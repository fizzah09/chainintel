"""Authentication placeholder until Keycloak SSO (OIDC/SAML) is wired in.

Development runs without sign-in. To try role rules (for example four-eyes model approval) in
development, send `X-Dev-User` and `X-Dev-Roles` (comma-separated) headers; they are ignored in every
other environment. Staging and production refuse every API call until real authentication is
configured, so the API can never be deployed open by mistake.
"""

from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel

from app.core.config import Settings, get_settings


class Principal(BaseModel):
    user_id: str
    tenant_id: str
    roles: list[str]


def require_principal(
    settings: Settings = Depends(get_settings),
    x_dev_user: str | None = Header(default=None),
    x_dev_roles: str | None = Header(default=None),
    x_dev_tenant: str | None = Header(default=None),
) -> Principal:
    if settings.env in ("development", "test"):
        return Principal(
            user_id=x_dev_user or "dev-user",
            tenant_id=x_dev_tenant or "dev-tenant",
            roles=[r.strip() for r in x_dev_roles.split(",") if r.strip()] if x_dev_roles else ["developer"],
        )
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Authentication is not configured for this environment.",
    )


def require_roles(*roles: str):
    """Dependency: the caller must hold at least one of `roles` ('developer' passes in development)."""

    def check(p: Principal = Depends(require_principal)) -> Principal:
        if not set(roles) & set(p.roles) and "developer" not in p.roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"requires role {' or '.join(roles)}")
        return p

    return check
