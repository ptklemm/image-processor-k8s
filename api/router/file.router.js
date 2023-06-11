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

const initFileRouter = (configuration, amqpChannel) => {
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

        const message = {
            fileName: req.file.originalname,
            uploadId: req.file.filename,
            path: req.file.path,
            size: req.file.size
        }

        await amqpChannel.sendToQueue('new-upload', Buffer.from(JSON.stringify(message)), { persistent: true });

        return res.status(200).send({ status: "Uploaded", image: req.file.originalname, uploadId: req.file.filename });
    });

    fileRouter.get("/:uploadId", (req, res) => {

    });

    return fileRouter;
}

const generateUploadId = () => {
    return crypto.randomUUID({ disableEntropyCache: false });
}

export default initFileRouter;
