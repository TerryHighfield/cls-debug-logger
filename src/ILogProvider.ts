import { ILogMessage } from './ILogMessage';

export interface ILogProvider {
  /**
   * Log the provided object.
   *
   * @param logMessage The message to log
   */
  log(logMessage: ILogMessage): void;
}
