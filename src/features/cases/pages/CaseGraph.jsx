import { Card, CaseGraph } from '../../../components/ui';
import { CW, useCase } from '../shared';

export function CGraph() {
  const [c, s] = useCase(); const fn = s.findings.filter((f) => f.caseId === c.id); const ev = s.evidence.filter((e) => e.caseId === c.id);
  const ws = c.subjects.filter((x) => x.kind === 'wallet').map((x) => x.ref); const txs = c.subjects.filter((x) => x.kind === 'tx').map((x) => x.ref);
  return <CW active="Graph"><Card title="Investigation graph" sub="Wallets, transactions, findings and evidence linked to this case"><CaseGraph wallets={ws} txs={txs} findings={fn.map((f) => f.id)} evidence={ev.slice(0, 6).map((e) => e.id)} /><div style={{ marginTop: 10 }}><div className="legend"><span><i style={{ background: '#DC2626' }} />Wallet</span><span><i style={{ background: '#475569' }} />Transaction</span><span><i style={{ background: '#EA580C' }} />Finding</span><span><i style={{ background: '#1769E0' }} />Evidence</span></div></div></Card></CW>;
}

export default CGraph;
