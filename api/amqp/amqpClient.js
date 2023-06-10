import amqp from "amqplib";
import { logger } from '../util/logger.js';

async function initAMQPClient() {
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

    logger.info("Connecting to channel...");
    try {
        channel = await amqpClient.createChannel();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
    logger.info("Channel connected.");

    channel.assertQueue('new-upload', {
        durable: true
    });

    return channel;
}

export default initAMQPClient;
