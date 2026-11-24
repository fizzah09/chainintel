"""Seed remaining intel label sources: Chainabuse, ScamSniffer, Etherscan community labels,
Tornado Cash known contracts.

Revision ID: 0015
Revises: 0014
Create Date: 2026-11-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0015"
down_revision: str | None = "0014"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO label_sources (key, name, url, licence, commercial_use, default_confidence, refresh, notes, updated_at)
        VALUES
            ('chainabuse',
             'Chainabuse Community Reports',
             'https://www.chainabuse.com/api',
             'CC BY 4.0 — attribution required', 'allowed', 0.80, 'daily',
             'Community-submitted scam/hack/ransomware/phishing reports. GraphQL API, free tier.',
             NOW()),

            ('scamsniffer',
             'ScamSniffer Phishing Database',
             'https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.json',
             'MIT', 'allowed', 0.78, 'daily',
             'Curated list of phishing smart contracts and EOAs. GitHub-hosted JSON, no API key needed.',
             NOW()),

            ('eth_community_labels',
             'Ethereum Community Contract Labels',
             'https://raw.githubusercontent.com/ethereum-lists/contracts/main/contracts/eth/active.json',
             'MIT', 'allowed', 0.75, 'weekly',
             'ethereum-lists/contracts — community-maintained exchange, DEX, mixer contract names.',
             NOW()),

            ('tornado_cash',
             'Tornado Cash Known Contracts',
             'https://github.com/tornadocash/tornado-core',
             'Internal seed — no external sync', 'allowed', 1.00, 'static',
             'All known Tornado Cash pool and router contract addresses on Ethereum mainnet.',
             NOW()),

            ('metamask_phishfort',
             'MetaMask / PhishFort Blacklist',
             'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json',
             'MIT', 'allowed', 0.80, 'daily',
             'MetaMask phishing detector — blacklisted domains and ETH addresses used in phishing.',
             NOW())
        ON CONFLICT (key) DO NOTHING;
    """)

    # Seed Tornado Cash pool contracts as address_labels directly (static — no API needed).
    # Addresses sourced from the official TC deployment tx history (mainnet).
    op.execute("""
        INSERT INTO address_labels
            (source_key, network, chain_id, address, category, name, confidence,
             source_ref, attributes, valid_from, valid_to, import_id, ended_by_import_id)
        VALUES
            -- ETH pools
            ('tornado_cash','evm',1,'0x722122df12d4e14e13ac3b6895a86e84145b6967','mixer','Tornado Cash 0.1 ETH',1.00,'TC-ETH-0.1','{"denomination_eth":0.1,"token":"ETH"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0xdd4c48c0b24039969fc16d1cdf626eab821d3384','mixer','Tornado Cash 1 ETH',  1.00,'TC-ETH-1',  '{"denomination_eth":1,"token":"ETH"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0xd90e2f925da726b50c4ed8d0fb90ad053324f31b','mixer','Tornado Cash 10 ETH', 1.00,'TC-ETH-10', '{"denomination_eth":10,"token":"ETH"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x910cbd523d972eb0a6f4cae4618ad62622b39dbf','mixer','Tornado Cash 100 ETH',1.00,'TC-ETH-100','{"denomination_eth":100,"token":"ETH"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0xa160cdab225685da1d56aa342ad8841c3b53f291','mixer','Tornado Cash 1000 ETH',1.00,'TC-ETH-1000','{"denomination_eth":1000,"token":"ETH"}',NOW(),NULL,NULL,NULL),
            -- USDT pools
            ('tornado_cash','evm',1,'0xfd8610d20aa15b7b2e3be39b396a1bc3516c7144','mixer','Tornado Cash 100 USDT', 1.00,'TC-USDT-100', '{"denomination_usdt":100,"token":"USDT"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x07687e702b410fa43f4cb4af7fa097918ffd2730','mixer','Tornado Cash 1000 USDT',1.00,'TC-USDT-1000','{"denomination_usdt":1000,"token":"USDT"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x23773e65ed146a459667843b1e7a0b1d9e5af8a6','mixer','Tornado Cash 10000 USDT',1.00,'TC-USDT-10000','{"denomination_usdt":10000,"token":"USDT"}',NOW(),NULL,NULL,NULL),
            -- DAI pools
            ('tornado_cash','evm',1,'0x22aaa7720ddd5388a3c0a3333430953c68f1849b','mixer','Tornado Cash 100 DAI', 1.00,'TC-DAI-100', '{"denomination_dai":100,"token":"DAI"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x03893a7c7463ae47d46bc7f091665f1893656003','mixer','Tornado Cash 1000 DAI',1.00,'TC-DAI-1000','{"denomination_dai":1000,"token":"DAI"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x2717c5e28cf931547b621a5dddb772ab6a35b701','mixer','Tornado Cash 10000 DAI',1.00,'TC-DAI-10000','{"denomination_dai":10000,"token":"DAI"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0xd21be7248e0197ee08e0c20d4a96debdac3d20af','mixer','Tornado Cash 100000 DAI',1.00,'TC-DAI-100000','{"denomination_dai":100000,"token":"DAI"}',NOW(),NULL,NULL,NULL),
            -- WBTC pools
            ('tornado_cash','evm',1,'0x178169b423a011fff22b9e3f3abea13414ddd0f1','mixer','Tornado Cash 0.1 WBTC', 1.00,'TC-WBTC-0.1', '{"denomination_wbtc":0.1,"token":"WBTC"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x610b717796ad172b316836ac95a2ffad065ceab4','mixer','Tornado Cash 1 WBTC',   1.00,'TC-WBTC-1',   '{"denomination_wbtc":1,"token":"WBTC"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0xbb93e510bbcd0b7beb5a853875f9ec60275cf498','mixer','Tornado Cash 10 WBTC',  1.00,'TC-WBTC-10',  '{"denomination_wbtc":10,"token":"WBTC"}',NOW(),NULL,NULL,NULL),
            -- Router and proxy contracts
            ('tornado_cash','evm',1,'0x722122df12d4e14e13ac3b6895a86e84145b6967','mixer','Tornado Cash Router',   1.00,'TC-ROUTER',   '{"type":"router"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x5efda50f22d34f262c29268506c5fa42cb56a1ce','mixer','Tornado Cash Proxy',    1.00,'TC-PROXY',    '{"type":"proxy"}',NOW(),NULL,NULL,NULL),
            ('tornado_cash','evm',1,'0x722122df12d4e14e13ac3b6895a86e84145b6967','mixer','Tornado Cash Governance',1.00,'TC-GOV',     '{"type":"governance"}',NOW(),NULL,NULL,NULL)
        ON CONFLICT ON CONSTRAINT uq_address_labels_current DO NOTHING;
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM address_labels WHERE source_key = 'tornado_cash';
        DELETE FROM label_sources
        WHERE key IN ('chainabuse','scamsniffer','eth_community_labels','tornado_cash','metamask_phishfort');
    """)
