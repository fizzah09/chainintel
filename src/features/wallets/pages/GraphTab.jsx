/**
 * GraphTab — Arkham-style full-screen wallet relationship graph.
 * Layout: left sidebar (nodes + stats) | 3D graph | right sidebar (transfers)
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { WalletGraph } from '../../../components/graph/WalletGraph';
import { W, useWallet } from '../shared';
import { sh, usd } from '../../../lib/format';
import { act, getState } from '../../../mocks/store';

const isAddr = (s) => /^0x[a-fA-F0-9]{40}$/.test(s);

function shortAddr(a) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

// ── small entity chip for transfer table rows ────────────────────────────────
function EntityChip({ id, labelInfo }) {
  const name = labelInfo?.name ?? null;
  const initials = name ? name.slice(0, 2).toUpperCase() : (id ?? '').slice(2, 4).toUpperCase();
  const color = name ? '#388bfd' : '#484f58';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
        {initials}
      </div>
      <div style={{ minWidth: 0 }}>
        {name && <div style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>}
        <div style={{ fontSize: 10, color: '#8b949e', fontFamily: 'ui-monospace,monospace', whiteSpace: 'nowrap' }}>{shortAddr(id)}</div>
      </div>
    </div>
  );
}

export function Graph() {
  const [p] = useWallet();
  const nav = useNavigate();

  const [inputAddr, setInputAddr] = useState(p.address || '');
  const [loadedAddr, setLoadedAddr] = useState('');
  const [depth, setDepth] = useState('1');
  const [minVal, setMinVal] = useState('0');
  const [chainId, setChainId] = useState('1');

  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [sel, setSel] = useState(null);

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // right panel
  const [txTab, setTxTab] = useState('ALL');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const session = getState().session;
  const apiBase = import.meta.env.VITE_API_URL || '';

  const buildGraph = useCallback(async (addr) => {
    if (!isAddr(addr)) { setError('Enter a valid 0x… address.'); return; }
    setLoading(true); setError(''); setStatus('Fetching on-chain data…'); setSel(null);
    try {
      const params = new URLSearchParams({ depth, minValueEth: minVal });
      const res = await fetch(`${apiBase}/api/v1/graph/${chainId}/${addr}?${params}`, { headers: { 'X-Session-Id': session || 'anonymous' } });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const nodes = (data.nodes || []).map((n) => ({ id: n.id, label: n.label, root: n.root || false, labelInfo: n.labelInfo || null }));
      const edges = (data.edges || []).map((e) => ({ from: e.from, to: e.to, value: e.value || 0, asset: e.asset || 'ETH', isError: e.isError || false, title: `${(e.value || 0).toFixed(6)} ${e.asset || 'ETH'}` }));
      setGraphNodes(nodes); setGraphEdges(edges); setLoadedAddr(addr);
      const labelled = nodes.filter((n) => n.labelInfo).length;
      const chain = { 1: 'Ethereum', 10: 'Optimism', 137: 'Polygon', 8453: 'Base', 42161: 'Arbitrum' }[Number(chainId)] || `chain ${chainId}`;
      setStatus(`${nodes.length} nodes · ${edges.length} transfers · ${labelled} labelled · ${chain}`);
    } catch (err) {
      setError('Failed to fetch on-chain data. Check the address and try again.');
      setStatus('');
    } finally { setLoading(false); }
  }, [depth, minVal, chainId, session, apiBase]);

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current || !p.address) return;
    initRef.current = true;
    buildGraph(p.address);
  }, [p.address]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── derived stats ─────────────────────────────────────────────────────────
  const rootNode = graphNodes.find((n) => n.root);
  const totalVol = graphEdges.reduce((s, e) => s + (e.value || 0), 0);
  const assets = [...new Set(graphEdges.map((e) => e.asset))];
  const chains = 1;

  // filter transfers for right panel
  const nodeById = Object.fromEntries(graphNodes.map((n) => [n.id, n]));
  const filteredEdges = graphEdges.filter((e) => {
    if (txTab === 'INCOMING') return e.to === loadedAddr;
    if (txTab === 'OUTGOING') return e.from === loadedAddr;
    if (txTab === 'SELF') return e.from === loadedAddr && e.to === loadedAddr;
    return true;
  });

  return (
    <W active="Graph">
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#010409', color: '#e6edf3' }}>

        {/* ── Top address bar ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#0d1117', borderBottom: '1px solid #21262d', alignItems: 'center', flexShrink: 0 }}>
          <input
            value={inputAddr}
            onChange={(e) => setInputAddr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buildGraph(inputAddr)}
            placeholder="0x… address"
            style={{ flex: '1 1 240px', background: '#161b22', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'ui-monospace,monospace', outline: 'none' }}
          />
          <select value={depth} onChange={(e) => setDepth(e.target.value)} style={ss}>
            <option value="0">Depth 0</option><option value="1">Depth 1</option><option value="2">Depth 2</option>
          </select>
          <select value={chainId} onChange={(e) => setChainId(e.target.value)} style={ss}>
            <option value="1">Ethereum</option><option value="10">Optimism</option><option value="137">Polygon</option><option value="8453">Base</option><option value="42161">Arbitrum</option>
          </select>
          <select value={minVal} onChange={(e) => setMinVal(e.target.value)} style={ss}>
            <option value="0">Any value</option><option value="0.001">≥ 0.001 ETH</option><option value="0.01">≥ 0.01 ETH</option><option value="0.1">≥ 0.1 ETH</option>
          </select>
          <button onClick={() => buildGraph(inputAddr)} disabled={loading} style={{ background: loading ? '#1a4731' : '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
            {loading ? 'Building…' : 'Visualize'}
          </button>
          {(error || status) && (
            <span style={{ fontSize: 11, color: error ? '#f85149' : '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>{error || status}</span>
          )}
        </div>

        {/* ── 3-panel body ────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left sidebar */}
          {!leftCollapsed && (
            <div style={{ width: 260, flexShrink: 0, background: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #21262d' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Scratch</span>
                <button onClick={() => setLeftCollapsed(true)} style={iconBtn}>‹</button>
              </div>

              {/* overview stats */}
              {loadedAddr && (
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #21262d' }}>
                  <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Overview</div>
                  {[
                    ['Transfer Volume', usd(totalVol * 2500)],
                    ['Tokens', assets.length],
                    ['Transfers', graphEdges.length],
                    ['Chains', chains],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #161b22' }}>
                      <span style={{ fontSize: 11, color: '#8b949e' }}>{k}</span>
                      <span style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* node list */}
              <div style={{ padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nodes {graphNodes.length > 0 && graphNodes.length}</span>
                </div>
                {graphNodes.length === 0 && (
                  <div style={{ fontSize: 11, color: '#484f58', padding: '8px 0' }}>Enter an address above to start.</div>
                )}
                {graphNodes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setSel(n.id === sel ? null : n.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 6px', borderRadius: 5, cursor: 'pointer', background: sel === n.id ? '#161b22' : 'transparent', marginBottom: 1 }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: n.root ? '#1f6feb' : (n.labelInfo ? '#d29922' : '#30363d'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(n.labelInfo?.name ?? n.id ?? '').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#e6edf3', fontWeight: n.root ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {n.labelInfo?.name ?? shortAddr(n.id)}
                      </div>
                      {n.labelInfo && <div style={{ fontSize: 10, color: '#8b949e', fontFamily: 'ui-monospace,monospace' }}>{shortAddr(n.id)}</div>}
                    </div>
                    {n.root && <span style={{ fontSize: 9, color: '#388bfd', fontWeight: 700, flexShrink: 0 }}>ROOT</span>}
                    <button
                      onClick={(ev) => { ev.stopPropagation(); act.openWallet(n.id); nav(pathOf('WalletOverview')); }}
                      style={{ ...iconBtn, fontSize: 10, color: '#58a6ff' }} title="Open wallet">↗</button>
                  </div>
                ))}
              </div>

              {/* follow / save */}
              {loadedAddr && (
                <div style={{ marginTop: 'auto', padding: '10px 12px', borderTop: '1px solid #21262d', display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#8b949e', flex: 1 }}>Not saved</span>
                  <button style={{ ...actionBtn, padding: '4px 10px', fontSize: 11 }}>Follow</button>
                  <button style={{ ...actionBtn, padding: '4px 10px', fontSize: 11, background: '#238636', border: 'none' }}>Save</button>
                </div>
              )}
            </div>
          )}

          {/* show left toggle when collapsed */}
          {leftCollapsed && (
            <button onClick={() => setLeftCollapsed(false)} style={{ ...iconBtn, width: 20, background: '#0d1117', borderRight: '1px solid #21262d', borderRadius: 0, height: '100%' }}>›</button>
          )}

          {/* ── Graph ─────────────────────────────────────────────────── */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Legend overlay */}
            <div style={{ position: 'absolute', bottom: 44, left: 10, zIndex: 10, background: 'rgba(13,17,23,0.85)', border: '1px solid #21262d', borderRadius: 6, padding: '6px 10px', display: 'flex', gap: 12, backdropFilter: 'blur(6px)' }}>
              {[['#58a6ff', '●', 'Root'], ['#d29922', '●', 'Labeled'], ['#484f58', '●', 'Unknown']].map(([c, s, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: c, fontSize: 10 }}>{s}</span>
                  <span style={{ fontSize: 10, color: '#8b949e' }}>{l}</span>
                </div>
              ))}
              <div style={{ width: 1, background: '#21262d' }} />
              {[['rgba(63,185,80,0.9)', '→', 'Outgoing'], ['rgba(248,81,73,0.9)', '→', 'Error']].map(([c, s, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: c, fontSize: 10 }}>{s}</span>
                  <span style={{ fontSize: 10, color: '#8b949e' }}>{l}</span>
                </div>
              ))}
            </div>

            {!loading && graphNodes.length === 0 && !error && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#484f58', gap: 10 }}>
                <div style={{ fontSize: 32 }}>⬡</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8b949e' }}>Enter a wallet address to visualize</div>
                <div style={{ fontSize: 11 }}>Fetches live on-chain transactions from Blockscout</div>
              </div>
            )}
            <WalletGraph nodes={graphNodes} edges={graphEdges} sel={sel} onSel={setSel} />
          </div>

          {/* Right sidebar — transfers */}
          {!rightCollapsed && (
            <div style={{ width: 420, flexShrink: 0, background: '#0d1117', borderLeft: '1px solid #21262d', display: 'flex', flexDirection: 'column' }}>
              {/* tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
                <button onClick={() => setRightCollapsed(true)} style={{ ...iconBtn, borderRadius: 0, borderRight: '1px solid #21262d', padding: '0 8px' }}>›</button>
                {['ALL', 'INCOMING', 'OUTGOING', 'SELF'].map((t) => (
                  <button key={t} onClick={() => setTxTab(t)} style={{ flex: 1, padding: '8px 4px', background: 'none', border: 'none', borderBottom: txTab === t ? '2px solid #388bfd' : '2px solid transparent', color: txTab === t ? '#e6edf3' : '#8b949e', fontSize: 11, fontWeight: txTab === t ? 700 : 400, cursor: 'pointer', letterSpacing: '0.04em' }}>{t}</button>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, color: '#8b949e' }}>
                  {Math.ceil(filteredEdges.length / 25)} / {Math.ceil(graphEdges.length / 25)}
                </div>
              </div>

              {/* col headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr 1fr 70px 50px 60px', gap: 4, padding: '5px 10px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
                {['', 'FROM', 'TO', 'VAL', 'TOKEN', 'USD'].map((h) => (
                  <div key={h} style={{ fontSize: 10, color: '#8b949e', fontWeight: 700, letterSpacing: '0.06em' }}>{h}</div>
                ))}
              </div>

              {/* rows */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredEdges.length === 0 && (
                  <div style={{ padding: 20, fontSize: 12, color: '#484f58', textAlign: 'center' }}>
                    {graphEdges.length === 0 ? 'Build a graph to see transfers.' : 'No transfers match this filter.'}
                  </div>
                )}
                {filteredEdges.slice(0, 100).map((e, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px 1fr 1fr 70px 50px 60px', gap: 4, padding: '5px 10px', borderBottom: '1px solid #161b22', alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={(ev) => ev.currentTarget.style.background = '#161b22'}
                    onMouseLeave={(ev) => ev.currentTarget.style.background = 'transparent'}
                  >
                    {/* direction arrow */}
                    <div style={{ fontSize: 10, color: e.isError ? '#f85149' : e.from === loadedAddr ? '#3fb950' : '#58a6ff', fontWeight: 700 }}>
                      {e.from === loadedAddr ? '↑' : '↓'}
                    </div>
                    {/* from */}
                    <EntityChip id={e.from} labelInfo={nodeById[e.from]?.labelInfo} />
                    {/* to */}
                    <EntityChip id={e.to} labelInfo={nodeById[e.to]?.labelInfo} />
                    {/* value */}
                    <div style={{ fontSize: 11, color: '#e6edf3', fontFamily: 'ui-monospace,monospace', textAlign: 'right' }}>
                      {(e.value || 0).toFixed(4)}
                    </div>
                    {/* token */}
                    <div style={{ fontSize: 11, color: '#8b949e' }}>{e.asset || 'ETH'}</div>
                    {/* usd */}
                    <div style={{ fontSize: 11, color: '#e6edf3', textAlign: 'right' }}>
                      {usd((e.value || 0) * 2500)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rightCollapsed && (
            <button onClick={() => setRightCollapsed(false)} style={{ ...iconBtn, width: 20, background: '#0d1117', borderLeft: '1px solid #21262d', borderRadius: 0, height: '100%' }}>‹</button>
          )}
        </div>

        {/* ── Bottom toolbar ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: '#0d1117', borderTop: '1px solid #21262d', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#484f58' }}>100%</span>
          {['−', '+', '⊡'].map((icon) => (
            <button key={icon} style={toolBtn}>{icon}</button>
          ))}
          <div style={{ width: 1, height: 14, background: '#21262d', margin: '0 2px' }} />
          <button style={toolBtn}>🔒</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#8b949e' }}>Display Options</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8b949e' }}>
            Panels
            <div style={{ width: 28, height: 15, borderRadius: 8, background: '#238636', position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', right: 2, top: 2, width: 11, height: 11, borderRadius: '50%', background: '#fff' }} />
            </div>
          </div>
        </div>
      </div>
    </W>
  );
}

const ss = {
  background: '#161b22', color: '#e6edf3', border: '1px solid #30363d',
  borderRadius: 6, padding: '6px 8px', fontSize: 11, cursor: 'pointer', outline: 'none',
};

const iconBtn = {
  background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer',
  padding: '4px 6px', borderRadius: 4, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const actionBtn = {
  background: 'none', border: '1px solid #30363d', color: '#e6edf3',
  borderRadius: 5, cursor: 'pointer', fontWeight: 600,
};

const toolBtn = {
  background: '#161b22', border: '1px solid #30363d', color: '#8b949e',
  borderRadius: 4, padding: '3px 7px', fontSize: 12, cursor: 'pointer',
};

export default Graph;
