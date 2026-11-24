"""Builds the provider router from settings. The only place that knows which vendors exist."""

import logging

import httpx

from app.core.config import Settings
from app.modules.m3_data.providers.alchemy import AlchemyProvider
from app.modules.m3_data.providers.base import ChainDataProvider
from app.modules.m3_data.providers.etherscan import EtherscanProvider
from app.modules.m3_data.providers.infura import InfuraProvider
from app.modules.m3_data.providers.resilience import RetryPolicy, TokenBucket
from app.modules.m3_data.providers.router import ProviderRouter

log = logging.getLogger(__name__)


def build_router(settings: Settings, client: httpx.Client | None = None) -> ProviderRouter:
    client = client or httpx.Client(headers={"User-Agent": "chainintel-backend"})
    retry = RetryPolicy(max_attempts=settings.provider_max_retries)
    available: dict[str, ChainDataProvider] = {}

    if settings.etherscan_api_key:
        if settings.env == "production" and not settings.etherscan_commercial_plan:
            # Licence register: the free plan forbids commercial use.
            log.warning("Etherscan skipped: free plan is non-commercial; set CI_ETHERSCAN_COMMERCIAL_PLAN")
        else:
            available["etherscan"] = EtherscanProvider(
                settings.etherscan_api_key.get_secret_value(),
                client,
                TokenBucket(settings.etherscan_rps),
                retry,
                page_size=settings.provider_page_size,
                max_pages=settings.provider_max_pages,
                timeout=settings.provider_timeout,
            )
    if settings.alchemy_api_key:
        available["alchemy"] = AlchemyProvider(
            settings.alchemy_api_key.get_secret_value(),
            client,
            TokenBucket(settings.alchemy_rps),
            retry,
            page_size=settings.provider_page_size,
            max_pages=settings.provider_max_pages,
            timeout=settings.provider_timeout,
        )
    if settings.infura_api_key:
        available["infura"] = InfuraProvider(
            settings.infura_api_key.get_secret_value(),
            client,
            TokenBucket(settings.infura_rps),
            retry,
            page_size=settings.provider_page_size,
            max_pages=settings.provider_max_pages,
            timeout=settings.provider_timeout,
        )

    providers = [available[n] for n in settings.provider_order if n in available]
    if not providers:
        log.warning("No blockchain data provider configured: set CI_INFURA_API_KEY, CI_ETHERSCAN_API_KEY or CI_ALCHEMY_API_KEY")
    return ProviderRouter(providers)
