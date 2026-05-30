from dotenv import load_dotenv
load_dotenv()

try:
    import cv2
except ImportError:
    cv2 = None
import re
import os
import io
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
    tesseract_env = os.getenv("TESSERACT_CMD")
    if tesseract_env:
        pytesseract.pytesseract.tesseract_cmd = tesseract_env
except ImportError:
    pytesseract = None

# Intentar importar pypdf
try:
    import pypdf
except ImportError:
    pypdf = None

# Intentar importar SentenceTransformers para clasificación semántica inteligente
try:
    from sentence_transformers import SentenceTransformer, util
    import torch
    # Usar modelo multilingüe eficiente y de buen desempeño
    MODELO_SEMANTICO = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
except Exception as e:
    MODELO_SEMANTICO = None
    print(f"[IA Warning] No se pudo cargar SentenceTransformers ({e}). Se usará clasificador de contingencia.")

# Catálogo TUPA de contingencia (coincide con seed_tupas.js y sus UUIDs reales)
FALLBACK_TUPA_CATALOGO = [
    {
        "id": "527680f4-1c8b-40c4-81e7-cdbaa5cea90b",
        "codigo_tupa": "DOC-001",
        "nombre_tramite": "Formulario Unico de Tramite (FUT) o Solicitud Simple",
        "dias_plazo_legal": 1,
        "area_responsable_id": "99ec2363-70e0-4ac7-a4c9-1621d5f812a9",
        "palabras_clave": ["formulario", "unico", "tramite", "fut", "solicitud", "simple"]
    },
    {
        "id": "baaf2591-4fd1-4b97-b710-e247859e541c",
        "codigo_tupa": "DOC-002",
        "nombre_tramite": "Oficios y Cartas de Instituciones Externas",
        "dias_plazo_legal": 0,
        "area_responsable_id": "5aeac95f-4f74-4e9e-a138-92d0158a6dcc",
        "palabras_clave": ["oficios", "cartas", "instituciones", "externas", "oficio", "carta"]
    },
    {
        "id": "ad27fb7b-8461-4842-b03f-856256fa7f74",
        "codigo_tupa": "TUP-001",
        "nombre_tramite": "Licencia de Funcionamiento - Nivel de riesgo bajo",
        "dias_plazo_legal": 2,
        "area_responsable_id": "9094a739-9f22-4dc6-ba76-d583fee4d191",
        "palabras_clave": ["licencia", "funcionamiento", "riesgo", "bajo", "negocio", "comercio", "tienda"]
    },
    {
        "id": "9d057666-2b74-41c0-a8d2-8cf619c0ff81",
        "codigo_tupa": "TUP-002",
        "nombre_tramite": "Licencia de Funcionamiento - Nivel de riesgo alto o muy alto",
        "dias_plazo_legal": 8,
        "area_responsable_id": "9094a739-9f22-4dc6-ba76-d583fee4d191",
        "palabras_clave": ["licencia", "funcionamiento", "riesgo", "alto", "muy", "negocio", "comercio", "tienda"]
    },
    {
        "id": "cfacc99c-efa5-4f52-80cd-b1cd36bee5af",
        "codigo_tupa": "TUP-003",
        "nombre_tramite": "Inspeccion Tecnica de Seguridad en Edificaciones (ITSE)",
        "dias_plazo_legal": 7,
        "area_responsable_id": "0448dd7c-46fc-4fdc-98dd-be55e2700bb5",
        "palabras_clave": ["inspeccion", "tecnica", "seguridad", "edificaciones", "itse", "defensa", "civil"]
    },
    {
        "id": "83f9ff60-d481-46d1-bc72-0d79e24cdc44",
        "codigo_tupa": "TUP-004",
        "nombre_tramite": "Licencia de Edificacion Modalidad A",
        "dias_plazo_legal": 1,
        "area_responsable_id": "ecf3abf0-8627-4a55-b9ce-3e2a143f7f97",
        "palabras_clave": ["licencia", "edificacion", "modalidad", "construccion", "obra"]
    },
    {
        "id": "6dcfd029-5634-46b3-ada8-1b720fe51b6e",
        "codigo_tupa": "TUP-005",
        "nombre_tramite": "Licencia de Edificacion Modalidad B, C y D",
        "dias_plazo_legal": 15,
        "area_responsable_id": "ecf3abf0-8627-4a55-b9ce-3e2a143f7f97",
        "palabras_clave": ["licencia", "edificacion", "modalidad", "construccion", "obra"]
    },
    {
        "id": "5914c57d-7497-4819-b482-c7af22f0788b",
        "codigo_tupa": "TUP-006",
        "nombre_tramite": "Constancia de posesion de terrenos",
        "dias_plazo_legal": 15,
        "area_responsable_id": "ecf3abf0-8627-4a55-b9ce-3e2a143f7f97",
        "palabras_clave": ["constancia", "posesion", "terrenos", "terreno", "propiedad", "lote"]
    },
    {
        "id": "70445be4-6de0-4f9b-834b-81c15f43ac6e",
        "codigo_tupa": "TUP-007",
        "nombre_tramite": "Licencia de Conducir para Vehiculos Menores Motorizados",
        "dias_plazo_legal": 5,
        "area_responsable_id": "ecf3abf0-8627-4a55-b9ce-3e2a143f7f97",
        "palabras_clave": ["licencia", "conducir", "vehiculos", "menores", "motorizados", "moto", "brevete"]
    },
    {
        "id": "de3bccbc-9a65-4903-97cc-fce1ae07a372",
        "codigo_tupa": "TUP-008",
        "nombre_tramite": "Nulidad de papeletas de infracciones de transito",
        "dias_plazo_legal": 30,
        "area_responsable_id": "7a6bb509-a9ae-4e79-8211-563ef25ffbd0",
        "palabras_clave": ["nulidad", "papeletas", "infracciones", "transito", "papeleta", "multa", "descargo"]
    },
    {
        "id": "149df240-3667-4ed7-a986-64089e0af630",
        "codigo_tupa": "TUP-009",
        "nombre_tramite": "Inscripcion de actas de nacimiento",
        "dias_plazo_legal": 1,
        "area_responsable_id": "99ec2363-70e0-4ac7-a4c9-1621d5f812a9",
        "palabras_clave": ["inscripcion", "actas", "nacimiento", "acta", "partida", "bebe", "hijo"]
    },
    {
        "id": "abe4b4c8-1642-4e00-ae45-fd4ea4596faa",
        "codigo_tupa": "TUP-010",
        "nombre_tramite": "Suspension de cobranza coactiva",
        "dias_plazo_legal": 15,
        "area_responsable_id": "7a6bb509-a9ae-4e79-8211-563ef25ffbd0",
        "palabras_clave": ["suspension", "cobranza", "coactiva", "coactivo", "deuda", "embargo"]
    }
]

def cargar_catalogo_desde_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return FALLBACK_TUPA_CATALOGO
    
    conn = None
    try:
        import psycopg2
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT id, codigo_tupa, nombre_tramite, dias_plazo_legal, area_responsable_id FROM tupa_procedimientos WHERE es_activo = TRUE;")
        rows = cur.fetchall()
        
        if not rows:
            cur.close()
            conn.close()
            return FALLBACK_TUPA_CATALOGO
            
        catalogo = []
        for r in rows:
            tupa_id, codigo_tupa, nombre_tramite, dias_plazo, area_id = r
            # Generar palabras clave dinámicas
            cleaned = limpiar_texto(nombre_tramite)
            palabras_clave = list(set(cleaned.split()))
            
            catalogo.append({
                "id": str(tupa_id),
                "codigo_tupa": codigo_tupa,
                "nombre_tramite": nombre_tramite,
                "dias_plazo_legal": dias_plazo,
                "area_responsable_id": str(area_id),
                "palabras_clave": palabras_clave
            })
            
        cur.close()
        conn.close()
        print(f"[DB INFO] Catálogo TUPA cargado dinámicamente de la DB ({len(catalogo)} trámites).")
        return catalogo
    except Exception as e:
        print(f"[DB WARNING] Error cargando catálogo de DB ({e}). Usando fallback estático.")
        if conn:
            conn.close()
        return FALLBACK_TUPA_CATALOGO


def extraer_texto_ocr(image_path: str) -> str:
    """
    Extrae el texto de un archivo PDF (digital o escaneado) o de una imagen (usando OCR).
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"El archivo {image_path} no existe.")

    # Si es un archivo PDF, procesarlo correspondientemente
    if image_path.lower().endswith('.pdf'):
        texto_pdf = ""
        if pypdf is not None:
            try:
                reader = pypdf.PdfReader(image_path)
                paginas_texto = []
                for page in reader.pages:
                    t = page.extract_text()
                    if t:
                        paginas_texto.append(t)
                texto_pdf = "\n".join(paginas_texto).strip()
            except Exception as e:
                print(f"[PDF Error] No se pudo extraer texto digital del PDF: {e}")
        
        if texto_pdf:
            return texto_pdf

        # Si no se extrajo texto (puede ser PDF escaneado), intentar extraer imágenes y hacerles OCR
        if pypdf is not None and pytesseract is not None:
            print("[OCR] PDF digital vacío. Intentando OCR sobre imágenes embebidas...")
            try:
                reader = pypdf.PdfReader(image_path)
                texto_imagenes = []
                for page in reader.pages:
                    for image_file_object in page.images:
                        try:
                            with PIL.Image.open(io.BytesIO(image_file_object.data)) as img_obj:
                                t = pytesseract.image_to_string(img_obj, lang="spa")
                                if t:
                                    texto_imagenes.append(t)
                        except Exception as img_err:
                            print(f"[OCR Warning] No se pudo procesar imagen del PDF: {img_err}")
                texto_ocr_pdf = "\n".join(texto_imagenes).strip()
                if texto_ocr_pdf:
                    return texto_ocr_pdf
            except Exception as e:
                print(f"[PDF OCR Error] Error al extraer imágenes e interactuar con Tesseract: {e}")

        raise ValueError("El archivo PDF no contiene texto legible digitalmente ni imágenes procesables por OCR.")

    # Procesar como imagen convencional
    if pytesseract is None:
        raise ImportError("pytesseract no está instalado en el entorno actual.")

    # 1. Cargar imagen con OpenCV (si está disponible)
    img = cv2.imread(image_path) if cv2 is not None else None
    if img is None:
        # Si OpenCV falla, intentar con PIL directamente
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

# Cargar catálogo dinámicamente
TUPA_CATALOGO = cargar_catalogo_desde_db()


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
