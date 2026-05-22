from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine, Base
from app.api.routes.auth import router as auth_router
from app.api.routes.usuarios import router as usuarios_router
from app.api.routes.ofertas import router_produtos, router_ofertas
from app.api.routes.parcerias import router_parcerias, router_notificacoes, router_relatorios
from app.api.routes.chatbot import router as chatbot_router

# Cria todas as tabelas automaticamente na inicialização
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Anti-Desperdício de Alimentos — API",
    description="API REST para gestão de excedentes alimentares, conexão entre parceiros e chatbot com IA.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,         prefix="/api")
app.include_router(usuarios_router,     prefix="/api")
app.include_router(router_produtos,     prefix="/api")
app.include_router(router_ofertas,      prefix="/api")
app.include_router(router_parcerias,    prefix="/api")
app.include_router(router_notificacoes, prefix="/api")
app.include_router(router_relatorios,   prefix="/api")
app.include_router(chatbot_router,      prefix="/api")


@app.get("/", tags=["Status"])
def root():
    return {"status": "online", "projeto": "Anti-Desperdício de Alimentos", "docs": "/docs"}


@app.get("/health", tags=["Status"])
def health():
    return {"status": "ok"}
