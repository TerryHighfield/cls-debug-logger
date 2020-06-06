export interface ILogMessage {
  message: string | object;
  session?: string;
  subSessionIds?: string[];
}
