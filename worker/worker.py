from skimage import filters
from skimage import io
import json
import pika
from pika.exceptions import AMQPConnectionError
import os
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


def process_image(ch, method, properties, body):
    msg_string = body.decode()
    print('Received Message: %r' % msg_string)
    message = json.loads(msg_string)

    image = io.imread(message['path'], as_gray=True)
    processed_image = filters.sobel(image)

    save_path = os.path.join(processed_path, message['uploadId']+'.jpg')
    plt.imsave(save_path, processed_image, cmap=plt.cm.gray)

    print(f'Image Processor Worker: Saved \'{save_path}\'.')

    ch.basic_ack(delivery_tag=method.delivery_tag)


connection = pika.BlockingConnection(
    pika.URLParameters(rabbitmq_url))

channel = connection.channel()
channel.queue_declare(queue='new-upload', durable=True)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='new-upload',
                      on_message_callback=process_image)

print('Image Processor Worker: Waiting for new messages.')
channel.start_consuming()
