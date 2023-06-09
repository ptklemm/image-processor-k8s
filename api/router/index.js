import express from "express";
import configRouter from "./config.router.js";
import initFileRouter from "./file.router.js";

const initApiRouter = (configuration) => {
    const router = express.Router();

    router.use("/configuration", configRouter);
    // router.use("/admin", require("./admin.router"));
    router.use("/file", initFileRouter(configuration));

    return router;
}

export default initApiRouter;
