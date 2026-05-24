"""
Tarea de Clasificación TUPA — SGDML Microservicio IA
- Limpia texto con NLTK
- Clasifica con modelo Scikit-learn / Transformers
- Calcula score_prioridad
- Llama al webhook Node con resultados
"""
from celery_app import celery_app


@celery_app.task(name="clasificador.procesar", bind=True, max_retries=3)
def clasificar_expediente(self, expediente_id: str, texto: str):
    """
    Clasifica el documento según TUPA y calcula prioridad.
    TODO: implementar lógica completa.
    """
    try:
        # 1. Pre-procesar texto (NLTK: stopwords, lematización)
        # 2. Clasificar con modelo TUPA → tupa_id, ia_confianza
        # 3. Determinar area_asignada_id desde mapeo TUPA → área
        # 4. Calcular score_prioridad según fecha_limite
        # 5. POST al webhook /api/webhooks/ml-resultado
        raise NotImplementedError("Tarea clasificadora pendiente de implementación.")
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
