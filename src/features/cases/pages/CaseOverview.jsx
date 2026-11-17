import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Col, Dl, Gauge, Row, Tier, Timeline } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { fdt } from '../../../lib/format';
import { quickScore } from '../../../lib/risk';


// ---- tabs ----
export function COverview() {
  const [c, s] = useCase(); const nav = useNavigate();
  const fn = s.findings.filter((f) => f.caseId === c.id); const ev = s.evidence.filter((e) => e.caseId === c.id); const tk = s.tasks.filter((t) => t.caseId === c.id && t.status !== 'Completed'); const au = s.audit.filter((a) => a.caseId === c.id).slice(-4).reverse();
  const primary = c.subjects.find((x) => x.kind === 'wallet')?.ref; const sc = primary ? quickScore(primary) : 0;
  return <CW active="Overview"><Row><Col flex="2 1 560px"><Card title="Summary"><p style={{ margin: 0 }}>{c.desc}</p></Card>
    <Card title="Key findings" act={<Btn sm to={pathOf('CaseFindings')}>All findings</Btn>}>{fn.length ? fn.slice(0, 3).map((f) => <div key={f.id} className="ev" style={{ marginBottom: 10, display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between' }}><div><b>{f.title}</b><div className="mu sm">{f.desc}</div></div><Tier k={f.tier} /></div>) : <div className="mu">No findings yet. Add findings from the Findings tab.</div>}</Card>
    <Card title="Recent activity">{au.length ? <Timeline items={au.map((a) => ({ t: a.action, who: a.actor, when: fdt(a.at), d: a.object }))} /> : <div className="mu">No activity yet.</div>}</Card></Col>
    <Col flex="1 1 320px"><Card title="Risk snapshot (primary wallet)">{primary ? <><div style={{ display: 'flex', justifyContent: 'center' }}><Gauge score={sc} size={190} /></div><div style={{ textAlign: 'center' }}><Tier score={sc} /></div></> : <div className="mu">No wallet subject.</div>}</Card>
      <Card title="Case health"><Dl w={120} items={[['Evidence', `${ev.length} · ${ev.filter((e) => e.status === 'Verified').length} verified`], ['Open tasks', tk.length], ['Findings', fn.length], ['Notes', s.notes.filter((n) => n.caseId === c.id).length], ['Reviewer', c.reviewer], ['Source', c.source]]} /></Card></Col></Row></CW>;
}

export default COverview;
