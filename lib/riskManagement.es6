'use strict';

import HttpClient from './clients/httpClient';
import EquityTrackingClient from './clients/equityTracking/equityTracking.client';
import DomainClient from './clients/domain.client';

/**
 * MetaApi risk management API SDK
 */
export default class RiskManagement {

  /**
   * Risk management SDK options
   * @typedef RiskManagementOptions
   * @property {String} [domain] domain to connect to
   * @property {Number} [requestTimeout] timeout for http requests in seconds
   * @property {Number} [extendedTimeout] timeout for extended http requests in seconds
   * @property {RetryOptions} [retryOpts] retry options for http requests
   */

  /**
   * Constructs class instance
   * @param {String} token authorization API token (access tokens are not supported)
   * @param {RiskManagementOptions} opts connection options
   */
  constructor(token, opts = {}) {
    this._domain = opts.domain || 'agiliumtrade.agiliumtrade.ai';
    let requestTimeout = opts.requestTimeout || 10;
    let requestExtendedTimeout = opts.extendedTimeout || 70;
    let retryOpts = opts.retryOpts || {};
    this._httpClient = new HttpClient(requestTimeout, requestExtendedTimeout, retryOpts);
    this._domainClient = new DomainClient(this._httpClient, token, 'risk-management-api-v1', this._domain);
    this._equityTrackingClient = new EquityTrackingClient(this._domainClient);
  }

  /**
   * Returns RiskManagement equity tracking API
   * @returns {EquityTrackingClient} tracking API
   */
  get riskManagementApi() {
    return this._equityTrackingClient;
  }

}
