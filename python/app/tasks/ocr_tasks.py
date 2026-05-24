"""
Tarea OCR — SGDML Microservicio IA
- Descarga el PDF/imagen del expediente
- Aplica pre-procesamiento con OpenCV
- Extrae texto con Tesseract
"""
from celery_app import celery_app


@celery_app.task(name="ocr.procesar", bind=True, max_retries=3)
def procesar_ocr(self, expediente_id: str, archivo_url: str):
    """
    Descarga el archivo, ejecuta OCR y retorna el texto extraído.
    TODO: implementar lógica completa.
    """
    try:
        # 1. Descargar archivo desde archivo_url
        # 2. Pre-procesar imagen con OpenCV (denoising, deskew)
        # 3. Ejecutar pytesseract.image_to_string()
        # 4. Devolver texto limpio
        raise NotImplementedError("Tarea OCR pendiente de implementación.")
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
