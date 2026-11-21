import { useState } from 'react';
import { byStatus } from '../../../components/domain/workspace';
import { Bars, Btn, Card, Donut, Head, Kpis, Note, Row, useToast } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { STAGES, useStore, verifyChain } from '../../../mocks/store';

const WEEK_MS = 7 * 24 * 3600 * 1000;
const WEEKS = 8;

// Audit entries per week, oldest first, for the last WEEKS weeks.
function weeklyCounts(audit, now = Date.now()) {
  const start = now - WEEKS * WEEK_MS;
  const counts = Array.from({ length: WEEKS }, () => 0);
  for (const a of audit) {
    const t = new Date(a.at).getTime();
    if (t < start || t > now) continue;
    counts[Math.min(WEEKS - 1, Math.floor((t - start) / WEEK_MS))] += 1;
  }
  const labels = counts.map((_, i) => new Date(start + i * WEEK_MS).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }));
  return { counts, labels };
}

export function AudDash() {
  const s = useStore(); const toast = useToast();
  const [res, setRes] = useState(null);
  const intact = verifyChain(s.audit).ok;
  const { counts, labels } = weeklyCounts(s.audit);
  const verified = s.evidence.filter((e) => e.status === 'Verified').length;

  return <>
    <Head title="Audit dashboard" desc="Read-only overview of compliance activity and record integrity." />
    <Kpis items={[
      ['Cases in period', s.cases.length, 'All records'],
      ['Audit events', s.audit.length, intact ? 'Hash chain intact' : 'Hash chain broken', intact ? undefined : 'crit'],
      ['Evidence verified', `${verified} of ${s.evidence.length}`, 'Across all cases'],
    ]} />
    <Row>
      <Card title="Activity by week" sub="Audit entries per week, last eight weeks" style={{ flex: '2 1 400px' }}>
        <Bars vals={counts} labels={labels} />
      </Card>
      <Card title="Evidence status" style={{ flex: '1 1 260px' }}>
        <Donut items={[['Verified', verified, '#16A34A'], ['Pending', s.evidence.filter((e) => e.status === 'Pending Verification').length, '#F59E0B'], ['Unverified', s.evidence.filter((e) => e.status === 'Unverified').length, '#64748B']]} center={String(s.evidence.length)} sub="items" />
      </Card>
    </Row>
    <Card title="Cases by stage" style={{ flex: '1 1 100%' }}>
      <Bars vals={byStatus(s.cases).map((x) => x[1])} labels={STAGES.map((x) => x.split(' ')[0])} />
    </Card>
    <Card title="Integrity" sub="Checks every audit entry's hash against the one before it" act={<Btn sm kind="pri" onClick={() => { const r = verifyChain(s.audit); setRes(r); toast(r.ok ? 'Integrity verified' : 'Integrity check failed', r.ok ? 'ok' : 'bad'); }}>Run verification</Btn>}>
      {res
        ? <Note k={res.ok ? 'ok' : 'bad'} icon="shield">{res.ok ? `All ${res.n} entries verified. Hash chain intact, no gaps.` : `Chain broken at entry ${res.at}.`}</Note>
        : <p className="mu sm" style={{ margin: 0 }}>Not run in this session yet.</p>}
    </Card>
  </>;
}

export default AudDash;
