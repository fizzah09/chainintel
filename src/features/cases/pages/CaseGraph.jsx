import { Card } from '../../../components/ui';
import { CaseGraph } from '../../../components/graph/CaseGraph';
import { CW, useCase } from '../shared';

export function CGraph() {
  const [c, s] = useCase();
  const fn = s.findings.filter((f) => f.caseId === c.id);
  const ev = s.evidence.filter((e) => e.caseId === c.id);
  const ws = c.subjects.filter((x) => x.kind === 'wallet').map((x) => x.ref);
  const txs = c.subjects.filter((x) => x.kind === 'tx').map((x) => x.ref);

  return (
    <CW active="Graph">
      <Card title="Investigation graph" sub="Wallets, transactions, findings and evidence linked to this case">
        <CaseGraph
          wallets={ws}
          txs={txs}
          findings={fn.map((f) => f.id)}
          evidence={ev.slice(0, 6).map((e) => e.id)}
          height={560}
        />
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            ['#1f6feb', 'Primary wallet'],
            ['#58a6ff', 'Wallet'],
            ['#8b949e', 'Transaction'],
            ['#ea580c', 'Finding'],
            ['#3b82f6', 'Evidence'],
          ].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: l === 'Transaction' ? 2 : '50%', background: c }} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </Card>
    </CW>
  );
}

export default CGraph;
