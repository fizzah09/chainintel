import { Btn, Card, Empty, Head, Note, Status, useToast } from '../../../components/ui';
import { download, fd, fdt, isAddr, sh } from '../../../lib/format';
import { TN, walletProfile } from '../../../lib/risk';
import { act, can, useStore } from '../../../mocks/store';

export function ReportPreview() {
  const s = useStore(); const toast = useToast(); const r = s.reports.find((x) => x.id === s.ctx.report) || s.reports[0]; if (!r) return <Empty title="No reports yet" />;
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
  return <><Head title={r.title} desc={`${r.id} · generated ${fdt(r.date)} by ${r.by}`} badge={<Status s={r.status} />} acts={<><Btn icon="print" onClick={() => window.print()}>Print / PDF</Btn><Btn icon="dl" onClick={() => download(`${r.id}.txt`, `${r.title}\n${r.id}\n\n` + r.sections.map((x) => `${x}\n${body[x]}\n`).join('\n'))}>Download</Btn><Btn kind="pri" icon="check" disabled={final || !can(s, 'approve_review') && s.session.role !== 'inv'} onClick={() => { act.reportStatus(r.id, 'Final'); toast('Report finalised'); }}>Finalise</Btn></>} />
    <Card style={{ maxWidth: 860, padding: 36 }}><div className="mu sm">CONFIDENTIAL · {s.settings.orgName}</div><h1 style={{ fontSize: 24, margin: '6px 0 4px' }}>{r.title}</h1><div className="mu">Subject: <span className="mono">{r.subject}</span></div>{!final && <div style={{ margin: '14px 0' }}><Note k="warn">Draft. Finalise to lock the content.</Note></div>}
      {r.sections.map((x, i) => <section key={x} style={{ marginTop: 22 }}><h3>{i + 1}. {x}</h3><p style={{ color: '#334155', lineHeight: 1.6 }}>{body[x]}</p></section>)}</Card></>;
}

export default ReportPreview;
