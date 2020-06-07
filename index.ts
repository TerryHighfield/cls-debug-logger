import { ILogProvider } from './lib/ILogProvider';
import { Logger } from './lib/Logger';
import { ILogger } from './lib/ILogger';

export * from './lib/ILogger';
export * from './lib/ILogMessage';
export * from './lib/ILogProvider';

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
