import express from "express";
import db from '../db/client.js';

const configRouter = express.Router();

const CONFIG_FILTER = { _id: 1 };

configRouter.get("/", async (req, res) => {
    const result = await db.collection("configuration").findOne(CONFIG_FILTER);

    if (!result) {
        res.status(404).send("Not found");
    }

    res.status(200).send(result);
});

configRouter.put("/", async (req, res) => {
    const result = await db.collection("configuration").updateOne(CONFIG_FILTER, { $set: req.body });

    if (!result) {
        res.status(404).send("Not found.");
    }

    res.status(200).send(result);
});

export default configRouter;
