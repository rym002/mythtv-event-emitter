import { EventMapping } from './messages'
import { EventEmitter } from 'events';

type MythEvent = 'MythEvent';
type SenderNotificationTypes = 'pre' | 'post';

export function notifyEvent<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, sender: string, eventMessage: P): void {
    mythNotifier.emit('MythEvent', sender, eventType, eventMessage);
}
export interface MythHostEventEmitter {
    emit<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, message: P): boolean
    on<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    once<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    prependListener<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    removeListener<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, listener: (message: P) => void): this
    removeAllListeners<T extends keyof EventMapping>(eventType: T): this

    emit<T extends keyof EventMapping, P extends EventMapping[T]>(event: SenderNotificationTypes, eventType: T, message: P): boolean;
    on<T extends keyof EventMapping, P extends EventMapping[T]>(event: SenderNotificationTypes, listener: (eventType: T, message: P) => void): this
    once<T extends keyof EventMapping, P extends EventMapping[T]>(event: SenderNotificationTypes, listener: (eventType: T, message: P) => void): this
    prependListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: SenderNotificationTypes, listener: (eventType: T, message: P) => void): this
    removeListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: SenderNotificationTypes, listener: (eventType: T, message: P) => void): this
    removeAllListeners(event: SenderNotificationTypes): this
}

export interface MythEventEmitter {
    emit<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, sender: string, eventType: T, message: P): boolean;
    on<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (sender: string, eventType: T, message: P) => void): this
    once<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (sender: string, eventType: T, message: P) => void): this
    removeListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (sender: string, eventType: T, message: P) => void): this
    prependListener<T extends keyof EventMapping, P extends EventMapping[T]>(event: MythEvent, listener: (sender: string, eventType: T, message: P) => void): this
    hostEmitter(sender: String): MythHostEventEmitter
    removeAllListeners(event: MythEvent): this
}

class MythEmitter extends EventEmitter implements MythEventEmitter {
    private hosts = new Map<string, MythHostEventEmitter>();
    constructor() {
        super();
        this.on('MythEvent', this.handleNotification);
    }
    public hostEmitter(host: string): MythHostEventEmitter {
        let ret = this.hosts.get(host);
        if (!ret) {
            ret = new EventEmitter();
            this.hosts.set(host, ret);
        }
        return ret;
    }
    private handleNotification<T extends keyof EventMapping, P extends EventMapping[T]>(sender: string, eventType: T, message: P) {
        const eventEmitter = this.hostEmitter(sender);
        eventEmitter.emit('pre', eventType, message);
        eventEmitter.emit(eventType, message);
        eventEmitter.emit('post', eventType, message);
    }
}

export const mythNotifier: MythEventEmitter = new MythEmitter();
