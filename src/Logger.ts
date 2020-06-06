import * as CLS from 'continuation-local-storage';
import util from 'util';
import { v4 as uuid } from 'uuid';

import { ILogger } from './ILogger';
import { ILogProvider } from './ILogProvider';

export class Logger implements ILogger {
  private readonly logSessionIdKey = 'logSessionId';

  constructor(
    private readonly namespace: string,
    public readonly logProvider: ILogProvider
  ) {}

  private getNamespace(): CLS.Namespace {
    return (
      CLS.getNamespace(this.namespace) || CLS.createNamespace(this.namespace)
    );
  }

  private getSessionId(): string | undefined {
    const namespace = CLS.getNamespace(this.namespace);
    return namespace && namespace.get(this.logSessionIdKey);
  }

  public log(message: string | object, ...args: any[]) {
    this.logProvider.log({
      message: util.format(message, ...args),
      session: this.getSessionId() || 'undefined',
    });
  }

  public session<T>(session: () => Promise<T>, sessionId?: string) {
    const logSessionNS = this.getNamespace();
    sessionId = sessionId || uuid();

    return logSessionNS.runAndReturn(async () => {
      logSessionNS.set(this.logSessionIdKey, sessionId);

      await session();
    });
  }
}
