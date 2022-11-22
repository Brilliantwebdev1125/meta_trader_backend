'use strict';

import DrawdownListenerManager from './drawdownListenerManager';

/**
 * metaapi.cloud RiskManagement equity tracking API client (see https://metaapi.cloud/docs/riskManagement/)
 */
export default class EquityTrackingClient {

  /**
   * Constructs RiskManagement equity tracking API client instance
   * @param {DomainClient} domainClient domain client
   */
  constructor(domainClient) {
    this._domainClient = domainClient;
    this._drawdownListenerManager = new DrawdownListenerManager(domainClient);
  }

  /**
   * Drawdown tracker configuration update
   * @typedef {Object} DrawdownTrackerUpdate
   * @property {String} name drawdown tracker name
   */

  /**
   * Period length to track drawdown for
   * @typedef {'day' | 'date' | 'week' | 'week-to-date' | 'month' | 'month-to-date' | 'quarter' | 'quarter-to-date' |
   * 'year' | 'year-to-date' | 'lifetime'} Period
   */

  /**
   * New drawdown tracker configuration
   * @typedef {DrawdownTrackerUpdate} NewDrawdownTracker
   * @property {String} [startBrokerTime] time to start tracking from in broker timezone, YYYY-MM-DD HH:mm:ss.SSS format
   * @property {String} [endBrokerTime] time to end tracking at in broker timezone, YYYY-MM-DD HH:mm:ss.SSS format
   * @property {Period} period period length to track drawdown for
   * @property {Number} [relativeDrawdownThreshold] relative drawdown threshold after which drawdown event is generated,
   * a fraction of 1
   * @property {Number} [absoluteDrawdownThreshold] absolute drawdown threshold after which drawdown event is generated,
   * should be greater than 0
   */

  /**
   * Drawdown tracker id
   * @typedef {Object} DrawdownTrackerId
   * @property {String} id drawdown tracker id
   */

  /**
   * Creates drawdown tracker. See
   * https://metaapi.cloud/docs/riskManagement/restApi/api/equityTracking/createDrawdownTracker/
   * @param {String} accountId id of the MetaApi account
   * @param {NewDrawdownTracker} tracker drawdown tracker
   * @return {Promise<DrawdownTrackerId>} promise resolving with drawdown tracker id
   */
  createDrawdownTracker(accountId, tracker) {
    return this._domainClient.requestApi({
      url: `/users/current/accounts/${accountId}/drawdown-trackers`,
      method: 'POST',
      body: tracker
    });
  }

  /**
   * Drawdown tracker configuration
   * @typedef {NewDrawdownTracker} DrawdownTracker
   * @property {String} _id unique drawdown tracker id
   */

  /**
   * Returns drawdown trackers defined for an account
   * @param {String} accountId id of the MetaApi account
   * @return {Promise<DrawdownTracker[]>} promise resolving with drawdown trackers
   */
  getDrawdownTrackers(accountId) {
    return this._domainClient.requestApi({
      url: `/users/current/accounts/${accountId}/drawdown-trackers`,
      method: 'GET'
    });
  }

  /**
   * Returns drawdown tracker by account and name
   * @param {string} accountId id of the MetaApi account
   * @param {string} name tracker name
   * @return {Promise<DrawdownTracker>} promise resolving with drawdown tracker found
   */
  getDrawdownTrackerByName(accountId, name) {
    return this._domainClient.requestApi({
      url: `/users/current/accounts/${accountId}/drawdown-trackers/name/${encodeURIComponent(name)}`,
      method: 'GET'
    });
  }

  /**
   * Updates drawdown tracker
   * @param {String} accountId id of the MetaApi account
   * @param {String} id id of the drawdown tracker
   * @param {DrawdownTrackerUpdate} update drawdown tracker update
   * @return {Promise} promise resolving when drawdown tracker updated
   */
  updateDrawdownTracker(accountId, id, update) {
    return this._domainClient.requestApi({
      url: `/users/current/accounts/${accountId}/drawdown-trackers/${id}`,
      method: 'PUT',
      body: update
    });
  }

  /**
   * Removes drawdown tracker
   * @param {String} accountId id of the MetaApi account
   * @param {String} id id of the drawdown tracker
   * @return {Promise} promise resolving when drawdown tracker removed
   */
  deleteDrawdownTracker(accountId, id) {
    return this._domainClient.requestApi({
      url: `/users/current/accounts/${accountId}/drawdown-trackers/${id}`,
      method: 'DELETE'
    });
  }

  /**
   * Drawdown threshold exceeded event model
   * @typedef {Object} DrawdownEvent
   * @property {Number} sequenceNumber event unique sequence number
   * @property {String} accountId MetaApi account id
   * @property {String} trackerId drawdown tracker id
   * @property {String} startBrokerTime drawdown tracking period start time in broker timezone,
   * in YYYY-MM-DD HH:mm:ss.SSS format
   * @property {String} [endBrokerTime] drawdown tracking period end time in broker timezone,
   * in YYYY-MM-DD HH:mm:ss.SSS format
   * @property {Period} period drawdown tracking period
   * @property {String} brokerTime drawdown threshold exceeded event time in broker timezone,
   * in YYY-MM-DD HH:mm:ss.SSS format
   * @property {Number} absoluteDrawdown absolute drawdown value which was observed when the drawdown threshold was
   * exceeded
   * @property {Number} relativeDrawdown relative drawdown value which was observed when the drawdown threshold was
   * exceeded
   */

  /**
   * Returns drawdown events by broker time range
   * @param {String} [startBrokerTime] value of the event time in broker timezone to start loading data from, inclusive,
   * in 'YYYY-MM-DD HH:mm:ss.SSS format
   * @param {String} [endBrokerTime] value of the event time in broker timezone to end loading data at, inclusive,
   * in 'YYYY-MM-DD HH:mm:ss.SSS format
   * @param {String} [accountId] id of the MetaApi account
   * @param {String} [trackerId] id of the drawdown tracker
   * @param {Number} [limit] pagination limit, default is 1000
   * @return {Promise<DrawdownEvent[]>} promise resolving with drawdown events
   */
  getDrawdownEvents(startBrokerTime, endBrokerTime, accountId, trackerId, limit) {
    return this._domainClient.requestApi({
      url: '/users/current/drawdown-events/by-broker-time',
      qs: {startBrokerTime, endBrokerTime, accountId, trackerId, limit},
      method: 'GET'
    });
  }

  /**
   * Adds a drawdown listener and creates a job to make requests
   * @param {DrawdownListener} listener drawdown listener
   * @param {String} [accountId] account id
   * @param {String} [trackerId] tracker id
   * @param {Number} [sequenceNumber] sequence number
   * @return {String} listener id
   */
  addDrawdownListener(listener, accountId, trackerId, sequenceNumber) {
    return this._drawdownListenerManager.addDrawdownListener(listener, accountId, trackerId, sequenceNumber);
  }

  /**
   * Removes drawdown listener and cancels the event stream
   * @param {String} listenerId drawdown listener id
   */
  removeDrawdownListener(listenerId) {
    this._drawdownListenerManager.removeDrawdownListener(listenerId);
  }

  /**
   * Drawdown period statistics
   * @typedef {Object} DrawdownPeriodStatistics
   * @property {String} startBrokerTime period start time in broker timezone, in YYYY-MM-DD HH:mm:ss format
   * @property {String} [endBrokerTime] period end time in broker timezone, in YYYY-MM-DD HH:mm:ss format
   * @property {Period} period period length
   * @property {Number} initialBalance balance at period start time
   * @property {String} [maxDrawdownTime] time max drawdown was observed at in broker timezone,
   * in YYYY-MM-DD HH:mm:ss format
   * @property {Number} [maxAbsoluteDrawdown] the value of maximum absolute drawdown observed
   * @property {Number} [maxRelativeDrawdown] the value of maximum relative drawdown observed
   * @property {Boolean} thresholdExceeded the flag indicating that max allowed total drawdown was exceeded
   */

  /**
   * Returns account drawdown tracking stats by drawdown tracker id
   * @param {String} accountId id of MetaAPI account
   * @param {String} trackerId id of drawdown tracker
   * @param {String} [startTime] time to start loading stats from, default is current time. Note that stats is loaded in
   * backwards direction
   * @param {Number} [limit] number of records to load, default is 1
   * @return {Promise<DrawdownPeriodStatistics[]>} promise resolving with drawdown statistics
   */
  getDrawdownStatistics(accountId, trackerId, startTime, limit) {
    return this._domainClient.requestApi({
      url: `/users/current/accounts/${accountId}/drawdown-trackers/${trackerId}/statistics`,
      qs: {startTime, limit},
      method: 'GET'
    });
  }

  /**
   * Equity chart item
   * @typedef {Object} EquityChartItem
   * @property {String} startBrokerTime start time of a chart item as per broker timezone, in YYYY-MM-DD HH:mm:ss format
   * @property {String} endBrokerTime end time of a chart item as per broker timezone, in YYYY-MM-DD HH:mm:ss format
   * @property {Number} averageBalance average balance value during the period
   * @property {Number} minBalance minimum balance value during the period
   * @property {Number} maxBalance maximum balance value during the period
   * @property {Number} averageEquity average equity value during the period
   * @property {Number} minEquity minimum equity value during the period
   * @property {Number} maxEquity maximum equity value during the period
   */

  /**
   * Returns equity chart by account id
   * @param {String} accountId metaApi account id
   * @param {String} [startTime] starting broker time in YYYY-MM-DD HH:mm:ss format
   * @param {String} [endTime] ending broker time in YYYY-MM-DD HH:mm:ss format
   * @return {Promise<EquityChartItem[]>} promise resolving with equity chart
   */
  getEquityChart(accountId, startTime, endTime) {
    return this._domainClient.requestApi({
      url: `/users/current/accounts/${accountId}/equity-chart`,
      qs: {startTime, endTime},
      method: 'GET'
    });
  }
}
