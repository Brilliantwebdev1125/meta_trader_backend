'use strict';

import randomstring from 'randomstring';

/**
 * Drawdown event listener manager
 */
export default class DrawdownListenerManager {

  /**
   * Constructs drawdown listener manager instance
   * @param {DomainClient} domainClient domain client
   */
  constructor(domainClient) {
    this._domainClient = domainClient;
    this._drawdownListeners = {};
    this._errorThrottleTime = 1000;
  }

  /**
   * Returns the dictionary of drawdown listeners
   * @returns {{[listenerId: string]: DrawdownListener}} dictionary of drawdown listeners
   */
  get drawdownListeners() {
    return this._drawdownListeners;
  }

  /**
   * Adds a drawdown listener
   * @param {DrawdownListener} listener drawdown listener 
   * @param {String} [accountId] account id
   * @param {String} [trackerId] tracker id
   * @param {Number} [sequenceNumber] event sequence number
   * @returns {String} drawdown listener id
   */
  addDrawdownListener(listener, accountId, trackerId, sequenceNumber) {
    const listenerId = randomstring.generate(10);
    this._drawdownListeners[listenerId] = listener;
    this._startDrawdownEventJob(listenerId, listener, accountId, trackerId, sequenceNumber);
    return listenerId;
  }

  /**
   * Removes drawdown listener by id
   * @param {String} listenerId listener id 
   */
  removeDrawdownListener(listenerId) {
    delete this._drawdownListeners[listenerId];
  }

  async _startDrawdownEventJob(listenerId, listener, accountId, trackerId, sequenceNumber) {
    let throttleTime = this._errorThrottleTime;

    while (this._drawdownListeners[listenerId]) {
      try {
        const packets = await this._domainClient.requestApi({
          url: '/users/current/drawdown-events/stream',
          method: 'GET',
          qs: {
            previousSequenceNumber: sequenceNumber,
            accountId, trackerId,
            limit: 1000
          }
        }, true);
        for (let packet of packets) {
          await listener.onDrawdown(packet);
        }
        throttleTime = this._errorThrottleTime;
        if (this._drawdownListeners[listenerId] && packets.length) {
          sequenceNumber = packets.slice(-1)[0].sequenceNumber;
        }
      } catch (error) {
        await new Promise(res => setTimeout(res, throttleTime));
        throttleTime = Math.min(throttleTime * 2, 30000);
      }
    }
  }

}
