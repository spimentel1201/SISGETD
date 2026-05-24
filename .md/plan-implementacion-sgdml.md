# Plan de Implementación Modular — Sistema de Gestión Documental con ML
## Municipalidad Provincial de Yau · SGDML MVP

> **Marco normativo base:** Ley N° 27444 · Ley N° 29733 · Ley N° 31814 · DS N° 115-2025-PCM · DS N° 098-2025-PCM · Ley N° 29783

---

## Índice

1. [Versiones del sistema](#1-versiones-del-sistema)
2. [Arquitectura de microservicios](#2-arquitectura-de-microservicios)
3. [Módulos y servicios — Versión A (Core MVP)](#3-módulos-y-servicios--versión-a-core-mvp)
5. [Entidades y esquema relacional](#5-entidades-y-esquema-relacional)
6. [Relaciones entre entidades](#6-relaciones-entre-entidades)
7. [Flujos de datos](#7-flujos-de-datos)
8. [Pantallas e interfaces](#8-pantallas-e-interfaces)
9. [Cumplimiento normativo por módulo](#9-cumplimiento-normativo-por-módulo)

---

## 1. Versiones del sistema

| | Versión A — Core MVP |
|---|---|---|
| **Descripción** | Gestión documental completa con IA |
| **Módulos** | 6 | 8 |
| **Entidades BD** | 6 tablas |
| **Pantallas** | 9 |
| **Actores** | Ciudadano, Mesa de Partes, Funcionario, Alta Dirección |
| **Ley 31814** | Clasificación documental (riesgo medio)|

---

## 2. Arquitectura de microservicios

El sistema sigue un modelo de **microservicios asíncronos** orientado a eventos, separando la carga transaccional de la carga computacional de IA.

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                        │
│   React.js — Mesa de Partes Virtual · Portal Ciudadano          │
│              Dashboard Gerencial · Módulo CAS (v.B)             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────────────┐
│                     API GATEWAY                                 │
│   Express.js (Node) — Auth JWT · CRUD Expedientes               │
│                        Multer (uploads) · Webhooks              │
└────────────┬───────────────────────────┬────────────────────────┘
             │ Produce mensajes          │ Recibe webhooks
┌────────────▼──────────┐   ┌────────────▼────────────────────────┐
│   MESSAGE BROKER      │   │        MICROSERVICIO IA             │
│   RabbitMQ / Redis    │──▶│   FastAPI (Python) + Celery Workers │
│   Queues asíncronas   │   │   OCR · NLP · ML · Embeddings       │
└───────────────────────┘   └────────────┬────────────────────────┘
                                         │ Lectura / escritura
┌────────────────────────────────────────▼────────────────────────┐
│                        CAPA DE DATOS                            │
│   PostgreSQL + pgvector   ·   S3 / Object Storage (PDFs)        │
│   Logs de auditoría (Ley 31814)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Stack tecnológico

| Componente | Tecnología | Justificación |
|---|---|---|
| Frontend | React.js + Recharts | SPA, dashboards interactivos |
| API Gateway | Express.js (Node) | Orquestación ligera, JWT, Multer |
| Message Broker | RabbitMQ o Redis | Desacopla transaccional de ML |
| Microservicio IA | FastAPI + Celery (Python) | Rendimiento asíncrono, ecosistema ML |
| Base de datos | PostgreSQL + pgvector | Relacional + búsqueda vectorial |
| Almacenamiento | S3 / local (MinIO) | Archivos PDF e imágenes |
| OCR | Tesseract + OpenCV | Extracción de texto de documentos escaneados |
| NLP | Scikit-learn / HuggingFace Transformers | Clasificación TUPA |
| Embeddings | SentenceTransformers (v.B) | Búsqueda semántica de CVs |

---

## 3. Módulos y servicios — Versión A (Core MVP)

### M1 · Ingesta Documental
**Capa:** Frontend · **Tecnología:** React.js · **Prioridad:** 1

**Servicios / componentes:**
- `MesaPartesForm` — formulario de ingreso ciudadano
- `FileUploader` — validación de tipo y tamaño de archivo en cliente (TensorFlow.js)
- `TrackingPortal` — consulta de estado por N° expediente
- `AuthModule` — login JWT para ciudadanos y funcionarios

**Endpoints que consume:**
```
POST /api/expedientes
GET  /api/expedientes/:id/estado
```

---

### M2 · API Gateway
**Capa:** Backend · **Tecnología:** Express.js (Node) · **Prioridad:** 2

**Servicios / controladores:**
- `AuthController` — JWT, refresh tokens, control de roles
- `ExpedienteController` — CRUD completo de expedientes
- `FileController` — upload a S3/local vía Multer
- `WebhookController` — recibe resultados del microservicio Python
- `NotificacionController` — dispara emails (Nodemailer) y SMS

**Endpoints expuestos:**
```
POST /api/auth/login
POST /api/auth/register
POST /api/expedientes
GET  /api/expedientes
GET  /api/expedientes/:id
POST /api/webhooks/ml-resultado
GET  /api/dashboard/kpis
GET  /api/dashboard/expedientes-criticos
```

---

### M3 · Message Broker
**Capa:** Infraestructura · **Tecnología:** RabbitMQ / Redis · **Prioridad:** 3

**Colas definidas:**
- `expedientes.procesar` — tareas OCR + clasificación ML
- `notificaciones.enviar` — emails y SMS asíncronos

**Roles:**
- **Producer (Node)** — publica evento al recibir y guardar el archivo
- **Consumer (Python Celery)** — consume la cola y procesa con IA

---

### M4 · Microservicio IA
**Capa:** ML / Python · **Tecnología:** FastAPI + Celery · **Prioridad:** 4

**Servicios / workers:**
- `OCRWorker` — Tesseract + OpenCV, corrección de imagen (des-torcido, ruido)
- `PreprocesoService` — limpieza de texto con NLTK (stopwords, lematización)
- `ClasificadorTUPA` — modelo Scikit-learn/Transformers fine-tuned, clasifica el documento según el TUPA
- `PriorizadorService` — calcula `score_prioridad` basado en días restantes al plazo legal
- `EnrutadorService` — mapea clase TUPA → `area_id` responsable

**Endpoints internos:**
```
POST /ml/clasificar
POST /ml/priorizar
```

---

### M5 · Base de Datos
**Capa:** Datos · **Tecnología:** PostgreSQL + extensión pgvector · **Prioridad:** 5

Tablas: `usuarios`, `areas`, `tupa_procedimientos`, `expedientes`, `historial_estados`, `notificaciones`

> Detalle completo en la sección [Entidades y esquema relacional](#5-entidades-y-esquema-relacional).

---

### M6 · Dashboard Gerencial
**Capa:** Frontend · **Tecnología:** React.js + Recharts · **Prioridad:** 6

**Componentes:**
- `BandejaFuncionario` — lista priorizada de expedientes por área
- `KPIPanel` — tiempos promedio de atención, cuellos de botella
- `MapaCarga` — distribución de expedientes por área/gerencia
- `AlertasVencimiento` — semáforo rojo/ámbar/verde de plazos legales

**Endpoints que consume:**
```
GET /api/dashboard/kpis
GET /api/dashboard/expedientes-criticos
GET /api/areas/:id/expedientes
```

---

## 5. Entidades y esquema relacional

### `usuarios`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID · PK | |
| `dni` | VARCHAR(8) · UNIQUE | |
| `nombre` | VARCHAR(120) | |
| `email` | VARCHAR(120) · UNIQUE | |
| `rol` | ENUM | `ciudadano`, `funcionario`, `admin` |
| `area_id` | UUID · FK → `areas` | Null para ciudadanos |
| `hash_password` | TEXT | bcrypt |
| `created_at` | TIMESTAMP | |

---

### `areas`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID · PK | |
| `codigo` | VARCHAR(20) · UNIQUE | Ej.: `GDE`, `GTI` |
| `nombre` | VARCHAR(120) | |
| `gerencia` | VARCHAR(120) | |

---

### `tupa_procedimientos`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID · PK | |
| `codigo_tupa` | VARCHAR(30) · UNIQUE | |
| `nombre_tramite` | VARCHAR(200) | |
| `dias_plazo_legal` | INT | Días hábiles |
| `tipo_silencio` | ENUM | `positivo`, `negativo`, `automatico` |
| `area_responsable_id` | UUID · FK → `areas` | |

---

### `expedientes`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID · PK | |
| `numero_expediente` | VARCHAR(20) · UNIQUE | Auto-generado |
| `usuario_id` | UUID · FK → `usuarios` | |
| `tupa_id` | UUID · FK → `tupa_procedimientos` | Asignado por IA |
| `area_asignada_id` | UUID · FK → `areas` | Asignada por IA |
| `estado` | ENUM | `ingresado`, `en_validacion`, `requiere_triaje`, `derivado`, `en_evaluacion`, `resuelto`, `archivado` |
| `ia_confianza` | FLOAT | Porcentaje de certeza del modelo ML (0.00 - 1.00) |
| `score_prioridad` | FLOAT | Calculado por ML (0–100) |
| `archivo_url` | TEXT | Ruta en S3/local |
| `fecha_ingreso` | TIMESTAMP | |
| `fecha_limite` | TIMESTAMP | `fecha_ingreso + dias_plazo_legal` |
| `fecha_resolucion` | TIMESTAMP | Null hasta resolución |

---

### `historial_estados`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID · PK | |
| `expediente_id` | UUID · FK → `expedientes` | |
| `estado_anterior` | VARCHAR(50) | |
| `estado_nuevo` | VARCHAR(50) | |
| `usuario_id` | UUID · FK → `usuarios` | Actor del cambio |
| `observacion` | TEXT | |
| `fecha` | TIMESTAMP | |

> Log inmutable — sin UPDATE ni DELETE permitidos a nivel de aplicación.

---

### `notificaciones`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID · PK | |
| `expediente_id` | UUID · FK → `expedientes` | |
| `usuario_id` | UUID · FK → `usuarios` | |
| `canal` | ENUM | `email`, `sms` |
| `mensaje` | TEXT | |
| `enviado` | BOOLEAN | |
| `fecha_envio` | TIMESTAMP | |

---

## 6. Relaciones entre entidades

```
usuarios ──────────────── N:1 ──→ areas
expedientes ───────────── N:1 ──→ usuarios
expedientes ───────────── N:1 ──→ tupa_procedimientos
expedientes ───────────── N:1 ──→ areas            (area_asignada_id)
historial_estados ──────── N:1 ──→ expedientes
historial_estados ──────── N:1 ──→ usuarios
notificaciones ─────────── N:1 ──→ expedientes
notificaciones ─────────── N:1 ──→ usuarios
```

---

## 7. Flujos de datos

### Flujo A · Ingreso de un trámite ciudadano

```
1. [Ciudadano]       Sube PDF en Mesa de Partes Virtual (React)
2. [Express]         Recibe archivo en memoria (Buffer) y realiza validación rápida (MIME type real, firmas mágicas, límite MB).
3. [Express]         Guarda en bucket S3 "tmp-quarantine" (con política de auto-borrado TTL de 24h).
4. [Express]         Crea expediente en BD con estado = "en_validacion".
5. [Express]         Responde al ciudadano: "Trámite recibido — N° EXP-2025-XXXX"
6. [Celery Worker]   Consume evento de la cola
7. [Python]          Descarga archivo, ejecuta OCR + OpenCV
8. [Python]          Limpia texto (NLTK), clasifica con modelo TUPA (Scikit-learn)
9. [Python]          Calcula score_prioridad según días al plazo legal
10. [Python]         Determina area_asignada_id
11. [Python]         Llama al webhook de Express con los resultados
12. [Express]        Actualiza expediente en BD (estado = "derivado", area, score)
13. [Express]        Registra cambio en historial_estados
14. [Express]        Envía email/SMS al ciudadano con área asignada
15. [Funcionario]    Ve expediente en bandeja priorizada (Dashboard React)
16. [Funcionario]    Evalúa, redacta informe técnico y firma digitalmente
17. [Express]        Actualiza estado = "resuelto", notifica al ciudadano
```

---

## 8. Pantallas e interfaces

### Actor: Ciudadano

#### S01 · Acceso / Registro
**Descripción:** Login ciudadano o registro de cuenta nueva.

**Campos del formulario:**
| Campo | Tipo |
|---|---|
| DNI / RUC | text |
| Contraseña | password |
| Nombre completo | text |
| Correo electrónico | email |
| Teléfono | tel |

**Acciones / servicios:**
- Validar DNI contra RENIEC vía PIDE (interoperabilidad)
- Generar token JWT con claims de rol
- Enviar correo de bienvenida (Nodemailer)

**Reglas de negocio:**
- Sesión expira en 8 horas
- 2FA opcional para funcionarios y admin
- Contraseña mínimo 8 caracteres

---

#### S02 · Mesa de Partes Virtual
**Descripción:** Ingreso de expediente nuevo por parte del ciudadano.

**Campos del formulario:**
| Campo | Tipo |
|---|---|
| Tipo de trámite (TUPA) | select |
| Asunto / descripción | textarea |
| Archivo(s) adjunto(s) | file (PDF / imagen) |
| Datos del administrado | auto (pre-fill desde JWT) |
| Folio / número de páginas | auto-calculado |

**Acciones / servicios:**
- Validar completitud del formulario en cliente (TensorFlow.js)
- Crear expediente en BD con estado `recibido`
- Publicar evento en RabbitMQ
- Retornar N° expediente al ciudadano de forma inmediata

**Reglas de negocio:**
- Máximo 20 MB por archivo
- Solo se aceptan PDF, JPEG y PNG
- Campo asunto con mínimo 20 caracteres
- Formulario con pre-fill automático desde el JWT

---

#### S03 · Seguimiento de trámite
**Descripción:** Consulta de estado del expediente sin necesidad de login.

**Campos del formulario:**
| Campo | Tipo |
|---|---|
| N° expediente | text |
| DNI del titular | text |

**Acciones / servicios:**
- Consultar estado actual en BD
- Mostrar línea de tiempo de estados
- Mostrar área responsable actual
- Mostrar fecha límite legal con semáforo

**Reglas de negocio:**
- Acceso público (solo N° expediente + DNI)
- No expone datos de terceros ni de otras solicitudes
- Muestra notificaciones pendientes del expediente

---

#### S04 · Centro de notificaciones
**Descripción:** Historial de alertas y comunicaciones del ciudadano autenticado.

**Campos:**
| Campo | Tipo |
|---|---|
| Lista de notificaciones | readonly / timeline |
| Filtro por estado | select |

**Acciones / servicios:**
- Marcar notificación como leída
- Descargar resolución firmada digitalmente
- Redirigir al expediente correspondiente

**Reglas de negocio:**
- Solo muestra notificaciones del usuario autenticado
- El email/SMS ya fue despachado desde el backend

---

### Actor: Mesa de Partes

#### S05 · Bandeja de recepción
**Descripción:** Validación y supervisión de expedientes ingresados.

**Campos / elementos:**
| Campo | Tipo |
|---|---|
| Lista de expedientes recientes | table |
| Filtro por estado / área | select + date |
| Buscador por N° o DNI | text |

**Acciones / servicios:**
- Visualizar clasificación propuesta por la IA
- Confirmar o corregir el enrutamiento sugerido
- Marcar expediente como incompleto (devolver al ciudadano)
- Forzar reasignación manual a otra área

**Reglas de negocio:**
- Solo puede editar expedientes en estado `recibido` o `procesando`
- Toda corrección queda registrada en `historial_estados`
- La IA asiste; el operador humano supervisa y tiene la última palabra

---

#### S06 · Detalle de expediente
**Descripción:** Vista completa del expediente con resultado de clasificación IA.

**Campos / elementos:**
| Campo | Tipo |
|---|---|
| Datos del administrado | readonly |
| Documento(s) adjunto(s) | preview PDF integrado |
| Clasificación IA (TUPA) | badge con score de confianza |
| Área sugerida | readonly con opción de edición |
| Score de prioridad | gauge visual (0–100) |
| Historial de estados | timeline cronológica |

**Acciones / servicios:**
- Confirmar clasificación propuesta por la IA
- Editar área responsable manualmente
- Agregar observación al expediente
- Derivar expediente a la gerencia correspondiente

**Reglas de negocio:**
- Log en `historial_estados` es inmutable
- Score de IA visible solo para operadores internos
- Plazo legal mostrado con indicador semáforo (rojo / ámbar / verde)

---

### Actor: Funcionario / Especialista

#### S07 · Bandeja de trabajo
**Descripción:** Lista de expedientes asignados al área, priorizados por IA.

**Campos / elementos:**
| Campo | Tipo |
|---|---|
| Lista de expedientes | table ordenable |
| Ordenar por prioridad | toggle |
| Filtro por tipo de trámite | select |
| Indicador de vencimiento | semáforo rojo / ámbar / verde |

**Acciones / servicios:**
- Abrir expediente para evaluación
- Reasignar a un colega del área
- Solicitar ampliación de plazo
- Ver historial de solicitudes del administrado

**Reglas de negocio:**
- Solo ve expedientes de su propio `area_id`
- Orden por defecto: `score_prioridad DESC`
- Rojo = vence en menos de 3 días hábiles

---

#### S08 · Evaluación de expediente
**Descripción:** Resolución técnica del trámite con firma digital.

**Campos del formulario:**
| Campo | Tipo |
|---|---|
| Datos del expediente | readonly |
| Documentos adjuntos | visor PDF integrado |
| Informe técnico | textarea enriquecido |
| Resultado | select: `aprobado` / `observado` / `denegado` |
| Número de resolución | auto-generado |
| Firma digital | token RENIEC (DS 098-2025-PCM) |

**Acciones / servicios:**
- Guardar borrador sin cambiar estado
- Derivar a Asesoría Jurídica si hay controversia normativa
- Emitir resolución con firma digital
- Sistema notifica automáticamente al ciudadano

**Reglas de negocio:**
- El borrador no cambia el estado del expediente
- Resolución final cambia estado a `resuelto`
- Firma digital es obligatoria (DS N° 098-2025-PCM)
- Se genera PDF sellado disponible para descarga ciudadana

---

### Actor: Alta Dirección

#### S09 · Dashboard gerencial
**Descripción:** Panel de KPIs y análisis de gestión en tiempo real.

**Campos / elementos:**
| Campo | Tipo |
|---|---|
| Expedientes totales por período | métrica numérica |
| Tiempo promedio de resolución | métrica + gráfico de tendencia |
| Carga por área | mapa de calor |
| Expedientes críticos (rojo) | lista ordenada |
| Tasa de silencio administrativo | porcentaje |
| Filtro por período / área | date-range + select |

**Acciones / servicios:**
- Exportar reporte en PDF o Excel
- Filtrar por gerencia o período
- Drill-down a expediente individual
- Configurar umbrales de alerta

**Reglas de negocio:**
- Solo lectura — no puede editar expedientes
- Datos actualizados cada 5 minutos
- Las vistas agregadas no exponen datos personales (Ley 29733)
---

## 9. Cumplimiento normativo por módulo

| Módulo | Normativa aplicable | Cómo se cumple |
|---|---|---|
| M1 Ingesta | Ley 27444 — Principio de simplicidad | Formulario digital sin exigir presencia física |
| M2 API Gateway | Ley 27444 — Principio de celeridad | Respuesta inmediata al ciudadano; procesamiento asíncrono |
| M2 API Gateway | DS 098-2025-PCM (SGD PERÚ) | Firma digital via RENIEC en resoluciones |
| M4 Microservicio IA | Ley 31814 + DS 115-2025-PCM | Clasificación documentada con log de auditoría y supervisión humana |
| M4 Microservicio IA | Ley 27444 — Impulso de oficio | Score de prioridad activa alertas de vencimiento automáticamente |
| M5 Base de datos | Ley 29733 — Datos personales | Acceso por roles, historial inmutable, sin datos en vistas agregadas |
| M6 Dashboard | Ley 29783 — Salud en el trabajo | Reduce carga de atención presencial y trabajo repetitivo |
| M6 Dashboard | DS 016-2021-MINAM (Ecoeficiencia) | Política de cero papel en la gestión documental |

---

*Documento generado para el proyecto SGDML — Municipalidad Provincial de Yau.*
*Versión 1.0 · Mayo 2026*
