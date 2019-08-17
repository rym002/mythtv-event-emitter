import * as chai from 'chai';
import 'mocha';
import { mythNotifier, httpRouter } from '../src'
import { notifyEvent } from '../src/events'
import * as express from 'express';
import chaiHttp = require('chai-http');
import { Server } from 'http';

chai.use(chaiHttp);

describe('Myth Event Emitter', function () {
    const testEndpoint = 'testEndpoint';
    const event = 'USER_1';

    context('Endpoint Event', () => {
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
            const endpointEmitter = mythNotifier.endpoint(testEndpoint + 'Http');
            endpointEmitter.on(event, (message) => {
                try {
                    chai.expect(message).eql({
                        EVENTNAME: event,
                        SENDER: testEndpoint + 'Http'
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
                    SENDER: testEndpoint + 'Http'
                })
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                })
        })
        it('should notify endpoint', function (done) {
            const endpointEmitter = mythNotifier.endpoint(testEndpoint + 'Event');
            endpointEmitter.on(event, (message) => {
                try {
                    chai.expect(message).eql({});
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testEndpoint + 'Event', {});
        })
        it('should call pre', function (done) {
            const endpointEmitter = mythNotifier.endpoint(testEndpoint + 'Pre');
            endpointEmitter.on('pre', (eventType, message) => {
                try {
                    chai.expect(eventType).eql(event)
                    chai.expect(message).eql({});
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testEndpoint + 'Pre', {});
        })
        it('should call post', function (done) {
            const endpointEmitter = mythNotifier.endpoint(testEndpoint + 'Post');
            endpointEmitter.on('post', (eventType, message) => {
                try {
                    chai.expect(eventType).eql(event)
                    chai.expect(message).eql({});
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testEndpoint + 'Post', {});
        })
    })

    context('MythEvent',()=>{
        after(()=>{
            mythNotifier.removeAllListeners('MythEvent');
        })
        it('should emit MythEvent from notifyEvent', function (done) {
            mythNotifier.on('MythEvent', (endpoint, eventType, message) => {
                try {
                    chai.expect(endpoint).eql(testEndpoint);
                    chai.expect(eventType).eql(event)
                    done();
                } catch (err) {
                    done(err)
                }
            })
            notifyEvent(event, testEndpoint, {});
        })    
    })
})