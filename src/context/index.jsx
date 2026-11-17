import { ToastProvider, useToast } from './ToastContext';
import { useStore, act } from '../mocks/store';

/** Current signed-in user, or null. Session data lives in the mock store (mocks/store.js). */
export function useSession() {
  const s = useStore();
  const user = s.session.authed ? { ...s.session } : null;
  return { user, pendingMfa: s.session.mfa ? s.session : null, actions: act };
}

export function AppProviders({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}

export { useToast };
