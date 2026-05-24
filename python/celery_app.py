from celery import Celery
import os

BROKER_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "sgdml_worker",
    broker=BROKER_URL,
    backend=BROKER_URL,
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
