import { Router } from "express";
import { notifyEvent } from "./events";
import bodyParser = require("body-parser");
import { ScriptMessage } from "messages";

export const router = Router();
router.use(bodyParser.json())
    .put('/', (req, res) => {
        const payload = <ScriptMessage>req.body;
        res.end();
        notifyEvent(payload.EVENTNAME, payload.SENDER, payload);
    })
