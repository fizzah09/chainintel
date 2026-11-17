"""Which price applies to which asset, and where to get it.

Chainlink feed addresses were checked on Ethereum mainnet on 2026-11-17 (description(), decimals(),
latestRoundData()); token addresses were checked with symbol() and decimals().
"""

from dataclasses import dataclass

# Licence register for price sources (shown in the API and copied into every assessment manifest).
PRICE_SOURCES = {
    "chainlink": {
        "name": "Chainlink Data Feeds (on-chain)",
        "licence": "Public on-chain data read through the configured blockchain providers.",
        "commercial_use": "allowed",
    },
    "coingecko": {
        "name": "CoinGecko API",
        "licence": "Demo/free plan is non-commercial; production needs a paid plan (set CI_COINGECKO_COMMERCIAL_PLAN).",
        "commercial_use": "not_allowed",  # until a paid plan is configured
    },
}

# Chainlink USD feeds on Ethereum mainnet (proxy addresses), 8 decimals each.
CHAINLINK_FEEDS = {
    "ETH": "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    "BTC": "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
    "USDC": "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
    "USDT": "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
    "DAI": "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9",
    "LINK": "0x2c1d072e956affc0d435cb7ac38ef18d24d9127c",
}
CHAINLINK_CHAIN = 1

COINGECKO_IDS = {
    "ETH": "ethereum", "BTC": "bitcoin", "USDC": "usd-coin", "USDT": "tether", "DAI": "dai", "LINK": "chainlink",
    "POL": "polygon-ecosystem-token", "BNB": "binancecoin",
}
COINGECKO_PLATFORMS = {
    1: "ethereum", 10: "optimistic-ethereum", 56: "binance-smart-chain", 137: "polygon-pos", 8453: "base", 42161: "arbitrum-one",
}

# Native coin per chain. Sepolia (testnet) has no market price.
NATIVE = {1: "ETH", 10: "ETH", 8453: "ETH", 42161: "ETH", 137: "POL", 56: "BNB"}
NATIVE_SYMBOL = {**NATIVE, 11155111: "SepoliaETH"}

# Well-known tokens priced by a canonical key (shared Chainlink feed). WBTC uses BTC/USD: it tracks BTC
# 1:1 by design; the price row's source_ref says so.
KNOWN_TOKENS = {
    (1, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"): "USDC",
    (1, "0xdac17f958d2ee523a2206206994597c13d831ec7"): "USDT",
    (1, "0x6b175474e89094c44da98b954eedeac495271d0f"): "DAI",
    (1, "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"): "BTC",
    (1, "0x514910771af9ca656af840dff83e8264ecf986ca"): "LINK",
    (1, "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"): "ETH",
}


@dataclass(frozen=True)
class AssetRef:
    chain_id: int
    token: str | None  # None = the chain's native coin


@dataclass(frozen=True)
class PriceKey:
    key: str
    chainlink_feed: str | None
    coingecko: tuple[str, ...] | None  # ("coin", id) or ("contract", platform, address)


def resolve(asset: AssetRef) -> PriceKey | None:
    if asset.token is None:
        sym = NATIVE.get(asset.chain_id)
        if sym is None:
            return None
        return PriceKey(sym, CHAINLINK_FEEDS.get(sym), ("coin", COINGECKO_IDS[sym]) if sym in COINGECKO_IDS else None)
    token = asset.token.lower()
    known = KNOWN_TOKENS.get((asset.chain_id, token))
    if known:
        return PriceKey(known, CHAINLINK_FEEDS.get(known), ("coin", COINGECKO_IDS[known]))
    platform = COINGECKO_PLATFORMS.get(asset.chain_id)
    return PriceKey(f"erc20:{asset.chain_id}:{token}", None, ("contract", platform, token) if platform else None)
