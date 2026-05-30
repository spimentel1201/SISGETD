from celery import Celery
import os
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

# Priorizar RabbitMQ si está configurado en las variables de entorno
BROKER_URL = os.getenv("CELERY_BROKER_URL") or os.getenv("RABBITMQ_URL") or os.getenv("REDIS_URL") or "redis://localhost:6379/0"

# Para RabbitMQ (amqp), Celery requiere que el result backend sea 'rpc://' en lugar de 'amqp://'
RESULT_BACKEND = "rpc://" if BROKER_URL.startswith("amqp") else BROKER_URL

celery_app = Celery(
    "sgdml_worker",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
    include=[
        "app.tasks.ocr_tasks",
        "app.tasks.clasificador_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Lima",
    enable_utc=True,
)
