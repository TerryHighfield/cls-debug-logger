import { ILogProvider } from './ILogProvider';
import { Logger } from './Logger';
import { ILogger } from './ILogger';

export * from './ILogProvider';
export * from './ILogMessage';
export * from './ILogger';

/**
 * Create a logger instance.
 *
 * @param namespace  Has two uses:
 * With Debug to enable and disable the logger via the DEBUG
 * env variable.
 * With cls, this is the cls namespace id where the session
 * ids will be stored. Any logger created with this namespace
 * will have access to the active sessions within it. Every
 * log will gain the id of the active session
 *
 * @param logProvider By default this will use the Debug logger,
 * a custom log engine (e.g. winston) can be used instead by
 * passign the implementation here.
 */
export function createLogger(
  namespace: string,
  logProvider?: ILogProvider
): ILogger {
  return new Logger(namespace, logProvider);
}
