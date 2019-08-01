import debug from 'debug';
import Transport from 'winston-transport';

export class DebugTransport extends Transport {

  private debugger: debug.IDebugger;

  constructor(options?: Transport.TransportStreamOptions, name?: string) {
    super(options);
    this.debugger = debug(name || 'kites');
  }

  public log(info, callback: Function) {
    this.debugger(info);
    callback(null, true);
  }
}
