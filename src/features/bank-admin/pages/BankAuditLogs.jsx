import { AuditTrail } from '../../audit/pages/AuditTrail';

export const BaAudit = () => (
  <AuditTrail scope="all" title="Audit logs" desc="Tenant-wide record of user and system actions." />
);

export default BaAudit;
