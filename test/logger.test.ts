import * as TypeMoq from 'typemoq';
import { ILogProvider } from '../src/ILogProvider';
import { Logger } from '../src/Logger';

let logProvider: TypeMoq.IMock<ILogProvider>;
beforeEach(() => {
  logProvider = TypeMoq.Mock.ofType<ILogProvider>();
});

test('should log to the log provider', () => {
  const logger = new Logger(logProvider.object);

  logger.log('test log');

  logProvider.verify(
    (o) => o.log(TypeMoq.It.isAny()),
    TypeMoq.Times.exactly(1)
  );
});
