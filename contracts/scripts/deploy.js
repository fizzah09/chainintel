// Deploys AuditAnchor and optionally authorises extra writer wallets (comma-separated WRITERS env).
const { ethers, network } = require('hardhat');

async function main() {
  const c = await ethers.deployContract('AuditAnchor');
  await c.waitForDeployment();
  const address = await c.getAddress();
  console.log(`AuditAnchor deployed to ${address} on ${network.name}`);
  for (const w of (process.env.WRITERS || '').split(',').map((x) => x.trim()).filter(Boolean)) {
    await (await c.setWriter(w, true)).wait();
    console.log(`Writer allowed: ${w}`);
  }
  console.log(`\nSet VITE_ANCHOR_ADDRESS=${address} in the frontend .env.local`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
