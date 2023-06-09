import { MongoClient, ServerApiVersion } from "mongodb";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    appName: "Image Processor",
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 10
});

let connection;

try {
    connection = await client.connect();
} catch (err) {
    console.error(err);
}

const db = connection.db(process.env.DB_NAME);

export default db;
