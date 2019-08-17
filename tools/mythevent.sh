#!/bin/bash

# Mythtv Event Emitter System Event Script
# Add the below to any system events you want to monitor from node.
# To monitor all system events use EventCmdAll 
# mythevent.sh "CARDID=%CARDID%" "CATEGORY=%CATEGORY%" "CHANID=%CHANID%" "DESCRIPTION=%DESCRIPTION%" "DIR=%DIR%" "ENDTIME=%ENDTIME%" "ENDTIMEISO=%ENDTIMEISO%" "ENDTIMEISOUTC=%ENDTIMEISOUTC%" "ENDTIMEUTC=%ENDTIMEUTC%" "EPISODE=%EPISODE%" "EVENTNAME=%EVENTNAME%" "FILE=%FILE%" "FINDID=%FINDID%" "HOSTNAME=%HOSTNAME%" "INETREF=%INETREF%" "JOBID=%JOBID%" "ORIGINALAIRDATE=%ORIGINALAIRDATE%" "PARENTID=%PARENTID%" "PARTNUMBER=%PARTNUMBER%" "PARTTOTAL=%PARTTOTAL%" "PLAYGROUP=%PLAYGROUP%" "PROGEND=%PROGEND%" "PROGENDISO=%PROGENDISO%" "PROGENDISOUTC=%PROGENDISOUTC%" "PROGENDUTC=%PROGENDUTC%" "PROGSTART=%PROGSTART%" "PROGSTARTISO=%PROGSTARTISO%" "PROGSTARTISOUTC=%PROGSTARTISOUTC%" "PROGSTARTUTC=%PROGSTARTUTC%" "REACTIVATE=%REACTIVATE%" "RECGROUP=%RECGROUP%" "RECID=%RECID%" "RECORDEDID=%RECORDEDID%" "RECSTATUS=%RECSTATUS%" "RECTYPE=%RECTYPE%" "SEASON=%SEASON%" "SECS=%SECS%" "SENDER=%SENDER%" "STARTTIME=%STARTTIME%" "STARTTIMEISO=%STARTTIMEISO%" "STARTTIMEISOUTC=%STARTTIMEISOUTC%" "STARTTIMEUTC=%STARTTIMEUTC%" "SUBTITLE=%SUBTITLE%" "TITLE=%TITLE%" "TRANSPROFILE=%TRANSPROFILE%" "VERBOSELEVEL=%VERBOSELEVEL%" "VERBOSEMODE=%VERBOSEMODE%"

# Host of node express server
EVENT_HOST=localhost
# Port of node express server
EVENT_PORT=10091
# Path of node express server exposing the router
EVENT_PATH="mythtv"

json="{"
value_sep=""
for arg in "$@"
do
        arg_name=`expr match "$arg" '\(.*\)='`
        arg_value=${arg:${#arg_name}+1}
        if [[ "${arg_name}" != `expr match "${arg_value}" '\%\(.*\)\%'` ]]
        then
                json_value=\"${arg_name}\":\"${arg_value}\"
                json="${json}${value_sep}${json_value}"
                value_sep=","
        fi
done
json=${json}"}"

curl -X PUT  -H "Content-Type: application/json" http://${EVENT_HOST}:${EVENT_PORT}/${EVENT_PATH} --data "${json}"


