import { can } from '../mocks/store';

export { can };

// Which role prefixes own which screens (e.g. BA_* screens belong to Bank Admin).
const OWN = { INV: ['inv'], REV: ['rev'], CM: ['cm'], BA: ['ba'], AUD: ['aud'], ER: ['ex'], PA: ['pa', 'sa'], SA: ['sa', 'pa'] };
// Screens that need a specific permission from the permission matrix.
const PERM = { CaseCreate: 'create_case', CaseCreate2: 'create_case', CaseCreate3: 'create_case', CaseCreate4: 'create_case', ReportBuilder: 'export_reports', CaseAuditTrail: 'view_audit', EvidenceUpload: 'create_case', CaseReview: 'approve_review', TraceFilters: 'run_trace', TransactionTracing: 'run_trace', TraceLimitReached: 'run_trace' };

/** Can the signed-in user open the screen with this key? */
export function allowed(s, key) {
  const pre = key.split('_')[0];
  if (key.includes('_') && OWN[pre] && !OWN[pre].includes(s.session.role)) return false;
  if (key === 'CaseReview') return can(s, 'approve_review') || s.session.role === 'cm';
  if (PERM[key] && !can(s, PERM[key])) return false;
  const r = s.session.role;
  // Platform staff do not see tenant case data.
  if ((r === 'pa' || r === 'sa') && /^Case|^Evidence|^Alert|^Watchlist(?!List)/.test(key) && key !== 'CaseAuditTrail') return false;
  return true;
}
