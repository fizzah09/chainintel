import { createContext, useCallback, useContext, useState } from 'react';
import { Icon } from '../components/ui/Icon';

// toast
export const ToastCtx = createContext(() => {});

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((msg, kind = 'ok') => { const id = Math.random(); setList((l) => [...l, { id, msg, kind }]); setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4200); }, []);
  return <ToastCtx.Provider value={push}>{children}<div className="toasts" role="status" aria-live="polite">{list.map((t) => <div key={t.id} className={`toast ${t.kind}`}><Icon n={t.kind === 'bad' ? 'alert' : 'check'} />{t.msg}</div>)}</div></ToastCtx.Provider>;
}
