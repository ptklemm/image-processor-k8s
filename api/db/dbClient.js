import { MongoClient, ServerApiVersion } from "mongodb";
import fs from "node:fs/promises";
import { logger } from '../util/logger.js';

async function initDbClient() {
    let MONGODB_URL;

    if (process.env.MONGODB_URL) {
        MONGODB_URL = process.env.MONGODB_URL;
    } else if (process.env.MONGODB_URL_FILE) {
        MONGODB_URL = await readUrlFromFile(process.env.MONGODB_URL_FILE);
    } else {
        logger.fatal("Could not resolve environment variable MONGODB_URL or MONGODB_URL_FILE.");
        process.exit(1);
    }

    const client = new MongoClient(MONGODB_URL, {
        appName: "Image Processor",
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        maxPoolSize: 10
    });

    let connection;

    try {
        logger.info("Connecting to database...");
        connection = await client.connect();
    } catch (err) {
        logger.fatal(err);
        process.exit(1);
    } finally {
        process.on('exit', async () => {
            logger.info("Closing database connection.");
            await client.close();
        });
    }

    logger.info("Connected to database successfully.");



    const dbClient = connection.db(process.env.DB_NAME);
    return dbClient;
}

async function readUrlFromFile(filePath) {
    let url = "";

    try {
        const data = await fs.readFile(filePath, 'utf-8');

        if (data) {
            url = data;
        }
    } catch (err) {
        logger.fatal(err);
        process.exit(1);
    }

    return url;
}

export default initDbClient;
