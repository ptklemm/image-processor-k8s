const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024; // 2 MB max upload

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/mnt/uploads/");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, file.originalname);
    }
});

let uploadFile = multer({
    storage,
    limits: { fileSize: maxSize }
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;