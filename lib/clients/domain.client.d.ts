import HttpClient from "./httpClient";

/**
 * Connection URL and request managing client
 */
export default class DomainClient {

  /**
   * Constructs domain client instance
   * @param {HttpClient} httpClient HTTP client
   * @param {string} token authorization token
   * @param {String} apiPath api url part
   * @param {string} domain domain to connect to, default is agiliumtrade.agiliumtrade.ai
   */
  constructor(httpClient: HttpClient, token: string, apiPath: string, domain: string);

  /**
   * Returns domain client domain
   * @returns {string} client domain
   */
  get domain(): string;

  /**
   * Returns domain client token
   * @returns {string} client token
   */
  get token(): string;

  /**
   * Sends an API request
   * @param {Object} opts options request options
   * @param {Boolean} [isExtendedTimeout] whether to run the request with an extended timeout
   * @returns {Promise<Object|String|any>} request result
   */
  requestApi(opts: Object, isExtendedTimeout?: boolean): Promise<any>;

  /**
   * Sends an http request
   * @param {object} opts options request options
   * @returns {Promise<object|string|any>} request result
   */
  request(opts: Object): Promise<any>;

}
