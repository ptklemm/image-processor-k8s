import os
import json

from skimage import io, filters
from pika import BlockingConnection, URLParameters
from pika.channel import Channel
# from pika.exceptions import AMQPConnectionError
import matplotlib.pyplot as plt
from dotenv import load_dotenv

load_dotenv()

print('Image Processor Worker: Starting...')

uploads_path = os.environ['UPLOADS_PATH']
processed_path = os.environ['PROCESSED_PATH']

print(
    f'Image Processor Worker: Retrieving uploaded images from \'{uploads_path}\'.')

print(
    f'Image Processor Worker: Saving processed images to \'{processed_path}\'.')

rabbitmq_url = os.environ['RABBITMQ_URL'] or 'localhost'

print(
    f'Image Processor Worker: Using RabbitMQ Server ({rabbitmq_url}).')


def process_image(channel: Channel, method, properties, body):
    msg_string = body.decode()
    print(f'Image Processor Worker: Received {msg_string}')
    message = json.loads(msg_string)

    channel.basic_publish(
        exchange='', routing_key='processing', body=message['uploadId'])

    upload_path = os.path.join(uploads_path, message['uploadId'])
    image = io.imread(upload_path, as_gray=True)
    processed_image = filters.sobel(image)

    save_path = os.path.join(processed_path, message['uploadId']+'.jpg')
    plt.imsave(save_path, processed_image, cmap=plt.cm.gray)

    os.remove(upload_path)

    channel.basic_publish(
        exchange='', routing_key='completed', body=message['uploadId'])

    print(
        f"Image Processor Worker: Processed (UploadID: {message['uploadId']}, Saved: {save_path}, Removed: {upload_path})")
    channel.basic_ack(delivery_tag=method.delivery_tag)


connection = BlockingConnection(URLParameters(rabbitmq_url))

channel = connection.channel()
channel.queue_declare(queue='uploaded', durable=True)
channel.queue_declare(queue='processing', durable=True)
channel.queue_declare(queue='completed', durable=True)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='uploaded',
                      on_message_callback=process_image)

try:
    print('Image Processor Worker: Waiting for new messages.')
    channel.start_consuming()
except KeyboardInterrupt:
    channel.stop_consuming()

connection.close()
