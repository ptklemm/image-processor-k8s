const express = require("express");
const router = express.Router();
const controller = require("../controller/file.controller");

// let routes = (app) => {
//     app.use(router);
// };

router.get("/files", controller.getListFiles);
router.get("/files/:name", controller.download);

// standard upload using form-data
router.post("/upload", controller.upload);

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
router.post("/multipart-upload", controller.requestMultipartUpload);
// 2. Client uploads each file part
router.put("/multipart-upload-part", controller.uploadPart);
// 3. Client signals completion of upload and data for cross-validation.
router.post("/multipart-upload-complete", controller.completeMultipartUpload)

module.exports = router;
