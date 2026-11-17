import { useEffect, useMemo, useState } from 'react';
import { assessSimulated, assessWallet, liveAvailable } from '../../engine';
import { walletProfile } from '../../lib/risk';
import { useStore } from '../../mocks/store';

const cache = new Map();

/**
 * Full engine report for a wallet (logical score, exposure, behaviour, model, forecast, confidence).
 * Live data when a history provider key is set; otherwise the simulated history at the monitoring clock.
 */
export function useRiskReport(address) {
  const s = useStore();
  const asOf = s.monitor.clock;
  const version = s.cfg.version;
  const key = `${address?.toLowerCase()}|${asOf}|${version}`;
  const sim = useMemo(() => {
    if (!address || liveAvailable()) return null;
    if (!cache.has(key)) cache.set(key, assessSimulated(address, walletProfile(address).hints, asOf));
    return cache.get(key);
  }, [address, asOf, key]);
  const [live, setLive] = useState({ status: 'idle', report: null, error: null });
  useEffect(() => {
    if (!address || !liveAvailable()) return undefined;
    let on = true;
    setLive({ status: 'loading', report: null, error: null });
    assessWallet(address, { hints: walletProfile(address).hints })
      .then((report) => on && setLive({ status: 'ok', report, error: null }))
      .catch((e) => on && setLive({ status: 'error', report: assessSimulated(address, walletProfile(address).hints, asOf), error: e.message }));
    return () => { on = false; };
  }, [address, asOf, version]);
  if (sim) return { status: 'ok', report: sim, error: null };
  return live;
}
