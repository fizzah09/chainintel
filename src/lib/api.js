/**
 * Chain Intel API client — talks to the FastAPI backend at /api/v1.
 *
 * In development the backend accepts X-Dev-User / X-Dev-Roles / X-Dev-Tenant headers
 * instead of a real auth token; we derive them from the signed-in mock session so the
 * UI and the backend see the same identity.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/** Map frontend role names to backend role strings the security module understands. */
const ROLE_MAP = {
  analyst: 'analyst',
  investigator: 'investigator',
  reviewer: 'reviewer',
  compliance_manager: 'compliance_manager',
  bank_admin: 'bank_admin',
  super_admin: 'super_admin',
  platform_admin: 'platform_admin',
  developer: 'developer',
  pa: 'platform_admin',
  sa: 'super_admin',
  ba: 'bank_admin',
  cm: 'compliance_manager',
  inv: 'investigator',
  rev: 'reviewer',
};

function devHeaders(session) {
  if (!session?.authed) return {};
  return {
    'X-Dev-User': session.email || session.name || 'dev-user',
    'X-Dev-Roles': ROLE_MAP[session.role] || session.role || 'developer',
    'X-Dev-Tenant': 'dev-tenant',
  };
}

async function request(method, path, { body, params, session } = {}) {
  const url = new URL(BASE + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
  }
  const headers = {
    'Content-Type': 'application/json',
    ...devHeaders(session),
  };
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url.toString(), opts);
  if (!res.ok) {
    let detail = `${method} ${path} → ${res.status}`;
    try { const j = await res.json(); detail = j.detail || JSON.stringify(j); } catch {}
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

const get = (path, opts) => request('GET', path, opts);
const post = (path, body, opts) => request('POST', path, { ...opts, body });
const patch = (path, body, opts) => request('PATCH', path, { ...opts, body });
const del = (path, opts) => request('DELETE', path, opts);

// ---- Health ------------------------------------------------------------------

export const health = {
  ready: (session) => get('/health/ready', { session }),
};

// ---- M3 data -----------------------------------------------------------------

export const chains = {
  list: (session) => get('/api/v1/chains', { session }),
};

export const transfers = {
  list: (chainId, address, params, session) =>
    get(`/api/v1/chains/${chainId}/addresses/${address}/transfers`, { params, session }),
  sync: (chainId, address, session) =>
    post(`/api/v1/chains/${chainId}/addresses/${address}/sync`, {}, { session }),
};

export const labels = {
  list: (chainId, address, params, session) =>
    get(`/api/v1/chains/${chainId}/labels`, { params: { address, ...params }, session }),
  sources: (session) => get('/api/v1/label-sources', { session }),
  imports: (params, session) => get('/api/v1/label-imports', { params, session }),
};

// ---- M4 risk -----------------------------------------------------------------

export const assessments = {
  create: (chainId, address, body, session) =>
    post(`/api/v1/chains/${chainId}/addresses/${address}/assessments`, body, { session }),
  list: (chainId, address, params, session) =>
    get(`/api/v1/chains/${chainId}/addresses/${address}/assessments`, { params, session }),
  get: (id, session) => get(`/api/v1/assessments/${id}`, { session }),
  reproduce: (id, session) => post(`/api/v1/assessments/${id}/reproduce`, {}, { session }),
  verifyChain: (session) => get('/api/v1/assessments/verify-chain', { session }),
};

export const walletStats = {
  get: (chainId, address, session) =>
    get(`/api/v1/chains/${chainId}/addresses/${address}/stats`, { session }),
  timeline: (chainId, address, params, session) =>
    get(`/api/v1/chains/${chainId}/addresses/${address}/risk-timeline`, { params, session }),
};

export const portfolio = {
  stats: (session) => get('/api/v1/analytics/portfolio', { session }),
};

export const entity = {
  get: (address, params, session) =>
    get('/api/v1/entity', { params: { address, ...params }, session }),
};

export const features = {
  build: (chainId, address, session) =>
    post(`/api/v1/chains/${chainId}/addresses/${address}/features`, {}, { session }),
  latest: (chainId, address, session) =>
    get(`/api/v1/chains/${chainId}/addresses/${address}/features/latest`, { session }),
};

export const rulesets = {
  list: (session) => get('/api/v1/rulesets', { session }),
};

export const models = {
  list: (session) => get('/api/v1/models', { session }),
  get: (id, session) => get(`/api/v1/models/${id}`, { session }),
  decide: (id, action, body, session) =>
    post(`/api/v1/models/${id}/${action}`, body, { session }),
  drift: (params, session) => get('/api/v1/models/drift', { params, session }),
};

export const backtests = {
  list: (session) => get('/api/v1/backtests', { session }),
  create: (body, session) => post('/api/v1/backtests', body, { session }),
  get: (id, session) => get(`/api/v1/backtests/${id}`, { session }),
};

export const reviewedCases = {
  list: (session) => get('/api/v1/reviewed-cases', { session }),
  add: (cases, session) => post('/api/v1/reviewed-cases', cases, { session }),
};

// ---- M5 tracing --------------------------------------------------------------

export const trace = {
  run: (chainId, address, body, session) =>
    post(`/api/v1/chains/${chainId}/addresses/${address}/trace`, body, { session }),
  list: (chainId, address, session) =>
    get(`/api/v1/chains/${chainId}/addresses/${address}/traces`, { session }),
  get: (traceId, session) => get(`/api/v1/traces/${traceId}`, { session }),
};

// ---- M6 cases ----------------------------------------------------------------

export const cases = {
  create: (body, session) => post('/api/v1/cases', body, { session }),
  list: (params, session) => get('/api/v1/cases', { params, session }),
  get: (id, session) => get(`/api/v1/cases/${id}`, { session }),
  update: (id, body, session) => patch(`/api/v1/cases/${id}`, body, { session }),
  setStatus: (id, body, session) => post(`/api/v1/cases/${id}/status`, body, { session }),
  addSubject: (id, body, session) => post(`/api/v1/cases/${id}/subjects`, body, { session }),
  addEvidence: (id, body, session) => post(`/api/v1/cases/${id}/evidence`, body, { session }),
  deleteEvidence: (caseId, evidenceId, session) => del(`/api/v1/cases/${caseId}/evidence/${evidenceId}`, { session }),
  addNote: (id, body, session) => post(`/api/v1/cases/${id}/notes`, body, { session }),
  addTask: (id, body, session) => post(`/api/v1/cases/${id}/tasks`, body, { session }),
  updateTask: (caseId, taskId, body, session) => patch(`/api/v1/cases/${caseId}/tasks/${taskId}`, body, { session }),
  sendMessage: (id, body, session) => post(`/api/v1/cases/${id}/messages`, body, { session }),
};

// ---- M7 monitoring -----------------------------------------------------------

export const watchlists = {
  create: (body, session) => post('/api/v1/watchlists', body, { session }),
  list: (session) => get('/api/v1/watchlists', { session }),
  get: (id, session) => get(`/api/v1/watchlists/${id}`, { session }),
  delete: (id, session) => del(`/api/v1/watchlists/${id}`, { session }),
  addEntry: (id, body, session) => post(`/api/v1/watchlists/${id}/entries`, body, { session }),
  removeEntry: (watchlistId, entryId, session) =>
    del(`/api/v1/watchlists/${watchlistId}/entries/${entryId}`, { session }),
};

export const alerts = {
  list: (params, session) => get('/api/v1/alerts', { params, session }),
  get: (id, session) => get(`/api/v1/alerts/${id}`, { session }),
  resolve: (id, body, session) => post(`/api/v1/alerts/${id}/resolve`, body, { session }),
  create: (body, session) => post('/api/v1/alerts', body, { session }),
};

export default {
  health, chains, transfers, labels, assessments, walletStats, portfolio,
  entity, features, rulesets, models, backtests, reviewedCases,
  trace, cases, watchlists, alerts,
};
