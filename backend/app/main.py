"""FastAPI entry point. Module routers (M3 to M7) are mounted here as they are built."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.core.config import get_settings
from app.modules.m3_data import api as m3_api
from app.modules.m3_data import scheduler as m3_scheduler
from app.modules.m4_risk import api as m4_api
from app.modules.m5_flow import api as m5_api
from app.modules.m6_cases import api as m6_api
from app.modules.m7_monitoring import api as m7_api
from app.modules.reports import api as reports_api


@asynccontextmanager
async def lifespan(app: FastAPI):
    m3_scheduler.start()
    yield
    m3_scheduler.stop()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        lifespan=lifespan,
        # Interactive docs only outside production.
        docs_url=None if settings.env == "production" else "/docs",
        redoc_url=None,
        openapi_url=None if settings.env == "production" else "/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.cors_allow_all else settings.cors_origins,
        allow_origin_regex=r"https://.*\.pages\.dev" if not settings.cors_allow_all else None,
        allow_credentials=not settings.cors_allow_all,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type", "X-Session-Id"] + (["X-Dev-User", "X-Dev-Roles", "X-Dev-Tenant"] if settings.env == "development" else []),
    )
    app.include_router(health.router)
    app.include_router(m3_api.router)
    app.include_router(m4_api.router)
    app.include_router(m5_api.router)
    app.include_router(m6_api.router)
    app.include_router(m7_api.router)
    app.include_router(reports_api.router)
    return app


app = create_app()
