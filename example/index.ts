import { createLogger } from '..';

const logger = createLogger('my_namespace');

// Log object
logger.log({
  prop: {
    lv1: {
      lv2: {
        nProp: 2,
        lv3: {
          sProp: 'a string',
        },
      },
    },
  },
});
/*
 Output:
   my_namespace "{ message: { prop: { lv1: { lv2: { nProp: 2, lv3: { sProp: 'a string' } } } } }, session: 'undefined' }" +0ms
*/

// Session
logger
  .session(async () => {
    logger.log('%d: %s', 4, 'a log message');
    /*
     Output:
      my_namespace "{ message: '4: a log message', session: 'my session id' }" +4ms
    */

    // Sub session
    logger
      .session(async () => {
        logger.log('%d: %s', 10, 'a sub log message');
      }, 'my sub-session id')
      .then();
    /*
      Output:
        my_namespace "{ message: '10: a sub log message', session: 'my session id', subSessions: [ 'my sub-session id' ] }" +0ms
    */
  }, 'my session id')
  .then();
