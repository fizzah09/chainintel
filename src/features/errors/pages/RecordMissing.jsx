import { Link } from 'react-router-dom';

const NOUN = { caseId: 'case', evidence: 'evidence item', watchlist: 'watchlist', alert: 'alert', report: 'report', complaint: 'complaint', wallet: 'wallet address', tx: 'transaction hash' };

// Empty state for a detail page whose record is not in this workspace (shown instead of a 404).
export default function RecordMissing({ field, value }) {
  const noun = NOUN[field] || 'record';
  return (
    <div className="card" style={{ maxWidth: 560, margin: '48px auto', padding: 28, textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>No {noun} found</h2>
      <p className="mu" style={{ margin: '0 0 6px' }}>
        {value ? <>There is no {noun} with the ID <span className="mono">{value}</span> in this workspace.</> : <>No {noun} is selected.</>}
      </p>
      <p className="mu" style={{ margin: '0 0 18px' }}>It may not have been created yet, or the link may be out of date.</p>
      <Link className="btn" to="/dashboard">Back to dashboard</Link>
    </div>
  );
}
