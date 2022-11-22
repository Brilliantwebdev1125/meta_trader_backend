import EquityTrackingClient from './clients/equityTracking/equityTracking.client';
import {RetryOptions} from './clients/httpClient';

/**
 * MetaApi risk management API SDK
 */
export default class RiskManagement {

  /**
   * Constructs class instance
   * @param {String} token authorization API token (access tokens are not supported)
   * @param {RiskManagementOptions} opts connection options
   */
  constructor(token: string, opts?: RiskManagementOptions);

  /**
   * Returns RiskManagement equity tracking API
   * @returns {EquityTrackingClient} tracking API
   */
  get riskManagementApi(): EquityTrackingClient;

}

/**
 * Risk management SDK options
 */
export declare type RiskManagementOptions = {
  /**
   * domain to connect to
   */
  domain?: string,
  
  /**
   * timeout for http requests in seconds
   */
  requestTimeout?: number,
  /**
   * timeout for extended http requests in seconds
   */
  extendedTimeout?: number,
  /**
   * retry options for http requests
   */
  retryOptions?: RetryOptions
};
