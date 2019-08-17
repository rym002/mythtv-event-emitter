# mythtv-event-emitter  ![Build Status](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoic1lYSVhhblFrM0xERm9ER1hjVXR5K0Ewb3htZFVLaEx1SkV4eDQyMjMzVnFHMEl4ZTdqTzVVSkFJamM0WlhpaWtMSlRGNVQ1ZDF5Um0xZ2t5KytsVStZPSIsIml2UGFyYW1ldGVyU3BlYyI6IkpBNzgvQ2kvcEZVRGUxSnoiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)
## Typescript Client library with an http endpoint for sending mythtv events.
## Exposes endpoint specific event emitters
### Supports
* CLIENT_CONNECTED
* CLIENT_DISCONNECTED
* SLAVE_CONNECTED
* SLAVE_DISCONNECTED
* SCHEDULER_RAN
* REC_PENDING
* REC_STARTED
* REC_FINISHED
* REC_DELETED
* REC_EXPIRED
* LIVETV_STARTED
* PLAY_STARTED
* PLAY_STOPPED
* PLAY_PAUSED
* PLAY_UNPAUSED
* PLAY_CHANGED
* MASTER_STARTED
* MASTER_SHUTDOWN
* NET_CTRL_CONNECTED
* NET_CTRL_DISCONNECTED
* MYTHFILLDATABASE_RAN
* SETTINGS_CACHE_CLEARED
* USER_1
* USER_2
* USER_3
* USER_4
* USER_5
* USER_6
* USER_7
* USER_8
* USER_9

See [tools/mythevent.sh](tools/mythevent.sh)