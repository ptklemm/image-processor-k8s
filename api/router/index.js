import express from "express";
import initConfigRouter from "./config.router.js";
import adminRouter from "./admin.router.js";
import initFileRouter from "./file.router.js";

const initApiRouter = (configuration, dbClient, amqpChannel) => {
    const apiRouter = express.Router();

    apiRouter.use("/configuration", initConfigRouter(dbClient));
    apiRouter.use("/admin", adminRouter);
    apiRouter.use("/file", initFileRouter(configuration, dbClient, amqpChannel));

    return apiRouter;
}

export default initApiRouter;
