import { useState } from 'react';
import { AnchorCard } from '../../../components/domain/OnChain';
import { Btn, Card, DataTable, Hash, Head, Note, Status, useToast } from '../../../components/ui';
import { csv, download, fdt } from '../../../lib/format';
import { useStore, verifyChain } from '../../../mocks/store';

export function AuditTrail({ scope, title, desc }) {
  const s = useStore(); const toast = useToast(); const [res, setRes] = useState(null); const c = s.cases.find((x) => x.id === s.ctx.caseId);
  const rows = (scope === 'case' ? s.audit.filter((a) => a.caseId === c.id) : s.audit).slice().reverse();
  return <><Head title={title ?? (scope === 'case' ? 'Case audit trail' : 'Audit logs')} desc={desc ?? (scope === 'case' ? `Immutable record of every action on ${c.id}.` : 'Record of user and system actions.')} acts={<><Btn icon="dl" onClick={() => download('audit.csv', csv(['Time', 'Actor', 'Action', 'Object', 'IP', 'Result', 'Hash'], rows.map((a) => [a.at, a.actor, a.action, a.object, a.ip, a.result, a.hash])))}>Export log</Btn><Btn kind="pri" icon="shield" onClick={() => { const r = verifyChain(s.audit); setRes(r); toast(r.ok ? 'Integrity verified' : 'Integrity check failed', r.ok ? 'ok' : 'bad'); }}>Verify integrity</Btn></>} />
    {res && <Note k={res.ok ? 'ok' : 'bad'} icon="shield">{res.ok ? `All ${res.n} entries verified. Hash chain intact, no gaps.` : `Chain broken at entry ${res.at}.`}</Note>}
    <Card><DataTable exportName="audit" search="Search by actor, action or object" searchText={(a) => a.actor + a.action + a.object} rows={rows} size={10} filters={[{ label: 'Actor', options: [...new Set(s.audit.map((a) => a.actor))], test: (a, v) => a.actor === v }, { label: 'Result', options: ['Success', 'Failed'], test: (a, v) => a.result === v }]} cols={[{ h: 'Time (UTC)', render: (a) => fdt(a.at), val: (a) => a.at }, { h: 'Actor', render: (a) => a.actor, val: (a) => a.actor }, { h: 'Action', render: (a) => a.action }, { h: 'Object', render: (a) => a.object }, { h: 'IP', render: (a) => a.ip }, { h: 'Result', render: (a) => <Status s={a.result} /> }, { h: 'Entry hash', render: (a) => <span className="mono">{a.hash.slice(0, 4)}…{a.hash.slice(-4)}</span> }]} /><div style={{ marginTop: 14 }}><Note k="ok" icon="shield">Entries are append-only and keccak-256 hash-chained. Edits and deletions are not possible.</Note></div></Card><AnchorCard /></>;
}

export default AuditTrail;
