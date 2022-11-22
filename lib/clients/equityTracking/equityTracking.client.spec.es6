'use strict';

import EquityTrackingClient from './equityTracking.client';
import DrawdownListener from './drawdownListener';
import sinon from 'sinon';
import 'should';

/**
 * @test {EquityTrackingClient}
 */
describe('EquityTrackingClient', () => {

  let sandbox;
  let equityTrackingClient;
  let requestApiStub;
  let domainClient = {
    requestApi: () => {}
  };

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    equityTrackingClient = new EquityTrackingClient(domainClient);
    requestApiStub = sandbox.stub(domainClient, 'requestApi');
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * @test {EquityTrackingClient#createDrawdownTracker}
   */
  it('should create drawdown tracker', async () => {
    let expected = {id: 'trackerId'};
    let tracker = {name: 'trackerName'};
    requestApiStub.resolves(expected);
    
    let actual = await equityTrackingClient.createDrawdownTracker('accountId', tracker);
    actual.should.equal(expected);
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/accounts/accountId/drawdown-trackers',
      method: 'POST',
      body: tracker
    });
  });

  /**
   * @test {EquityTrackingClient#getDrawdownTrackers}
   */
  it('should retrieve drawdown trackers', async () => {
    let expected = [{name: 'trackerName'}];
    requestApiStub.resolves(expected);

    let actual = await equityTrackingClient.getDrawdownTrackers('accountId');
    actual.should.equal(expected);
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/accounts/accountId/drawdown-trackers',
      method: 'GET'
    });
  });

  /**
   * @test {EquityTrackingClient#getDrawdownTrackerByName}
   */
  it('should retrieve drawdown tracker by name', async () => {
    let expected = {name: 'trackerName'};
    requestApiStub.resolves(expected);

    let actual = await equityTrackingClient.getDrawdownTrackerByName('accountId', 'name');
    actual.should.equal(expected);
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/accounts/accountId/drawdown-trackers/name/name',
      method: 'GET'
    });
  });

  /**
   * @test {EquityTrackingClient#updateDrawdownTracker}
   */
  it('should update drawdown tracker', async () => {
    let update = {name: 'newTrackerName'};
    await equityTrackingClient.updateDrawdownTracker('accountId', 'trackerId', update);
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/accounts/accountId/drawdown-trackers/trackerId',
      method: 'PUT',
      body: update
    });
  });

  /**
   * @test {EquityTrackingClient#deleteDrawdownTracker}
   */
  it('should delete drawdown tracker', async () => {
    await equityTrackingClient.deleteDrawdownTracker('accountId', 'trackerId');
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/accounts/accountId/drawdown-trackers/trackerId',
      method: 'DELETE'
    });
  });

  /**
   * @test {EquityTrackingClient#getDrawdownEvents}
   */
  it('should retrieve drawdown events', async () => {
    let expected = [{
      sequenceNumber: 1,
      accountId: 'accountId',
      trackerId: 'trackerId',
      period: 'day',
      startBrokerTime: '2022-04-08 00:00:00.000',
      endBrokerTime: '2022-04-08 23:59:59.999',
      brokerTime: '2022-04-08 09:36:00.000',
      absoluteDrawdown: 250,
      relativeDrawdown: 0.25
    }];
    requestApiStub.resolves(expected);

    let actual = await equityTrackingClient.getDrawdownEvents('2022-04-08 09:36:00.000', '2022-04-08 10:36:00.000',
      'accountId', 'trackerId', 100);
    actual.should.equal(expected);
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/drawdown-events/by-broker-time',
      qs: {
        startBrokerTime: '2022-04-08 09:36:00.000',
        endBrokerTime: '2022-04-08 10:36:00.000',
        accountId: 'accountId',
        trackerId: 'trackerId',
        limit: 100
      },
      method: 'GET'
    });
  });

  /**
   * @test {EquityTrackingClient#getDrawdownStatistics}
   */
  it('should retrieve drawdown statistics', async () => {
    let expected = [{
      period: 'day',
      startBrokerTime: '2022-04-08 00:00:00.000',
      endBrokerTime: '2022-04-08 23:59:59.999',
      initialBalance: 1000,
      maxDrawdownTime: '2022-04-08 09:36:00.000',
      maxAbsoluteDrawdown: 250,
      maxRelativeDrawdown: 0.25,
      thresholdExceeded: true
    }];
    requestApiStub.resolves(expected);

    let actual = await equityTrackingClient.getDrawdownStatistics('accountId', 'trackerId', '2022-04-08 09:36:00.000',
      100);
    actual.should.equal(expected);
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/accounts/accountId/drawdown-trackers/trackerId/statistics',
      qs: {startTime: '2022-04-08 09:36:00.000', limit: 100},
      method: 'GET'
    });
  });

  /**
   * @test {EquityTrackingClient#getEquityChart}
   */
  it('should retrieve equity chart', async () => {
    let expected = [{
      startBrokerTime: '2022-04-08 00:00:00.000',
      endBrokerTime: '2022-04-08 23:59:59.999',
      averageBalance: 1050,
      minBalance: 100,
      maxBalance: 2000,
      averageEquity: 1075,
      minEquity: 50,
      maxEquity: 2100
    }];
    requestApiStub.resolves(expected);

    let actual = await equityTrackingClient.getEquityChart('accountId', '2022-04-08 09:36:00.000',
      '2022-04-08 10:36:00.000');
    actual.should.equal(expected);
    sinon.assert.calledOnceWithExactly(domainClient.requestApi, {
      url: '/users/current/accounts/accountId/equity-chart',
      qs: {
        startTime: '2022-04-08 09:36:00.000',
        endTime: '2022-04-08 10:36:00.000'
      },
      method: 'GET'
    });
  });

  /**
   * @test {EquityTrackingClient#addDrawdownListener}
   * @test {EquityTrackingClient#removeDrawdownListener}
   */
  describe('drawdownListener', () => {

    let listener;

    beforeEach(() => {

      class Listener extends DrawdownListener {
        async onDrawdown(drawdownEvents) {}
      }

      listener = new Listener();
    });

    /**
     * @test {EquityTrackingClient#addDrawdownListener}
     */
    it('should add drawdown listener', async () => {
      const callStub = sandbox.stub(equityTrackingClient._drawdownListenerManager, 'addDrawdownListener');
      equityTrackingClient.addDrawdownListener(listener, 'accountId', 'trackerId', 1);
      sinon.assert.calledWith(callStub, listener, 'accountId', 'trackerId', 1);
    });

    /**
     * @test {EquityTrackingClient#addDrawdownListener}
     */
    it('should remove drawdown listener', async () => {
      const callStub = sandbox.stub(equityTrackingClient._drawdownListenerManager, 'removeDrawdownListener');
      equityTrackingClient.removeDrawdownListener('id');
      sinon.assert.calledWith(callStub);
    });

  });

});
