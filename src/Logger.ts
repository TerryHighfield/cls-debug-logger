import { ILogProvider } from './ILogProvider';
import { ILogger } from './ILogger';

export class Logger implements ILogger {
  constructor(public readonly logProvider: ILogProvider) {}

  public log(message: string | object, ...args: any[]) {
    this.logProvider.log({ message });
  }
}
