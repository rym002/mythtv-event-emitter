import { Router } from "express";
import { notifyEvent } from "./events";
import { ScriptMessage } from "./messages";
import bodyParser = require("body-parser");
import moment = require("moment");

export const router = Router();
router.use(bodyParser.json())
    .put('/', (req, res) => {
        const payload = scrubPayload(req.body);
        res.end(() => {
            notifyEvent(payload.EVENTNAME, payload.HOSTNAME || payload.SENDER, payload);
        });
    })

const dateFields = [
    'ENDTIME',
    'PROGEND',
    'PROGSTART',
    'STARTTIME'
]
const utcDateFields = dateFields.map(field => {
    return field + 'UTC'
})
const isoFields = dateFields.map(field=>{
    return field + 'ISO'
})
const isoUtcFields = isoFields.map(field=>{
    return field + 'UTC'
})
const mythDateFormat = 'YYYYMMDDHHmmss'
export function scrubPayload(message: any) {
    Object.keys(message).forEach((key) => {
        const value = message[key];
        if (key != 'SENDER' && key != 'EVENTNAME') {
            if (value && ('%' + key + '%' == value || value.trim() == "")) {
                message[key] = undefined
            }else{
                if (isoFields.includes(key) || isoUtcFields.includes(key)) {
                    message[key] = new Date(value)
                } else if (dateFields.includes(key)) {
                    message[key] = moment(value, mythDateFormat).toDate()
                } else if (utcDateFields.includes(key)) {
                    message[key] = moment.utc(value, mythDateFormat).toDate()
                } else if (key == 'ORIGINALAIRDATE') {
                    message[key] = moment(value, 'YYYY-MM-DD').toDate()
                }    
            }
        }
    })
    return <ScriptMessage>message;
}