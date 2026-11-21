"""Settings, read from environment variables prefixed CI_ (and backend/.env in development).

Secrets are never hard-coded: in production the environment is filled from the bank's vault.
"""

import json
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="CI_", env_file=str(_ENV_FILE), extra="ignore")

    env: Literal["development", "test", "staging", "production"] = "development"
    app_name: str = "Chain Intel API"
    version: str = "0.1.0"

    database_url: str = "postgresql+psycopg://chainintel:chainintel@127.0.0.1:5432/chainintel"
    redis_url: str = "redis://127.0.0.1:6379/0"

    cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=lambda: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ])

    @field_validator('cors_origins', mode='before')
    @classmethod
    def _parse_cors(cls, v):
        if isinstance(v, str):
            value = v.strip()
            if not value:
                return []
            if value.startswith("["):
                return json.loads(value)
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return v
    # Set CI_CORS_ALLOW_ALL=true in production to allow any origin (use behind auth).
    cors_allow_all: bool = False

    # Seconds a readiness probe waits for a dependency before calling it down.
    health_timeout: float = 2.0

    # ---- M3 blockchain data providers -----------------------------------------------------------
    etherscan_api_key: SecretStr | None = None
    # Free plan = personal/research use only. Production refuses Etherscan unless this is true.
    etherscan_commercial_plan: bool = False
    etherscan_rps: float = 3.0  # free plan; Advanced allows 20
    alchemy_api_key: SecretStr | None = None
    alchemy_rps: float = 2.0  # getAssetTransfers costs 120 CU; free tier allows 300 CU/s
    infura_api_key: SecretStr | None = None
    infura_rps: float = 10.0  # free tier: 100K req/day ≈ ~1 req/s sustained; allow bursts
    provider_order: list[str] = Field(default_factory=lambda: ["infura", "etherscan", "alchemy"])
    provider_timeout: float = 15.0
    provider_max_retries: int = 4
    provider_page_size: int = 1000
    provider_max_pages: int = 20

    # Blocks newer than head - depth are unconfirmed: they may still be reorganised away.
    default_confirmations: int = 12
    confirmations: dict[int, int] = Field(default_factory=lambda: {137: 128, 56: 15})
    # Cap contract reads per sync, so a wallet spammed with thousands of airdrop tokens cannot stall it.
    max_token_checks_per_sync: int = 50

    # ---- Prices (M4.2) ---------------------------------------------------------------------------
    coingecko_enabled: bool = True
    coingecko_api_key: SecretStr | None = None
    coingecko_pro: bool = False  # true = paid plan on pro-api.coingecko.com
    # Free/demo plan is non-commercial. Production uses CoinGecko only when this is true.
    coingecko_commercial_plan: bool = False
    coingecko_rps: float = 0.4  # demo plan: 30 calls per minute
    chainlink_max_calls_per_request: int = 200

    # ---- Risk assessment inputs (M4.2) -----------------------------------------------------------
    # Counterparties whose own history is loaded so 2-hop exposure is visible. Each costs one sync.
    risk_neighbours: int = 5
    default_ruleset: int = 3

    # ---- Model governance (M4.4) -----------------------------------------------------------------
    # Content-addressed model artefacts (<sha256>.json). In a bank: a mounted volume or object storage.
    model_store_dir: str = str(Path(__file__).resolve().parents[2] / "model_store")
    model_name: str = "illicit-classifier"
    model_min_roc_auc: float = 0.80  # validation refuses weaker models
    model_max_brier: float = 0.15
    # Send an assessment to manual review when this share of its transfers has no USD price.
    review_unpriced_share: float = 0.20

    def confirmations_for(self, chain_id: int) -> int:
        return self.confirmations.get(chain_id, self.default_confirmations)


@lru_cache
def get_settings() -> Settings:
    return Settings()
