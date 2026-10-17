from fastapi import FastAPI

from app.api.routes import health, items


def create_app() -> FastAPI:
    application = FastAPI()
    application.include_router(health.router)
    application.include_router(items.router)
    return application


app = create_app()
