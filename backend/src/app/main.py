from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health
from app.config import get_cors_origins


def create_app(cors_origins: list[str] | None = None) -> FastAPI:
    application = FastAPI(
        title="Pouso Alegre FC",
        description="Gestão do elenco, partidas e escalações do Pouso Alegre FC.",
        version="0.1.0",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if cors_origins is not None else get_cors_origins(),
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type"],
    )
    application.include_router(health.router)
    return application


app = create_app()