import amqp from "amqplib";
import { logger } from '../util/logger.js';

async function initAMQPClient(dbClient) {
    let amqpClient;
    let channel;

    const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

    logger.info(`Connecting AMQP Client (${RABBITMQ_URL})...`);
    try {
        amqpClient = await amqp.connect(RABBITMQ_URL);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
    logger.info("AMQP Client connected successfully.");

    process.on('exit', async () => {
        logger.info("Closing AMQP client connection.");
        await amqpClient.close();
    });

    logger.info("Creating channel...");
    try {
        channel = await amqpClient.createChannel();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
    logger.info("Channel created.");

    channel.assertQueue('uploaded', {
        durable: true
    });

    channel.assertQueue('processing', {
        durable: true
    });

    channel.assertQueue('completed', {
        durable: true
    });

    await channel.prefetch(1);

    logger.info('Waiting for incoming processing messages.');

    await channel.consume('processing', (msg) => {
        const uploadId = msg.content.toString();
        logger.info("Received processing image message: ", uploadId);
        dbClient.collection("uploads").updateOne({ uploadId }, { $set: { status: "Processing" } });
        channel.ack(msg);
    });

    logger.info('Waiting for incoming completion messages.');

    await channel.consume('completed', (msg) => {
        const uploadId = msg.content.toString();
        logger.info("Received completed image message: ", uploadId);
        dbClient.collection("uploads").updateOne({ uploadId }, { $set: { status: "Completed" } });
        channel.ack(msg);
    });

    return channel;
}

export default initAMQPClient;
