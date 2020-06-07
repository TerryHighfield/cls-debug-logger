import * as TypeMoq from 'typemoq';

import { ILogProvider } from '../lib/ILogProvider';
import { Logger } from '../lib/Logger';

class TestNotifier {
  private callback: () => void;
  wait(callback: () => void) {
    this.callback = callback;
  }

  notifiy() {
    this.callback();
  }
}

let logProvider: TypeMoq.IMock<ILogProvider>;
beforeEach(() => {
  logProvider = TypeMoq.Mock.ofType<ILogProvider>();
});

test('unbound callback from another context will not log with a session id', async () => {
  const logger = new Logger('namespace_hshfdg3', logProvider.object);

  const testNotifier = new TestNotifier();
  const sessionPromise = logger
    .session(async () => {
      await new Promise((resolve) => {
        testNotifier.wait(() => {
          logger.log('timeout ping');
          resolve();
        });
      });
    }, 'session_a')
    .then();
  testNotifier.notifiy();
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

test('bound callback from another context will log with a session id', async () => {
  const logger = new Logger('namespace_hshfdg3', logProvider.object);

  const testNotifier = new TestNotifier();
  const sessionPromise = logger.session(async () => {
    await new Promise((resolve) => {
      testNotifier.wait(
        logger.bind(() => {
          logger.log('timeout ping');
          resolve();
        })
      );
    });
  }, 'session_a');
  testNotifier.notifiy();

  await sessionPromise;

  logProvider.verify(
    (o) =>
      o.log(
        TypeMoq.It.isObjectWith({
          message: 'timeout ping',
          session: 'session_a',
        })
      ),
    TypeMoq.Times.exactly(1)
  );
});
