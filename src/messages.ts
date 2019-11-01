export interface ScriptMessage {
    ARGS?: string
    CARDID?: string
    CATEGORY?: string
    CHANID?: string
    CHANNUM?: string
    DESCRIPTION?: string
    DIR?: string
    ENDTIME?: Date
    ENDTIMEISO?: Date
    ENDTIMEISOUTC?: Date
    ENDTIMEUTC?: Date
    EPISODE?: string
    EVENTNAME: keyof EventMapping
    FILE?: string
    FINDID?: string
    HOSTNAME?: string
    INETREF?: string
    INPUTNAME?: string
    JOBID?: string
    ORIGINALAIRDATE?: Date
    PARENTID?: string
    PARTNUMBER?: string
    PARTTOTAL?: string
    PLAYGROUP?: string
    PROGEND?: Date
    PROGENDISO?: Date
    PROGENDISOUTC?: Date
    PROGENDUTC?: Date
    PROGSTART?: Date
    PROGSTARTISO?: Date
    PROGSTARTISOUTC?: Date
    PROGSTARTUTC?: Date
    REACTIVATE?: string
    RECGROUP?: string
    RECID?: string
    RECSTATUS?: string
    RECTYPE?: string
    RECORDEDID?: string
    SEASON?: string
    SECS?: string
    SENDER: string
    STARTTIME?: Date
    STARTTIMEISO?: Date
    STARTTIMEISOUTC?: Date
    STARTTIMEUTC?: Date
    SUBTITLE?: string
    SYNDICATEDEPISODE?: string
    TITLE?: string
    TOTALEPISODES?: string
    TRANSPROFILE?: string
    VIDEODEVICE?: string
    VBIDEVICE?: string
    VERBOSELEVEL?: string
    CREATED?: string
    DESTROYED?: string
    COMMAND?: string
}

export type AllEvent = Pick<ScriptMessage, 'ARGS' | 'VERBOSELEVEL' | 'SENDER'>

export type RecEvent = Pick<ScriptMessage, 'CARDID' | 'CHANID' | 'STARTTIME' | 'RECSTATUS' | 'VIDEODEVICE' | 'VBIDEVICE'> & RecordingEvent
export type PlayEvent = Pick<ScriptMessage, 'HOSTNAME' | 'CHANID' | 'STARTTIME'> & RecordingEvent

export type RecPendingEvent = Pick<ScriptMessage, 'SECS'> & RecEvent
export type RecDeletedEvent = Pick<ScriptMessage, 'CHANID' | 'STARTTIME'> & RecordingEvent

export type TuningSignalTimeoutEvent = Pick<ScriptMessage, 'CARDID'> & AllEvent

export type ConnectedEvent = Pick<ScriptMessage, 'HOSTNAME'> & AllEvent
export type ScreenTypeEvent = Pick<ScriptMessage, 'CREATED' | 'DESTROYED'> & AllEvent
export type CecCommandEvent = Pick<ScriptMessage, 'COMMAND'> & AllEvent

type ProgramInfo = Pick<ScriptMessage, 'DIR' | 'FILE' | 'TITLE' | 'SUBTITLE' | 'SEASON' | 'EPISODE' | 'TOTALEPISODES' | 'SYNDICATEDEPISODE'
    | 'DESCRIPTION' | 'HOSTNAME' | 'CATEGORY' | 'RECGROUP' | 'PLAYGROUP' | 'CHANID' | 'INETREF' | 'PARTNUMBER' | 'PARTTOTAL' | 'ORIGINALAIRDATE'
    | 'STARTTIME' | 'STARTTIMEISO' | 'STARTTIMEISOUTC' | 'STARTTIMEUTC'
    | 'ENDTIME' | 'ENDTIMEISO' | 'ENDTIMEISOUTC' | 'ENDTIMEUTC'
    | 'PROGSTART' | 'PROGSTARTISO' | 'PROGSTARTISOUTC' | 'PROGSTARTUTC'
    | 'PROGEND' | 'PROGENDISO' | 'PROGENDISOUTC' | 'PROGENDUTC'
    | 'RECORDEDID'>
type RecordingInfo = Pick<ScriptMessage, 'RECID' | 'PARENTID' | 'FINDID' | 'RECSTATUS' | 'RECTYPE' | 'REACTIVATE' | 'INPUTNAME' | 'CHANNUM'>
    & ProgramInfo
type UnknownRecording = Pick<ScriptMessage, 'CHANID' | 'STARTTIME' | 'STARTTIMEISO'>

type RecordingEvent = (RecordingInfo & UnknownRecording) & AllEvent

/** 
 * From libs/libmythtv/mythsystemevent.cpp
 * MythSystemEventEditor::MythSystemEventEditor
*/
export interface EventMapping {
    'REC_PENDING': RecPendingEvent
    'REC_PREFAIL': RecEvent
    'REC_FAILING': RecEvent
    'REC_STARTED': RecEvent
    'REC_STARTED_WRITING': RecEvent
    'REC_FINISHED': RecEvent
    'REC_DELETED': RecDeletedEvent
    'REC_EXPIRED': RecEvent
    'LIVETV_STARTED': ConnectedEvent
    'LIVETV_ENDED': ConnectedEvent
    'PLAY_STARTED': PlayEvent
    'PLAY_STOPPED': PlayEvent
    'PLAY_PAUSED': PlayEvent
    'PLAY_UNPAUSED': PlayEvent
    'PLAY_CHANGED': PlayEvent
    'TUNING_SIGNAL_TIMEOUT': TuningSignalTimeoutEvent
    'MASTER_STARTED': AllEvent
    'MASTER_SHUTDOWN': AllEvent
    'CLIENT_CONNECTED': ConnectedEvent
    'CLIENT_DISCONNECTED': ConnectedEvent
    'SLAVE_CONNECTED': ConnectedEvent
    'SLAVE_DISCONNECTED': ConnectedEvent
    'NET_CTRL_CONNECTED': AllEvent
    'NET_CTRL_DISCONNECTED': AllEvent
    'MYTHFILLDATABASE_RAN': AllEvent
    'SCHEDULER_RAN': AllEvent
    'SETTINGS_CACHE_CLEARED': AllEvent
    'SCREEN_TYPE': AllEvent
    'KEY_01': AllEvent
    'KEY_02': AllEvent
    'KEY_03': AllEvent
    'KEY_04': AllEvent
    'KEY_05': AllEvent
    'KEY_06': AllEvent
    'KEY_07': AllEvent
    'KEY_08': AllEvent
    'KEY_09': AllEvent
    'KEY_10': AllEvent
    'CEC_COMMAND_RECEIVED': CecCommandEvent
}