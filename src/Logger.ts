import * as CLS from 'cls-hooked';
import util from 'util';
import { v4 as uuid } from 'uuid';

import { ILogger } from './ILogger';
import { ILogProvider } from './ILogProvider';
import { ILogMessage } from './ILogMessage';

/**
 * A logger that uses continuation local storage to maintain a
 * session id throughout a function call chain (logical pass
 * through a code block). It supplies bind functions to allow
 * callbacks from other execution context to be bound to this
 * logging context, thus maintaining the session id through
 * all calls.
 *
 * The session Id will be logged with any log messages enabling
 * simple grouping of logged activities. This allows for far
 * simpler logging when code is executed asynchronously.
 *
 * Any session can have a subsession allowing for smaller code
 * paths to be tracked within an outer larger session.
 * @see session
 */
export class Logger implements ILogger {
  // Used to store the id of the current session
  private readonly logSessionIdKey = 'logSessionId';
  // Stores the ids of any session that is running
  // with the parent session context.
  private readonly logSubsessionIdKey = 'subSessionIds';

  /**
   *
   * @param namespace    A unique name for the logger
   * @param logProvider  The a wrapper around the logging engine: Debug, Winston etc
   */
  constructor(
    private readonly namespace: string,
    public readonly logProvider: ILogProvider
  ) {
    namespace = namespace || uuid();
  }

  /**
   * The continuation local storage namespace in which the session ids are stored
   *
   * @param create  True if a namespace should be created if it does not already exist
   */
  private getNamespace(params?: { create?: boolean }): CLS.Namespace {
    return (
      CLS.getNamespace(this.namespace) ||
      (params?.create && CLS.createNamespace(this.namespace))
    );
  }

  /**
   * The id of the parent or most outer session
   */
  private getSessionId(): string | undefined {
    const namespace = this.getNamespace();
    return namespace && namespace.get(this.logSessionIdKey);
  }

  /**
   * The ids of all the sessions that are running within the
   * parent (outer) session context
   */
  private getSubSessionIds(): string[] | undefined {
    const namespace = this.getNamespace();
    return namespace && namespace.get(this.logSubsessionIdKey);
  }

  /**
   * Log a message the current log provider
   *
   * @param message  The string message or object to be logged. The
   * can be a format template whose elements can be populated by the
   * supplied args. @see util.format and @see util.formatWithOptions
   * @param args     Any arguments to fill the string
   */
  public log(message: string | object, ...args: any[]) {
    const inspectOptions: util.InspectOptions = {
      depth: 5,
      compact: true,
      breakLength: 120,
      getters: 'get',
    };
    const logMessage: ILogMessage = {
      message:
        typeof message === 'object'
          ? message
          : util.formatWithOptions(inspectOptions, message, ...args),
      session: this.getSessionId() || 'undefined',
    };
    const subSessionIds = this.getSubSessionIds();
    if (subSessionIds) {
      logMessage.subSessions = subSessionIds;
    }
    this.logProvider.log(logMessage);
  }

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
  public async session<T>(session: () => Promise<T>, sessionId?: string) {
    const logSessionNS = this.getNamespace({ create: true });
    sessionId = sessionId || uuid();

    await logSessionNS.runAndReturn(async () => {
      const existingSession = this.getSessionId();
      if (!existingSession) {
        // Create a parent session
        logSessionNS.set(this.logSessionIdKey, sessionId);
      } else {
        // Store this session id in the sub session id list of an existing session
        const existingSubSessions = this.getSubSessionIds();
        const subSessionsIds = existingSubSessions
          ? existingSubSessions.map((o) => o)
          : [];
        subSessionsIds.push(sessionId);

        logSessionNS.set(this.logSubsessionIdKey, subSessionsIds);
      }

      // Run the callback within the new session context
      await session();
    });
  }
}
