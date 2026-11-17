import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '72px 8px', maxWidth: 520 }}>
      <div className="eyebrow">404</div>
      <h1 className="serif" style={{ fontSize: 34, margin: '8px 0' }}>Page not found.</h1>
      <p className="mu">The address may be mistyped, or the record no longer exists.</p>
      <Link className="btn pri" to="/" style={{ marginTop: 16 }}>Back to workspace</Link>
    </div>
  );
}
