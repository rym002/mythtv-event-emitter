import { EventMapping } from './messages'
import { EventEmitter } from 'events';

type MythEvent = 'MythEvent';
type EndpointNotificationTypes = 'pre' | 'post';

export function notifyEvent<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, sender: string, eventMessage: P): void {
    mythNotifier.emit('MythEvent', sender, eventType, eventMessage);
}
export interface MythEndpointEventEmitter {
    emit<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, message: P): boolean
    on<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    once<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    prependListener<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    removeListener<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    removeAllListeners<T extends keyof EventMapping>(eventType: T): this

    emit<T extends keyof EventMapping, P extends EventMapping[T]>(event: EndpointNotificationTypes, eventType: T, message: P): boolean;
    on<T extends keyof EventMapping, P extends EventMapping[T]>(event: EndpointNotificationTypes, listener: (eventType: T, message: P) => void): this
    once<T extends keyof EventMapping, P extends EventMapping[T]>(event: EndpointNotificationTypes, listener: (eventType: T, message: P) => void): this
    prependListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: EndpointNotificationTypes, listener: (eventType: T, message: P) => void): this
    removeListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: EndpointNotificationTypes, listener: (eventType: T, message: P) => void): this
    removeAllListeners(event: EndpointNotificationTypes): this
}

export interface MythEventEmitter {
    emit<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, endpoint: string, eventType: T, message: P): boolean;
    on<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (endpoint: string, eventType: T, message: P) => void): this
    once<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (endpoint: string, eventType: T, message: P) => void): this
    removeListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (endpoint: string, eventType: T, message: P) => void): this
    prependListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (endpoint: string, eventType: T, message: P) => void): this
    endpoint(endpoint: String): MythEndpointEventEmitter
    removeAllListeners(event: MythEvent): this
}

class MythEmitter extends EventEmitter implements MythEventEmitter {
    private endpoints = new Map<string, MythEndpointEventEmitter>();
    constructor() {
        super();
        this.on('MythEvent', this.handleEndpointNotification);
    }
    public endpoint(endpoint: string): MythEndpointEventEmitter {
        let ret = this.endpoints.get(endpoint);
        if (!ret) {
            ret = new EventEmitter();
            this.endpoints.set(endpoint, ret);
        }
        return ret;
    }
    private handleEndpointNotification<T extends keyof EventMapping, P extends EventMapping[T]>(endpoint: string, eventType: T, message: P) {
        const endpointEmitter = this.endpoint(endpoint);
        endpointEmitter.emit('pre', eventType, message);
        endpointEmitter.emit(eventType, message);
        endpointEmitter.emit('post', eventType, message);
    }
}

export const mythNotifier: MythEventEmitter = new MythEmitter();
