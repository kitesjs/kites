import { expect } from 'chai';
import { EventCollectionEmitter, ICollectionItem } from './event-collection';

describe('EventCollectionEmitter', () => {
    var listeners: EventCollectionEmitter;
    beforeEach(() => {
        listeners = new EventCollectionEmitter();
    });

    it('should return a valid awaitable promise', async () => {
        listeners.add('test', () => Promise.resolve(1));
        listeners.add('test', () => Promise.resolve(2));
        let result = await listeners.fire();
        expect(result[0]).eq(1);
        expect(result[1]).eq(2);
    });

    it('should fire with arguments', async () => {
        let obj: any = {};
        listeners.add('test', (o: any) => {
            o.ic = 'kites framework';
            return 2.0;
        });

        let [result] = await listeners.fire(obj);
        expect(obj.ic).eq('kites framework');
        expect(result).eq(2.0);
    });

    it('should got an error!', async () => {
        try {
            listeners.add('test', () => Promise.reject('foo'));
            await listeners.fire();
        } catch (err) {
            expect(err).eq('foo');
        }
    });

    it('should apply pre hooks', async () => {
        let i = 0;
        let preHookResult;
        listeners.pre(function(this: ICollectionItem) {
            i++;
            preHookResult = this.key;
        });

        listeners.pre(() => {
            i++;
        });

        listeners.add('test', () => 100);

        let [result] = await listeners.fire();
        expect(preHookResult).eq('test');
        expect(result).eq(100);
        expect(i).eq(2);
    });

    it('should apply post hooks', async () => {
        let i = 0;
        let postHookResult;
        listeners.post(function(this: ICollectionItem) {
            i++;
            postHookResult = this.key;
        });

        listeners.post(() => {
            i += 2;
        });

        listeners.add('post', () => 100);

        let [result] = await listeners.fire();
        expect(postHookResult).eq('post');
        expect(result).eq(100);
        expect(i).eq(3);
    });

    it('should apply postError hooks', async () => {
        let error;
        listeners.postFail((err: Error) => {
            error = err;
        });

        listeners.add('test', () => {
            return Promise.reject(new Error('foo'));
        });

        try {
            await listeners.fire();
        } catch (err) {
            expect(err).eq(error);
        }
    });
});
