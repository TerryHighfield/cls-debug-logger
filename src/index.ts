import { ILogProvider } from './ILogProvider';
import { Logger } from './Logger';
import { ILogger } from './ILogger';

export * from './ILogProvider';
export * from './ILogMessage';
export * from './ILogger';

let globalLogProvider: ILogProvider | undefined;

export function setGlobalLogProvider(logProvider?: ILogProvider) {
  globalLogProvider = logProvider;
}

export function createLogger(
  namespace?: string,
  logProvider?: ILogProvider
): ILogger {
  return new Logger(namespace, logProvider || globalLogProvider);
}
