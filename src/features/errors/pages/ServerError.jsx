import { Link } from 'react-router-dom';
import AuthLayout from '../../auth/layouts/AuthLayout';

export default function ServerError() {
  return (
    <AuthLayout>
      <div className="eyebrow">Error 500</div>
      <h2 style={{ fontSize: 28 }}>Something went wrong on our side.</h2>
      <p className="mu">The request could not be completed. Your work is saved; try again in a moment. If it keeps happening, contact your administrator with the time of the error.</p>
      <div style={{ display: 'flex', gap: 10 }}><button className="btn" onClick={() => window.location.reload()}>Try again</button><Link className="btn pri" to="/">Go to workspace</Link></div>
    </AuthLayout>
  );
}
