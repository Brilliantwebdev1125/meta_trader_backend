'use strict';

import HttpClient from './httpClient';
import sinon from 'sinon';
import DomainClient from './domain.client';
import { ValidationError, InternalError } from './errorHandler';

/**
 * @test {DomainClient}
 */
describe('DomainClient', () => {

  let domainClient;
  const token = 'header.payload.sign';
  let httpClient = new HttpClient();
  let sandbox;
  let requestStub;
  let getRegionsStub;
  let getHostStub;
  let clock;
  const expected = [{_id: 'ABCD'}];

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    domainClient = new DomainClient(httpClient, token, 'risk-management-api-v1');
    clock = sandbox.useFakeTimers({shouldAdvanceTime: true});
    requestStub = sandbox.stub(httpClient, 'request');
    requestStub.withArgs({
      url: 'https://risk-management-api-v1.vint-hill.agiliumtrade.agiliumtrade.ai/some/rest/api',
      method: 'GET',
      headers: {'auth-token': token},
      json: true
    }).resolves(expected);
    getRegionsStub = requestStub.withArgs({
      url: 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/regions',
      method: 'GET',
      headers: {'auth-token': token},
      json: true,
    }).resolves(['vint-hill', 'us-west']);
    getHostStub = requestStub.withArgs({
      url: 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/servers/mt-client-api',
      method: 'GET',
      headers: {'auth-token': token},
      json: true,
    }).resolves({domain: 'agiliumtrade.agiliumtrade.ai'});
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  /**
   * @test {DomainClient#requestApi}
   */
  describe('requestApi', () => {

    const opts = {
      url: '/some/rest/api',
      method: 'GET'
    };

    /**
     * @test {DomainClient#requestApi}
     */
    it('should execute request', async () => {
      const response = await domainClient.requestApi(opts);
      sinon.assert.match(response, expected);
      sinon.assert.calledWith(requestStub, {
        url: 'https://risk-management-api-v1.vint-hill.agiliumtrade.agiliumtrade.ai/some/rest/api',
        method: 'GET',
        headers: {'auth-token': token},
        json: true
      });
    });

    /**
     * @test {DomainClient#requestApi}
     */
    it('should use cached url on repeated request', async () => {
      await domainClient.requestApi(opts);
      const response = await domainClient.requestApi(opts);
      sinon.assert.calledWith(requestStub, {
        url: 'https://risk-management-api-v1.vint-hill.agiliumtrade.agiliumtrade.ai/some/rest/api',
        method: 'GET',
        headers: {'auth-token': token},
        json: true
      });
      sinon.assert.match(response, expected);
      sinon.assert.calledOnce(getHostStub);
      sinon.assert.calledOnce(getRegionsStub);
    });

    /**
     * @test {DomainClient#requestApi}
     */
    it('should request url again if expired', async () => {
      await domainClient.requestApi(opts);
      await clock.tickAsync(610000);
      const response = await domainClient.requestApi(opts);
      sinon.assert.match(response, expected);
      sinon.assert.calledWith(requestStub, {
        url: 'https://risk-management-api-v1.vint-hill.agiliumtrade.agiliumtrade.ai/some/rest/api',
        method: 'GET',
        headers: {'auth-token': token},
        json: true
      });
      sinon.assert.calledTwice(getHostStub);
      sinon.assert.calledTwice(getRegionsStub);
    });

    /**
     * @test {DomainClient#requestApi}
     */
    it('should return request error', async () => {
      requestStub.withArgs({
        url: 'https://risk-management-api-v1.vint-hill.agiliumtrade.agiliumtrade.ai/some/rest/api',
        method: 'GET',
        headers: {'auth-token': token},
        json: true
      }).throws(new ValidationError('test'));
      try {
        await domainClient.requestApi(opts);
        throw new Error('ValidationError expected');
      } catch (error) {
        error.name.should.equal('ValidationError');
      }
    });

    /**
     * @test {DomainClient#requestApi}
     */
    it('should return error if failed to get host', async () => {
      getHostStub.throws(new ValidationError('test'));
      try {
        await domainClient.requestApi(opts);
        throw new Error('ValidationError expected');
      } catch (error) {
        error.name.should.equal('ValidationError');
      }
    });

    /**
     * @test {DomainClient#requestApi}
     */
    describe('regions', () => {

      /**
       * @test {DomainClient#requestApi}
       */
      it('should return error if failed to get regions', async () => {
        getRegionsStub.throws(new ValidationError('test'));
        try {
          await domainClient.requestApi(opts);
          throw new Error('ValidationError expected');
        } catch (error) {
          error.name.should.equal('ValidationError');
        }
      });

      /**
       * @test {DomainClient#requestApi}
       */
      it('should try another region if the first failed', async () => {
        requestStub.withArgs({
          url: 'https://risk-management-api-v1.vint-hill.agiliumtrade.agiliumtrade.ai/some/rest/api',
          method: 'GET',
          headers: {'auth-token': token},
          json: true
        }).rejects(new InternalError('test'));
        requestStub.withArgs({
          url: 'https://risk-management-api-v1.us-west.agiliumtrade.agiliumtrade.ai/some/rest/api',
          method: 'GET',
          headers: {'auth-token': token},
          json: true
        }).resolves(expected);
        const response = await domainClient.requestApi(opts);
        sinon.assert.calledWith(requestStub, {
          url: 'https://risk-management-api-v1.us-west.agiliumtrade.agiliumtrade.ai/some/rest/api',
          method: 'GET',
          headers: {'auth-token': token},
          json: true
        });
        sinon.assert.match(response, expected);

        sinon.assert.calledOnce(getHostStub);
        sinon.assert.calledOnce(getRegionsStub);
      });

      /**
       * @test {DomainClient#requestApi}
       */
      it('should return error if all regions failed', async () => {
        requestStub.withArgs({
          url: 'https://risk-management-api-v1.vint-hill.agiliumtrade.agiliumtrade.ai/some/rest/api',
          method: 'GET',
          headers: {'auth-token': token},
          json: true
        }).throws(new InternalError('test'));
        requestStub.withArgs({
          url: 'https://risk-management-api-v1.us-west.agiliumtrade.agiliumtrade.ai/some/rest/api',
          method: 'GET',
          headers: {'auth-token': token},
          json: true
        }).throws(new InternalError('test'));

        try {
          await domainClient.requestApi(opts);
          throw new Error('InternalError expected');
        } catch (error) {
          error.name.should.equal('InternalError');
        }
      });

    });

  });

  /**
   * @test {DomainClient#request}
   */
  describe('request', () => {

    it('should execute request', async () => {
      const opts = {
        url:  'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/accountId',
        method: 'GET',
        headers: {
          'auth-token': token
        },
        json: true
      };

      requestStub.withArgs(opts).resolves(expected);
      const response = await domainClient.request(opts);
      sinon.assert.match(response, expected);
      sinon.assert.calledWith(requestStub, opts);
    });

  });

});
