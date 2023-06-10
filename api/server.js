import "dotenv/config";
import { logger } from './util/logger.js';
import process from 'node:process';
import express from "express";
import cors from "cors";
import initDbClient from "./db/dbClient.js";
import initAMQPClient from "./amqp/amqpClient.js";
import initApiRouter from "./router/index.js";

process.on('SIGINT', () => {
    process.exit(0);
});

process.on('SIGQUIT', () => {
    process.exit(0);
});

process.on('SIGTERM', () => {
    process.exit(0);
});

(async () => {
    logger.info("Image Processor API starting.");

    const dbClient = await initDbClient();

    logger.info("Loading configuration...");
    const configuration = await dbClient.collection("configuration").findOne({ _id: 1 });
    logger.info("Loaded configuration: ", configuration);

    const amqpChannel = await initAMQPClient();

    const app = express();

    logger.info("CORS is enabled.")
    app.use(cors());

    app.use(express.json());

    logger.info("Initializing API routes.");
    app.use("/api", initApiRouter(configuration, dbClient, amqpChannel));
    logger.info("API routes initialized.");

    process.on('exit', () => {
        logger.info("Image Processor API shutting down.");
    });

    const PORT = process.env.APP_PORT || 8080;
    app.listen(PORT, () => {
        logger.info(`Image Processor API listening on localhost:${PORT}`);
    });
})();
