export interface ICollectionItem {
    readonly key: string;
    readonly fn: Function;
    readonly context: object|Function;
}

export class EventCollectionEmitter {
    [key: string]: any;
    private listeners: ICollectionItem[];
    private preHooks: Function[];
    private postHooks: Function[];
    private postFailHooks: Function[];

    constructor() {
        this.listeners = [];
        this.preHooks = [];
        this.postHooks = [];
        this.postFailHooks = [];
    }

    /**
     * Add listener callback at the end of the current chain
     * @param key
     * @param context
     * @param listener
     */
    add(key: string, context: Object|Function, listener?: Function) {
        let ctx = listener == null ? this : context;
        let fn = listener || context as Function;

        if (typeof fn !== 'function') {
            throw new Error('Listener must be a function!');
        }

        this.listeners.push({
            context: ctx,
            fn: fn,
            key: key
        });
    }

    /**
     * Remove the listener specified by its key from the collection
     * @param key
     */
    remove(key: string) {
        this.listeners = this.listeners.filter(x => x.key !== key);
    }

    /**
     * add hook that will be executed before actual listener
     * @param fn
     */
    pre(fn: Function) {
        this.preHooks.push(fn);
    }

    /**
     * add hook that will be executed after actual listener
     * @param fn
     */
    post(fn: Function) {
        this.postHooks.push(fn);
    }

    /**
     * add hook that will be executed after actual listener when execution will fail
     * @param fn
     */
    postFail(fn: Function) {
        this.postFailHooks.push(fn);
    }

    /**
     * Fire registered listeners in sequence and returns a promise containing wrapping an array of all individual results
     * The parameters passed to the fire are forwarded in the same order to the listeners
     * @returns {Promise<U>}
     */
    async fire(...args: object[]) {
        var self: EventCollectionEmitter = this;

        function mapSeries(arr: any[], next: Function) {
            // create a empty promise to start our series
            var currentPromise = Promise.resolve();
            var promises = arr.map(async (item) => {
                // execute the next function after the previous has resolved successfully
                return (currentPromise = currentPromise.then(() => next(item)));
            });
            // group the results for executing concurrently
            // and return the group promise
            return Promise.all(promises);
        }

        function applyHook(listener: ICollectionItem, hookArrayName: string, outerArgs: any[]) {
            var hooks = self[hookArrayName] as Function[];
            hooks.forEach((hook) => {
                try {
                    hook.apply(listener, outerArgs);
                } catch (err) {
                    console.warn('Event listener [' + hookArrayName + '] hook got an error!', err);
                }
            });
        }

        return await mapSeries(this.listeners, async (listener: ICollectionItem) => {
            if (!listener) {
                return null;
            }
            var currentArgs = args.slice(0);
            applyHook(listener, 'preHooks', currentArgs);

            try {
                let valOrPromise = listener.fn.apply(listener.context, currentArgs);
                let result = await Promise.resolve(valOrPromise);
                applyHook(listener, 'postHooks', currentArgs);
                return result;
            } catch (err) {
                currentArgs.unshift(err);
                // console.warn('Event listener got an error!', err);
                applyHook(listener, 'postFailHooks', currentArgs);
                return Promise.reject(err);
            }
        });
    }
}
