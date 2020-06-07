import * as TypeMoq from 'typemoq';

import { ILogProvider } from '../src/ILogProvider';
import { Logger } from '../src/Logger';

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

test('should not log the session id without binding to the logger session', async () => {
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

test('should not log the session id without binding to the logger session', async () => {
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
