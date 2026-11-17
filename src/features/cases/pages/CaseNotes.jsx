import { useState } from 'react';
import { Btn, Card, Empty, Note, Person, Row, TextArea, useToast } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { fdt } from '../../../lib/format';
import { act, can } from '../../../mocks/store';

export function CNotes() {
  const [c, s] = useCase(); const toast = useToast(); const [t, setT] = useState(''); const [err, setErr] = useState(''); const edit = can(s, 'create_case') || s.session.role === 'rev';
  return <CW active="Notes"><Row><Card title="New note" style={{ flex: '1 1 360px' }}><TextArea label="Note" value={t} onChange={(x) => { setT(x); setErr(''); }} err={err} placeholder="Add context for other investigators…" /><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}><span className="mu sm">Visible to case members</span><Btn kind="pri" sm disabled={!edit} onClick={() => { if (!t.trim()) return setErr('Write a note first.'); act.addNote(c.id, t.trim()); setT(''); toast('Note posted'); }}>Post note</Btn></div></Card>
    <Card title="Notes" style={{ flex: '2 1 560px' }}>{s.notes.filter((n) => n.caseId === c.id).map((n) => <div key={n.id} style={{ padding: '14px 0', borderBottom: '1px solid #EDF1F6' }}><Person n={n.by} sub={fdt(n.at)} /><div style={{ margin: '8px 0 0 35px' }}>{n.text}</div></div>)}{!s.notes.some((n) => n.caseId === c.id) && <Empty icon="chat" title="No notes yet" />}</Card></Row></CW>;
}

export default CNotes;
