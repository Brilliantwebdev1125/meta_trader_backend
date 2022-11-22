import DomainClient from '../domain.client';
import DrawdownListener from './drawdownListener';

/**
 * metaapi.cloud RiskManagement equity tracking API client (see https://metaapi.cloud/docs/riskManagement/)
 */
export default class EquityTrackingClient {

  /**
   * Constructs RiskManagement equity tracking API client instance
   * @param {DomainClient} domainClient domain client
   */
  constructor(domainClient: DomainClient); 

  /**
   * Creates drawdown tracker. See
   * https://metaapi.cloud/docs/riskManagement/restApi/api/equityTracking/createDrawdownTracker/
   * @param {String} accountId id of the MetaApi account
   * @param {NewDrawdownTracker} tracker drawdown tracker
   * @return {Promise<DrawdownTrackerId>} promise resolving with drawdown tracker id
   */
  createDrawdownTracker(accountId: string, tracker: NewDrawdownTracker): Promise<DrawdownTrackerId>;

  /**
   * Returns drawdown trackers defined for an account
   * @param {String} accountId id of the MetaApi account
   * @return {Promise<DrawdownTracker[]>} promise resolving with drawdown trackers
   */
  getDrawdownTrackers(accountId: string): Promise<DrawdownTracker[]>;

  /**
   * Returns drawdown tracker by account and name
   * @param {string} accountId id of the MetaApi account
   * @param {string} name tracker name
   * @return {Promise<DrawdownTracker>} promise resolving with drawdown tracker found
   */
  getDrawdownTrackerByName(accountId: string, name: string): Promise<DrawdownTracker>;

    /**
   * Updates drawdown tracker
   * @param {String} accountId id of the MetaApi account
   * @param {String} id id of the drawdown tracker
   * @param {DrawdownTrackerUpdate} update drawdown tracker update
   * @return {Promise} promise resolving when drawdown tracker updated
   */
  updateDrawdownTracker(accountId: string, id: string, update: DrawdownTrackerUpdate): Promise<void>;

  /**
   * Removes drawdown tracker
   * @param {String} accountId id of the MetaApi account
   * @param {String} id id of the drawdown tracker
   * @return {Promise} promise resolving when drawdown tracker removed
   */
  deleteDrawdownTracker(accountId: string, id: string): Promise<void>;

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
  getDrawdownEvents(startBrokerTime?: string, endBrokerTime?: string, accountId?: string, trackerId?: string,
    limit?: number): Promise<DrawdownEvent[]>;

  /**
   * Adds a drawdown listener and creates a job to make requests
   * @param {DrawdownListener} listener drawdown listener
   * @param {String} [accountId] account id
   * @param {String} [trackerId] tracker id
   * @param {Number} [sequenceNumber] sequence number
   * @return {String} listener id
   */
  addDrawdownListener(listener: DrawdownListener, accountId?: string, trackerId?: string, sequenceNumber?: string): string;

  /**
   * Removes drawdown listener and cancels the event stream
   * @param {String} listenerId drawdown listener id
   */
  removeDrawdownListener(listenerId: string): void;

  /**
   * Returns account drawdown tracking stats by drawdown tracker id
   * @param {String} accountId id of MetaAPI account
   * @param {String} trackerId id of drawdown tracker
   * @param {String} [startTime] time to start loading stats from, default is current time. Note that stats is loaded in
   * backwards direction
   * @param {Number} [limit] number of records to load, default is 1
   * @return {Promise<DrawdownPeriodStatistics[]>} promise resolving with drawdown statistics
   */
  getDrawdownStatistics(accountId: string, trackerId: string, startTime?: string, limit?: number):
    Promise<DrawdownPeriodStatistics[]>

  /**
   * Returns equity chart by account id
   * @param {String} accountId metaApi account id
   * @param {String} [startTime] starting broker time in YYYY-MM-DD HH:mm:ss format
   * @param {String} [endTime] ending broker time in YYYY-MM-DD HH:mm:ss format
   * @return {Promise<EquityChartItem[]>} promise resolving with equity chart
   */
  getEquityChart(accountId: string, startTime?: string, endTime?: string): Promise<EquityChartItem[]>;
}

/**
 * Drawdown tracker configuration update
 */
export declare type DrawdownTrackerUpdate = {
  /**
   * drawdown tracker name
   */
  name: string
}

/**
 * Period length to track drawdown for
 */
export declare type Period = 'day' | 'date' | 'week' | 'week-to-date' | 'month' | 'month-to-date' | 'quarter' |
    'quarter-to-date' | 'year' | 'year-to-date' | 'lifetime';

/**
 * New drawdown tracker configuration
 */
export declare type NewDrawdownTracker = DrawdownTrackerUpdate & {
  /**
   * time to start tracking from in broker timezone, YYYY-MM-DD HH:mm:ss.SSS format
   */
  startBrokerTime?: string,
  /**
   * time to end tracking at in broker timezone, YYYY-MM-DD HH:mm:ss.SSS format
   */
  endBrokerTime?: string,
  /**
   * period length to track drawdown for
   */
  period: Period
  /**
   * relative drawdown threshold after which drawdown event is generated, a fraction of 1
   */
  relativeDrawdownThreshold?: number,
  /**
   * absolute drawdown threshold after which drawdown event is generated, should be greater than 0
   */
  absoluteDrawdownThreshold?: number 
}

/**
 * Drawdown tracker id
 */
export declare type DrawdownTrackerId = {
  /**
   * drawdown tracker id
   */
  id: string
}

/**
 * Drawdown tracker configuration
 */
export declare type DrawdownTracker = NewDrawdownTracker & {
  /**
   * unique drawdown tracker id
   */
  _id: string
}

/**
 * Drawdown threshold exceeded event model
 */
export declare type DrawdownEvent = {
  /**
   * event unique sequence number
   */
  sequenceNumber: number,
  /**
   * MetaApi account id
   */
  accountId: string,
  /**
   * drawdown tracker id
   */
  trackerId: string,
  /**
   * drawdown tracking period start time in broker timezone, in YYYY-MM-DD HH:mm:ss.SSS format
   */
  startBrokerTime: string,
  /**
   * drawdown tracking period end time in broker timezone, in YYYY-MM-DD HH:mm:ss.SSS format
   */
  endBrokerTime?: string,
  /**
   * drawdown tracking period
   */
  period: Period,
  /**
   * drawdown threshold exceeded event time in broker timezone, in YYY-MM-DD HH:mm:ss.SSS format
   */
  brokerTime: string,
  /**
   * absolute drawdown value which was observed when the drawdown threshold was exceeded
   */
  absoluteDrawdown: number,
  /**
   * relative drawdown value which was observed when the drawdown threshold was exceeded
   */
  relativeDrawdown: number
}

/**
 * Drawdown period statistics
 */
export declare type DrawdownPeriodStatistics = {
  /**
   * period start time in broker timezone, in YYYY-MM-DD HH:mm:ss format
   */
  startBrokerTime: string,
  /**
   * period end time in broker timezone, in YYYY-MM-DD HH:mm:ss format
   */
  endBrokerTime?: string,
  /**
   * period length
   */
  period: Period,
  /**
   * balance at period start time
   */
  initialBalance: number,
  /**
   * time max drawdown was observed at in broker timezone, in YYYY-MM-DD HH:mm:ss format
   */
  maxDrawdownTime?: string,
  /**
   * the value of maximum absolute drawdown observed
   */
  maxAbsoluteDrawdown?: number,
  /**
   * the value of maximum relative drawdown observed
   */
  maxRelativeDrawdown?: number
  /**
   * the flag indicating that max allowed total drawdown was exceeded
   */
  thresholdExceeded: boolean
}

/**
 * Equity chart item
 */
export declare type EquityChartItem = {
  /**
   * start time of a chart item as per broker timezone, in YYYY-MM-DD HH:mm:ss format
   */
  startBrokerTime: string,
  /**
   * end time of a chart item as per broker timezone, in YYYY-MM-DD HH:mm:ss format
   */
  endBrokerTime: string,
  /**
   * average balance value during the period
   */
  averageBalance: number,
  /**
   * minimum balance value during the period
   */
  minBalance: number,
  /**
   * maximum balance value during the period
   */
  maxBalance: number,
  /**
   * average equity value during the period
   */
  averageEquity: number,
  /**
   * minimum equity value during the period
   */
  minEquity: number,
  /**
   * maximum equity value during the period
   */
  maxEquity: number
}
