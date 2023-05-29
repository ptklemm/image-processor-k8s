const cors = require("cors");
const express = require("express");
const app = express();
const router = require("./router");


app.use(cors());

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', router);

const port = 8080;
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
});