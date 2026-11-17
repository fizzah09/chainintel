import { useState } from 'react';
import { Btn, Card, Check, Empty, Modal, SelectIn, Stack, Status, TextArea, TextIn, Tier, useToast } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { act, can } from '../../../mocks/store';

export function CFindings() {
  const [c, s] = useCase(); const toast = useToast(); const fn = s.findings.filter((f) => f.caseId === c.id); const [m, setM] = useState(false); const [v, setV] = useState({ tier: 'high', evidence: [] }); const [err, setErr] = useState({}); const edit = can(s, 'create_case'); const vf = can(s, 'verify_evidence'); const ev = s.evidence.filter((e) => e.caseId === c.id);
  return <CW active="Findings"><Card title="Findings" act={<Btn kind="pri" sm icon="plus" disabled={!edit} onClick={() => { setV({ tier: 'high', evidence: [] }); setErr({}); setM(true); }}>Add finding</Btn>}>
    {!fn.length && <Empty icon="flag" title="No findings yet" desc="Record what the evidence shows." />}
    {fn.map((f) => <div key={f.id} className="ev" style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><span className="mono mu">{f.id}</span> · <b>{f.title}</b></div><div style={{ display: 'flex', gap: 8 }}><Tier k={f.tier} /><Status s={f.status} /></div></div><div style={{ margin: '6px 0 10px', color: '#334155' }}>{f.desc}</div><div className="mu sm">Evidence: {f.evidence.join(', ') || 'None linked'}</div>{vf && f.status !== 'Verified' && <div style={{ marginTop: 10 }}><Btn sm onClick={() => { act.findingStatus(f.id, 'Verified'); toast('Finding verified'); }}>Verify</Btn></div>}</div>)}</Card>
    <Modal open={m} title="Add finding" onClose={() => setM(false)} wide footer={<><Btn onClick={() => setM(false)}>Cancel</Btn><Btn kind="pri" onClick={() => { const e = {}; if (!(v.title || '').trim()) e.title = 'Title is required.'; if (!(v.desc || '').trim()) e.desc = 'Describe the finding.'; if (!v.evidence.length) e.ev = 'Link at least one evidence item.'; setErr(e); if (Object.keys(e).length) return; act.addFinding({ caseId: c.id, title: v.title.trim(), desc: v.desc.trim(), tier: v.tier, evidence: v.evidence }); toast('Finding added'); setM(false); }}>Add finding</Btn></>}>
      <Stack gap={14}><TextIn label="Title" req value={v.title} onChange={(x) => setV({ ...v, title: x })} err={err.title} /><TextArea label="Description" req value={v.desc} onChange={(x) => setV({ ...v, desc: x })} err={err.desc} /><SelectIn label="Severity" value={v.tier} onChange={(x) => setV({ ...v, tier: x })} options={[['low', 'Low'], ['mod', 'Moderate'], ['high', 'High'], ['crit', 'Critical']]} />
        <div><b style={{ fontSize: 13 }}>Linked evidence *</b>{ev.map((e) => <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}><Check on={v.evidence.includes(e.id)} onChange={(on) => setV({ ...v, evidence: on ? [...v.evidence, e.id] : v.evidence.filter((x) => x !== e.id) })} label={e.id} /><span>{e.id} · {e.title}</span></div>)}{err.ev && <div className="hint err">{err.ev}</div>}</div></Stack></Modal></CW>;
}

export default CFindings;
