const cors = require("cors");
const express = require("express");
const app = express();

global.__basedir = __dirname;

app.use(cors({
    origin: "http://localhost:8081"
}));

const initRoutes = require("./routes");

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

let port = 8080;
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
});