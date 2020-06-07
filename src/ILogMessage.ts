export interface ILogMessage {
  message: string | object;
  session?: string;
  subSessions?: string[];
}
