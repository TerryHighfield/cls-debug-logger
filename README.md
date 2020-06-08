# cls-debug-logger

Uses the cls-hooked fork of continuation-local-storage to maintain a session id with all logs.

All async calls, callbacks and event emitters will maintain references to the session ids.

### See

- [cls-hooked](https://github.com/jeff-lewis/cls-hooked)

- [continuation-local-storage](https://github.com/othiym23/node-continuation-local-storage)

## Logger implementation

By default this logger uses the [Debug](https://github.com/visionmedia/debug#readme) logger. Any logging engine can be used with this logger by Implementing the `ILogProvider` class.

### `createLogger(namespace: string, logProvider: ILogProvider): ILogger`

- return: ILogger
- params:
  - **namespace**: Has two uses:
    - With Debug to enable and disable the logger via the DEBUG env variable.
    - With cls, this is the cls namespace id where the session ids will be stored. Any logger created with this namespace will have access to the active sessions within it. Every log will gain the id of the active session
  - **logProvider**: By default this will use the Debug logger, a custom log engine (e.g. winston) can be used instead by passing the implementation here.

Create a logger instance.

## ILogger

### `log(message: string | object, ...args: any[]): void`

- return: ILogger
- params:
  - **message**: The string message or object to be logged. The can be a format template whose elements can be populated by the supplied args. @see util.format and @see util.formatWithOptions
  - **args**: Any arguments to fill the format string

Log a message the current log provider

### `session<T>(session: () => Promise<T>, sessionId?: string): Promise<T>`

- return: The result of the session callback
- params:
  - **session** The callback to execute in the session context
  - **sessionId** The id of the session context, this will be outputted with each log. Optional: a Uuid will be created

Create a logging session. All logs made in the executing session with be labelled with a session id.

Parent session and sub-session. The first session created is considered a parent or outer session. Any session created with that session context (essentially by calling this function again from the callback 'session') is called a sub-session. A list of subsession ids will also be outputted to the logs. Subsessions are really useful to label smaller code paths within a session, especially when tracking each item in a promise.all call where each execution can have its own subsession.

### `bind<T>(func: () => T): () => T`

- return: the result of the callback `func`
- params:
  - **func** The fucntion to bind to the active session. The function will now log with the session ids of active session.

Bind a function call back to the currently executing session

### `bindEmitter<T>(emitter: EventEmitter): void`

- return: void
- params:
  - **emitter** The emitter to bind to the active session. All the listeners of the event emitter will not log will the active session ids

Bind an EventEmitter to the currently executing session

## ILogProvider

### `log(logMessage: ILogMessage): void``

- return: void
- param:
  - **logMessage** The message to log

Log the provided object `logMessage`

## ILogMessage

```javascript
  message: string | object;
  session?: string;
  subSessions?: string[];
```

# Example

```javascript
const logger: ILogger = createLogger('my_namespace');

// Session
await logger.session(async () => {
  logger.log('%d: %s', 4, 'a log message');

  // Sub session
  await logger.session(async () => {
    logger.log('%d: %s', 10, 'a sub log message');
  }, 'my sub-session id');
}, 'my session id');
```

Output:

```
my_namespace { message: '4: a log message', session: 'my session id' } +3ms
my_namespace { message: '10: a sub log message', session: 'my session id', subSessions: [ 'my sub-session id' ] } +0ms
```
