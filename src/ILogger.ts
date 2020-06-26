import { EventEmitter } from 'events';

export interface ILogger {
  /**
   * Log a message the current log provider
   *
   * @param message  The string message or object to be logged. The
   * can be a format template whose elements can be populated by the
   * supplied args. @see util.format and @see util.formatWithOptions
   * @param args     Any arguments to fill the string
   */
  log(message: any, ...args: any[]): void;

  /**
   * Create a logging session. All logs made in the executing session with
   * be labelled with a session id.
   *
   * Parent session and sub-session. The first session created is considered
   * a parent or outer session. Any session created with that session context
   * (essentially by calling this function again from the callback 'session')
   * is called a sub-session. A list of subsession ids will also be outputted
   * to the logs. Subsessions are really useful to label smaller code paths
   * within a session, especially when tracking each item in a promise.all
   * call where each execution can have its own subsession.
   *
   * @param session   The callback to execute in the session context
   * @param sessionId The id of the session context, this will be outputted
   * with each log. Optional: a Uuid will be created
   */
  session<T>(session: () => Promise<T>, sessionId?: string): Promise<T>;

  /**
   * Bind a function call back to the currently executing session
   *
   * @param func The fucntion to bind to the active session. The
   * function will now log with the session ids of active session.
   */
  bind<T>(func: () => T): () => T;

  /**
   * Bind an EventEmitter to the currently executing session
   *
   * @param emitter The emitter to bind to the active session. All
   * the listeners of the event emitter will not log will the active
   * session ids
   */
  bindEmitter(emitter: EventEmitter): void;
}
