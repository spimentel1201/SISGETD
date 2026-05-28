import os
import httpx
import tempfile
from celery_app import celery_app
from app.utils import extraer_texto_ocr

@celery_app.task(name="ocr.procesar", bind=True, max_retries=3)
def procesar_ocr(self, expediente_id: str, archivo_url: str):
    """
    Descarga el archivo desde archivo_url, ejecuta OCR y envía el texto al clasificador.
    """
    temp_file_path = None
    try:
        # 1. Obtener contenido del archivo
        if archivo_url.startswith("http"):
            with httpx.Client(timeout=30.0) as client:
                response = client.get(archivo_url)
                response.raise_for_status()
                content = response.content
        else:
            # Fallback para rutas de archivos locales en desarrollo
            path_limpio = archivo_url.replace("file://", "")
            with open(path_limpio, "rb") as f:
                content = f.read()

        # Determinar extensión del archivo
        extension = os.path.splitext(archivo_url)[1] or ".png"

        # 2. Guardar en un archivo temporal local
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name

        # 3. Procesar OCR para extraer el texto
        texto_extraido = extraer_texto_ocr(temp_file_path)

        # 4. Importar y disparar de forma encadenada el clasificador TUPA de Celery
        from app.tasks.clasificador_tasks import clasificar_expediente
        clasificar_expediente.delay(expediente_id, texto_extraido)

        return {
            "status": "success",
            "expediente_id": expediente_id,
            "longitud_texto": len(texto_extraido)
        }
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
    finally:
        # Asegurar la limpieza del archivo temporal para evitar fugas de almacenamiento
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

