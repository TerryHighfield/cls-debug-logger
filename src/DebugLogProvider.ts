import { ILogProvider } from './ILogProvider';
import * as util from 'util';
import { v4 as uuid } from 'uuid';
import debug from 'debug';

export class DebugLogProvider implements ILogProvider {
  private debug: (message: string, ...args: any[]) => void;

  /**
   *
   * @param namespace The debug namespace
   */
  constructor(namespace: string) {
    this.debug = debug(namespace || uuid());
  }

  /**
   * Log the provided object.
   *
   * @param logMessage The provided object will be formatted (%j) in debug
   */
  log(logMessage: object) {
    const inspectOptions: util.InspectOptions = {
      depth: 5,
      compact: true,
      breakLength: 120,
      getters: 'get',
    };
    this.debug(util.format('%j', util.inspect(logMessage, inspectOptions)));
  }
}
