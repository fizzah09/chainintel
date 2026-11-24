"""Import every module's ORM models here so Alembic sees all tables."""

from app.modules.m3_data import models as m3_models  # noqa: F401
from app.modules.m4_risk import models as m4_models  # noqa: F401
from app.modules.m5_flow import models as m5_models  # noqa: F401
