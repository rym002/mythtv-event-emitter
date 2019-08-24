import * as chai from 'chai';
import 'mocha';
import { mythNotifier, httpRouter } from '../src'
import { notifyEvent } from '../src/events'
import * as express from 'express';
import chaiHttp = require('chai-http');
import { Server } from 'http';

chai.use(chaiHttp);

describe('Myth Event Emitter', function () {
    const testSender = 'testSender';
    const event = 'USER_1';

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
        it('should call notifyEvent from express', function (done) {
            const senderEmitter = mythNotifier.sender(testSender + 'Http');
            senderEmitter.on(event, (message) => {
                try {
                    chai.expect(message).eql({
                        EVENTNAME: event,
                        SENDER: testSender + 'Http'
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
                    SENDER: testSender + 'Http'
                })
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                })
        })
        it('should notify sender', function (done) {
            const senderEmitter = mythNotifier.sender(testSender + 'Event');
            senderEmitter.on(event, (message) => {
                try {
                    chai.expect(message).eql({});
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testSender + 'Event', {});
        })
        it('should call pre', function (done) {
            const senderEmitter = mythNotifier.sender(testSender + 'Pre');
            senderEmitter.on('pre', (eventType, message) => {
                try {
                    chai.expect(eventType).eql(event)
                    chai.expect(message).eql({});
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testSender + 'Pre', {});
        })
        it('should call post', function (done) {
            const senderEmitter = mythNotifier.sender(testSender + 'Post');
            senderEmitter.on('post', (eventType, message) => {
                try {
                    chai.expect(eventType).eql(event)
                    chai.expect(message).eql({});
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testSender + 'Post', {});
        })
    })

    context('MythEvent',()=>{
        after(()=>{
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
            notifyEvent(event, testSender, {});
        })    
    })
})