import * as chai from 'chai';
import 'mocha';
import { mythNotifier, httpRouter } from '../src'
import { notifyEvent } from '../src/events'
import * as express from 'express';
import chaiHttp = require('chai-http');
import { Server } from 'http';
import { scrubPayload } from '../src/router';

chai.use(chaiHttp);

describe('Myth Event Emitter', function () {
    const testSender = 'testSender';
    const event = 'KEY_01';
    const testMessage = {
        SENDER: testSender
    }
    context('Sender Event', () => {
        let app: express.Express | undefined;
        let server: Server
        before(function () {
            app = express();
            server = app.use(httpRouter)
                .listen(10000);
        })

        after(function () {
            if (server) {
                server.close()
            }
        })
        it('should call notifyEvent from express using SENDER', function (done) {
            const senderEmitter = mythNotifier.hostEmitter(testSender + 'HttpSender');
            senderEmitter.on(event, (message) => {
                try {
                    chai.expect(message).eql({
                        EVENTNAME: event,
                        SENDER: testSender + 'HttpSender'
                    });
                    done();
                } catch (err) {
                    done(err)
                }
            })
            chai.request(app)
                .put('/')
                .send({
                    EVENTNAME: event,
                    SENDER: testSender + 'HttpSender'
                })
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                })
        })
        it('should call notifyEvent from express using HOSTNAME', function (done) {
            const senderEmitter = mythNotifier.hostEmitter(testSender + 'HttpHostName');
            senderEmitter.on(event, (message) => {
                try {
                    chai.expect(message).eql({
                        EVENTNAME: event,
                        SENDER: testSender + 'HttpHostSenderHttp',
                        HOSTNAME:testSender + 'HttpHostName'
                    });
                    done();
                } catch (err) {
                    done(err)
                }
            })
            chai.request(app)
                .put('/')
                .send({
                    EVENTNAME: event,
                    SENDER: testSender + 'HttpHostSenderHttp',
                    HOSTNAME:testSender + 'HttpHostName'
                })
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                })
        })
        it('should notify sender', function (done) {
            const senderEmitter = mythNotifier.hostEmitter(testSender + 'Event');
            senderEmitter.on(event, (message) => {
                try {
                    chai.expect(message).eql(testMessage);
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testSender + 'Event', testMessage);
        })
        it('should call pre', function (done) {
            const senderEmitter = mythNotifier.hostEmitter(testSender + 'Pre');
            senderEmitter.on('pre', (eventType, message) => {
                try {
                    chai.expect(eventType).eql(event)
                    chai.expect(message).eql(testMessage);
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testSender + 'Pre', testMessage);
        })
        it('should call post', function (done) {
            const senderEmitter = mythNotifier.hostEmitter(testSender + 'Post');
            senderEmitter.on('post', (eventType, message) => {
                try {
                    chai.expect(eventType).eql(event)
                    chai.expect(message).eql(testMessage);
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testSender + 'Post', testMessage);
        })
    })

    context('MythEvent', () => {
        after(() => {
            mythNotifier.removeAllListeners('MythEvent');
        })
        it('should emit MythEvent from notifyEvent', function (done) {
            mythNotifier.on('MythEvent', (sender, eventType, message) => {
                try {
                    chai.expect(sender).eql(testSender);
                    chai.expect(eventType).eql(event)
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testSender, {
                SENDER: ''
            });
        })
    })
    context('Scrub Message', () => {
        const expectedDate = new Date('2019-10-30T00:18:29Z')
        //"ENDTIME":"20191029201829","ENDTIMEISO":"2019-10-29T20:18:29","ENDTIMEISOUTC":"2019-10-30T00:18:29Z","ENDTIMEUTC":"20191030001829"

        it('should parse ENDTIME', function () {
            const scrubbed = scrubPayload({
                ENDTIME: '20191029201829'
            })
            chai.expect(scrubbed)
                .to.have.property('ENDTIME')
                .to.eql(expectedDate)
        })
        it('should parse ENDTIMEISO', function () {
            const scrubbed = scrubPayload({
                ENDTIMEISO: '2019-10-29T20:18:29'
            })
            chai.expect(scrubbed)
                .to.have.property('ENDTIMEISO')
                .to.eql(expectedDate)
        })
        it('should parse ENDTIMEISOUTC', function () {
            const scrubbed = scrubPayload({
                ENDTIMEISOUTC: '2019-10-30T00:18:29Z'
            })
            chai.expect(scrubbed)
                .to.have.property('ENDTIMEISOUTC')
                .to.eql(expectedDate)
        })
        it('should parse ENDTIMEUTC', function () {
            const scrubbed = scrubPayload({
                ENDTIMEUTC: '20191030001829'
            })
            chai.expect(scrubbed)
                .to.have.property('ENDTIMEUTC')
                .to.eql(expectedDate)
        })
        it('should undefine ENDTIMEUTC', function () {
            const scrubbed = scrubPayload({
                ENDTIMEUTC: '%ENDTIMEUTC%'
            })
            chai.expect(scrubbed)
                .to.have.property('ENDTIMEUTC')
                .to.be.undefined
        })
        it('should undefine ORIGINALAIRDATE', function () {
            const scrubbed = scrubPayload({
                ORIGINALAIRDATE: '2019-10-30'
            })
            chai.expect(scrubbed)
                .to.have.property('ORIGINALAIRDATE')
                .to.be.eql(new Date('2019-10-30T00:00:00'))
        })
    })
})