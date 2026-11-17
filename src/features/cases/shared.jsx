import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../app/config/paths';
import { Btn, Card, Chip, Modal, Prio, SelectIn, Stack, Status, Stepper, Tabs, TextArea, TextIn, Timeline, useToast } from '../../components/ui';
import { fd } from '../../lib/format';
import { STAGES, act, can, nextOf, stageIdx, useStore } from '../../mocks/store';

export const TABS = [['Overview', 'CaseDetails'], ['Subjects', 'CaseSubjects'], ['Evidence', 'CaseEvidence'], ['Findings', 'CaseFindings'], ['Graph', 'CaseRelGraph'], ['Tasks', 'CaseTasks'], ['Notes', 'CaseNotes'], ['Communication', 'CaseComms'], ['Review', 'CaseReview'], ['Timeline', 'CaseTimeline']];

export const useCase = (forceStatus) => { const s = useStore(); let c = s.cases.find((x) => x.id === s.ctx.caseId); if (forceStatus) c = s.cases.find((x) => x.status === forceStatus) || c; return [c || s.cases[0], s]; };

export const assignees = (s) => s.users.filter((u) => u.status === 'Active' && ['inv', 'cm'].includes(u.role)).map((u) => u.name);

export function CaseHead({ active, forceStatus, dialog }) {
  const [c, s] = useCase(forceStatus); const nav = useNavigate(); const toast = useToast();
  const [dlg, setDlg] = useState(dialog || null); const [v, setV] = useState({}); const [err, setErr] = useState('');
  const edit = can(s, 'create_case'); const idx = stageIdx(c); const nx = nextOf(c);
  const close = () => { setDlg(null); setV({}); setErr(''); };
  const run = (r) => { if (!r.ok) toast(r.error, 'bad'); else toast(r.status === 'Under Review' ? 'Submitted for review' : `Moved to ${r.status}`); };
  const ov = s.tasks.filter((t) => t.caseId === c.id && t.status !== 'Completed' && t.due && new Date(t.due) < new Date()).length;
  return <>
    <Card style={{ padding: 22 }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div><div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><span className="mono mu">{c.id}</span><Status s={c.status} /><Prio p={c.priority} /></div><h1 style={{ fontSize: 22, marginTop: 6 }}>{c.title}</h1><div className="mu" style={{ marginTop: 6, display: 'flex', gap: 18, flexWrap: 'wrap' }}><span>Assignee: {c.assignee || 'Unassigned'}</span><span>Opened {fd(c.opened)}</span><span>Due {c.due ? fd(c.due) : '—'}</span><span>Subjects: {c.subjects.length}</span></div></div>
      <div className="acts"><Btn icon="edit" disabled={!edit || c.status === 'Closed'} onClick={() => { setV({ title: c.title, priority: c.priority, due: c.due ? c.due.slice(0, 10) : '' }); setDlg('edit'); }}>Edit</Btn><Btn icon="users" disabled={!edit || c.status === 'Closed'} onClick={() => { setV({ who: c.assignee || assignees(s)[0] }); setDlg('reassign'); }}>Reassign</Btn><Btn icon="report" disabled={!can(s, 'export_reports')} onClick={() => { act.setCtx({ reportSubject: c.id }); nav(pathOf('ReportBuilder')); }}>Generate report</Btn>
        {c.status === 'Closed' ? <Btn kind="pri" icon="refresh" disabled={!edit} onClick={() => setDlg('reopen')}>Reopen</Btn> : c.status === 'Decision' ? <Btn kind="pri" icon="check" disabled={!edit} onClick={() => setDlg('close')}>Close case</Btn> : c.status === 'Escalated' ? <Btn kind="pri" disabled={!edit} onClick={() => act.resolveEscalation(c.id)}>Resolve escalation</Btn> : c.status === 'On Hold' ? <Btn kind="pri" disabled={!edit} onClick={() => act.hold(c.id)}>Resume</Btn> : nx ? <Btn kind="pri" icon={nx === 'Under Review' ? 'send' : 'arrow'} disabled={!edit} onClick={() => run(act.advance(c.id))}>{nx === 'Under Review' ? 'Submit for review' : `Move to ${nx}`}</Btn> : null}
        {!['Closed', 'Escalated', 'On Hold'].includes(c.status) && <><Btn kind="danger" icon="flag" disabled={!edit} onClick={() => setDlg('escalate')}>Escalate</Btn><Btn icon="pause" disabled={!edit} onClick={() => act.hold(c.id)}>Hold</Btn></>}</div></div>
      <div style={{ marginTop: 20 }}><Stepper steps={STAGES} cur={idx} /></div>{ov > 0 && <div style={{ marginTop: 12 }}><Chip k="bad">{ov} overdue task{ov > 1 ? 's' : ''}</Chip></div>}</Card>
    {active && <Tabs items={TABS.map(([l, k]) => [l, pathOf(k)])} active={active} />}
    <Modal open={dlg === 'edit'} title="Edit case" onClose={close} footer={<><Btn onClick={close}>Cancel</Btn><Btn kind="pri" onClick={() => { if (!(v.title || '').trim()) return setErr('Title is required.'); act.caseUpdate(c.id, { title: v.title.trim(), priority: v.priority, due: v.due ? new Date(v.due).toISOString() : '' }, 'Edited case'); toast('Case updated'); close(); }}>Save</Btn></>}><Stack gap={14}><TextIn label="Title" req value={v.title} onChange={(x) => setV({ ...v, title: x })} err={err} /><SelectIn label="Priority" value={v.priority} onChange={(x) => setV({ ...v, priority: x })} options={['Low', 'Medium', 'High', 'Critical']} /><TextIn label="Due date" type="date" value={v.due} onChange={(x) => setV({ ...v, due: x })} /></Stack></Modal>
    <Modal open={dlg === 'reassign'} title="Reassign this case" onClose={close} footer={<><Btn onClick={close}>Cancel</Btn><Btn kind="pri" onClick={() => { act.assign(c.id, v.who || assignees(s)[0]); toast('Case reassigned'); close(); }}>Reassign</Btn></>}><p className="mu" style={{ marginTop: 0 }}>The new assignee is notified and the previous assignee loses edit access.</p><SelectIn label="New assignee" req value={v.who || c.assignee || assignees(s)[0]} onChange={(x) => setV({ ...v, who: x })} options={assignees(s)} /></Modal>
    <Modal open={dlg === 'escalate'} title="Escalate this case?" onClose={close} footer={<><Btn onClick={close}>Cancel</Btn><Btn kind="dg" onClick={() => { if (!(v.reason || '').trim()) return setErr('A reason is required.'); act.escalate(c.id, v.to || 'Compliance Manager', v.reason.trim()); toast('Case escalated'); close(); }}>Escalate</Btn></>}><p className="mu" style={{ marginTop: 0 }}>The Compliance Manager and Platform Admin will be notified. Escalations are recorded in the audit trail.</p><Stack gap={12}><SelectIn label="Escalate to" req value={v.to || 'Compliance Manager'} onChange={(x) => setV({ ...v, to: x })} options={['Compliance Manager', 'Platform Admin']} /><TextArea label="Reason" req value={v.reason} onChange={(x) => setV({ ...v, reason: x })} err={err} /></Stack></Modal>
    <Modal open={dlg === 'close'} title="Close this case?" onClose={close} footer={<><Btn onClick={close}>Cancel</Btn><Btn kind="pri" onClick={() => { if (!(v.note || '').trim()) return setErr('A closing note is required.'); act.close(c.id, v.dec || 'Suspicious activity confirmed', v.note.trim()); toast('Case closed'); close(); }}>Close case</Btn></>}><p className="mu" style={{ marginTop: 0 }}>Closing records the final decision and locks evidence. You can reopen the case later with a reason.</p><Stack gap={12}><SelectIn label="Final decision" req value={v.dec || 'Suspicious activity confirmed'} onChange={(x) => setV({ ...v, dec: x })} options={['Suspicious activity confirmed', 'No suspicious activity', 'Insufficient evidence', 'Referred to authorities']} /><TextArea label="Closing note" req value={v.note} onChange={(x) => setV({ ...v, note: x })} err={err} /></Stack></Modal>
    <Modal open={dlg === 'reopen'} title="Reopen this case?" onClose={close} footer={<><Btn onClick={close}>Cancel</Btn><Btn kind="pri" onClick={() => { if (!(v.reason || '').trim()) return setErr('A reason is required.'); act.reopen(c.id, v.reason.trim()); toast('Case reopened'); close(); }}>Reopen case</Btn></>}><p className="mu" style={{ marginTop: 0 }}>A reason is required. The case returns to Open and the original closure stays in the history.</p><TextArea label="Reason for reopening" req value={v.reason} onChange={(x) => setV({ ...v, reason: x })} err={err} /></Modal></>;
}

export const CW = ({ active, children, forceStatus, dialog }) => <><CaseHead active={active} forceStatus={forceStatus} dialog={dialog} />{children}</>;

// ---- wizard ----
export const WSTEPS = ['Basics', 'Subjects', 'Priority', 'Assignment', 'Evidence', 'Review', 'Submit'];

export const ARTE = ['Risk snapshot', 'Transaction set', 'Graph export', 'Counterparty report'];

export const sha = async (buf) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buf))).map((b) => b.toString(16).padStart(2, '0')).join('');

export const overdue = (t) => t.status !== 'Completed' && t.due && new Date(t.due) < new Date();
