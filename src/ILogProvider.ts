import { ILogMessage } from './ILogMessage';

export interface ILogProvider {
  log(logMessage: ILogMessage): void;
}
