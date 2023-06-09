import "dotenv/config";
import express from "express";
import cors from "cors";
import initApiRouter from "./router/index.js";
import db from "./db/client.js";

(async () => {
    console.log("Image Processor API starting.");

    console.log("Loading configuration...");
    const configuration = await db.collection("configuration").findOne({ _id: 1 });
    console.log("Loaded configuration: ", configuration);

    const app = express();

    console.log("CORS is enabled.")
    app.use(cors());

    // app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    console.log("Initializing API routes.");
    app.use("/api", initApiRouter(configuration));

    const PORT = process.env.APP_PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Image Processor API listening on localhost:${PORT}`);
    });
})();
