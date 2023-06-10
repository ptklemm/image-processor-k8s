import express from "express";
import { logger, readLog } from '../util/logger.js';

const adminRouter = express.Router();

adminRouter.get("/log", async (req, res) => {
    try {
        const log = readLog();
        res.set('Content-Type', 'text/plain');
        return res.send(log);
    } catch (err) {
        return res.sendStatus(500);
    }
});

export default adminRouter;
