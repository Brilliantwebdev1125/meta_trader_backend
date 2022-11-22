import DomainClient from '../domain.client';
import DrawdownListener from './drawdownListener';

/**
 * Drawdown listener for handling a stream of drawdown events
 */
export default class DrawdownListenerManager {

  /**
   * Constructs drawdown listener manager instance
   * @param {DomainClient} domainClient domain client
   */
  constructor(domainClient: DomainClient);

  /**
   * Returns the dictionary of drawdown listeners
   * @returns {{[listenerId: string]: DrawdownListener}} dictionary of drawdown listeners
   */
  get drawdownListeners(): {[listenerId: string]: DrawdownListener};

  /**
   * Adds a drawdown listener
   * @param {DrawdownListener} listener 
   * @param {String} [accountId] account id
   * @param {String} [trackerId] tracker id
   * @param {Number} [sequenceNumber] event sequence number
   * @returns {String} drawdown listener id
   */
  addDrawdownListener(listener: DrawdownListener, accountId?: string, trackerId?: string,
    sequenceNumber?: number): string;

  /**
   * Removes drawdown listener by id
   * @param {String} listenerId listener id 
   */
  removeDrawdownListener(listenerId: string): void;

}
