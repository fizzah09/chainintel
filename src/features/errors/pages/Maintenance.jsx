import AuthLayout from '../../auth/layouts/AuthLayout';

export default function Maintenance() {
  return (
    <AuthLayout>
      <div className="eyebrow">Scheduled maintenance</div>
      <h2 style={{ fontSize: 28 }}>Chain Intel is being updated.</h2>
      <p className="mu">Sign-in is paused while the platform is updated. Monitoring and alerting keep running. Please check back shortly.</p>
    </AuthLayout>
  );
}
