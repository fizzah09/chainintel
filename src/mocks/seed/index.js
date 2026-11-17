import { addr, txh, kec } from '../../lib/format';
import { TG, KW } from '../../lib/risk';

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

const iso = (d, h = 9, m = 0) => `2026-${d}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`;
export function chainLog(list, e) {
  const prev = list.length ? list[list.length - 1].hash : 'GENESIS';
  const body = { ...e, prev };
  return { ...body, hash: kec(prev + JSON.stringify([e.at, e.actor, e.action, e.object])) };
}

export function seed() {
  const people = ['Sara Ali', 'Omar Siddiq', 'Maria Chen', 'Ahmed Khan', 'Nadia Hussain'];
  const cases = [
    ['CASE-2026-00128', 'Suspected layering via mixer', 'Under Review', 'Critical', 'Sara Ali', '11-02', '11-09', TG],
    ['CASE-2026-00127', 'Sanctioned counterparty exposure', 'Analysis', 'High', 'Sara Ali', '11-01', '11-08', addr('c127')],
    ['CASE-2026-00124', 'Rapid pass-through of customer funds', 'Evidence Collection', 'High', 'Omar Siddiq', '10-30', '11-07', addr('c124')],
    ['CASE-2026-00121', 'Unexplained inbound volume spike', 'Assigned', 'Medium', 'Maria Chen', '10-29', '11-12', addr('c121')],
    ['CASE-2026-00119', 'Phishing-linked deposit', 'Open', 'Medium', '', '10-28', '', addr('c119')],
    ['CASE-2026-00110', 'Bridge hopping across chains', 'Decision', 'High', 'Sara Ali', '10-22', '11-05', addr('c110')],
    ['CASE-2026-00102', 'Exchange deposit review', 'Closed', 'Low', 'Ahmed Khan', '10-14', '', addr('c102')],
  ].map(([id, title, status, priority, assignee, od, dd, w]) => ({ id, title, type: 'Transaction monitoring', desc: `${title}. Opened from monitoring.`, status, prev: null, priority, assignee, team: 'Financial Crime', opened: iso(od, 9, 50), due: dd ? iso(dd, 17) : '', createdBy: 'Sara Ali', reviewer: 'Nadia Hussain', source: 'Manual', decision: id === 'CASE-2026-00102' ? 'No suspicious activity' : '', subjects: [{ id: 's1', kind: 'wallet', ref: w, role: 'Primary' }] }));
  cases[0].desc = `Wallet 0x7a3f…9B21 received 4,200 USDT from two flagged counterparties between 06:12 and 08:15 UTC on 02 Nov and forwarded 3.20 ETH to a known mixing service within 90 minutes. Pattern is consistent with layering. Customer statement is pending.`;
  cases[0].source = 'Alert ALR-2026-0912';
  cases[0].subjects.push({ id: 's2', kind: 'wallet', ref: KW.E, role: 'Related' }, { id: 's3', kind: 'wallet', ref: KW.mix, role: 'Related' }, { id: 's4', kind: 'tx', ref: txh('1'), role: 'Key' });
  const ev = (id, caseId, title, type, source, by, status, d) => ({ id, caseId, title, type, source, by, date: iso(d, 10), status, note: '', content: `${title}|${source}|${caseId}`, hash: kec(`${title}|${source}|${caseId}`) });
  const evidence = [
    ev('EVD-000184', 'CASE-2026-00128', 'Counterparty exposure snapshot', 'Risk snapshot', 'Chain Intel', 'Sara Ali', 'Verified', '11-02'),
    ev('EVD-000185', 'CASE-2026-00128', 'Mixer interaction transaction set', 'Transaction set', 'Etherscan', 'Sara Ali', 'Verified', '11-02'),
    ev('EVD-000186', 'CASE-2026-00128', 'Graph export (3 hops)', 'Graph image', 'Chain Intel', 'Sara Ali', 'Pending Verification', '11-02'),
    ev('EVD-000187', 'CASE-2026-00128', 'Label reference: mixing service', 'External source', 'Forta labels', 'System', 'Verified', '10-28'),
    ev('EVD-000188', 'CASE-2026-00128', 'Customer statement PDF', 'Document', 'Customer', 'Ahmed Khan', 'Unverified', '10-27'),
    ev('EVD-000189', 'CASE-2026-00128', 'Sanctions screening result', 'External source', 'OFAC list', 'System', 'Source Unavailable', '10-27'),
    ev('EVD-000190', 'CASE-2026-00127', 'Sanctions screening hit', 'External source', 'OFAC list', 'Sara Ali', 'Pending Verification', '11-01'),
    ev('EVD-000191', 'CASE-2026-00110', 'Bridge transfer set', 'Transaction set', 'Etherscan', 'Sara Ali', 'Verified', '10-23'),
  ];
  evidence.find((e) => e.id === 'EVD-000189').srcDown = true;
  const findings = [
    { id: 'FND-0012', caseId: 'CASE-2026-00128', title: 'Mixer interaction', desc: 'Direct transfer of 3.20 ETH to a known mixing service at 08:15 UTC.', tier: 'crit', status: 'Verified', evidence: ['EVD-000185', 'EVD-000187'] },
    { id: 'FND-0013', caseId: 'CASE-2026-00128', title: 'Exposure to flagged wallets', desc: 'Nine flagged counterparties within two hops of the primary wallet.', tier: 'high', status: 'Verified', evidence: ['EVD-000184'] },
    { id: 'FND-0014', caseId: 'CASE-2026-00128', title: 'Rapid pass-through', desc: 'Inbound funds forwarded within 90 minutes of receipt.', tier: 'high', status: 'Pending Verification', evidence: ['EVD-000186'] },
    { id: 'FND-0015', caseId: 'CASE-2026-00110', title: 'Multiple bridge hops', desc: 'Two bridges used within 48 hours.', tier: 'high', status: 'Verified', evidence: ['EVD-000191'] },
  ];
  const tasks = [
    { id: 'TSK-0031', caseId: 'CASE-2026-00128', title: 'Request customer statement', assignee: 'Sara Ali', due: iso('11-04', 17), status: 'Completed', priority: 'Medium' },
    { id: 'TSK-0032', caseId: 'CASE-2026-00128', title: 'Verify mixer label with second source', assignee: 'Sara Ali', due: iso('11-07', 17), status: 'In Progress', priority: 'High' },
    { id: 'TSK-0033', caseId: 'CASE-2026-00128', title: 'Screen related wallets against sanctions lists', assignee: 'Omar Siddiq', due: iso('11-08', 17), status: 'Waiting', priority: 'High' },
    { id: 'TSK-0034', caseId: 'CASE-2026-00128', title: 'Draft case report', assignee: 'Sara Ali', due: iso('11-09', 17), status: 'Overdue', priority: 'Critical' },
    { id: 'TSK-0035', caseId: 'CASE-2026-00127', title: 'Confirm sanctions match', assignee: 'Sara Ali', due: iso('11-08', 17), status: 'In Progress', priority: 'High' },
  ];
  const notes = [
    { id: 'N1', caseId: 'CASE-2026-00128', by: 'Sara Ali', at: iso('11-02', 14, 5), text: 'Mixer label confirmed by two sources. Awaiting customer statement before escalating.' },
    { id: 'N2', caseId: 'CASE-2026-00128', by: 'Ahmed Khan', at: iso('11-02', 10, 20), text: 'Priority raised. Please attach exposure snapshot and graph export.' },
    { id: 'N3', caseId: 'CASE-2026-00128', by: 'Sara Ali', at: iso('11-02', 9, 55), text: 'Created from alert. Primary wallet shows 3.1x velocity increase.' },
  ];
  const comms = [
    { id: 'M1', caseId: 'CASE-2026-00128', to: 'Customer relations', subject: 'Request for source of funds', dir: 'Outbound', date: iso('10-31'), status: 'Awaiting Response', body: 'Please confirm source of funds for the 02 Nov transfers.' },
    { id: 'M2', caseId: 'CASE-2026-00128', to: 'Customer relations', subject: 'Re: Request for source of funds', dir: 'Inbound', date: iso('11-02'), status: 'Response Received', body: 'Customer states the funds came from an OTC trade.' },
    { id: 'M3', caseId: 'CASE-2026-00128', to: 'Exchange compliance', subject: 'Account ownership enquiry', dir: 'Outbound', date: iso('11-02'), status: 'Sent', body: '' },
    { id: 'M4', caseId: 'CASE-2026-00128', to: 'Law enforcement liaison', subject: 'Referral draft', dir: 'Outbound', date: '', status: 'Draft', body: '' },
  ];
  const reviews = [{ id: 'R1', caseId: 'CASE-2026-00102', decision: 'Approved', by: 'Nadia Hussain', date: iso('10-14'), comment: 'Complete evidence set' }, { id: 'R2', caseId: 'CASE-2026-00098', decision: 'Returned', by: 'Nadia Hussain', date: iso('10-12'), comment: 'Missing source of funds' }, { id: 'R3', caseId: 'CASE-2026-00091', decision: 'Approved', by: 'Nadia Hussain', date: iso('10-08'), comment: 'Good analysis' }];
  const audit = [];
  [['11-02', 9, 50, 'Sara Ali', 'Created case', 'CASE-2026-00128', '10.20.4.18'], ['11-02', 10, 15, 'Ahmed Khan', 'Changed priority', 'CASE-2026-00128', '10.20.4.9'], ['11-02', 13, 2, 'Sara Ali', 'Attached evidence', 'EVD-000186', '10.20.4.18'], ['11-02', 14, 2, 'Sara Ali', 'Added finding', 'FND-0014', '10.20.4.18'], ['11-02', 14, 20, 'Sara Ali', 'Submitted for review', 'CASE-2026-00128', '10.20.4.18']].forEach(([d, h, m, actor, action, object, ip]) => audit.push(chainLog(audit, { id: 'A' + (audit.length + 1), at: iso(d, h, m), actor, action, object, caseId: 'CASE-2026-00128', ip, result: 'Success' })));
  const watchlists = [
    { id: 'WL-1', name: 'High-risk counterparties', scope: 'Tenant', desc: 'Wallets that must be watched for any critical movement.', thr: 75, rule: 'score', owner: 'Ahmed Khan', updated: iso('11-02'), email: true, app: true, wallets: [KW.E, KW.mix, TG, KW.B, KW.G].map((a) => ({ a, added: iso('10-29'), by: 'Ahmed Khan' })) },
    { id: 'WL-2', name: 'Case 00128 subjects', scope: 'Personal', desc: '', thr: 0, rule: 'any', owner: 'Sara Ali', updated: iso('11-02'), email: false, app: true, wallets: [TG, KW.E, KW.mix].map((a) => ({ a, added: iso('11-02'), by: 'Sara Ali' })) },
    { id: 'WL-3', name: 'Sanctions screening hits', scope: 'Tenant', desc: '', thr: 0, rule: 'any', owner: 'Ahmed Khan', updated: iso('10-30'), email: true, app: true, wallets: [KW.H].map((a) => ({ a, added: iso('10-30'), by: 'Ahmed Khan' })) },
    { id: 'WL-4', name: 'Mixer-adjacent wallets', scope: 'Platform', desc: '', thr: 50, rule: 'score', owner: 'Hina Raza', updated: iso('10-28'), email: false, app: true, wallets: [KW.C, KW.D].map((a) => ({ a, added: iso('10-28'), by: 'Hina Raza' })) },
  ];
  const alerts = [
    { id: 'ALR-2026-0912', wallet: TG, trigger: 'Score crossed 75', from: 61, score: 78, at: iso('11-02', 9, 44), status: 'Unacknowledged', tx: txh('1'), list: 'High-risk counterparties' },
    { id: 'ALR-2026-0911', wallet: KW.E, trigger: 'New flagged counterparty', from: 70, score: 81, at: iso('11-02', 8, 30), status: 'Acknowledged', tx: txh('E1'), list: 'High-risk counterparties' },
    { id: 'ALR-2026-0908', wallet: KW.mix, trigger: 'Watchlist activity', from: 90, score: 92, at: iso('11-02', 6, 10), status: 'Acknowledged', tx: txh('M1'), list: 'High-risk counterparties' },
    { id: 'ALR-2026-0902', wallet: KW.G, trigger: 'Velocity increase', from: 55, score: 63, at: iso('11-01', 12), status: 'Resolved', tx: txh('G1'), list: 'High-risk counterparties' },
  ];
  const reports = [
    { id: 'RPT-2026-0214', title: 'Wallet risk assessment', type: 'Wallet', subject: TG, by: 'Sara Ali', date: iso('11-02', 15, 32), status: 'Final', sections: ['Executive summary', 'Risk score explanation', 'Evidence register', 'Methodology and limitations'] },
    { id: 'RPT-2026-0213', title: 'Case summary CASE-2026-00128', type: 'Case', subject: 'CASE-2026-00128', by: 'Sara Ali', date: iso('11-02', 15, 0), status: 'Draft', sections: ['Executive summary', 'Evidence register'] },
    { id: 'RPT-2026-0210', title: 'Monthly compliance summary', type: 'Compliance', subject: 'Example Bank', by: 'Ahmed Khan', date: iso('11-01'), status: 'Final', sections: ['Executive summary'] },
    { id: 'RPT-2026-0204', title: 'Alert activity report', type: 'Alerts', subject: 'Example Bank', by: 'Ahmed Khan', date: iso('10-28'), status: 'Final', sections: ['Executive summary'] },
  ];
  const users = [
    ['Sara Ali', 'sara.ali@examplebank.com', 'inv', 'Financial Crime', 'Active'], ['Ahmed Khan', 'ahmed.khan@examplebank.com', 'cm', 'Compliance', 'Active'], ['Nadia Hussain', 'nadia.h@examplebank.com', 'rev', 'Compliance', 'Active'],
    ['Imran Sheikh', 'imran.s@examplebank.com', 'aud', 'Internal Audit', 'Active'], ['Bilal Qureshi', 'bilal@examplebank.com', 'ba', 'Platform', 'Active'], ['Omar Siddiq', 'omar.siddiq@examplebank.com', 'inv', 'Financial Crime', 'Active'], ['Maria Chen', 'maria.chen@examplebank.com', 'inv', 'Financial Crime', 'Active'],
    ['New Hire', 'new.hire@examplebank.com', 'inv', 'Financial Crime', 'Invited'], ['Old User', 'old.user@examplebank.com', 'rev', 'Compliance', 'Disabled'],
  ].map(([name, email, role, team, status], i) => ({ id: 'U' + (i + 1), name, email, role, team, status, last: i < 3 ? '2026-11-02T13:00:00Z' : '2026-10-28T10:00:00Z' }));
  const teams = [{ id: 'T1', name: 'Financial Crime', lead: 'Ahmed Khan', members: 14, cases: 16, created: '2026-01-12' }, { id: 'T2', name: 'Compliance', lead: 'Nadia Hussain', members: 9, cases: 8, created: '2026-01-12' }, { id: 'T3', name: 'Internal Audit', lead: 'Imran Sheikh', members: 3, cases: 0, created: '2026-02-03' }];
  const tenants = [['TEN-0007', 'Example Bank', 'Enterprise', 38, 1284, 'Active'], ['TEN-0011', 'Northern Savings', 'Professional', 21, 640, 'Active'], ['TEN-0014', 'Harbour Credit', 'Professional', 12, 302, 'Active'], ['TEN-0002', 'Test Sandbox', 'Evaluation', 4, 58, 'Suspended']].map(([id, name, plan, users, wallets, status]) => ({ id, name, plan, users, wallets, status }));
  const providers = [
    { id: 'P1', name: 'Etherscan API V2', purpose: 'Transactions and labels', used: 62, lat: 210, err: 0.2, calls: 62410, status: 'Healthy', on: true, licence: 'Commercial API' },
    { id: 'P2', name: 'Ethereum RPC (primary)', purpose: 'Raw chain data', used: 35, lat: 90, err: 0.1, calls: 181220, status: 'Healthy', on: true, licence: 'Provider terms' },
    { id: 'P3', name: 'Blockscout', purpose: 'Fallback explorer', used: 12, lat: 260, err: 0.2, calls: 3200, status: 'Healthy', on: true, licence: 'Open source' },
    { id: 'P4', name: 'Forta labels', purpose: 'Malicious labels', used: 0, lat: 1400, err: 4.8, calls: 1204, status: 'Degraded', on: true, licence: 'MIT' },
    { id: 'P5', name: 'OFAC SDN', purpose: 'Sanctions list', used: 0, lat: 0, err: 0, calls: 24, status: 'Healthy', on: true, licence: 'US public data' },
    { id: 'P6', name: 'ScamSniffer scam-database', purpose: 'Scam addresses', used: 0, lat: 0, err: 0, calls: 24, status: 'Healthy', on: false, licence: 'GPL-3.0 (legal review)' },
  ];
  const jobs = [['Risk scoring', 'Example Bank', '09:44', '3 s', 'Completed'], ['Report generation', 'Example Bank', '09:40', '12 s', 'Running'], ['Label sync', 'Platform', '09:30', '—', 'Retrying'], ['Ingestion', 'Northern Savings', '09:12', '41 s', 'Failed'], ['Risk scoring', 'Harbour Credit', '09:50', '—', 'Queued']].map(([type, tenant, started, dur, status], i) => ({ id: 'JOB-48' + i, type, tenant, started, dur, status }));
  const notifications = [
    { id: 'NT1', title: 'Critical wallet alert', desc: 'Wallet 0x7a3f…9B21 crossed score 75 after a transfer from a high-risk counterparty.', at: iso('11-02', 9, 44), kind: 'alert', read: false, to: 'AlertsDashboard' },
    { id: 'NT2', title: 'Case assigned to you', desc: 'CASE-2026-00128 · Suspected layering via mixer was assigned by Ahmed Khan.', at: iso('11-02', 9, 51), kind: 'case', read: false, to: 'CaseDetails' },
    { id: 'NT3', title: 'Review requested', desc: 'CASE-2026-00128 was submitted for review by Sara Ali.', at: iso('11-02', 14, 20), kind: 'review', read: false, to: 'CaseReview' },
    { id: 'NT4', title: 'Watchlist match', desc: 'Wallet 0xE5f7…90b8 is now on watchlist "High-risk counterparties".', at: iso('11-01', 12), kind: 'watch', read: true, to: 'WatchlistList' },
    { id: 'NT5', title: 'Report ready', desc: 'Wallet Risk Assessment Report RPT-2026-0214 finished generating.', at: iso('11-01', 15, 32), kind: 'report', read: true, to: 'ReportLibrary' },
    { id: 'NT6', title: 'Provider degraded', desc: 'Forta labels error rate above threshold. Some labels may be missing.', at: iso('10-31', 9), kind: 'system', read: true, to: 'PA_Provider' },
  ];
  return {
    v: 3, session: { authed: false, mfa: false, role: 'inv', name: 'Sara Ali' }, ctx: { wallet: TG, tx: txh('1'), caseId: 'CASE-2026-00128', watchlist: 'WL-1', alert: 'ALR-2026-0912', report: 'RPT-2026-0214', evidence: 'EVD-000184', trace: null }, recent: [TG, KW.E, KW.G, KW.mix, KW.C, KW.dex, KW.ex, KW.F, KW.D],
    cfg: { weights: { T: 0.35, E: 0.25, B: 0.2, A: 0.1, O: 0.1 }, thr: [25, 50, 75], version: 3 }, perms,
    settings: { orgName: 'Example Bank', tz: 'UTC+05:00', mfaRequired: true, timeout: 30, branding: true, ipAllow: false, sso: false, lockFails: true, pwPolicy: 'Strong', critThr: 75, requireReview: true, reviewSla: 48, autoAssign: false, retention: '7 years', maintenance: false, selfReg: false, errAlert: 2, queueAlert: 500, oncall: true, traceHops: 3, traceNodes: 100, traceEdges: 250, tracePeriod: 30 },
    prefs: { lang: 'English', tz: 'UTC+05:00 Karachi', email: true, mfa: true },
    cases, evidence, findings, tasks, notes, comms, reviews, audit, watchlists, alerts, reports, users, teams, tenants, providers, jobs, notifications, counters: { case: 131, evd: 192, fnd: 16, tsk: 36, rpt: 215, wl: 5, alr: 913, usr: 10 },
    wizard: { title: '', type: 'Transaction monitoring', desc: '', source: 'Manual', ref: '', subjects: [], priority: 'Medium', due: '', assignee: '', team: 'Financial Crime', evidence: [] },
  };
}
