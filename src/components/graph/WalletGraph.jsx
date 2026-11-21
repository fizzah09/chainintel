/**
 * WalletGraph — 3D WebGL force-directed transaction graph.
 * Uses react-force-graph-3d (Three.js / WebGL) for a true 3D experience.
 */
import { useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

function makeLinkLabel(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 36;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(22,27,34,0.88)';
  ctx.beginPath(); ctx.rect(0, 0, 160, 36); ctx.fill();
  ctx.font = 'bold 13px ui-monospace,monospace';
  ctx.fillStyle = '#c9d1d9';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 80, 18);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(18, 4, 1);
  return sprite;
}

/** Convert our node/edge arrays to the format ForceGraph3D expects. */
function toGraphData(nodes, edges) {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      name: n.label || n.id,
      root: !!n.root,
      labeled: !!n.labelInfo,
      labelName: n.labelInfo?.name ?? null,
      risk: n.risk ?? null,
    })),
    links: edges.map((e, i) => {
      const root = nodes.find((n) => n.root)?.id ?? null;
      return {
        id: `l${i}`,
        source: e.from,
        target: e.to,
        value: e.value ?? 0,
        asset: e.asset ?? 'ETH',
        isError: !!e.isError,
        title: e.title ?? '',
        _outgoing: root ? e.from === root : false,
        _incoming: root ? e.to === root : false,
      };
    }),
  };
}

function nodeColor(n) {
  if (n.root) return '#58a6ff';
  if (n.labeled) return '#d29922';
  return '#8b949e';
}

// WalletGraph receives a `rootId` prop so links can be colored by direction
function linkColor(l) {
  if (l.isError) return 'rgba(248,81,73,0.75)';
  if (l._outgoing) return 'rgba(63,185,80,0.75)';   // green = outgoing from root
  if (l._incoming) return 'rgba(88,166,255,0.75)';  // blue  = incoming to root
  return 'rgba(139,148,158,0.5)';
}

function linkWidth(l) {
  if (!l.value) return 0.5;
  return Math.min(0.5 + Math.log10(1 + l.value) * 0.8, 4);
}

function nodeThreeObject(n) {
  const radius = n.root ? 7 : n.labeled ? 5 : 3.5;
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshLambertMaterial({
    color: nodeColor(n),
    transparent: true,
    opacity: 0.92,
  });
  const mesh = new THREE.Mesh(geo, mat);

  // Glow ring for root node
  if (n.root) {
    const ringGeo = new THREE.TorusGeometry(radius + 3, 0.8, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#1f6feb', transparent: true, opacity: 0.5 });
    mesh.add(new THREE.Mesh(ringGeo, ringMat));
  }

  return mesh;
}

/**
 * @param {{
 *   nodes: Array<{ id: string, label: string, root?: boolean, labelInfo?: object|null, risk?: number }>,
 *   edges: Array<{ from: string, to: string, value?: number, isError?: boolean, asset?: string, title?: string }>,
 *   sel?: string,
 *   onSel?: (id: string) => void,
 *   style?: React.CSSProperties,
 * }} props
 */
export function WalletGraph({ nodes = [], edges = [], sel, onSel, style }) {
  const fgRef = useRef(null);

  const graphData = toGraphData(nodes, edges);

  // Focus selected node
  useEffect(() => {
    if (!sel || !fgRef.current) return;
    const node = graphData.nodes.find((n) => n.id === sel);
    if (!node) return;
    const distance = 80;
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
    fgRef.current.cameraPosition(
      { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
      node,
      800,
    );
  }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick = useCallback((node) => {
    if (onSel) onSel(node.id);
  }, [onSel]);

  const nodeLabel = useCallback((n) => {
    const lines = [n.id];
    if (n.labelName) lines.unshift(n.labelName);
    return `<div style="background:#161b22;border:1px solid #30363d;border-radius:6px;padding:6px 10px;font:12px ui-monospace,monospace;color:#e6edf3;max-width:260px;word-break:break-all">${lines.join('<br/>')}</div>`;
  }, []);

  const linkLabel = useCallback((l) => {
    return `<div style="background:#161b22;border:1px solid #30363d;border-radius:6px;padding:5px 9px;font:11px ui-monospace,monospace;color:#8b949e">${l.title || `${l.value?.toFixed(5)} ${l.asset}`}</div>`;
  }, []);

  return (
    <div style={{ background: '#0d1117', width: '100%', height: '100%', ...style }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#0d1117"
        nodeThreeObject={nodeThreeObject}
        nodeLabel={nodeLabel}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={linkColor}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(l) => linkWidth(l) * 0.6}
        linkDirectionalParticleColor={linkColor}
        linkLabel={linkLabel}
        linkThreeObjectExtend={true}
        linkThreeObject={(l) => {
          const v = l.value ?? 0;
          if (v < 0.0001) return null;
          const text = v >= 1 ? `${v.toFixed(3)} ${l.asset}` : `${v.toFixed(5)} ${l.asset}`;
          return makeLinkLabel(text);
        }}
        linkPositionUpdate={(obj, { start, end }) => {
          if (!obj) return;
          obj.position.set((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
        }}
        onNodeClick={handleNodeClick}
        nodeColor={nodeColor}
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={false}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.25}
        warmupTicks={60}
        cooldownTicks={200}
        onEngineStop={() => fgRef.current?.zoomToFit(400, 80)}
      />
    </div>
  );
}

export default WalletGraph;
