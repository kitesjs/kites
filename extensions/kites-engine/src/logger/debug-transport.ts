import debug from 'debug';
import { Transport, TransportOptions } from 'winston';

export class DebugTransport extends Transport {

    private debugger: debug.IDebugger;

    constructor(options?: TransportOptions) {
        super(options);
        this.name = 'debug';
        this.debugger = debug('kites');
    }

    public log(level: string, msg: string, meta: any, callback: Function) {
        this.debugger(`${level} ${msg}`);
        callback(null, true);
    }
}

export default function InitDebugTransport(options?: TransportOptions) {
    return DebugTransport.bind(options);
}
