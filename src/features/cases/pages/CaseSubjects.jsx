import { useState } from 'react';
import { Addr, Btn, Card, DataTable, Hash, Tier, useToast } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { isAddr, isTx } from '../../../lib/format';
import { quickScore } from '../../../lib/risk';
import { act, can } from '../../../mocks/store';

export function CSubjects() {
  const [c, s] = useCase(); const toast = useToast(); const [v, setV] = useState(''); const [err, setErr] = useState(''); const edit = can(s, 'create_case');
  const add = () => { const t = v.trim(); if (!isAddr(t) && !isTx(t)) return setErr('Enter a valid wallet address or transaction hash.'); if (c.subjects.some((x) => x.ref.toLowerCase() === t.toLowerCase())) return setErr('Already a subject of this case.'); act.addSubject(c.id, isAddr(t) ? 'wallet' : 'tx', t); setV(''); setErr(''); toast('Subject added'); };
  return <CW active="Subjects"><Card title="Case subjects" act={edit && <><input className="in" style={{ width: 280, minHeight: 32 }} placeholder="Wallet address or tx hash" value={v} onChange={(e) => { setV(e.target.value); setErr(''); }} aria-label="New subject" /><Btn kind="pri" sm icon="plus" onClick={add}>Add subject</Btn></>}>{err && <div className="hint err" role="alert">{err}</div>}
    <DataTable tools={false} rows={c.subjects} size={10} cols={[{ h: 'Subject', render: (x) => (x.kind === 'wallet' ? <Addr a={x.ref} /> : <Hash h={x.ref} />) }, { h: 'Type', render: (x) => (x.kind === 'wallet' ? 'Wallet' : 'Transaction') }, { h: 'Role', render: (x) => x.role }, { h: 'Risk', render: (x) => (x.kind === 'wallet' ? <Tier score={quickScore(x.ref)} /> : '—') }, { h: '', render: (x) => edit && c.subjects.length > 1 && <Btn sm kind="danger" onClick={() => { act.removeSubject(c.id, x.id); toast('Subject removed'); }}>Remove</Btn> }]} /></Card></CW>;
}

export default CSubjects;
