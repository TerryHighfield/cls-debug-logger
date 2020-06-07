import * as TypeMoq from 'typemoq';
import { EventEmitter } from 'events';

import { ILogProvider } from '../lib/ILogProvider';
import { Logger } from '../lib/Logger';

class TestEmitter extends EventEmitter {}

let logProvider: TypeMoq.IMock<ILogProvider>;
beforeEach(() => {
  logProvider = TypeMoq.Mock.ofType<ILogProvider>();
});

test('unbound event listener should not recieve a session id', async () => {
  const logger = new Logger('namespace_hshfdg3', logProvider.object);

  const testEmitter = new TestEmitter();
  const sessionPromise = logger
    .session(async () => {
      await new Promise((resolve) => {
        testEmitter.once('testNotification', () => {
          logger.log('timeout ping');
          resolve();
        });
      });
    }, 'session_afs')
    .then();
  testEmitter.emit('testNotification');
  await sessionPromise;

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.isObjectWith({
          message: 'timeout ping',
          session: 'undefined',
        })
      ),
    TypeMoq.Times.exactly(1)
  );
});

test('bound event listener should recieve a session id', async () => {
  const logger = new Logger('namespace_hshfdg3', logProvider.object);

  const testEmitter = new TestEmitter();
  const sessionPromise = logger.session(async () => {
    logger.bindEmitter(testEmitter);
    await new Promise((resolve) => {
      testEmitter.once('testNotification', () => {
        logger.log('timeout ping');
        resolve();
      });
    });
  }, 'session_afs');
  testEmitter.emit('testNotification');

  await sessionPromise;

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.isObjectWith({
          message: 'timeout ping',
          session: 'session_afs',
        })
      ),
    TypeMoq.Times.exactly(1)
  );
});
