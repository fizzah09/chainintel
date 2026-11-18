/**
 * React hooks that call the real Chain Intel API.
 * Each hook accepts the signed-in session (from useStore) for dev-mode auth headers.
 *
 * Pattern: returns { data, loading, error, refetch }.
 * On network failure, `error` is set and `data` is null — callers decide whether
 * to fall back to mock data or show an error state.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api';

/** Default chain id — Ethereum mainnet. */
export const DEFAULT_CHAIN = 1;

function useApiCall(fn, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
    } catch (e) {
      setError(e.message || 'API error');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run };
}

// ---- Wallet ------------------------------------------------------------------

/** Latest risk assessment for a wallet. Returns null if none exists yet. */
export function useLatestAssessment(address, chainId = DEFAULT_CHAIN, session) {
  return useApiCall(
    async () => {
      if (!address) return null;
      const list = await api.assessments.list(chainId, address, { limit: 1 }, session);
      return list?.[0] ?? null;
    },
    [address, chainId, session?.email],
  );
}

/** Score a wallet (triggers a fresh assessment). */
export function useAssessWallet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const assess = useCallback(async (address, chainId = DEFAULT_CHAIN, session, opts = {}) => {
    setLoading(true); setError(null);
    try {
      return await api.assessments.create(chainId, address, { refresh: true, ...opts }, session);
    } catch (e) {
      setError(e.message); return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return { assess, loading, error };
}

/** Stored transfers for a wallet. */
export function useTransfers(address, chainId = DEFAULT_CHAIN, params, session) {
  return useApiCall(
    async () => {
      if (!address) return { items: [], total: 0, stale: false };
      return api.transfers.list(chainId, address, params, session);
    },
    [address, chainId, JSON.stringify(params), session?.email],
  );
}

/** Risk score timeline (history) for a wallet. */
export function useRiskTimeline(address, chainId = DEFAULT_CHAIN, limit = 30, session) {
  return useApiCall(
    async () => {
      if (!address) return [];
      return api.walletStats.timeline(chainId, address, { limit }, session);
    },
    [address, chainId, limit, session?.email],
  );
}

/** Wallet stats (R6/R7) — includes not_applicable flag. */
export function useWalletStats(address, chainId = DEFAULT_CHAIN, session) {
  return useApiCall(
    async () => {
      if (!address) return null;
      return api.walletStats.get(chainId, address, session);
    },
    [address, chainId, session?.email],
  );
}

/** Entity classification for an address. */
export function useEntity(address, session) {
  return useApiCall(
    async () => {
      if (!address) return null;
      return api.entity.get(address, {}, session);
    },
    [address, session?.email],
  );
}

/** Portfolio stats across the whole tenant. */
export function usePortfolioStats(session) {
  return useApiCall(() => api.portfolio.stats(session), [session?.email]);
}

// ---- Tracing -----------------------------------------------------------------

/** Run a fund flow trace. Returns a function + state. */
export function useTrace() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTrace = useCallback(async (address, chainId = DEFAULT_CHAIN, params, session) => {
    setLoading(true); setError(null);
    try {
      const r = await api.trace.run(chainId, address, params, session);
      setResult(r);
      return r;
    } catch (e) {
      setError(e.message); return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, runTrace, setResult };
}

/** Past traces for a wallet. */
export function useTraceHistory(address, chainId = DEFAULT_CHAIN, session) {
  return useApiCall(
    async () => {
      if (!address) return [];
      return api.trace.list(chainId, address, session);
    },
    [address, chainId, session?.email],
  );
}

// ---- Cases -------------------------------------------------------------------

export function useCases(params, session) {
  return useApiCall(() => api.cases.list(params, session), [JSON.stringify(params), session?.email]);
}

export function useCase(id, session) {
  return useApiCall(
    async () => { if (!id) return null; return api.cases.get(id, session); },
    [id, session?.email],
  );
}

export function useCaseMutations(session) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wrap = (fn) => async (...args) => {
    setLoading(true); setError(null);
    try { return await fn(...args); }
    catch (e) { setError(e.message); return null; }
    finally { setLoading(false); }
  };

  return {
    loading, error,
    createCase: wrap((body) => api.cases.create(body, session)),
    updateCase: wrap((id, body) => api.cases.update(id, body, session)),
    setStatus: wrap((id, body) => api.cases.setStatus(id, body, session)),
    addSubject: wrap((id, body) => api.cases.addSubject(id, body, session)),
    addEvidence: wrap((id, body) => api.cases.addEvidence(id, body, session)),
    addNote: wrap((id, body) => api.cases.addNote(id, body, session)),
    addTask: wrap((id, body) => api.cases.addTask(id, body, session)),
    sendMessage: wrap((id, body) => api.cases.sendMessage(id, body, session)),
  };
}

// ---- Watchlists & alerts -----------------------------------------------------

export function useWatchlists(session) {
  return useApiCall(() => api.watchlists.list(session), [session?.email]);
}

export function useWatchlist(id, session) {
  return useApiCall(
    async () => { if (!id) return null; return api.watchlists.get(id, session); },
    [id, session?.email],
  );
}

export function useAlerts(params, session) {
  return useApiCall(() => api.alerts.list(params, session), [JSON.stringify(params), session?.email]);
}

// ---- Rule sets & models ------------------------------------------------------

export function useRulesets(session) {
  return useApiCall(() => api.rulesets.list(session), [session?.email]);
}

export function useModels(session) {
  return useApiCall(() => api.models.list(session), [session?.email]);
}

// ---- Backend availability ----------------------------------------------------

/** Returns true when the backend is reachable. Checked once on mount. */
export function useBackendAvailable(session) {
  const [available, setAvailable] = useState(null); // null = checking
  useEffect(() => {
    api.health.ready(session)
      .then(() => setAvailable(true))
      .catch(() => setAvailable(false));
  }, [session?.email]); // eslint-disable-line react-hooks/exhaustive-deps
  return available;
}
