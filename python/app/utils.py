try:
    import cv2
except ImportError:
    cv2 = None
import re
import os
import numpy as np
from datetime import datetime, timedelta
import PIL.Image

# Intentar importar NLTK para lematización/stopwords
try:
    import nltk
    from nltk.corpus import stopwords
    nltk.download("stopwords", quiet=True)
    SPANISH_STOPWORDS = set(stopwords.words("spanish"))
except Exception:
    # Lista de contingencia/fallback en caso de que NLTK falle o esté offline
    SPANISH_STOPWORDS = {
        "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para", 
        "con", "no", "una", "su", "al", "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este", 
        "sí", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre", "también", "me", "hasta", 
        "desde", "nos", "durante", "uno", "ni", "contra", "este", "ese", "eso", "mí", "ti", "sí"
    }

# Intentar importar pytesseract
try:
    import pytesseract
    # En entornos Windows, a veces es necesario apuntar al ejecutable de Tesseract si no está en PATH
    # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
except ImportError:
    pytesseract = None

# Intentar importar SentenceTransformers para clasificación semántica inteligente
try:
    from sentence_transformers import SentenceTransformer, util
    import torch
    # Usar modelo multilingüe eficiente y de buen desempeño
    MODELO_SEMANTICO = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
except Exception as e:
    MODELO_SEMANTICO = None
    print(f"[IA Warning] No se pudo cargar SentenceTransformers ({e}). Se usará clasificador de contingencia.")

# Catálogo mock de trámites TUPA y sus gerencias responsables para el MVP
TUPA_CATALOGO = [
    {
        "id": "tupa-001",
        "codigo_tupa": "TUPA-001",
        "nombre_tramite": "Licencia de Edificación, Ampliación o Demolición de Viviendas",
        "dias_plazo_legal": 15,
        "area_responsable_id": "area-gidu", # Gerencia de Infraestructura y Desarrollo Urbano
        "palabras_clave": ["edificacion", "construccion", "ampliacion", "demolicion", "plano", "licencia", "obra", "vivienda"]
    },
    {
        "id": "tupa-002",
        "codigo_tupa": "TUPA-002",
        "nombre_tramite": "Autorización para la Instalación de Anuncios y Publicidad Comercial",
        "dias_plazo_legal": 10,
        "area_responsable_id": "area-gde", # Gerencia de Desarrollo Económico
        "palabras_clave": ["anuncio", "publicidad", "panel", "letrero", "propaganda", "comercial", "cartel"]
    },
    {
        "id": "tupa-003",
        "codigo_tupa": "TUPA-003",
        "nombre_tramite": "Licencia de Funcionamiento de Establecimientos Comerciales e Industriales",
        "dias_plazo_legal": 15,
        "area_responsable_id": "area-gde", # Gerencia de Desarrollo Económico
        "palabras_clave": ["funcionamiento", "licencia", "negocio", "local", "comercio", "tienda", "establecimiento", "giro"]
    },
    {
        "id": "tupa-004",
        "codigo_tupa": "TUPA-004",
        "nombre_tramite": "Certificado de Parámetros Urbanísticos y Edificatorios",
        "dias_plazo_legal": 5,
        "area_responsable_id": "area-gidu", # Gerencia de Infraestructura y Desarrollo Urbano
        "palabras_clave": ["parametros", "urbanisticos", "zonificacion", "certificado", "altura", "retiro", "lote"]
    },
    {
        "id": "tupa-005",
        "codigo_tupa": "TUPA-005",
        "nombre_tramite": "Duplicado de Carné de Sanidad y Control Metropolitano",
        "dias_plazo_legal": 2,
        "area_responsable_id": "area-gds", # Gerencia de Desarrollo Social / Servicios a la Ciudad
        "palabras_clave": ["carne", "sanidad", "salud", "duplicado", "manipulador", "alimentos", "medico"]
    }
]


def extraer_texto_ocr(image_path: str) -> str:
    """
    Descarga o abre una imagen, le aplica preprocesamiento básico mediante OpenCV
    para mejorar el contraste y extrae el texto usando PyTesseract.
    """
    if pytesseract is None:
        raise ImportError("pytesseract no está instalado en el entorno actual.")
        
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"El archivo {image_path} no existe.")

    # 1. Cargar imagen con OpenCV (si está disponible)
    img = cv2.imread(image_path) if cv2 is not None else None
    if img is None:
        # Si OpenCV falla (por ejemplo, formato no soportado), intentar con PIL directamente
        try:
            with PIL.Image.open(image_path) as pil_img:
                return pytesseract.image_to_string(pil_img, lang="spa").strip()
        except Exception as e:
            raise ValueError(f"No se pudo decodificar la imagen: {e}")

    # 2. Convertir a escala de grises
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. Aplicar umbralización (Otsu Thresholding) para optimizar el OCR
    processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    # 4. Extraer texto indicando idioma español
    texto = pytesseract.image_to_string(processed_img, lang="spa")
    
    return texto.strip()


def limpiar_texto(texto: str) -> str:
    """
    Normaliza el texto: convierte a minúsculas, elimina puntuación,
    números y remueve las palabras vacías (stopwords).
    """
    if not texto:
        return ""
        
    # Convertir a minúsculas
    texto = texto.lower()
    
    # Mantener solo letras (incluye tildes, eñes y diéresis) y espacios
    texto = re.sub(r"[^\w\sáéíóúñü]", "", texto)
    
    # Filtrar palabras vacías
    palabras = texto.split()
    palabras_filtradas = [w for w in palabras if w not in SPANISH_STOPWORDS]
    
    return " ".join(palabras_filtradas)


def clasificar_contingencia_keywords(texto_limpio: str) -> dict:
    """
    Clasificador de contingencia basado en conteo de palabras clave/coincidencia simple.
    Se utiliza en caso de que SentenceTransformers esté desactivado o no tenga conexión.
    """
    scores = []
    palabras_doc = set(texto_limpio.split())
    
    for tramite in TUPA_CATALOGO:
        # Calcular intersección de palabras clave con el texto limpio
        coincidencias = palabras_doc.intersection(set(tramite["palabras_clave"]))
        score = len(coincidencias)
        scores.append(score)
        
    max_score = max(scores)
    
    if max_score > 0:
        idx_max = scores.index(max_score)
        tramite_elegido = TUPA_CATALOGO[idx_max]
        # Calcular una confianza mock en base a la proporción de palabras clave encontradas
        ia_confianza = min(0.95, 0.4 + (max_score / len(tramite_elegido["palabras_clave"])) * 0.5)
    else:
        # Si no coincide nada, se asigna al primer trámite por defecto con confianza baja
        tramite_elegido = TUPA_CATALOGO[0]
        ia_confianza = 0.20
        
    return {
        "tupa_id": tramite_elegido["id"],
        "codigo_tupa": tramite_elegido["codigo_tupa"],
        "nombre_tramite": tramite_elegido["nombre_tramite"],
        "area_asignada_id": tramite_elegido["area_responsable_id"],
        "dias_plazo_legal": tramite_elegido["dias_plazo_legal"],
        "ia_confianza": round(ia_confianza, 2)
    }


def clasificar_documento_semantico(texto_documento: str) -> dict:
    """
    Compara semánticamente el documento de entrada contra la lista de trámites TUPA.
    Retorna el trámite con mayor similitud semántica.
    """
    texto_limpio = limpiar_texto(texto_documento)
    
    # Validar si no hay texto significativo
    if not texto_limpio:
        return {
            "tupa_id": TUPA_CATALOGO[0]["id"],
            "codigo_tupa": TUPA_CATALOGO[0]["codigo_tupa"],
            "nombre_tramite": TUPA_CATALOGO[0]["nombre_tramite"],
            "area_asignada_id": TUPA_CATALOGO[0]["area_responsable_id"],
            "dias_plazo_legal": TUPA_CATALOGO[0]["dias_plazo_legal"],
            "ia_confianza": 0.10
        }

    # Si SentenceTransformers no cargó correctamente, usar contingencia por keywords
    if MODELO_SEMANTICO is None:
        return clasificar_contingencia_keywords(texto_limpio)
        
    try:
        # Obtener los nombres y descripciones de los trámites
        nombres_tupa = [t["nombre_tramite"] for t in TUPA_CATALOGO]
        
        # Codificar tanto el catálogo como el texto del expediente
        embeddings_tupa = MODELO_SEMANTICO.encode(nombres_tupa, convert_to_tensor=True)
        emb_doc = MODELO_SEMANTICO.encode(texto_limpio, convert_to_tensor=True)
        
        # Calcular similitud coseno entre el texto del documento y el catálogo
        similitudes = util.cos_sim(emb_doc, embeddings_tupa)[0]
        
        # Obtener el índice con mayor similitud
        idx_max = int(np.argmax(similitudes.cpu().numpy()))
        score_confianza = float(similitudes[idx_max].item())
        
        tramite_elegido = TUPA_CATALOGO[idx_max]
        
        # Forzar un rango saludable de confianza (0.0 - 1.0)
        score_confianza = max(0.0, min(1.0, score_confianza))
        
        return {
            "tupa_id": tramite_elegido["id"],
            "codigo_tupa": tramite_elegido["codigo_tupa"],
            "nombre_tramite": tramite_elegido["nombre_tramite"],
            "area_asignada_id": tramite_elegido["area_responsable_id"],
            "dias_plazo_legal": tramite_elegido["dias_plazo_legal"],
            "ia_confianza": round(score_confianza, 2)
        }
    except Exception as e:
        print(f"[IA Error] Fallo en clasificación semántica ({e}). Usando contingencia.")
        return clasificar_contingencia_keywords(texto_limpio)


def calcular_score_prioridad(fecha_ingreso: datetime, dias_plazo_legal: int) -> float:
    """
    Calcula dinámicamente un valor de prioridad entre 0 y 100
    según los días de plazo que le queden legalmente al trámite.
    """
    fecha_actual = datetime.now()
    fecha_limite = fecha_ingreso + timedelta(days=dias_plazo_legal)
    
    # Calcular diferencia de días
    dias_restantes = (fecha_limite - fecha_actual).days
    
    # Si ya venció el plazo, prioridad máxima
    if dias_restantes <= 0:
        return 100.0
        
    # Si quedan más días del plazo legal total (caso extraño de fechas futuras), prioridad mínima
    if dias_restantes >= dias_plazo_legal:
        return 10.0
        
    # La prioridad aumenta exponencialmente a medida que la fecha límite se aproxima
    proporcion_tiempo_transcurrido = 1.0 - (dias_restantes / dias_plazo_legal)
    score = proporcion_tiempo_transcurrido * 100.0
    
    return round(max(10.0, min(100.0, score)), 2)
