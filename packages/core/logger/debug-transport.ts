import debug from 'debug';
import Transport from 'winston-transport';

export class DebugTransport extends Transport {
  public name: string;

  private debugger: debug.IDebugger;

  constructor(options?: Transport.TransportStreamOptions, name?: string) {
    super(options);
    this.debugger = debug('kites');
    this.name = name || 'debug';
  }

  public log(info, callback: Function) {
    this.debugger(info);
    callback(null, true);
  }
}
