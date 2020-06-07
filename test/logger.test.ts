import * as TypeMoq from 'typemoq';

import { ILogProvider } from '../src/ILogProvider';
import { Logger } from '../src/Logger';

let logProvider: TypeMoq.IMock<ILogProvider>;
beforeEach(() => {
  logProvider = TypeMoq.Mock.ofType<ILogProvider>();
});

test('should log ILogMessage type to the log provider', () => {
  const logger = new Logger('testNamespace', logProvider.object);

  logger.log('test log');

  logProvider.verify(
    (o) => o.log(TypeMoq.It.isObjectWith({ message: 'test log' })),
    TypeMoq.Times.exactly(1)
  );
});

test('should format the log message', () => {
  const logger = new Logger('namespace', logProvider.object);

  logger.log('%d : %s', 1154, 'a string');

  logProvider.verify(
    (o) => o.log(TypeMoq.It.isObjectWith({ message: '1154 : a string' })),
    TypeMoq.Times.exactly(1)
  );
});

test('should log a session id', async () => {
  const logger = new Logger('namespace_', logProvider.object);

  await logger.session(async () => {
    logger.log('%d : %s', 1154, 'a string');
  }, 'a test session');

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.isObjectWith({
          message: '1154 : a string',
          session: 'a test session',
        })
      ),
    TypeMoq.Times.exactly(1)
  );
});

test("should log 'undefined' for any logs outside a session", () => {
  const logger = new Logger('namespace_', logProvider.object);

  logger.log('a log message');

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.isObjectWith({
          message: 'a log message',
          session: 'undefined',
        })
      ),
    TypeMoq.Times.exactly(1)
  );
});

test('should use a uuid as a default session id', async () => {
  const logger = new Logger('namespace_', logProvider.object);

  await logger.session(async () => {
    logger.log('fr');
  });

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.is(
          (log) =>
            log.message === 'fr' &&
            log.session !== undefined &&
            log.session !== 'undefined'
        )
      ),
    TypeMoq.Times.exactly(1)
  );
});

test('should use different uuid each time as a default session id', async () => {
  const logger = new Logger('namespace_t', logProvider.object);

  await logger.session(async () => {
    logger.log('fr');
  });

  let otherSessionId: string | undefined = undefined;
  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.is((log) => {
          otherSessionId = log.session;
          return (
            log.message === 'fr' &&
            log.session !== undefined &&
            log.session !== 'undefined'
          );
        })
      ),
    TypeMoq.Times.exactly(1)
  );

  logProvider.reset();

  await logger.session(async () => {
    logger.log('frew');
  });

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.is(
          (log) => log.message === 'frew' && log.session !== otherSessionId
        )
      ),
    TypeMoq.Times.exactly(1)
  );
});

test('should use log sub-session id', async () => {
  const logger = new Logger('namespace_ljhg', logProvider.object);

  await logger.session(async () => {
    await logger.session(async () => {
      logger.log('sub session message');
    }, 'subSession');
  }, 'parent session');

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.is(
          (log) =>
            log.message === 'sub session message' &&
            log.session === 'parent session' &&
            log.subSessions[0] === 'subSession'
        )
      ),
    TypeMoq.Times.exactly(1)
  );
});

test('should use remove the sub session when the sub session is complete', async () => {
  const logger = new Logger('namespace_d', logProvider.object);

  await logger.session(async () => {
    // Session level 1
    await logger.session(async () => {
      // Session level 2
      logger.log('session lvl 2 message');

      logProvider.verify(
        (o) =>
          o.log(
            TypeMoq.It.is(
              (log) =>
                log.message === 'session lvl 2 message' &&
                log.session === 'parent session' &&
                log.subSessions[0] === 'subSession' &&
                !log.subSessions[1] // No 2nd sub session id
            )
          ),
        TypeMoq.Times.exactly(1)
      );
      logProvider.reset();

      await logger.session(async () => {
        // Session level 3
        logger.log('session lvl 3 message');

        logProvider.verify(
          (o) =>
            o.log(
              TypeMoq.It.is(
                (log) =>
                  log.message === 'session lvl 3 message' &&
                  log.session === 'parent session' &&
                  log.subSessions[0] === 'subSession' &&
                  log.subSessions[1] === 'subSessionLvl2' // Another sub session id
              )
            ),
          TypeMoq.Times.exactly(1)
        );
        logProvider.reset();
      }, 'subSessionLvl2');

      // Session level 2
      logger.log('session lvl 2 message 2');

      logProvider.verify(
        (o) =>
          o.log(
            TypeMoq.It.is(
              (log) =>
                log.message === 'session lvl 2 message 2' &&
                log.session === 'parent session' &&
                log.subSessions[0] === 'subSession' &&
                !log.subSessions[1] // No 2nd sub session id
            )
          ),
        TypeMoq.Times.exactly(1)
      );
    }, 'subSession');
  }, 'parent session');
});

test('should use sub session should create the parent session if it does not exist', async () => {
  const logger = new Logger('namespace_23', logProvider.object);

  await logger.session(async () => {
    logger.log('sub session message');
  }, 'subSession');

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.is(
          (log) =>
            log.message === 'sub session message' &&
            log.session === 'subSession'
        )
      ),
    TypeMoq.Times.exactly(1)
  );
});

test('should not format message objects', () => {
  const logger = new Logger('namespace_23', logProvider.object);

  const logMessageObject = { b: 3, c: 'a' };
  logger.log(logMessageObject);

  logProvider.verify(
    (o) => o.log(TypeMoq.It.isObjectWith({ message: logMessageObject })),
    TypeMoq.Times.exactly(1)
  );
});
