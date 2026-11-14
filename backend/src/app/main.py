from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, items
from app.config import get_cors_origins


def create_app(cors_origins: list[str] | None = None) -> FastAPI:
    application = FastAPI()
    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if cors_origins is not None else get_cors_origins(),
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Content-Type"],
    )
    application.include_router(health.router)
    application.include_router(items.router)
    return application


app = create_app()
