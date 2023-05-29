const util = require("util");
const multer = require("multer");
const twoMB = 2 * 1024 * 1024; // 2 MB max upload

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/mnt/uploads/");
    },
    filename: (req, file, cb) => {
        console.log(`Received: ${file.originalname}`);
        cb(null, file.originalname);
    }
});

let uploadFile = multer({
    storage,
    limits: { fileSize: twoMB }
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;