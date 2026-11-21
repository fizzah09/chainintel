/**
 * CaseGraph — 3D WebGL investigation graph for a case.
 * Fetches real on-chain data for each wallet subject via the graph API,
 * then overlays finding/evidence nodes.
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { sh } from '../../lib/format';
import { labelOf } from '../../lib/risk';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ── node colors by type ───────────────────────────────────────────────────
const NODE_COLOR = {
  wallet_primary: '#388bfd',
  wallet:         '#58a6ff',
  tx:             '#8b949e',
  finding:        '#f97316',
  evidence:       '#3b82f6',
};

function nodeColor(n) {
  return NODE_COLOR[n.type] ?? '#484f58';
}

function nodeMesh(n) {
  const r = n.type === 'wallet_primary' ? 6 : n.type === 'finding' ? 4.5 : n.type === 'evidence' ? 4 : n.type === 'tx' ? 2.5 : 4;
  const color = nodeColor(n);

  if (n.type === 'tx') {
    const geo = new THREE.OctahedronGeometry(r, 0);
    return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.85 }));
  }

  if (n.type === 'finding') {
    const geo = new THREE.ConeGeometry(r, r * 1.5, 6);
    return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.9 }));
  }

  if (n.type === 'evidence') {
    const geo = new THREE.BoxGeometry(r * 1.4, r * 1.8, r * 0.5);
    return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.85 }));
  }

  // sphere for all wallet types
  const geo = new THREE.SphereGeometry(r, 14, 14);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.92 }));

  if (n.type === 'wallet_primary') {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r + 2.5, 0.6, 8, 28),
      new THREE.MeshBasicMaterial({ color: '#1f6feb', transparent: true, opacity: 0.5 }),
    );
    mesh.add(ring);
  }
  return mesh;
}

function linkColor(l) {
  if (l.kind === 'finding')  return 'rgba(249,115,22,0.45)';
  if (l.kind === 'evidence') return 'rgba(59,130,246,0.4)';
  if (l.isError)             return 'rgba(248,81,73,0.6)';
  return 'rgba(88,166,255,0.4)';
}

function nodeTooltip(n) {
  return `<div style="background:#161b22;border:1px solid #30363d;border-radius:5px;padding:5px 9px;font:11px ui-monospace,monospace;color:#e6edf3;max-width:220px;word-break:break-all">${n.name}</div>`;
}

// ── merge graph data from multiple wallet fetches ─────────────────────────
async function fetchWalletGraph(addr, depth = 1) {
  try {
    const r = await fetch(`${API_BASE}/api/v1/graph/1/${addr}?depth=${depth}&minValueEth=0`, {
      headers: { 'X-Session-Id': 'case-graph' },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function buildGraphData(wallets, txs, findings, evidence, onChainData) {
  const nodeMap = new Map();
  const links = [];

  const addNode = (id, props) => {
    if (!nodeMap.has(id)) nodeMap.set(id, { id, ...props });
  };

  if (onChainData) {
    // Use real on-chain nodes
    for (const n of onChainData.nodes ?? []) {
      addNode(n.id, {
        type: n.root ? 'wallet_primary' : 'wallet',
        name: n.label || sh(n.id),
        labelInfo: n.labelInfo,
      });
    }
    for (const e of onChainData.edges ?? []) {
      links.push({ source: e.from, target: e.to, kind: 'wallet', isError: !!e.isError, value: e.value ?? 0 });
    }
  } else {
    // Fallback: static layout from case subjects
    const primary = wallets[0];
    if (primary) {
      addNode(primary, { type: 'wallet_primary', name: labelOf(primary) !== 'Unknown' ? labelOf(primary) : sh(primary) });
      wallets.slice(1).forEach((a) => {
        addNode(a, { type: 'wallet', name: labelOf(a) !== 'Unknown' ? labelOf(a) : sh(a) });
        links.push({ source: primary, target: a, kind: 'wallet' });
      });
      txs.forEach((h) => {
        addNode(h, { type: 'tx', name: sh(h, 8, 6) });
        links.push({ source: primary, target: h, kind: 'tx' });
      });
    }
  }

  // Always overlay findings and evidence
  const primary = wallets[0];
  findings.forEach((fid) => {
    addNode(fid, { type: 'finding', name: fid });
    if (primary) links.push({ source: primary, target: fid, kind: 'finding' });
    if (wallets[1]) links.push({ source: wallets[1], target: fid, kind: 'finding' });
  });
  evidence.forEach((eid) => {
    addNode(eid, { type: 'evidence', name: eid });
    if (primary) links.push({ source: primary, target: eid, kind: 'evidence' });
  });

  return { nodes: Array.from(nodeMap.values()), links };
}

export function CaseGraph({ wallets = [], txs = [], findings = [], evidence = [], height = 440 }) {
  const fgRef = useRef(null);
  const [graphData, setGraphData] = useState(() => buildGraphData(wallets, txs, findings, evidence, null));
  const [status, setStatus] = useState('');

  // Fetch real on-chain data for the primary wallet
  useEffect(() => {
    if (!wallets.length) return;
    setStatus('Fetching on-chain data…');
    fetchWalletGraph(wallets[0], 1).then((data) => {
      if (data) {
        setStatus(`${(data.nodes ?? []).length} addresses · ${(data.edges ?? []).length} transactions`);
      } else {
        setStatus('Using case subjects (backend unavailable)');
      }
      setGraphData(buildGraphData(wallets, txs, findings, evidence, data));
    });
  }, [wallets.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zoom to fit after warm-up
  useEffect(() => {
    const t = setTimeout(() => {
      fgRef.current?.zoomToFit(500, 80);
    }, 1500);
    return () => clearTimeout(t);
  }, [graphData]);

  const nodeObj = useCallback(nodeMesh, []);

  if (!wallets.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', borderRadius: 6, color: '#484f58', fontSize: 13 }}>
        No wallet subjects linked to this case.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', background: '#0d1117', borderRadius: 6, overflow: 'hidden', height }}>
      {status && (
        <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 10, fontSize: 11, color: '#8b949e', background: 'rgba(13,17,23,0.8)', padding: '3px 8px', borderRadius: 4 }}>
          {status}
        </div>
      )}

      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#0d1117"
        nodeThreeObject={nodeObj}
        nodeLabel={nodeTooltip}
        linkColor={linkColor}
        linkWidth={0.8}
        linkDirectionalArrowLength={2.5}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={linkColor}
        linkDirectionalParticles={(l) => (l.kind === 'wallet' ? 1 : 0)}
        linkDirectionalParticleWidth={0.8}
        linkDirectionalParticleColor={linkColor}
        showNavInfo={false}
        enableNodeDrag
        enableNavigationControls
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.35}
        warmupTicks={100}
        cooldownTicks={120}
        onEngineStop={() => fgRef.current?.zoomToFit(400, 80)}
      />
    </div>
  );
}

export default CaseGraph;
