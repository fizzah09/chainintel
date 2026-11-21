import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Check, Head, Note, SelectIn, SetRow, TextIn, useToast } from '../../../components/ui';
import { Alerts } from '../../alerts/pages/AlertsDashboard';
import { ReportLibrary } from './ReportLibrary';
import { ReportPreview } from './ReportPreview';
import { SECS } from '../shared';
import { isAddr } from '../../../lib/format';
import { act, can, useStore } from '../../../mocks/store';

export function ReportBuilder() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const [v, setV] = useState({ type: 'Wallet', subject: s.ctx.reportSubject || s.ctx.wallet || '', title: '', secs: SECS.slice(0, 3).concat(SECS[5]) }); const [err, setErr] = useState({});
  const set = (k) => (x) => { setV({ ...v, [k]: x }); setErr({}); };
  const go = () => {
    const e = {}; if (v.type === 'Wallet' && !isAddr(v.subject.trim())) e.subject = 'Enter a valid wallet address.'; if (v.type === 'Case' && !s.cases.some((c) => c.id === v.subject)) e.subject = 'Choose an existing case.'; if (!v.secs.length) e.secs = 'Select at least one section.';
    if (!can(s, 'export_reports')) e.perm = 'Your role cannot generate reports.'; setErr(e); if (Object.keys(e).length) return;
    act.createReport({ title: v.title.trim() || (v.type === 'Wallet' ? 'Wallet risk assessment' : v.type === 'Case' ? `Case summary ${v.subject}` : `${v.type} report`), type: v.type, subject: v.subject || s.settings.orgName, sections: v.secs }); toast('Report generated'); nav(pathOf('ReportPreview'));
  };
  return <><Head title="Generate report" desc="Choose a template, scope and sections." /><Card title="Configuration" style={{ maxWidth: 860 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}><SelectIn label="Template" value={v.type} onChange={(x) => setV({ ...v, type: x, subject: x === 'Case' ? s.cases[0].id : x === 'Wallet' ? s.ctx.wallet : '' })} options={['Wallet', 'Case', 'Compliance', 'Alerts']} />
      {v.type === 'Case' ? <SelectIn label="Case" req value={v.subject} onChange={set('subject')} options={s.cases.map((c) => [c.id, `${c.id} · ${c.title}`])} err={err.subject} w="2 1 360px" /> : v.type === 'Wallet' ? <TextIn label="Wallet address" req value={v.subject} onChange={set('subject')} err={err.subject} w="2 1 360px" /> : <TextIn label="Scope" value={v.subject || s.settings.orgName} onChange={set('subject')} w="2 1 360px" />}</div><div style={{ height: 14 }} />
    <TextIn label="Title (optional)" value={v.title} onChange={set('title')} /><div style={{ marginTop: 18 }}><b style={{ fontSize: 13 }}>Sections</b>{SECS.map((x) => <SetRow key={x} title={x}><Check on={v.secs.includes(x)} onChange={(on) => set('secs')(on ? SECS.filter((y) => v.secs.includes(y) || y === x) : v.secs.filter((y) => y !== x))} label={x} /></SetRow>)}{err.secs && <div className="hint err">{err.secs}</div>}</div>
    {err.perm && <div style={{ marginTop: 12 }}><Note k="bad">{err.perm}</Note></div>}<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}><Btn onClick={() => nav(pathOf('ReportLibrary'))}>Cancel</Btn><Btn kind="pri" icon="report" onClick={go}>Generate report</Btn></div></Card></>;
}

export default ReportBuilder;
