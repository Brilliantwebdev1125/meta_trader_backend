'use strict';

import sinon from 'sinon';
import DrawdownListener from './drawdownListener';
import DrawdownListenerManager from './drawdownListenerManager';

/**
 * @test {DrawdownListenerManager}
 */
describe('DrawdownListenerManager', () => {

  let domainClient = {
    requestApi: () => {}
  };
  let sandbox;
  let clock;
  let drawdownListenerManager;
  let getDrawdownStub, listener, callStub;

  let expected = [{
    sequenceNumber: 2,
    accountId: 'accountId',
    trackerId: 'trackerId',
    period: 'day',
    startBrokerTime: '2022-04-08 00:00:00.000',
    endBrokerTime: '2022-04-08 23:59:59.999',
    brokerTime: '2022-04-08 09:36:00.000',
    absoluteDrawdown: 250,
    relativeDrawdown: 0.25
  },
  {
    sequenceNumber: 3,
    accountId: 'accountId',
    trackerId: 'trackerId',
    period: 'day',
    startBrokerTime: '2022-04-08 00:00:00.000',
    endBrokerTime: '2022-04-08 23:59:59.999',
    brokerTime: '2022-04-08 09:36:00.000',
    absoluteDrawdown: 250,
    relativeDrawdown: 0.25
  }];

  let expected2 = [{
    sequenceNumber: 4,
    accountId: 'accountId',
    trackerId: 'trackerId',
    period: 'day',
    startBrokerTime: '2022-04-08 00:00:00.000',
    endBrokerTime: '2022-04-08 23:59:59.999',
    brokerTime: '2022-04-08 09:36:00.000',
    absoluteDrawdown: 250,
    relativeDrawdown: 0.25
  },
  {
    sequenceNumber: 5,
    accountId: 'accountId',
    trackerId: 'trackerId',
    period: 'day',
    startBrokerTime: '2022-04-08 00:00:00.000',
    endBrokerTime: '2022-04-08 23:59:59.999',
    brokerTime: '2022-04-08 09:36:00.000',
    absoluteDrawdown: 250,
    relativeDrawdown: 0.25
  }];


  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    clock = sandbox.useFakeTimers({shouldAdvanceTime: true});
    drawdownListenerManager = new DrawdownListenerManager(domainClient);
    getDrawdownStub = sandbox.stub(domainClient, 'requestApi');
    getDrawdownStub
      .callsFake(async (opts) => {
        await new Promise(res => setTimeout(res, 1000));
        return [];
      })
      .withArgs({
        url: '/users/current/drawdown-events/stream',
        method: 'GET',
        qs: {
          previousSequenceNumber: 1,
          accountId: 'accountId',
          trackerId: 'trackerId',
          limit: 1000
        }
      })
      .callsFake(async (opts) => {
        await new Promise(res => setTimeout(res, 1000));
        return expected;
      })
      .withArgs({
        url: '/users/current/drawdown-events/stream',
        method: 'GET',
        qs: {
          previousSequenceNumber: 3,
          accountId: 'accountId',
          trackerId: 'trackerId',
          limit: 1000
        }
      }).callsFake(async (opts) => {
        await new Promise(res => setTimeout(res, 1000));
        return expected2;
      });

    callStub = sinon.stub();

    class Listener extends DrawdownListener {

      async onDrawdown(drawdownEvent) {
        callStub(drawdownEvent);
      }

    }

    listener = new Listener();
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  /**
   * @test {DrawdownListenerManager#addDrawdownListener}
   */
  it('should add drawdown listener', async () => {
    const id = drawdownListenerManager.addDrawdownListener(listener, 'accountId', 'trackerId', 1);
    await clock.tickAsync(2200);
    sinon.assert.callCount(callStub, 4);
    callStub.args[0][0].should.equal(expected[0]);
    callStub.args[1][0].should.equal(expected[1]);
    callStub.args[2][0].should.equal(expected2[0]);
    callStub.args[3][0].should.equal(expected2[1]);
    drawdownListenerManager.removeDrawdownListener(id);
  });

  /**
   * @test {DrawdownListenerManager#addDrawdownListener}
   */
  it('should remove drawdown listener', async () => {
    const id = drawdownListenerManager.addDrawdownListener(listener, 'accountId', 'trackerId', 1);
    await clock.tickAsync(800);
    drawdownListenerManager.removeDrawdownListener(id);
    await clock.tickAsync(2200);
    sinon.assert.calledWith(callStub, expected[0]);
    sinon.assert.calledWith(callStub, expected[1]);
    sinon.assert.callCount(callStub, 2);
  });

  /**
   * @test {DrawdownListenerManager#addDrawdownListener}
   */
  it('should wait if error returned', async () => {
    getDrawdownStub
      .callsFake(async (opts) => {
        await new Promise(res => setTimeout(res, 500));
        return [];
      })
      .withArgs({
        url: '/users/current/drawdown-events/stream',
        method: 'GET',
        qs: {
          previousSequenceNumber: 1,
          accountId: 'accountId',
          trackerId: 'trackerId',
          limit: 1000
        }
      }).callsFake(async (opts) => {
        await new Promise(res => setTimeout(res, 500));
        return expected;
      })
      .onFirstCall().rejects(new Error('test'))
      .onSecondCall().rejects(new Error('test'));
    const id = drawdownListenerManager.addDrawdownListener(listener, 'accountId', 'trackerId', 1);
    await clock.tickAsync(600);
    sinon.assert.callCount(getDrawdownStub, 1);
    sinon.assert.notCalled(callStub);
    await clock.tickAsync(600);
    sinon.assert.callCount(getDrawdownStub, 2);
    sinon.assert.notCalled(callStub);
    await clock.tickAsync(2000);
    sinon.assert.callCount(getDrawdownStub, 3);
    sinon.assert.notCalled(callStub);
    await clock.tickAsync(800);
    sinon.assert.calledWith(callStub, expected[0]);
    sinon.assert.calledWith(callStub, expected[1]);
    drawdownListenerManager.removeDrawdownListener(id);
  });

});
