import express from "express";

const initConfigRouter = (dbClient) => {
    const configRouter = express.Router();

    const CONFIG_FILTER = { _id: 1 };

    configRouter.get("/", async (req, res) => {
        const result = await dbClient.collection("configuration").findOne(CONFIG_FILTER);

        if (!result) {
            return res.status(404).send("Not found");
        }

        return res.status(200).send(result);
    });

    configRouter.put("/", async (req, res) => {
        const result = await dbClient.collection("configuration").updateOne(CONFIG_FILTER, { $set: req.body });

        if (!result) {
            return res.status(404).send("Not found.");
        }

        return res.status(200).send(result);
    });

    return configRouter;
}

export default initConfigRouter;
