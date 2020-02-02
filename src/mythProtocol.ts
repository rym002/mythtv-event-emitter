import { createConnection, Socket, NetConnectOpts } from 'net'
import { padEnd } from 'lodash'
import { notifyEvent, mythNotifier } from './events'
import { EventEmitter } from 'events'
import { dateFields } from './messages'
import moment = require("moment");

interface MessageHandler<T extends MessageTypes> {
    readonly messageType: T
    process(client: MythProtocolClient, message: string[]): void
}

interface MessageConstructor {
    constructMessage(): string
}

type MessageTypes = 'BACKEND_MESSAGE' | 'ACCEPT' | 'REJECT' | 'OK'

class DoneMessage implements MessageConstructor {
    constructMessage(): string {
        return 'DONE'
    }
}
abstract class AbstractMessageConstructor implements MessageConstructor {
    constructMessage(): string {
        return this.constructMessageParts().join(' ')
    }
    abstract constructMessageParts(): Array<string | number>
}

class MythProtoVersionMessage extends AbstractMessageConstructor {
    private static readonly _protocolVersions = new Map<number, string>()
    private readonly version: number
    constructor(version?: number) {
        super()
        this.version = version ? version : MythProtoVersionMessage.protocolVersions.entries().next().value[0]
    }
    private static get protocolVersions() {
        if (this._protocolVersions.size == 0) {
            this._protocolVersions.set(91, 'BuzzOff')
            this._protocolVersions.set(90, 'BuzzCut')
            this._protocolVersions.set(89, 'BuzzKill')
            this._protocolVersions.set(88, 'XmasGift')
            this._protocolVersions.set(85, 'BluePool')
        }
        return this._protocolVersions
    }
    constructMessageParts(): Array<string | number> {
        const token = MythProtoVersionMessage.protocolVersions.get(this.version)
        if (token != undefined) {
            return ['MYTH_PROTO_VERSION', this.version, token]
        } else {
            throw new Error('Unsupported proto version ' + this.version)
        }
    }

}

enum EventMode {
    NO_EVENT = 0,
    ALL_EVENTS = 1,
    NO_SYSTEM_EVENT = 2,
    ONLY_SYSTEM_EVENT = 3
}

class AnnMonitorMessage extends AbstractMessageConstructor {
    constructor(readonly hostname: string, readonly eventMode: EventMode) {
        super()
    }
    constructMessageParts(): (string | number)[] {
        return ['ANN', 'Monitor', this.hostname, this.eventMode]
    }
}

class RejectMessageHandler implements MessageHandler<'REJECT'>{
    readonly messageType = 'REJECT'

    process(client: MythProtocolClient, message: string[]): void {
        client.connectEmitter.emit('REJECT', Number(message[1]))
    }
}

class AcceptMessageHandler implements MessageHandler<'ACCEPT'>{
    readonly messageType = 'ACCEPT'
    process(client: MythProtocolClient, message: string[]): void {
        client.connectEmitter.emit('ACCEPT', Number(message[1]))
    }
}

class BackendMessageHandler implements MessageHandler<'BACKEND_MESSAGE'>{
    readonly messageType = "BACKEND_MESSAGE"
    private readonly dataSuffixes = ['UTC', 'ISO', 'ISOUTC']

    private addDateFields(fieldName: string, notificationMessage: any) {
        const dateValue = new Date(notificationMessage[fieldName])
        this.dataSuffixes.forEach(suffix => {
            notificationMessage[fieldName + suffix] = dateValue
        })
        notificationMessage[fieldName] = dateValue
    }
    process(client: MythProtocolClient, message: string[]): void {
        const eventMessage = message[1].split(' ')
        const notificationMessage: any = {}
        for (let i = 0; i < eventMessage.length; i += 2) {
            const key = eventMessage[i]
            const value = eventMessage[i + 1]
            notificationMessage[key] = value
            if (dateFields.indexOf(key) >= 0) {
                this.addDateFields(key, notificationMessage)
            } else if (key == 'ORIGINALAIRDATE') {
                notificationMessage[key] = moment(value, 'YYYY-MM-DD').toDate()
            }
        }
        const eventType = notificationMessage['SYSTEM_EVENT']
        const sender = notificationMessage['SENDER']
        notificationMessage['EVENTNAME'] = eventType
        notifyEvent(eventType, sender, notificationMessage)
    }
}

class OkMessageHandler implements MessageHandler<'OK'>{
    readonly messageType = "OK"
    process(client: MythProtocolClient, message: string[]): void {
        client.connectEmitter.emit('OK')
    }
}

class MythProtocolClient {
    private readonly messageHandlers = new Map<MessageTypes, MessageHandler<any>>()
    private static readonly LOCALE = 'utf-8'
    private static readonly LIST_DELIMITER = '[]:[]'
    private _connection?: Socket
    readonly connectEmitter = new EventEmitter()
    private readonly options: NetConnectOpts
    constructor(host: string, port?: number) {
        this.messageHandlers.set('ACCEPT', new AcceptMessageHandler())
        this.messageHandlers.set('BACKEND_MESSAGE', new BackendMessageHandler())
        this.messageHandlers.set('OK', new OkMessageHandler())
        this.messageHandlers.set('REJECT', new RejectMessageHandler())

        if (!port) {
            port = 6543
        }
        this.options = {
            port: port,
            host: host,
            timeout: 3
        }
    }
    private get connection() {
        if (!this._connection) {
            const lConnection = createConnection(this.options, () => {
                lConnection.on('data', (data) => {
                    let msgEnd = 0
                    while (msgEnd < data.length) {
                        msgEnd = this.readMessage(data, msgEnd)
                    }
                })
                lConnection.on('close', (had_error) => {
                    console.log('close backend connection')
                    this._connection = undefined
                    if (had_error) {
                        this.connectEmitter.emit('error', new Error('Connection Error'))
                    } else {
                        this.connectEmitter.emit('close')
                    }
                })
            })
            this._connection = lConnection
        }
        return this._connection
    }
    private createBackendMessage(message: string) {
        const msgLen = message.length
        const msgPrefix = padEnd(msgLen.toString(), 8)
        return msgPrefix + message;
    }

    private readMessage(data: Buffer, start: number) {
        const msgLenEnd = start + 8
        const msgLen = Number(data.toString(MythProtocolClient.LOCALE, start, msgLenEnd))
        const msgEnd = msgLenEnd + msgLen
        const message = data.toString(MythProtocolClient.LOCALE, msgLenEnd, msgEnd)
        const messageParts = message.split(MythProtocolClient.LIST_DELIMITER)
        const messageHandler = this.messageHandlers.get(<MessageTypes>messageParts[0])
        if (messageHandler) {
            try {
                messageHandler.process(this, messageParts)
            } catch (err) {
                this.connectEmitter.emit('error', err)
            }
        } else {
            console.log('No handler found for message %s', message)
        }
        return msgEnd
    }
    public sendMessage(message: MessageConstructor) {
        try {
            const backendMessage = this.createBackendMessage(message.constructMessage())
            this.connection.write(backendMessage)
        } catch (err) {
            this.connectEmitter.emit('error', err)
        }
    }
    public disconnect() {
        if (this._connection) {
            return new Promise((resolve, reject) => {
                this.connectEmitter.once('close', () => {
                    resolve()
                })
                this.sendMessage(new DoneMessage())
            })
        } else {
            return Promise.resolve()
        }
    }
    public createList(args: string[]) {
        return args.join(MythProtocolClient.LIST_DELIMITER)
    }

    private connectClient() {
        return new Promise((resolve, reject) => {
            this.connectEmitter.once('ACCEPT', (version) => {
                this.connectEmitter.removeAllListeners()
                resolve(version)
            })
            this.connectEmitter.once('REJECT', (version) => {
                this.connectEmitter.once('close', () => {
                    this.sendMessage(new MythProtoVersionMessage(version))
                })
            })
            this.connectEmitter.once('error', (err) => {
                reject(err)
            })
            this.sendMessage(new MythProtoVersionMessage())
        })
    }

    public async monitor(monitorHostName: string, eventMode: EventMode) {
        await this.connectClient()
        return new Promise((resolve, reject) => {
            this.connectEmitter.on('OK', () => {
                console.log('Monitor mythbacked using host %s', monitorHostName)
                resolve()
            })
            this.connectEmitter.once('error', (err) => {
                reject(err)
            })
            this.sendMessage(new AnnMonitorMessage(monitorHostName, eventMode))
        })
    }
}

let client: MythProtocolClient
export async function monitorEvents(monitorHostName: string, backendHostName: string, host: string, port?: number) {
    client = new MythProtocolClient(host, port)
    await client.monitor(monitorHostName, EventMode.ONLY_SYSTEM_EVENT)
    const mythEventEmitter = mythNotifier.hostEmitter(backendHostName)
    mythEventEmitter.on('MASTER_STARTED', async (message) => {
        await client.monitor(monitorHostName, EventMode.ONLY_SYSTEM_EVENT)
    })
}

export async function disconnectMythProto(){
    if (client){
        await client.disconnect()
    }
}
