"""FastAPI entry point. Module routers (M3 to M7) are mounted here as they are built."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.core.config import get_settings
from app.modules.m3_data import api as m3_api
from app.modules.m4_risk import api as m4_api


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        # Interactive docs only outside production.
        docs_url=None if settings.env == "production" else "/docs",
        redoc_url=None,
        openapi_url=None if settings.env == "production" else "/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"] + (["X-Dev-User", "X-Dev-Roles", "X-Dev-Tenant"] if settings.env == "development" else []),
    )
    app.include_router(health.router)
    app.include_router(m3_api.router)
    app.include_router(m4_api.router)
    return app


app = create_app()
