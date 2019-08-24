import { EventMapping } from './messages'
import { EventEmitter } from 'events';

type MythEvent = 'MythEvent';
type SenderNotificationTypes = 'pre' | 'post';

export function notifyEvent<T extends keyof EventMapping, P extends EventMapping[T]>(eventType: T, sender: string, eventMessage: P): void {
    mythNotifier.emit('MythEvent', sender, eventType, eventMessage);
}
export interface MythSenderEventEmitter {
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
    sender(sender: String): MythSenderEventEmitter
    removeAllListeners(event: MythEvent): this
}

class MythEmitter extends EventEmitter implements MythEventEmitter {
    private senders = new Map<string, MythSenderEventEmitter>();
    constructor() {
        super();
        this.on('MythEvent', this.handleSenderNotification);
    }
    public sender(sender: string): MythSenderEventEmitter {
        let ret = this.senders.get(sender);
        if (!ret) {
            ret = new EventEmitter();
            this.senders.set(sender, ret);
        }
        return ret;
    }
    private handleSenderNotification<T extends keyof EventMapping, P extends EventMapping[T]>(sender: string, eventType: T, message: P) {
        const senderEmitter = this.sender(sender);
        senderEmitter.emit('pre', eventType, message);
        senderEmitter.emit(eventType, message);
        senderEmitter.emit('post', eventType, message);
    }
}

export const mythNotifier: MythEventEmitter = new MythEmitter();
