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

  await logger.session(async () => {
    logger.log('fr');
  });

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.is(
          (log) => log.message === 'fr' && log.session !== otherSessionId
        )
      ),
    TypeMoq.Times.exactly(1)
  );
});

/*
TODO:
 - Cross contamination of sessions: Should not be able to load the details of another session
*/
