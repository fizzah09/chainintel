import { kec } from '../../lib/format';
import { BASE_AS_OF } from '../../engine/sim';

// Demo role accounts: they only exist so each role can sign in. Their profiles start empty.
export const ACCOUNTS = [
  { role: 'inv', name: 'Sara Ali', email: 'sara.ali@examplebank.com' },
  { role: 'rev', name: 'Nadia Hussain', email: 'nadia.h@examplebank.com' },
  { role: 'cm', name: 'Ahmed Khan', email: 'ahmed.khan@examplebank.com' },
  { role: 'ba', name: 'Bilal Qureshi', email: 'bilal@examplebank.com' },
  { role: 'aud', name: 'Imran Sheikh', email: 'imran.s@examplebank.com' },
  { role: 'ex', name: 'Dr. Ayesha Malik', email: 'ayesha.malik@university.edu' },
  { role: 'pa', name: 'Hina Raza', email: 'hina@chainintel.io' },
  { role: 'sa', name: 'Omar Farooq', email: 'omar@chainintel.io' },
];
export const ROLE_NAMES = { inv: 'Investigator', rev: 'Reviewer', cm: 'Compliance Manager', ba: 'Bank Admin', aud: 'Auditor', ex: 'Academic Examiner', pa: 'Platform Admin', sa: 'Super Admin' };
export const PERM_ROLES = ['inv', 'rev', 'cm', 'ba', 'aud', 'ex'];
export const PERMS = [['view_wallets', 'View wallets'], ['run_trace', 'Run trace'], ['create_case', 'Create case'], ['verify_evidence', 'Verify evidence'], ['approve_review', 'Approve review'], ['manage_users', 'Manage users'], ['view_audit', 'View audit logs'], ['export_reports', 'Export reports']];
const M = { view_wallets: [1, 1, 1, 1, 1, 1], run_trace: [1, 1, 1, 1, 0, 0], create_case: [1, 0, 1, 1, 0, 0], verify_evidence: [0, 1, 1, 0, 0, 0], approve_review: [0, 1, 1, 0, 0, 0], manage_users: [0, 0, 0, 1, 0, 0], view_audit: [0, 0, 1, 1, 1, 0], export_reports: [1, 1, 1, 1, 1, 0] };
const perms = {}; for (const [k] of PERMS) perms[k] = Object.fromEntries(PERM_ROLES.map((r, i) => [r, !!M[k][i]]));

export function chainLog(list, e) {
  const prev = list.length ? list[list.length - 1].hash : 'GENESIS';
  const body = { ...e, prev };
  return { ...body, hash: kec(prev + JSON.stringify([e.at, e.actor, e.action, e.object])) };
}

// Empty workspace: no cases, wallets, alerts, reports, complaints or provider data are pre-filled.
export function seed() {
  return {
    v: 3, session: { authed: false, mfa: false, role: 'inv', name: 'Sara Ali' },
    ctx: { wallet: '', tx: '', caseId: '', watchlist: '', alert: '', report: '', evidence: '', trace: null },
    recent: [],
    cfg: { thr: [25, 50, 75], version: 3 }, perms,
    settings: { orgName: 'My organisation', tz: 'UTC+05:00', mfaRequired: true, timeout: 30, branding: true, ipAllow: false, sso: false, lockFails: true, pwPolicy: 'Strong', critThr: 75, requireReview: true, reviewSla: 48, autoAssign: false, retention: '7 years', maintenance: false, selfReg: false, errAlert: 2, queueAlert: 500, oncall: true, traceHops: 3, traceNodes: 100, traceEdges: 250, tracePeriod: 30 },
    prefs: { lang: 'English', tz: 'UTC+05:00 Karachi', email: true, mfa: true },
    cases: [], evidence: [], findings: [], complaints: [], tasks: [], notes: [], comms: [], reviews: [], audit: [],
    watchlists: [], alerts: [], reports: [], notifications: [], jobs: [], providers: [], tenants: [], teams: [],
    users: ACCOUNTS.map((a, i) => ({ id: 'U' + (i + 1), name: a.name, email: a.email, role: a.role, team: '', status: 'Active', last: null })),
    counters: { cmp: 0, case: 0, evd: 0, fnd: 0, tsk: 0, rpt: 0, wl: 0, alr: 0, usr: ACCOUNTS.length },
    wizard: { title: '', type: 'Transaction monitoring', desc: '', source: 'Manual', ref: '', subjects: [], priority: 'Medium', due: '', assignee: '', team: '', evidence: [] },
    monitor: { clock: BASE_AS_OF, runs: [], snapshots: {} },
  };
}
