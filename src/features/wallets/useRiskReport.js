import { useEffect, useMemo, useState } from 'react';
import { assessSimulated, assessWallet, liveAvailable } from '../../engine';
import { mapAssessment } from '../../lib/apiAdapters';
import * as api from '../../lib/api';
import { walletProfile } from '../../lib/risk';
import { useStore } from '../../mocks/store';

const cache = new Map();

/**
 * Full engine report for a wallet.
 * Priority order:
 *   1. Latest backend assessment (if backend reachable)
 *   2. Live Etherscan/Alchemy engine (if key set)
 *   3. Simulated engine (always works)
 */
export function useRiskReport(address) {
  const s = useStore();
  const asOf = s.monitor.clock;
  const version = s.cfg.version;
  const session = s.session;
  const key = `${address?.toLowerCase()}|${asOf}|${version}`;

  const sim = useMemo(() => {
    if (!address) return null;
    if (!cache.has(key)) cache.set(key, assessSimulated(address, walletProfile(address).hints, asOf));
    return cache.get(key);
  }, [address, asOf, key]);

  const [state, setState] = useState({ status: 'idle', report: null, error: null });

  useEffect(() => {
    if (!address) return;
    let alive = true;
    setState({ status: 'loading', report: null, error: null });

    api.assessments.list(1, address, { limit: 1 }, session)
      .then((list) => {
        if (!alive) return;
        const mapped = list?.[0] ? mapAssessment(list[0]) : null;
        if (mapped) {
          setState({ status: 'ok', report: mapped, error: null });
          return;
        }
        // Backend reachable but no assessment yet
        if (liveAvailable()) {
          return assessWallet(address, { hints: walletProfile(address).hints })
            .then((r) => alive && setState({ status: 'ok', report: r, error: null }))
            .catch((e) => alive && setState({ status: 'ok', report: sim, error: e.message }));
        }
        setState({ status: 'ok', report: sim, error: null });
      })
      .catch(() => {
        if (!alive) return;
        // Backend unreachable — fall through to live or simulated
        if (liveAvailable()) {
          assessWallet(address, { hints: walletProfile(address).hints })
            .then((r) => alive && setState({ status: 'ok', report: r, error: null }))
            .catch((e) => alive && setState({ status: 'ok', report: sim, error: e.message }));
        } else {
          setState({ status: 'ok', report: sim, error: null });
        }
      });

    return () => { alive = false; };
  }, [address, asOf, version, session?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
