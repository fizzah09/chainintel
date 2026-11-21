import { useState } from 'react';
import { Btn, Card, Chip, Dl, Hash, Head, Row, Status, Timeline, useToast } from '../../../components/ui';
import { download, fdt, kec } from '../../../lib/format';
import { act, can, useStore } from '../../../mocks/store';

export function EvDetail() {
  const s = useStore(); const toast = useToast(); const e = s.evidence.find((x) => x.id === s.ctx.evidence) || s.evidence[0]; const [chk, setChk] = useState(null);
  const cust = s.audit.filter((a) => a.object === e.id).reverse(); const vf = can(s, 'verify_evidence');
  return <><Head title={e.id} desc={e.title} badge={<Status s={e.status} />} acts={<><Btn icon="dl" onClick={() => download(`${e.id}.json`, JSON.stringify(e, null, 2), 'application/json')}>Download</Btn><Btn kind="pri" icon="check" disabled={!vf || e.status === 'Verified'} onClick={() => { act.evidenceStatus(e.id, 'Verified'); toast('Evidence verified'); }}>Verify</Btn></>} />
    <Row><Card title="Metadata" style={{ flex: '1 1 420px' }}><Dl items={[['Type', e.type], ['Source', e.source], ['Captured', fdt(e.date) + ' UTC'], ['Captured by', e.by], ['SHA-256', <span className="mono" key="h" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{e.hash}</span>], ['Linked to', e.caseId]]} />
      <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Btn sm icon="shield" onClick={() => setChk(e.srcDown ? 'down' : e.fileName ? 'file' : kec(e.content) === e.hash ? 'ok' : 'bad')}>Re-check hash</Btn>{chk === 'ok' && <Chip k="ok">Hash matches stored value</Chip>}{chk === 'bad' && <Chip k="bad">Hash does not match</Chip>}{chk === 'down' && <Chip k="bad">Source unavailable</Chip>}{chk === 'file' && <Chip k="ok">Stored at upload ({e.fileName})</Chip>}</div></Card>
      <Card title="Chain of custody" style={{ flex: '1 1 420px' }}>{cust.length ? <Timeline items={cust.map((a) => ({ t: a.action, who: a.actor, when: fdt(a.at) }))} /> : <div className="mu">No recorded actions yet.</div>}</Card></Row>
    <Row><Card title="Content" style={{ flex: '1 1 420px' }}>{e.fileName
      ? <Dl items={[['Document', e.fileName], ['Size', e.size ? `${Math.round(e.size / 1024)} KB` : '—'], ['Stored as', 'Uploaded file, hash recorded at upload']]} />
      : (() => { const parts = String(e.content || '').split('|'); return parts.length > 1 ? <Dl items={[['Title', parts[0]], ['Source', parts[1] || '—'], ['Case', parts[2] || '—']]} /> : <Dl items={[['Content', e.content || '—']]} />; })()}</Card>
      <Card title="Links" style={{ flex: '1 1 300px' }}>{(e.links || []).length
        ? (e.links || []).map((l) => <div key={l} style={{ padding: '6px 0' }}><a href={l} target="_blank" rel="noreferrer" className="link">{l}</a></div>)
        : <div className="mu">No links recorded. Source: {e.source || '—'}.</div>}</Card></Row>
</>;
}

export default EvDetail;
