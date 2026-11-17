import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// wagmi/connectors bundles optional connectors whose peer packages are not installed; stub them out.
const OPTIONAL = ['@x402/evm', '@x402/evm/upto/client', '@x402/evm/exact/client', '@x402/core/client', '@x402/svm/exact/client', '@x402/svm', '@x402/core'];
const empty = fileURLToPath(new URL('./src/lib/empty.js', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.js'] },
  resolve: { alias: OPTIONAL.map((m) => ({ find: new RegExp(`^${m.replace(/[/@]/g, '\\$&')}$`), replacement: empty })) },
});
