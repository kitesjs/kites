import debug from 'debug';
import Transport from 'winston-transport';

export class DebugTransport extends Transport {
  public name: string;

  private debugger: debug.IDebugger;

  constructor(options?: Transport.TransportStreamOptions, name?: string) {
    super(options);
    this.debugger = debug(name || 'kites');
    this.name = name || 'debug';
  }

  public log(info, callback: Function) {
    this.debugger(`${info.level} ${info.message}`);
    callback(null, true);
  }
}
