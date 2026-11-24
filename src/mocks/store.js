import { useSyncExternalStore } from 'react';
import { seed, ACCOUNTS, chainLog, ROLE_NAMES } from './seed';
import { setCfg, setAsOf, quickScore, walletProfile } from '../lib/risk';
import { BASE_AS_OF } from '../engine';
import { isAddr, isEmail, kec, txh } from '../lib/format';

const KEY = 'chainintel-state-v2';
let state;
try { const raw = localStorage.getItem(KEY); state = raw ? JSON.parse(raw) : null; if (state && state.v !== 3) state = null; } catch { state = null; }
if (!state) state = seed();
if (!state.monitor) state.monitor = { clock: BASE_AS_OF, runs: [], snapshots: {} };
if (!state.complaints) { const fresh = seed(); state.complaints = fresh.complaints; state.counters = { ...state.counters, cmp: fresh.counters.cmp }; }
state.complaints = state.complaints.map((c) => { const f = seed().complaints.find((x) => x.id === c.id) || {}; return { ...f, ...c, caseId: c.caseId ?? f.caseId ?? '', thread: c.thread ?? [] }; });
setCfg(state.cfg);
setAsOf(state.monitor.clock);
const subs = new Set();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
export const getState = () => state;
export const useStore = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state);
function mutate(fn) { const d = structuredClone(state); const out = fn(d); state = d; persist(); subs.forEach((f) => f()); return out; }

const nowIso = () => new Date().toISOString();
const pad = (n, w) => String(n).padStart(w, '0');
const actor = (d) => d.session.name || 'System';
function log(d, action, object, caseId = null, result = 'Success') { d.audit.push(chainLog(d.audit, { id: 'A' + (d.audit.length + 1), at: nowIso(), actor: actor(d), role: d.session.role, action, object, caseId, ip: '10.20.4.18', result })); }
function notify(d, title, desc, kind = 'system', to = 'NotificationCenter') { d.notifications.unshift({ id: 'NT' + Date.now() + Math.random().toString(36).slice(2, 5), title, desc, at: nowIso(), kind, read: false, to }); }
export const verifyChain = (audit) => { let prev = 'GENESIS'; for (const e of audit) { if (e.prev !== prev || e.hash !== kec(prev + JSON.stringify([e.at, e.actor, e.action, e.object]))) return { ok: false, at: e.id }; prev = e.hash; } return { ok: true, n: audit.length }; };

export const STAGES = ['Open', 'Assigned', 'Evidence Collection', 'Analysis', 'Under Review', 'Decision', 'Closed'];
export const stageIdx = (c) => { const s = c.status === 'Escalated' || c.status === 'On Hold' || c.status === 'Reopened' ? c.prev || 'Open' : c.status; return Math.max(0, STAGES.indexOf(s)); };
const NEXT = { Open: 'Assigned', Assigned: 'Evidence Collection', 'Evidence Collection': 'Analysis', Analysis: 'Under Review' };
export const nextOf = (c) => NEXT[c.status];

export function can(s, perm) {
  const r = s.session.role;
  if (r === 'pa' || r === 'sa') return ['view_wallets', 'run_trace', 'view_audit', 'export_reports', 'manage_users'].includes(perm);
  return !!s.perms[perm]?.[r];
}

export const PRIORITY = { 'Something is not working': 'High', 'Wrong or missing data': 'Medium', 'Slow or unclear': 'Low', Other: 'Low' };
export const act = {
  // ---- Authentication: invite-only. No sign-up and no wallet sign-in; accounts exist only when an admin invites them.
  // Demo rules mirror docs/BACKEND-NOTES.md: generic errors, lockout after 5 failures for 15 minutes,
  // email OTP as the second factor (demo code 123456), OTP-based password reset.
  login(email, password) {
    const e = (email || '').trim().toLowerCase();
    if (!isEmail(e)) return { ok: false, field: 'email', error: 'Enter a valid work email.' };
    if (!password) return { ok: false, field: 'password', error: 'Enter your password.' };
    const lock = (state.auth?.locks || {})[e];
    if (lock && new Date(lock) > new Date()) return { ok: false, field: 'form', error: `Too many failed attempts. Try again after ${new Date(lock).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` };
    const a = ACCOUNTS.find((x) => x.email.toLowerCase() === e);
    const u = state.users.find((x) => x.email.toLowerCase() === e);
    const custom = (state.auth?.passwords || {})[e];
    const pwOk = custom ? password === custom : password.length >= 6;
    if (!a || (u && u.status !== 'Active') || !pwOk) {
      let locked = false;
      mutate((d) => {
        d.auth = d.auth || { fails: {}, locks: {}, passwords: {}, reset: {} };
        const n = (d.auth.fails[e] || 0) + 1; d.auth.fails[e] = n;
        log(d, 'Failed sign-in', e, null, 'Failed');
        if (n >= 5) { d.auth.locks[e] = new Date(Date.now() + 15 * 60 * 1000).toISOString(); d.auth.fails[e] = 0; locked = true; log(d, 'Account locked', e, null, 'Failed'); }
      });
      return { ok: false, field: 'form', error: locked ? 'Too many failed attempts. Your account is locked for 15 minutes.' : 'Invalid email or password.' };
    }
    mutate((d) => {
      d.auth = d.auth || { fails: {}, locks: {}, passwords: {}, reset: {} };
      d.auth.fails[e] = 0;
      d.session = { authed: false, mfa: true, role: a.role, name: a.name, email: a.email, otpTries: 0, otpSentAt: nowIso() };
      log(d, 'Sign-in (OTP sent)', a.email);
    });
    return { ok: true };
  },
  resendMfa() { mutate((d) => { d.session.otpTries = 0; d.session.otpSentAt = nowIso(); log(d, 'Sign-in OTP resent', d.session.email); }); },
  verifyMfa(code) {
    if (!state.session.mfa) return { ok: false, restart: true, error: 'Your sign-in expired. Sign in again.' };
    if (code !== '123456') {
      const tries = (state.session.otpTries || 0) + 1;
      if (tries >= 5) { mutate((d) => { log(d, 'Failed MFA (challenge ended)', d.session.email, null, 'Failed'); d.session = { authed: false, mfa: false, role: d.session.role, name: d.session.name }; }); return { ok: false, restart: true, error: 'Too many incorrect codes. Sign in again.' }; }
      mutate((d) => { d.session.otpTries = tries; log(d, 'Failed MFA', d.session.email, null, 'Failed'); });
      return { ok: false, error: `Incorrect or expired code. ${5 - tries} attempt${5 - tries === 1 ? '' : 's'} left.` };
    }
    mutate((d) => { d.session.authed = true; d.session.mfa = false; delete d.session.otpTries; delete d.session.otpSentAt; log(d, 'Signed in', d.session.email); });
    return { ok: true };
  },
  // Password reset, three steps: send OTP -> verify OTP (returns a short-lived reset token) -> set new password.
  requestPasswordReset(email) {
    const e = (email || '').trim().toLowerCase();
    if (!isEmail(e)) return { ok: false, error: 'Enter a valid work email.' };
    const a = ACCOUNTS.find((x) => x.email.toLowerCase() === e); const u = state.users.find((x) => x.email.toLowerCase() === e);
    mutate((d) => {
      d.auth = d.auth || { fails: {}, locks: {}, passwords: {}, reset: {} };
      // Same response whether or not the account exists; only real, active accounts get a code.
      if (a && (!u || u.status === 'Active')) { d.auth.reset[e] = { code: '123456', tries: 0, exp: Date.now() + 10 * 60 * 1000 }; log(d, 'Password reset OTP sent', e); }
    });
    return { ok: true };
  },
  verifyPasswordReset(email, code) {
    const e = (email || '').trim().toLowerCase(); const r = (state.auth?.reset || {})[e];
    if (!r || r.exp < Date.now()) return { ok: false, error: 'Incorrect or expired code.' };
    if (code !== r.code) {
      const tries = r.tries + 1;
      mutate((d) => { if (tries >= 5) delete d.auth.reset[e]; else d.auth.reset[e].tries = tries; log(d, 'Password reset OTP failed', e, null, 'Failed'); });
      return { ok: false, error: tries >= 5 ? 'Too many incorrect codes. Request a new code.' : 'Incorrect or expired code.', restart: tries >= 5 };
    }
    const token = kec(e + Date.now()).slice(2, 34);
    mutate((d) => { d.auth.reset[e] = { token, exp: Date.now() + 5 * 60 * 1000, verified: true }; log(d, 'Password reset OTP verified', e); });
    return { ok: true, resetToken: token };
  },
  resetPassword(email, token, password) {
    const e = (email || '').trim().toLowerCase(); const r = (state.auth?.reset || {})[e];
    if (!r || !r.verified || r.token !== token || r.exp < Date.now()) return { ok: false, error: 'This reset session expired. Start again.' };
    if (!password || password.length < 8) return { ok: false, error: 'Use at least 8 characters.' };
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return { ok: false, error: 'Use at least one letter and one number.' };
    mutate((d) => { d.auth.passwords[e] = password; delete d.auth.reset[e]; delete d.auth.locks[e]; d.auth.fails[e] = 0; log(d, 'Password reset completed', e); });
    return { ok: true };
  },
  recordAnchor(r) { mutate((d) => { d.anchors = [...(d.anchors || []), { ...r, at: nowIso(), by: actor(d) }]; log(d, `Anchored audit head (${r.count} entries) on Sepolia`, r.tx); }); },
  logout() { mutate((d) => { log(d, 'Signed out', 'Auth'); d.session = { authed: false, mfa: false, role: d.session.role, name: d.session.name }; }); },
  switchRole(role) { const a = ACCOUNTS.find((x) => x.role === role); mutate((d) => { d.session = { authed: true, mfa: false, role, name: a.name, email: a.email }; }); },
  reset() { state = seed(); state.monitor = { clock: BASE_AS_OF, runs: [], snapshots: {} }; setCfg(state.cfg); setAsOf(BASE_AS_OF); persist(); subs.forEach((f) => f()); },
  setCtx(p) { mutate((d) => { Object.assign(d.ctx, p); }); },
  openWallet(a) {
    if (!isAddr(a)) return { ok: false, error: 'Enter a valid Ethereum address (0x followed by 40 hex characters) or an ENS name.' };
    mutate((d) => { d.ctx.wallet = a.trim(); d.recent = [a.trim(), ...d.recent.filter((x) => x.toLowerCase() !== a.trim().toLowerCase())].slice(0, 12); log(d, 'Analysed wallet', a.trim()); });
    return { ok: true };
  },
  notifyRead(id) { mutate((d) => { const n = d.notifications.find((x) => x.id === id); if (n) n.read = true; }); },
  notifyAll() { mutate((d) => d.notifications.forEach((n) => (n.read = true))); },
  setWizard(p) { mutate((d) => { Object.assign(d.wizard, p); }); },
  resetWizard() { mutate((d) => { d.wizard = seed().wizard; }); },
  createCase() {
    return mutate((d) => {
      const w = d.wizard; const id = `CASE-2026-${pad(d.counters.case++, 5)}`;
      d.cases.unshift({ id, title: w.title, type: w.type, desc: w.desc, status: w.assignee ? 'Assigned' : 'Open', prev: null, priority: w.priority, assignee: w.assignee, team: w.team, opened: nowIso(), due: w.due ? new Date(w.due).toISOString() : '', createdBy: actor(d), reviewer: 'Nadia Hussain', source: w.source, decision: '', subjects: w.subjects.map((s, i) => ({ id: 's' + (i + 1), ...s })) });
      w.evidence.forEach((t) => d.evidence.push({ id: `EVD-${pad(d.counters.evd++, 6)}`, caseId: id, title: t, type: 'System artefact', source: 'Chain Intel', by: actor(d), date: nowIso(), status: 'Pending Verification', note: '', content: t + id, hash: kec(t + id) }));
      log(d, 'Created case', id, id);
      if (w.assignee) notify(d, 'Case assigned', `${id} · ${w.title} was assigned to ${w.assignee}.`, 'case', 'CaseDetails');
      d.ctx.caseId = id; d.wizard = seed().wizard; return id;
    });
  },
  caseUpdate(id, patch, action) { mutate((d) => { const c = d.cases.find((x) => x.id === id); Object.assign(c, patch); log(d, action, id, id); }); },
  advance(id) {
    const c = state.cases.find((x) => x.id === id);
    const ev = state.evidence.filter((e) => e.caseId === id), fn = state.findings.filter((e) => e.caseId === id);
    const nx = NEXT[c.status];
    if (!nx) return { ok: false, error: 'No further manual step from this status.' };
    if (nx === 'Assigned' && !c.assignee) return { ok: false, error: 'Assign an investigator before moving the case forward.' };
    if (nx === 'Analysis' && !ev.length) return { ok: false, error: 'Add at least one evidence item first.' };
    if (nx === 'Under Review') { if (!fn.length) return { ok: false, error: 'Add at least one finding before submitting for review.' }; if (!ev.length) return { ok: false, error: 'Add evidence before submitting for review.' }; }
    mutate((d) => { const x = d.cases.find((y) => y.id === id); x.status = nx; log(d, nx === 'Under Review' ? 'Submitted for review' : `Moved to ${nx}`, id, id); if (nx === 'Under Review') notify(d, 'Review requested', `${id} was submitted for review by ${actor(d)}.`, 'review', 'CaseReview'); });
    return { ok: true, status: nx };
  },
  assign(id, name) { mutate((d) => { const c = d.cases.find((x) => x.id === id); c.assignee = name; if (c.status === 'Open') c.status = 'Assigned'; log(d, `Assigned to ${name}`, id, id); notify(d, 'Case assigned', `${id} was assigned to ${name}.`, 'case', 'CaseDetails'); }); },
  escalate(id, to, reason) { mutate((d) => { const c = d.cases.find((x) => x.id === id); if (c.status !== 'Escalated') c.prev = c.status; c.status = 'Escalated'; log(d, `Escalated to ${to}: ${reason}`, id, id); notify(d, 'Case escalated', `${id} escalated to ${to}.`, 'case'); }); },
  hold(id) { mutate((d) => { const c = d.cases.find((x) => x.id === id); if (c.status === 'On Hold') { c.status = c.prev || 'Open'; log(d, 'Resumed from hold', id, id); } else { c.prev = c.status; c.status = 'On Hold'; log(d, 'Put on hold', id, id); } }); },
  resolveEscalation(id) { mutate((d) => { const c = d.cases.find((x) => x.id === id); c.status = c.prev || 'Analysis'; log(d, 'Escalation resolved', id, id); }); },
  close(id, decision, note) { mutate((d) => { const c = d.cases.find((x) => x.id === id); c.status = 'Closed'; c.decision = decision; c.closeNote = note; log(d, `Closed: ${decision}`, id, id); }); },
  reopen(id, reason) { mutate((d) => { const c = d.cases.find((x) => x.id === id); c.status = 'Open'; c.prev = null; c.decision = ''; log(d, `Reopened: ${reason}`, id, id); notify(d, 'Case reopened', `${id} was reopened.`, 'case'); }); },
  review(id, decision, comment) {
    mutate((d) => {
      const c = d.cases.find((x) => x.id === id);
      d.reviews.unshift({ id: 'R' + Date.now(), caseId: id, decision, by: actor(d), date: nowIso(), comment });
      if (decision === 'Approved') c.status = 'Decision'; else if (decision === 'Returned') c.status = 'Analysis'; else { c.prev = 'Under Review'; c.status = 'Escalated'; }
      log(d, `Review ${decision.toLowerCase()}`, id, id); notify(d, `Review ${decision.toLowerCase()}`, `${id}: ${comment || 'No comment'}`, 'review', 'CaseDetails');
    });
  },
  addSubject(id, kind, ref, role = 'Related') { mutate((d) => { const c = d.cases.find((x) => x.id === id); c.subjects.push({ id: 's' + (c.subjects.length + 1) + Date.now() % 1000, kind, ref, role }); log(d, 'Added subject', ref, id); }); },
  removeSubject(id, sid) { mutate((d) => { const c = d.cases.find((x) => x.id === id); c.subjects = c.subjects.filter((s) => s.id !== sid); log(d, 'Removed subject', sid, id); }); },
  addEvidence(e) { return mutate((d) => { const id = `EVD-${pad(d.counters.evd++, 6)}`; d.evidence.push({ id, status: 'Pending Verification', by: actor(d), date: nowIso(), note: '', source: 'Chain Intel', hash: kec(e.title + (e.content || '') + id), ...e, id }); log(d, 'Attached evidence', id, e.caseId); return id; }); },
  evidenceStatus(id, status) { mutate((d) => { const e = d.evidence.find((x) => x.id === id); e.status = status; log(d, `Evidence ${status.toLowerCase()}`, id, e.caseId); }); },
  addFinding(f) { mutate((d) => { const id = `FND-${pad(d.counters.fnd++, 4)}`; d.findings.push({ id, status: 'Pending Verification', evidence: [], ...f }); log(d, 'Added finding', id, f.caseId); }); },
  findingStatus(id, status) { mutate((d) => { const f = d.findings.find((x) => x.id === id); f.status = status; log(d, `Finding ${status.toLowerCase()}`, id, f.caseId); }); },
  addTask(t) { mutate((d) => { const id = `TSK-${pad(d.counters.tsk++, 4)}`; d.tasks.push({ id, status: 'In Progress', ...t }); log(d, 'Created task', id, t.caseId); }); },
  taskStatus(id, status) { mutate((d) => { const t = d.tasks.find((x) => x.id === id); t.status = status; log(d, `Task ${status.toLowerCase()}`, id, t.caseId); }); },
  addNote(caseId, text) { mutate((d) => { d.notes.unshift({ id: 'N' + Date.now(), caseId, by: actor(d), at: nowIso(), text }); log(d, 'Added note', caseId, caseId); }); },
  addComm(m) { mutate((d) => { d.comms.unshift({ id: 'M' + Date.now(), date: nowIso(), dir: 'Outbound', status: 'Sent', body: '', ...m }); log(d, 'Sent message', m.subject, m.caseId); }); },
  commStatus(id, status) { mutate((d) => { const m = d.comms.find((x) => x.id === id); m.status = status; }); },
  // watchlists & alerts
  createWatchlist(w) { return mutate((d) => { const id = 'WL-' + d.counters.wl++; d.watchlists.unshift({ id, owner: actor(d), updated: nowIso(), wallets: [], ...w, id }); log(d, 'Created watchlist', w.name); return id; }); },
  updateWatchlist(id, p) { mutate((d) => { Object.assign(d.watchlists.find((x) => x.id === id), p, { updated: nowIso() }); log(d, 'Updated watchlist', id); }); },
  raiseComplaint(v) {
    return mutate((d) => {
      const id = 'CMP-' + pad(d.counters.cmp++, 4);
      d.complaints.unshift({ id, by: actor(d), caseId: v.caseId || '', thread: [], subject: v.subject, problem: v.problem, where: v.where, details: v.details, shot: v.shot || '', priority: PRIORITY[v.problem] || 'Low', status: 'Open', handledBy: '', raisedAt: nowIso(), updated: nowIso(), reply: '' });
      log(d, 'Raised complaint', id);
      notify(d, 'Complaint raised', `${id}: ${v.subject}`, 'system', 'Complaints');
      return id;
    });
  },
  updateCaseTeam(id, { phase, assignees, due, note }) {
    mutate((d) => {
      const c = d.cases.find((x) => x.id === id);
      c.phase = phase;
      c.assignees = assignees;
      c.reviewDue = due || '';
      c.reviewNote = note || '';
      if (phase === 'Review') { c.status = 'Under Review'; c.reviewer = assignees[0]; }
      log(d, `Case ${phase.toLowerCase()}: ${assignees.join(', ')}`, id, id);
      notify(d, 'Case assigned', `${id}: ${phase.toLowerCase()} assigned to ${assignees.join(', ')}.`, 'case', 'CaseDetails');
    });
  },
  postComplaintMessage(id, text) {
    mutate((d) => {
      const c = d.complaints.find((x) => x.id === id);
      c.thread = [...(c.thread || []), { by: actor(d), role: d.session.role, at: nowIso(), text }];
      c.updated = nowIso();
      log(d, 'Posted complaint message', id);
      notify(d, 'Complaint message', `${id}: new message from ${actor(d)}.`, 'system', ['pa', 'sa'].includes(d.session.role) ? 'RaiseComplaint' : 'Complaints');
    });
  },
  assignComplaint(id, name) {
    mutate((d) => {
      const c = d.complaints.find((x) => x.id === id);
      c.handledBy = name; c.updated = nowIso();
      log(d, `Complaint assigned to ${name || 'nobody'}`, id);
    });
  },
  setComplaintStatus(id, status) {
    mutate((d) => {
      const c = d.complaints.find((x) => x.id === id);
      c.status = status; c.updated = nowIso();
      log(d, `Complaint ${status.toLowerCase()}`, id);
    });
  },
  answerComplaint(id, status, reply) {
    mutate((d) => {
      const c = d.complaints.find((x) => x.id === id);
      Object.assign(c, { status, reply, handledBy: actor(d), updated: nowIso() });
      c.thread = [...(c.thread || []), { by: actor(d), role: d.session.role, at: nowIso(), text: reply }];
      log(d, `Complaint ${status.toLowerCase()}`, id);
      notify(d, 'Complaint answered', `${id} is now ${status.toLowerCase()}.`, 'system', 'RaiseComplaint');
    });
  },
  deleteWatchlist(id) { mutate((d) => { d.watchlists = d.watchlists.filter((x) => x.id !== id); log(d, 'Deleted watchlist', id); }); },
  addToWatchlist(id, a) {
    if (!isAddr(a)) return { ok: false, error: 'Enter a valid Ethereum address.' };
    const w = state.watchlists.find((x) => x.id === id);
    if (w.wallets.some((x) => x.a.toLowerCase() === a.toLowerCase())) return { ok: false, error: 'This wallet is already on the watchlist.' };
    if (w.wallets.length >= 3) return { ok: false, error: 'A watchlist holds up to 3 addresses.' };
    const sc = quickScore(a);
    mutate((d) => {
      const wl = d.watchlists.find((x) => x.id === id); wl.wallets.push({ a, added: nowIso(), by: actor(d) }); wl.updated = nowIso(); log(d, 'Added wallet to watchlist', a);
      if (wl.rule === 'any' || (sc != null && sc >= wl.thr)) { const aid = `ALR-2026-${pad(d.counters.alr++, 4)}`; d.alerts.unshift({ id: aid, wallet: a, trigger: wl.rule === 'any' ? 'Watchlist activity' : `Score at or above ${wl.thr}`, from: Math.max(0, sc - 12), score: sc, at: nowIso(), status: 'Unacknowledged', tx: txh('al' + aid), list: wl.name }); notify(d, 'Watchlist match', `${a.slice(0, 6)}…${a.slice(-4)} matched "${wl.name}" (score ${sc}).`, 'watch', 'AlertsDashboard'); }
    });
    return { ok: true, score: sc };
  },
  removeFromWatchlist(id, a) { mutate((d) => { const w = d.watchlists.find((x) => x.id === id); w.wallets = w.wallets.filter((x) => x.a !== a); log(d, 'Removed wallet from watchlist', a); }); },
  // Monitoring needs backend scores for watchlist wallets; the frontend no longer simulates them.
  runMonitoring() { return { alerts: 0, wallets: 0, baseline: false, unavailable: true }; },
  alertStatus(id, status) { mutate((d) => { d.alerts.find((x) => x.id === id).status = status; log(d, `Alert ${status.toLowerCase()}`, id); }); },
  // reports
  createReport(r) { return mutate((d) => { const id = `RPT-2026-${pad(d.counters.rpt++, 4)}`; d.reports.unshift({ id, by: actor(d), date: nowIso(), status: 'Draft', ...r, id }); log(d, 'Generated report', id); notify(d, 'Report ready', `${r.title} (${id}) finished generating.`, 'report', 'ReportLibrary'); d.ctx.report = id; return id; }); },
  reportStatus(id, status) { mutate((d) => { d.reports.find((x) => x.id === id).status = status; log(d, `Report ${status.toLowerCase()}`, id); }); },
  deleteReport(id) { mutate((d) => { d.reports = d.reports.filter((x) => x.id !== id); log(d, 'Deleted report', id); }); },
  // admin
  invite(u) {
    if (!isEmail(u.email)) return { ok: false, error: 'Enter a valid work email.' };
    if (state.users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) return { ok: false, error: 'A user with this email already exists.' };
    mutate((d) => { d.users.push({ id: 'U' + d.counters.usr++, status: 'Invited', last: '', ...u }); log(d, 'Invited user', u.email); notify(d, 'User invited', `${u.name} was invited as ${ROLE_NAMES[u.role]}.`, 'system'); });
    return { ok: true };
  },
  userPatch(id, p, action) { mutate((d) => { const u = d.users.find((x) => x.id === id); Object.assign(u, p); log(d, action, u.email); }); },
  createTeam(t) { mutate((d) => { d.teams.push({ id: 'T' + (d.teams.length + 1), members: 0, cases: 0, created: nowIso(), ...t }); log(d, 'Created team', t.name); }); },
  setPerm(perm, role, v) { mutate((d) => { d.perms[perm][role] = v; log(d, `Permission ${perm} for ${role} ${v ? 'granted' : 'revoked'}`, 'Permissions'); }); },
  createTenant(t) { mutate((d) => { const n = 15 + d.tenants.length; d.tenants.push({ id: 'TEN-' + pad(n, 4), users: 1, wallets: 0, status: 'Active', ...t }); log(d, 'Created tenant', t.name); }); },
  tenantStatus(id, status) { mutate((d) => { const t = d.tenants.find((x) => x.id === id); t.status = status; log(d, `Tenant ${status.toLowerCase()}`, id); }); },
  providerPatch(id, p, action) { mutate((d) => { const x = d.providers.find((y) => y.id === id); Object.assign(x, p); log(d, action, x.name); }); },
  jobPatch(id, status) { mutate((d) => { d.jobs.find((x) => x.id === id).status = status; log(d, `Job ${status.toLowerCase()}`, id); }); },
  setting(k, v) { mutate((d) => { d.settings[k] = v; }); },
  saveSettings(scope) { mutate((d) => log(d, `Saved ${scope} settings`, scope)); },
  pref(k, v) { mutate((d) => { d.prefs[k] = v; }); },
  saveCfg(cfg) { mutate((d) => { d.cfg = { thr: cfg.thr, points: cfg.points || d.cfg.points, hopDecay: cfg.hopDecay || d.cfg.hopDecay, version: d.cfg.version + 1 }; d.monitor.snapshots = {}; log(d, `Published methodology v${d.cfg.version}`, 'Risk engine'); }); setCfg(state.cfg); mutate(() => {}); },
};
export { walletProfile };
