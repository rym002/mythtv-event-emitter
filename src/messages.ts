export interface ScriptMessage {
    CARDID?: string
    CATEGORY?: string
    CHANID?: string
    DESCRIPTION?: string
    DIR?: string
    ENDTIME?: string
    ENDTIMEISO?: string
    ENDTIMEISOUTC?: string
    ENDTIMEUTC?: string
    EPISODE?: string
    EVENTNAME: keyof EventMapping
    FILE?: string
    FINDID?: string
    HOSTNAME?: string
    INETREF?: string
    JOBID?: string
    ORIGINALAIRDATE?: string
    PARENTID?: string
    PARTNUMBER?: string
    PARTTOTAL?: string
    PLAYGROUP?: string
    PROGEND?: string
    PROGENDISO?: string
    PROGENDISOUTC?: string
    PROGENDUTC?: string
    PROGSTART?: string
    PROGSTARTISO?: string
    RECSTATUS?: string
    RECTYPE?: string
    SEASON?: string
    SECS?: string
    SENDER: string
    STARTTIME?: string
    STARTTIMEISO?: string
    STARTTIMEISOUTC?: string
    STARTTIMEUTC?: string
    SUBTITLE?: string
    TITLE?: string
    TRANSPROFILE?: string
    VERBOSELEVEL?: string
    VERBOSEMODE?: string
}

export type RemoteHostEvent = Pick<ScriptMessage, 'HOSTNAME'>
export type RecDeletedEvent = Pick<ScriptMessage, 'CHANID' | 'STARTTIME' | 'STARTTIMEISO' | 'STARTTIMEISOUTC' | 'STARTTIMEUTC'>
export type PlayEvent = RemoteHostEvent & RecDeletedEvent;
export type RecEvent = RecDeletedEvent & Pick<ScriptMessage, 'CARDID'>
export type RecExpired = RemoteHostEvent & RecDeletedEvent & Pick<ScriptMessage, 'SECS'>
export type RecPending = RecEvent & Pick<ScriptMessage, 'SECS'>


export interface EmptyEvent {

}

export interface EventMapping {
    'CLIENT_CONNECTED': RemoteHostEvent
    'CLIENT_DISCONNECTED': RemoteHostEvent
    'SLAVE_CONNECTED': RemoteHostEvent
    'SLAVE_DISCONNECTED': RemoteHostEvent
    'SCHEDULER_RAN': EmptyEvent
    'REC_PENDING': RecPending
    'REC_STARTED': RecEvent
    'REC_FINISHED': RecEvent
    'REC_DELETED': RecDeletedEvent
    'REC_EXPIRED': RecExpired
    'LIVETV_STARTED': EmptyEvent
    'LIVETV_ENDED': EmptyEvent
    'PLAY_STARTED': PlayEvent
    'PLAY_STOPPED': PlayEvent
    'PLAY_PAUSED': PlayEvent
    'PLAY_UNPAUSED': PlayEvent
    'PLAY_CHANGED': PlayEvent
    'MASTER_STARTED': EmptyEvent
    'MASTER_SHUTDOWN': EmptyEvent
    'NET_CTRL_CONNECTED': EmptyEvent
    'NET_CTRL_DISCONNECTED': EmptyEvent
    'MYTHFILLDATABASE_RAN': EmptyEvent
    'SETTINGS_CACHE_CLEARED': EmptyEvent
    'USER_1': EmptyEvent
    'USER_2': EmptyEvent
    'USER_3': EmptyEvent
    'USER_4': EmptyEvent
    'USER_5': EmptyEvent
    'USER_6': EmptyEvent
    'USER_7': EmptyEvent
    'USER_8': EmptyEvent
    'USER_9': EmptyEvent
}