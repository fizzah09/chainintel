import { useEffect, useState } from 'react';
import { assessWallet, liveAvailable } from '../../engine';
import { mapAssessment } from '../../lib/apiAdapters';
import * as api from '../../lib/api';
import { walletProfile } from '../../lib/risk';
import { useStore } from '../../mocks/store';

/**
 * Risk report for a wallet. Only real data is used:
 *   1. Latest backend assessment.
 *   2. Live engine on the user's own provider key, if one is set.
 * With neither, the status is 'empty' (no score is invented).
 */
export function useRiskReport(address) {
  const s = useStore();
  const session = s.session;
  const [state, setState] = useState({ status: 'idle', report: null, error: null });

  useEffect(() => {
    if (!address) return;
    let alive = true;
    setState({ status: 'loading', report: null, error: null });

    const live = () => (liveAvailable()
      ? assessWallet(address, { hints: walletProfile(address).hints })
        .then((r) => alive && setState({ status: 'ok', report: r, error: null }))
        .catch((e) => alive && setState({ status: 'error', report: null, error: e.message }))
      : alive && setState({ status: 'empty', report: null, error: null }));

    api.assessments.list(1, address, { limit: 1 }, session)
      .then((list) => {
        if (!alive) return;
        const mapped = list?.[0] ? mapAssessment(list[0]) : null;
        if (mapped) setState({ status: 'ok', report: mapped, error: null });
        else live();
      })
      .catch((e) => {
        if (!alive) return;
        if (liveAvailable()) live();
        else setState({ status: 'error', report: null, error: e.message });
      });

    return () => { alive = false; };
  }, [address, s.cfg.version, session?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
