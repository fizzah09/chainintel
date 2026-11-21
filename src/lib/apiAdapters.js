/**
 * Converts backend API response shapes to the frontend mock-store shapes
 * that existing page components already know how to render.
 *
 * All mappers are pure functions — no side effects.
 */

// ---- Transfers ---------------------------------------------------------------

/** Backend Transfer → frontend tx row expected by TransactionsTab, OverviewTab, etc. */
export function mapTransfer(transfer, walletAddress) {
  const addr = walletAddress?.toLowerCase() ?? '';
  const isInbound = transfer.to_address?.toLowerCase() === addr;
  const decimals = transfer.token_decimals ?? 18;
  const raw = Number(transfer.value ?? 0);
  const amt = raw / 10 ** decimals;

  return {
    hash: transfer.hash,
    time: transfer.block_time ?? transfer.created_at,
    from: transfer.from_address,
    to: transfer.to_address,
    cp: isInbound ? transfer.from_address : transfer.to_address,
    dir: isInbound ? 'in' : 'out',
    amt,
    sym: transfer.token_symbol ?? 'ETH',
    risk: null,  // per-tx risk not yet stored; callers fall back to tier colour
    status: 'Confirmed',
  };
}

/** Backend transfers list response → array of frontend tx rows. */
export function mapTransfers(response, walletAddress) {
  return (response?.items ?? []).map((t) => mapTransfer(t, walletAddress));
}

// ---- Counterparties ----------------------------------------------------------

/** Derive counterparty summary rows from a list of mapped transfers. */
export function deriveCps(txRows) {
  const byAddr = {};
  for (const t of txRows) {
    const a = (t.cp ?? '').toLowerCase();
    if (!a) continue;
    if (!byAddr[a]) byAddr[a] = { a: t.cp, label: 'Unknown', dir: t.dir, vol: 0, risk: 0, count: 0 };
    byAddr[a].vol += t.amt ?? 0;
    byAddr[a].count++;
    if (t.risk != null && t.risk > byAddr[a].risk) byAddr[a].risk = t.risk;
  }
  return Object.values(byAddr).sort((x, y) => y.vol - x.vol);
}

// ---- Risk assessment ---------------------------------------------------------

const TIER_NAMES = { crit: 'Critical', high: 'High', mod: 'Moderate', low: 'Low' };

/**
 * Map a backend assessment row to the shape useRiskReport returns.
 * The backend engine writes the same fields the frontend engine writes (it's a port),
 * so mostly we just unwrap the JSONB `report` field and add a couple of top-level props.
 */
export function mapAssessment(assessment) {
  if (!assessment?.report) return null;
  const r = assessment.report;
  return {
    ...r,
    mode: 'live',
    asOf: assessment.created_at,
    score: assessment.score ?? r.score,
    tier: assessment.tier ?? r.tier,
    tierName: r.tierName ?? TIER_NAMES[assessment.tier] ?? 'Unknown',
  };
}

// ---- Cases -------------------------------------------------------------------

/** Backend Case row → frontend mock-store shape (fields CaseList / CaseHead use). */
export function mapCase(c) {
  return {
    id: c.case_ref ?? c.id,
    _apiId: c.id,            // UUID for API calls
    title: c.title,
    status: c.status,
    priority: c.priority,
    assignee: c.assignee_name ?? c.assigned_to ?? null,
    opened: c.created_at,
    due: c.due_date ?? null,
    tags: c.tags ?? [],
    subjects: (c.subjects ?? []).map((s) => ({
      id: s.id,
      kind: s.kind ?? s.subject_type,
      ref: s.ref ?? s.subject_ref,
      role: s.role,
      label: s.label ?? null,
      riskScore: s.risk_score ?? null,
    })),
    evidence: c.evidence ?? [],
    notes: c.notes ?? [],
    tasks: c.tasks ?? [],
    messages: c.messages ?? [],
  };
}

/** Map a backend cases list (array or {items}) → frontend case array. */
export function mapCases(response) {
  const items = Array.isArray(response) ? response : (response?.items ?? []);
  return items.map(mapCase);
}

// ---- Alerts ------------------------------------------------------------------

/** Backend Alert row → frontend mock-store shape (fields AlertsDashboard uses). */
export function mapAlert(a) {
  return {
    id: a.id,
    _apiId: a.id,
    wallet: a.wallet ?? a.subject_address ?? '',
    trigger: a.trigger,
    score: a.score ?? 0,
    tier: a.tier ?? null,
    from: a.prev_score ?? 0,
    at: a.at ?? a.created_at,
    status: mapAlertStatus(a.status),
    details: a.details ?? {},
  };
}

/** Normalise backend status ('New' | 'Reviewed' | 'Resolved') → frontend status. */
function mapAlertStatus(s) {
  if (s === 'New') return 'Unacknowledged';
  if (s === 'Reviewed') return 'Acknowledged';
  if (s === 'Resolved') return 'Resolved';
  return s;
}

/** Map a backend alerts list → frontend alert array. */
export function mapAlerts(response) {
  const items = Array.isArray(response) ? response : (response?.items ?? []);
  return items.map(mapAlert);
}

// ---- Watchlists --------------------------------------------------------------

export function mapWatchlist(w) {
  return {
    id: w.id,
    name: w.name,
    scope: w.scope ?? 'Manual',
    rule: w.rule ?? null,
    wallets: (w.entries ?? []).map((e) => ({ a: e.subject_address ?? e.address, addedAt: e.created_at })),
  };
}

export function mapWatchlists(response) {
  const items = Array.isArray(response) ? response : (response?.items ?? []);
  return items.map(mapWatchlist);
}

// ---- Risk timeline -----------------------------------------------------------

/** Backend risk-timeline point list → array of scores (HistoryTab, OverviewTab). */
export function mapTimeline(response) {
  const items = Array.isArray(response) ? response : (response?.items ?? response ?? []);
  return items.map((p) => p.score ?? p.value ?? 0);
}
