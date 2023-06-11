import express from "express";
// import fs from "node:fs/promises";
import crypto from "node:crypto";
import multer from "multer";
import { logger } from '../util/logger.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_PATH);
    },
    filename: (req, file, cb) => {
        const uploadId = generateUploadId();
        cb(null, uploadId);
    }
});

const initFileRouter = (configuration, dbClient, amqpChannel) => {
    const fileRouter = express.Router();

    const { MaxSizeMB, AcceptedFileTypes } = configuration.Upload;
    const maxSizeBytes = MaxSizeMB * 1024 * 1024;

    const upload = multer({
        storage,
        limits: { fileSize: maxSizeBytes }
    });

    fileRouter.post("/upload", upload.single("image"), async (req, res) => {
        if (req.file == undefined) {
            return res.status(400).send({ message: "File missing." });
        }

        logger.info(`Received File (From: ${req.ip}, FileName: ${req.file.originalname}, UploadID: ${req.file.filename}, Path: ${req.file.path}, Size: ${req.file.size})`);

        const uploadMessage = {
            uploadId: req.file.filename,
            fileName: req.file.originalname,
            uploadPath: req.file.path,
            processedPath: null,
            originalSize: req.file.size,
            processedSize: null,
            status: "Uploaded"
        }

        const result = await dbClient.collection("uploads").insertOne(uploadMessage);

        if (result && result.acknowledged == true) {
            await amqpChannel.sendToQueue('uploaded', Buffer.from(JSON.stringify(uploadMessage)), { persistent: true });
            return res.status(200).send({ status: uploadMessage.status, image: uploadMessage.fileName, uploadId: uploadMessage.uploadId });
        }
    });

    fileRouter.get("/upload/:uploadId", async (req, res) => {
        const result = await dbClient.collection("uploads").findOne({ uploadId: req.params.uploadId });

        if (result) {
            return res.status(200).send({ status: result.status, image: result.fileName, uploadId: result.uploadId });
        }
    });

    fileRouter.get("/download/:uploadId", async (req, res) => {
        const result = await dbClient.collection("uploads").findOne({ uploadId: req.params.uploadId });

        if (result) {
            await dbClient.collection("uploads").updateOne({ uploadId: result.uploadId }, { $set: { status: 'Downloaded' } });
            return res.status(200).sendFile(`${process.env.PROCESSED_PATH}/${result.uploadId}.jpg`);
        }
    });

    return fileRouter;
}

const generateUploadId = () => {
    return crypto.randomUUID({ disableEntropyCache: false });
}

export default initFileRouter;
