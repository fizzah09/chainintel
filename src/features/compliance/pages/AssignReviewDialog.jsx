import { useState } from 'react';
import { Btn, Modal, useToast } from '../../../components/ui';
import { queueRows, open } from '../../../components/domain/workspace';
import { act, useStore } from '../../../mocks/store';

// CM "Update case": step 1 picks the stage (Review, Audit or Investigation); step 2 picks one or more people from that group.
const PHASES = [
  { key: 'Review', role: 'rev', label: 'Review', desc: 'Send the case for review. The case status becomes Under Review.', people: 'Reviewers' },
  { key: 'Audit', role: 'aud', label: 'Audit', desc: 'Audit the case records. The case stays in its current status.', people: 'Auditors' },
  { key: 'Investigation', role: 'inv', label: 'Investigation', desc: 'Investigate further. The case stays in its current status.', people: 'Investigators' },
];

export function AssignReviewDialog({ caseItem, onClose }) {
  const s = useStore(); const toast = useToast();
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('Review');
  const [picked, setPicked] = useState([]);
  const [due, setDue] = useState('');
  const [note, setNote] = useState('');

  const cfg = PHASES.find((p) => p.key === phase);
  const people = s.users.filter((u) => u.status === 'Active' && u.role === cfg.role);
  const load = (name) => s.cases.filter((c) => c.assignee === name && open(c)).length + queueRows(s).filter((c) => c.reviewer === name).length;
  const toggle = (name) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));
  const reset = () => { setStep(1); setPhase('Review'); setPicked([]); setDue(''); setNote(''); };
  const close = () => { reset(); onClose(); };

  const submit = () => {
    act.updateCaseTeam(caseItem.id, { phase, assignees: picked, due, note });
    toast(`${picked.length} ${cfg.people.toLowerCase()} assigned to ${caseItem.id}`);
    close();
  };

  const footer = step === 1
    ? <><Btn onClick={close}>Cancel</Btn><Btn kind="pri" onClick={() => { setPicked([]); setStep(2); }}>Next</Btn></>
    : <><Btn onClick={() => setStep(1)}>Back</Btn><Btn kind="pri" disabled={!picked.length} onClick={submit}>Save and assign</Btn></>;

  return <Modal open={!!caseItem} title="Update case" onClose={close} footer={footer}>
    {caseItem && <>
      <p className="mu" style={{ margin: '0 0 14px' }}>{caseItem.id} · {caseItem.title}</p>

      {step === 1 && <div className="fld">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Change the case status</span>
        {PHASES.map((p) => (
          <label key={p.key} className="set" style={{ cursor: 'pointer' }}>
            <span><input type="radio" name="phase" checked={phase === p.key} onChange={() => setPhase(p.key)} /> <b>{p.label}</b><span className="mu sm" style={{ display: 'block', marginLeft: 22 }}>{p.desc}</span></span>
          </label>
        ))}
      </div>}

      {step === 2 && <>
        <div className="fld" style={{ marginBottom: 14 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{cfg.people} for {cfg.label.toLowerCase()} (select one or more)</span>
          {people.map((u) => (
            <label key={u.name} className="set" style={{ cursor: 'pointer' }}>
              <span><input type="checkbox" checked={picked.includes(u.name)} onChange={() => toggle(u.name)} /> <b>{u.name}</b> <span className="mu sm">{u.team}</span></span>
              <span className="mu sm">{load(u.name)} open</span>
            </label>
          ))}
          {!people.length && <span className="mu sm">No active people in this group.</span>}
        </div>
        <div className="fld" style={{ marginBottom: 14 }}>
          <label htmlFor="rv-due">Due date</label>
          <input id="rv-due" className="in" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="fld">
          <label htmlFor="rv-note">Note (optional)</label>
          <textarea id="rv-note" className="in ta" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </>}
    </>}
  </Modal>;
}

export default AssignReviewDialog;
