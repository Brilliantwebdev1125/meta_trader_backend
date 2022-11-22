'use strict';

/**
 * Drawdown listener for handling a stream of drawdown events
 */
export default class DrawdownListener {

  /**
   * Processes drawdown event which occurs when a drawdown limit is exceeded in a drawdown tracker
   * @param {DrawdownEvent} drawdownEvent drawdown event
   */
  async onDrawdown(drawdownEvent) {
    throw Error('Abstract method onDrawdown has no implementation');
  }

}