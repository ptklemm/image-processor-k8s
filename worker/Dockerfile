FROM python:slim
# Or any preferred Python version.
ADD worker.py .
RUN pip install python-dotenv pika matplotlib scikit-image
CMD ["python", "worker.py"] 
# Or enter the name of your unique directory and parameter set.