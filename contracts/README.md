# Chain Intel contracts

`AuditAnchor.sol` stores the head hash of Chain Intel's keccak-256 audit chain per tenant (only a 32-byte hash and an entry count; no case data).
Only allowed writer wallets can anchor; the count must always grow, so a shorter or edited log can't be re-anchored.

    npm install
    npm test                     # 8 tests (Hardhat + chai)
    # offline / no compiler download: SOLCJS=1 npm test

Deploy to Sepolia:

    export SEPOLIA_RPC_URL=https://...   DEPLOYER_PRIVATE_KEY=0x...   WRITERS=0xYourBankWallet
    npm run deploy:sepolia

Then set `VITE_ANCHOR_ADDRESS` in the frontend `.env.local`.
