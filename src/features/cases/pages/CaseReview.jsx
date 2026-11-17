import { useState } from 'react';
import { Btn, Card, Check, Col, Dl, Note, Row, Status, TextArea, Timeline, useToast } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { fd } from '../../../lib/format';
import { act, can } from '../../../mocks/store';

export function CReview() {
  const [c, s] = useCase(); const toast = useToast(); const [cm, setCm] = useState(''); const [err, setErr] = useState('');
  const ev = s.evidence.filter((e) => e.caseId === c.id), fn = s.findings.filter((f) => f.caseId === c.id), rv = s.reviews.filter((r) => r.caseId === c.id);
  const items = [[`Evidence is complete and verified`, `${ev.filter((e) => e.status === 'Verified').length} of ${ev.length} verified`, ev.length > 0 && ev.every((e) => e.status === 'Verified')], ['Findings are supported by evidence', `${fn.length} findings`, fn.length > 0 && fn.every((f) => f.evidence.length)], ['Risk score explanation reviewed', 'Contributions sum to the final score', true], ['No conflict of interest', `Reviewer ${c.reviewer}${s.session.name === c.assignee ? ' is the assignee' : ''}`, s.session.name !== c.assignee]];
  const can_ = can(s, 'approve_review') && c.status === 'Under Review'; const conflict = s.session.name === c.assignee;
  const dec = (d) => { if (d !== 'Approved' && !cm.trim()) return setErr('A comment is required when returning or escalating.'); if (conflict) return toast('You cannot review a case assigned to you.', 'bad'); act.review(c.id, d, cm.trim()); toast(`Review ${d.toLowerCase()}`); setCm(''); setErr(''); };
  return <CW active="Review"><Row><Col flex="2 1 560px"><Card title="Reviewer checklist">{items.map(([t, d, ok]) => <div className="set" key={t}><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Check on={ok} onChange={() => {}} disabled label={t} /><div><b>{t}</b><span className="d mu sm" style={{ display: 'block' }}>{d}</span></div></div></div>)}</Card>
      <Card title="Review decision">{c.status !== 'Under Review' && <Note k="gray" icon="help">This case is {c.status}. Decisions can only be recorded while it is Under Review.</Note>}<div style={{ height: 8 }} /><TextArea label="Reviewer comments" value={cm} onChange={(x) => { setCm(x); setErr(''); }} err={err} /><div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}><Btn kind="pri" icon="check" disabled={!can_} onClick={() => dec('Approved')}>Approve</Btn><Btn icon="left" disabled={!can_} onClick={() => dec('Returned')}>Return for changes</Btn><Btn kind="danger" icon="flag" disabled={!can_} onClick={() => dec('Escalated')}>Escalate</Btn></div></Card></Col>
      <Col flex="1 1 300px"><Card title="Case"><Dl w={110} items={[['Assignee', c.assignee || '—'], ['Reviewer', c.reviewer], ['Status', <Status s={c.status} key="s" />], ['Due', fd(c.due)]]} /></Card><Card title="Review history">{rv.length ? <Timeline items={rv.map((r) => ({ t: r.decision, who: r.by, when: fd(r.date), d: r.comment }))} /> : <div className="mu">No reviews yet.</div>}</Card></Col></Row></CW>;
}

export default CReview;
