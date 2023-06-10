import express from "express";
import initConfigRouter from "./config.router.js";
import adminRouter from "./admin.router.js";
import initFileRouter from "./file.router.js";

const initApiRouter = (configuration, dbClient, amqpChannel) => {
    const router = express.Router();

    router.use("/configuration", initConfigRouter(dbClient));
    router.use("/admin", adminRouter);
    router.use("/file", initFileRouter(configuration, amqpChannel));

    return router;
}

export default initApiRouter;
