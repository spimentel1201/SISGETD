from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SGDML — Microservicio IA",
    description="OCR, Clasificación TUPA, Priorización ML — Municipalidad Provincial de Yau",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# TODO: montar routers cuando se implementen
# from app.routes import ml_router
# app.include_router(ml_router, prefix="/ml")
