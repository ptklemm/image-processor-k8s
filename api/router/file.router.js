import express from "express";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import util from "node:util";
import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_PATH);
    },
    filename: (req, file, cb) => {
        console.log(`Received: ${file.originalname}`);
        cb(null, file.originalname);
    }
});

const initFileRouter = (configuration) => {
    const fileRouter = express.Router();

    const { MaxSizeMB, AcceptedFileTypes } = configuration.Upload;
    const maxSizeBytes = MaxSizeMB * 1024 * 1024;

    let uploadFile = multer({
        storage,
        limits: { fileSize: maxSizeBytes }
    }).single("file");

    let uploadFileMiddleware = util.promisify(uploadFile);

    // standard upload using form-data
    fileRouter.post("/upload", async (req, res) => {
        try {
            await uploadFileMiddleware(req, res);

            if (req.file == undefined) {
                return res.status(400).send({ message: "Please upload a file!" });
            }

            res.status(200).send({
                message: "Uploaded the file successfully: " + req.file.originalname
            });
        } catch (err) {
            if (err.code == "LIMIT_FILE_SIZE") {
                return res.status(413).send({
                    message: `File size cannot be larger than ${MaxSizeMB} MB!`,
                });
            }

            res.status(500).send({
                message: `Could not upload the file: ${req.file.originalname}. ${err}`
            });
        }
    });

    // Multi-part upload
    /* 
    1. The client sends a request to initiate a multipart upload, the API responds with an upload id.
    
    2. The client uploads each file chunk with a part number (to maintain ordering of the file), the size of the part, 
    the md5 hash of the part and the upload id; each of these requests is a separate HTTP request. The API validates 
    the chunk by checking the md5 hash received chunk against the md5 hash the client supplied and the size of the 
    chunk matches the size the client supplied. The API responds with a tag (unique id) for the chunk. If you deploy 
    your API across multiple locations you will need to consider how to store the chunks and later access them in a 
    way that is location transparent.
    
    3. The client issues a request to complete the upload which contains a list of each chunk number and the associated 
    chunk tag (unique id) received from API. The API validates there are no missing chunks and that the chunk numbers 
    match the correct chunk tag and then assembles the file or returns an error response.
    */

    // 1. Server-side validation of image metadata. If validation passes, respond with a new request ID.
    fileRouter.post("/multipart-upload", async (req, res) => {
        const { size, type } = req.body;

        // Backend validation
        if (size > maxSizeBytes) {
            return res.status(413).send({ message: `File size cannot be larger than ${MaxSizeMB} MB!` });
        } else if (!AcceptedFileTypes.includes(type)) {
            return res.status(415).send({ message: `Invalid file type!` });
        }

        // generate upload ID
        const uploadId = generateUploadId();

        // create folder with upload id as its name
        try {
            await fs.mkdir(`${process.env.UPLOADS_PATH}/${uploadId}`);
        } catch (err) {
            console.error("Error creating directory: " + err);
            return res.status(500);
        }

        // return upload id
        return res.status(200).send({ uploadId })
    });
    // 2. Client uploads each file part
    fileRouter.put("/multipart-upload-part", (req, res) => {
        console.log(req.body);
    });
    // 3. Client signals completion of upload and data for cross-validation.
    fileRouter.post("/multipart-upload-complete", (req, res) => {
    });

    return fileRouter;
}

const generateUploadId = () => {
    return crypto.randomUUID({ disableEntropyCache: false });
}

export default initFileRouter;
