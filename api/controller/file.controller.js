const fs = require("fs");
const crypto = require('crypto');
const uploadFile = require("../middleware/upload");

const UPLOADS_PATH = '/mnt/uploads';
const twentyFiveMB = 25 * 1024 * 1024;

const getListFiles = (req, res) => {
    fs.readdir(UPLOADS_PATH, function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Unable to scan files!"
            });
        }

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file
            });
        });

        res.status(200).send(fileInfos);
    });
}

const download = (req, res) => {
    const fileName = req.params.name;

    res.download(UPLOADS_PATH + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err
            });
        }
    });
}

const upload = async (req, res) => {
    try {
        await uploadFile(req, res);

        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }

        res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname
        });
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 2MB!",
            });
        }

        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`
        });
    }
}

const requestMultipartUpload = (req, res) => {
    const uploadId = crypto.randomUUID({ disableEntropyCache: false });
    return res.status(200).send({ uploadId })
}

const uploadPart = (req, res) => {
}

const completeMultipartUpload = (req, res) => {
}

module.exports = {
    getListFiles,
    download,
    upload,
    requestMultipartUpload,
    uploadPart,
    completeMultipartUpload
}