import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '../../lib/web3/config';
import { AppProviders as ContextProviders } from '../../context';

// wagmi is used only to read chain data and to sign the optional audit-anchor transaction.
// Sign-in is email + password + email OTP; there is no wallet login.
export default function AppProviders({ children }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } } }));
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        <ContextProviders>{children}</ContextProviders>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
