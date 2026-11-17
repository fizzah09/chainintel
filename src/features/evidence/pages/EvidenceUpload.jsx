import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Check, Head, Icon, Row, SelectIn, SetRow, TextIn, useToast } from '../../../components/ui';
import { ARTE, sha, useCase } from '../../cases/shared';
import { act } from '../../../mocks/store';

export function EvUpload() {
  const [c, s] = useCase(); const nav = useNavigate(); const toast = useToast(); const [file, setFile] = useState(null); const [title, setTitle] = useState(''); const [type, setType] = useState('Document'); const [sys, setSys] = useState([]); const [err, setErr] = useState('');
  const pick = (f) => { if (!f) return; if (f.size > 25 * 1024 * 1024) { setErr('File is larger than 25 MB.'); setFile(null); return; } setErr(''); setFile(f); if (!title) setTitle(f.name); };
  const attach = async () => {
    if (!file && !sys.length) return setErr('Choose a file or at least one system item.');
    if (file && !title.trim()) return setErr('Enter a title.');
    if (file) { const h = await sha(await file.arrayBuffer()); act.addEvidence({ caseId: c.id, title: title.trim(), type, source: 'Upload', content: `${file.name}|${file.size}`, hash: h, fileName: file.name, size: file.size }); }
    sys.forEach((t) => act.addEvidence({ caseId: c.id, title: t, type: t, content: t + c.id }));
    toast('Evidence attached'); nav(pathOf('CaseEvidence'));
  };
  return <><Head title="Add evidence" desc={`Attach files or system-generated artefacts to ${c.id}. Each item is hashed and recorded in the audit trail.`} />
    <Row><Card title="Upload file" style={{ flex: '2 1 520px' }}><label style={{ display: 'block', border: '2px dashed var(--ln2)', borderRadius: 4, padding: '44px 20px', textAlign: 'center', background: '#F8FAFD', cursor: 'pointer' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}><div style={{ color: 'var(--pri)' }}><Icon n="upload" s={32} /></div><b style={{ display: 'block', marginTop: 8 }}>{file ? file.name : 'Drag and drop files here'}</b><div className="mu sm">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF, PNG, CSV, JSON up to 25 MB'}</div><input type="file" style={{ display: 'none' }} onChange={(e) => pick(e.target.files[0])} aria-label="Choose file" /><div style={{ marginTop: 14 }}><span className="btn"><Icon n="folder" s={16} />Browse files</span></div></label><div style={{ height: 16 }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}><TextIn label="Title" req value={title} onChange={setTitle} /><SelectIn label="Evidence type" req value={type} onChange={setType} options={['Document', 'Graph image', 'Transaction set', 'External source', 'Risk snapshot']} /></div>
      {err && <div className="hint err" role="alert" style={{ marginTop: 10 }}>{err}</div>}<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}><Btn onClick={() => nav(pathOf('CaseEvidence'))}>Cancel</Btn><Btn kind="pri" icon="check" onClick={attach}>Attach to case</Btn></div></Card>
      <Card title="Add from system" style={{ flex: '1 1 360px' }}>{ARTE.map((a) => <SetRow key={a} title={a}><Check on={sys.includes(a)} onChange={(v) => setSys(v ? [...sys, a] : sys.filter((x) => x !== a))} label={a} /></SetRow>)}</Card></Row></>;
}

export default EvUpload;
