import { useState } from 'react';
import { Btn, Card, Empty, Head, Note, Status, useToast } from '../../../components/ui';
import { download, fd, fdt, isAddr, sh } from '../../../lib/format';
import { TN, walletProfile } from '../../../lib/risk';
import { act, can, useStore } from '../../../mocks/store';

const API = import.meta.env.VITE_API_URL || '';

async function exportReport(body, fmt) {
  const res = await fetch(`${API}/api/v1/reports/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, fmt }),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const ext = { pdf: 'pdf', csv: 'csv', json: 'json' }[fmt] || 'txt';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${body.title}.${ext}`; a.click();
  URL.revokeObjectURL(url);
}

export function ReportPreview() {
  const s = useStore(); const toast = useToast();
  const [exporting, setExporting] = useState(null);
  const r = s.reports.find((x) => x.id === s.ctx.report) || s.reports[0]; if (!r) return <Empty title="No reports yet" />;
  const isW = r.type === 'Wallet' && isAddr(r.subject); const p = isW ? walletProfile(r.subject) : null; const c = r.type === 'Case' ? s.cases.find((x) => x.id === r.subject) : null;
  const body = {
    'Executive summary': isW ? `Wallet ${r.subject} has a risk score of ${p.score} (${TN[p.tier]}). Principal drivers: ${p.report.factors.slice(0, 2).map((f) => f.name).join(' and ') || 'none found'}.` : c ? `${c.id}: ${c.title}. Status ${c.status}, priority ${c.priority}, assigned to ${c.assignee || 'nobody'}. ${c.desc}` : `${r.title} for ${r.subject}, generated ${fd(r.date)}. ${s.cases.length} cases, ${s.alerts.length} alerts, ${s.watchlists.length} watchlists in scope.`,
    'Risk score explanation': isW ? p.report.factors.map((f) => `${f.name}: ${f.calc}`).join('; ') + `. Total ${p.score} (capped at 100).` : 'Score = sum of factor points (sanctions, mixer, ransomware, scam exposure with distance and amount factors; behaviour; counterparties; cross-chain; new wallet), capped at 100.',
    'Evidence register': c ? s.evidence.filter((e) => e.caseId === c.id).map((e) => `${e.id} ${e.title} (${e.status})`).join('; ') || 'No evidence recorded.' : isW ? p.evidence.map((e) => e.text).join('; ') : 'See case records.',
    'Transaction summary': isW ? `${p.txs.length} transactions in the observation window.` : 'Not applicable to this report type.',
    'Counterparty analysis': isW ? p.cps.slice(0, 5).map((x) => `${sh(x.a)} (${x.n} txs)`).join('; ') : 'Not applicable to this report type.',
    'Methodology and limitations': 'Scores are risk indicators, not legal conclusions. Labels depend on provider coverage; attribution of mixed funds uses stated assumptions (proportional, FIFO, temporal).',
  };
  const final = r.status === 'Final';
  const exportPayload = {
    title: r.title,
    sections: r.sections.map((x) => ({ heading: x, content: body[x] })),
    meta: { org: s.settings.orgName, subject: r.subject, generated_by: r.by, date: fd(r.date), report_id: r.id },
  };
  const handleExport = (fmt) => async () => {
    setExporting(fmt);
    try { await exportReport(exportPayload, fmt); }
    catch { toast('Export failed', 'error'); }
    finally { setExporting(null); }
  };
  return <><Head title={r.id} desc={`${r.title} · generated ${fdt(r.date)} UTC`} badge={<Status s={r.status} />} acts={<>
    <Btn icon="print" onClick={() => window.print()}>Print</Btn>
    <Btn icon="dl" disabled={exporting === 'pdf'} onClick={handleExport('pdf')}>{exporting === 'pdf' ? '…' : 'Download PDF'}</Btn>
    <Btn icon="dl" disabled={exporting === 'csv'} onClick={handleExport('csv')}>{exporting === 'csv' ? '…' : 'CSV'}</Btn>
    <Btn icon="dl" disabled={exporting === 'json'} onClick={handleExport('json')}>{exporting === 'json' ? '…' : 'JSON'}</Btn>
    <Btn kind="pri" icon="check" disabled={final || !can(s, 'approve_review') && s.session.role !== 'inv'} onClick={() => { act.reportStatus(r.id, 'Final'); toast('Report finalised'); }}>Finalise</Btn>
  </>} />
    <Card style={{ maxWidth: 860, padding: 36 }}><div className="mu sm">CONFIDENTIAL · {s.settings.orgName}</div><h1 style={{ fontSize: 24, margin: '6px 0 4px' }}>{r.title}</h1><div className="mu">Subject: <span className="mono">{r.subject}</span></div>{!final && <div style={{ margin: '14px 0' }}><Note k="warn">Draft. Finalise to lock the content.</Note></div>}
      {r.sections.map((x, i) => <section key={x} style={{ marginTop: 22 }}><h3>{i + 1}. {x}</h3><p style={{ color: '#334155', lineHeight: 1.6 }}>{body[x]}</p></section>)}</Card></>;
}

export default ReportPreview;
