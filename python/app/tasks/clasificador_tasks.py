import os
import httpx
from datetime import datetime
from celery_app import celery_app
from app.utils import clasificar_documento_semantico, calcular_score_prioridad

# Configuración del webhook a través de variables de entorno
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
NODE_WEBHOOK_URL = os.getenv("NODE_WEBHOOK_URL", f"{NODE_BACKEND_URL}/api/webhooks/ml-resultado")

@celery_app.task(name="clasificador.procesar", bind=True, max_retries=3)
def clasificar_expediente(self, expediente_id: str, texto: str):
    """
    Clasifica el documento extraído de un expediente según el catálogo TUPA,
    calcula la prioridad de atención y notifica al API Gateway mediante Webhook.
    """
    try:
        # 1. Ejecutar clasificación semántica inteligente
        resultado_ia = clasificar_documento_semantico(texto)

        # 2. Calcular prioridad del expediente (usando el plazo legal asignado al trámite)
        fecha_ingreso = datetime.now()
        dias_plazo = resultado_ia["dias_plazo_legal"]
        score_prioridad = calcular_score_prioridad(fecha_ingreso, dias_plazo)

        # 3. Construir el payload de resultados
        payload = {
            "expediente_id": expediente_id,
            "tupa_id": resultado_ia["tupa_id"],
            "codigo_tupa": resultado_ia["codigo_tupa"],
            "area_asignada_id": resultado_ia["area_asignada_id"],
            "ia_confianza": resultado_ia["ia_confianza"],
            "score_prioridad": score_prioridad,
            "texto_extraido": texto[:1000] # Enviamos un snippet de los primeros 1000 caracteres
        }

        # 4. Enviar resultados de forma asíncrona al webhook del API Gateway (Node.js)
        with httpx.Client(timeout=10.0) as client:
            response = client.post(NODE_WEBHOOK_URL, json=payload)
            response.raise_for_status()

        return {
            "status": "success",
            "expediente_id": expediente_id,
            "tupa_sugerido": resultado_ia["codigo_tupa"],
            "area_sugerida": resultado_ia["area_asignada_id"],
            "confianza": resultado_ia["ia_confianza"],
            "prioridad": score_prioridad
        }
    except Exception as exc:
        # Reintentar en caso de fallos de red o problemas temporales en el API Gateway
        raise self.retry(exc=exc, countdown=60)

