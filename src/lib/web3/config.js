import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// RPC endpoints come from env; the public fallbacks are rate-limited and fine for a demo only.
export const RPC = {
  mainnet: import.meta.env.VITE_MAINNET_RPC || 'https://ethereum-rpc.publicnode.com',
  sepolia: import.meta.env.VITE_SEPOLIA_RPC || 'https://ethereum-sepolia-rpc.publicnode.com',
};
export const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID || '';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ shimDisconnect: true }),
    ...(WC_PROJECT_ID ? [walletConnect({ projectId: WC_PROJECT_ID, showQrModal: true, metadata: { name: 'Chain Intel', description: 'Wallet monitoring for regulated banks', url: 'https://chainintel.local', icons: [] } })] : []),
  ],
  transports: { [mainnet.id]: http(RPC.mainnet), [sepolia.id]: http(RPC.sepolia) },
  
});
