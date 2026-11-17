import { useEffect, useState } from 'react';

/** Runs an async loader and tracks loading / ok / error. `key` re-runs it. */
export function useAsync(fn, key, enabled = true) {
  const [st, setSt] = useState({ status: enabled ? 'loading' : 'off', data: null, error: null });
  useEffect(() => {
    if (!enabled) { setSt({ status: 'off', data: null, error: null }); return; }
    let live = true; setSt((x) => ({ ...x, status: 'loading', error: null }));
    fn().then((data) => live && setSt({ status: 'ok', data, error: null })).catch((e) => live && setSt({ status: 'error', data: null, error: e?.shortMessage || e?.message || 'Request failed' }));
    return () => { live = false; };
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  return st;
}
