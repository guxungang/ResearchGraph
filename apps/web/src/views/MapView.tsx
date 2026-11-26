// 研究路线：图与列表两种等价视图（方案 §6.2、§6.7）。点击节点只改变“正在查看”，不改变执行绑定（AC-015）。
import { useEffect, useMemo, useRef, useState } from 'react';
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, ReactFlowProvider, useNodesInitialized, useNodesState, useReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';
import type { ResearchUnit } from '@rw/contracts';
import { WORK_STATE, label } from '@rw/domain';
import { storageKey, useStore } from '../data/store.tsx';
import { currentPath, get, runningSessionFor, unitDepth, type Model } from '../data/model.ts';
import { branchShort, routeColor } from '../data/format.ts';
import { navigate, type Route } from '../router.ts';
import { Badge } from '../components/ui.tsx';

const PINS_KEY = storageKey('map.pins');
const LAYOUT_KEY = storageKey('map.layout');
const NODE_W = 210;
const NODE_H = 92;

type UnitNodeData = { unit: ResearchUnit; onPath: boolean; viewing: boolean; executing: boolean; color: string };
type CollapsedData = { name: string; count: number; onExpand: () => void };

function UnitNode({ data }: NodeProps<Node<UnitNodeData>>) {
  const u = data.unit;
  return (
    <div
      className={`unit-node ${data.onPath ? 'on-path' : ''} ${data.viewing ? 'selected' : ''}`}
      style={{ borderTopColor: data.color }}
      aria-label={`${u.title}，${label(WORK_STATE, u.work_state).text}${data.executing ? '，正在执行' : ''}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="t">{u.title}</div>
      <div className="m">
        <Badge table={WORK_STATE} value={u.work_state} />
        {data.executing ? <span className="marker executing">正在执行</span> : null}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function CollapsedNode({ data }: NodeProps<Node<CollapsedData>>) {
  return (
    <div className="collapsed-node">
      <Handle type="target" position={Position.Top} />
      <div>{data.name}</div>
      <div className="row spread" style={{ marginTop: 4 }}>
        <span className="small">已折叠 {data.count} 项</span>
        <button type="button" className="ghost sm nodrag" onClick={data.onExpand}>展开</button>
      </div>
    </div>
  );
}

const nodeTypes = { unit: UnitNode, collapsed: CollapsedNode };
const elk = new ELK();

function useGraph(m: Model, hidden: Set<string>, viewing: string | null) {
  return useMemo(() => {
    const path = currentPath(m);
    const nodes: Node[] = m.units
      .filter((u) => !hidden.has(u.branch_id))
      .map((u) => ({
        id: u.id, type: 'unit', position: { x: 0, y: 0 }, width: NODE_W, height: NODE_H,
        data: { unit: u, onPath: path.has(u.id), viewing: viewing === u.id, executing: !!runningSessionFor(m, u.id), color: routeColor(m, u.branch_id) } satisfies UnitNodeData,
      }));
    for (const b of m.branches.filter((x) => hidden.has(x.id))) {
      nodes.push({ id: `collapsed:${b.id}`, type: 'collapsed', position: { x: 0, y: 0 }, width: NODE_W, height: 70, data: { name: branchShort(m, b.id), count: m.units.filter((u) => u.branch_id === b.id).length, onExpand: () => {} } });
    }
    const resolve = (unitId: string) => {
      const u = m.units.find((x) => x.id === unitId);
      if (!u) return null;
      return hidden.has(u.branch_id) ? `collapsed:${u.branch_id}` : u.id;
    };
    const edges: Edge[] = [];
    const seen = new Set<string>();
    for (const g of m.edges.filter((e) => e.relation === 'continues_to' && e.state === 'active')) {
      const s = resolve(g.source_id), t = resolve(g.target_id);
      if (!s || !t || s === t || seen.has(`${s}>${t}`)) continue;
      seen.add(`${s}>${t}`);
      const onPath = path.has(g.source_id) && path.has(g.target_id);
      edges.push({ id: g.id, source: s, target: t, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: onPath ? 2.5 : 1.5, stroke: routeColor(m, g.branch_id ?? '') } });
    }
    for (const g of m.edges.filter((e) => e.relation === 'uses' && e.target_id.startsWith('evd_'))) {
      const user = m.units.find((u) => u.id === g.source_id);
      const ev = m.evidence.find((e) => e.id === g.target_id);
      const producer = ev?.experiment_run_id ? m.runs.find((r) => r.id === ev.experiment_run_id)?.unit_id : undefined;
      const pu = producer ? m.units.find((u) => u.id === producer) : undefined;
      if (!user || !pu || pu.branch_id === user.branch_id) continue;
      const s = resolve(pu.id), t = resolve(user.id);
      if (!s || !t || seen.has(`reuse:${s}>${t}`)) continue;
      seen.add(`reuse:${s}>${t}`);
      edges.push({ id: `reuse-${g.id}`, source: s, target: t, label: '证据复用', style: { strokeDasharray: '6 4', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.Arrow } });
    }
    if (viewing) {
      for (const g of m.edges.filter((e) => e.relation === 'depends_on' && e.state === 'active' && (e.source_id === viewing || e.target_id === viewing))) {
        const s = resolve(g.source_id), t = resolve(g.target_id);
        if (s && t) edges.push({ id: `dep-${g.id}`, source: s, target: t, type: 'straight', label: '依赖', style: { strokeDasharray: '2 4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } });
      }
    }
    return { nodes, edges };
  }, [m, hidden, viewing]);
}

function Canvas({ m, hidden, setHidden }: { m: Model; hidden: Set<string>; setHidden: (s: Set<string>) => void }) {
  const { viewingUnitId, setViewingUnitId } = useStore();
  const graph = useGraph(m, hidden, viewingUnitId);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [layoutKey, setLayoutKey] = useState('');
  const lastPositions = useRef(new Map<string, { x: number; y: number }>(Object.entries(JSON.parse(localStorage.getItem(LAYOUT_KEY) ?? '{}'))));
  const flow = useReactFlow();

  // 只在拓扑变化时布局；已有节点保持原位，新节点放在上游节点附近（新增记录不重排整张图）。
  const topology = graph.nodes.map((n) => n.id).join('|') + '#' + graph.edges.filter((e) => !e.id.startsWith('dep-')).map((e) => e.id).join('|');
  useEffect(() => {
    let cancelled = false;
    const pins: Record<string, { x: number; y: number }> = JSON.parse(localStorage.getItem(PINS_KEY) ?? '{}');
    elk
      .layout({
        id: 'root',
        layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.layered.spacing.nodeNodeBetweenLayers': '56', 'elk.spacing.nodeNode': '40', 'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF' },
        children: graph.nodes.map((n) => ({ id: n.id, width: n.width ?? NODE_W, height: n.height ?? NODE_H })),
        edges: graph.edges.filter((e) => !e.id.startsWith('dep-') && !e.id.startsWith('reuse-')).map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
      })
      .then((res) => {
        if (cancelled) return;
        const elkPos = new Map(res.children?.map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));
        const prev = lastPositions.current;
        const placed = new Map<string, { x: number; y: number }>();
        const overlaps = (p: { x: number; y: number }) => [...placed.values()].some((q) => Math.abs(q.x - p.x) < NODE_W + 20 && Math.abs(q.y - p.y) < NODE_H + 20);
        for (const n of graph.nodes) if (pins[n.id] ?? prev.get(n.id)) placed.set(n.id, pins[n.id] ?? prev.get(n.id)!);
        for (const n of graph.nodes) {
          if (placed.has(n.id)) continue;
          const parent = graph.edges.find((e) => e.target === n.id && placed.has(e.source));
          if (prev.size && parent) {
            const base = placed.get(parent.source)!;
            let c = { x: base.x, y: base.y + NODE_H + 56 };
            while (overlaps(c)) c = { x: c.x + NODE_W + 40, y: c.y };
            placed.set(n.id, c);
          } else placed.set(n.id, elkPos.get(n.id) ?? { x: 0, y: 0 });
        }
        lastPositions.current = placed;
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(Object.fromEntries(placed)));
        setNodes(graph.nodes.map((n) => ({ ...n, position: placed.get(n.id)! })));
        setLayoutKey(topology);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topology]);

  const initialized = useNodesInitialized();
  useEffect(() => {
    if (initialized && layoutKey) flow.fitView({ padding: 0.05, minZoom: 0.6, maxZoom: 0.95 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, layoutKey]);

  useEffect(() => {
    if (layoutKey !== topology) return;
    setNodes((cur) =>
      cur.map((n) => {
        const fresh = graph.nodes.find((g) => g.id === n.id);
        if (!fresh) return n;
        if (n.type !== 'collapsed') return { ...n, data: fresh.data };
        const branchId = n.id.replace('collapsed:', '');
        return { ...n, data: { ...(fresh.data as CollapsedData), onExpand: () => { const next = new Set(hidden); next.delete(branchId); setHidden(next); } } };
      }),
    );
  }, [graph, layoutKey, topology, hidden, setHidden, setNodes]);

  return (
    <div className="map-canvas">
      <ReactFlow
        nodes={nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, n) => n.type === 'unit' && setViewingUnitId(n.id)}
        onNodeDoubleClick={(_, n) => n.type === 'unit' && navigate(`#/unit/${n.id}`)}
        onSelectionChange={({ nodes: sel }) => sel[0]?.type === 'unit' && setViewingUnitId(sel[0].id)}
        onNodeDragStop={(_, n) => {
          lastPositions.current.set(n.id, n.position);
          const pins = JSON.parse(localStorage.getItem(PINS_KEY) ?? '{}');
          pins[n.id] = n.position;
          localStorage.setItem(PINS_KEY, JSON.stringify(pins));
        }}
        nodesConnectable={false}
        nodesFocusable
        edgesFocusable={false}
        minZoom={0.3}
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} position="top-right" />
      </ReactFlow>
      <div className="map-legend" aria-hidden="true">
        <span><span className="legend-line" />派生</span>
        <span><span className="legend-line dashed" />证据复用</span>
        <span><span className="legend-line dotted" />依赖</span>
      </div>
    </div>
  );
}

function ListView({ m }: { m: Model }) {
  const { setViewingUnitId } = useStore();
  // 有多个上级时取最深的一条，保证每个单元都排在它的所有来源之后
  const order = (branchId: string) => m.units.filter((u) => u.branch_id === branchId).sort((a, b) => unitDepth(m, a.id) - unitDepth(m, b.id));
  return (
    <div style={{ maxWidth: 820 }}>
      {m.branches.map((b) => (
        <section key={b.id} style={{ marginBottom: 24 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="swatch" style={{ background: routeColor(m, b.id) }} aria-hidden="true" />
            <h2 style={{ fontSize: '1rem' }}>{b.name}</h2>
          </div>
          <div className="rows">
            {order(b.id).map((u) => (
              <a key={u.id} className="rowi" href={`#/unit/${u.id}`} onClick={() => setViewingUnitId(u.id)}>
                <div className="grow title">{u.title}</div>
                {runningSessionFor(m, u.id) ? <span className="marker executing">正在执行</span> : null}
                <Badge table={WORK_STATE} value={u.work_state} />
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function MapView({ route, listMode = false }: { route: Route; listMode?: boolean }) {
  const { model: m, viewingUnitId, setViewingUnitId } = useStore();
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(m.branches.filter((b) => b.state === 'closed').map((b) => b.id)));
  const list = listMode || route.query.get('view') === 'list';
  const select = route.query.get('select');
  useEffect(() => {
    if (select) setViewingUnitId(select);
  }, [select, setViewingUnitId]);
  const viewing = get<ResearchUnit>(m, viewingUnitId);
  const session = viewing ? runningSessionFor(m, viewing.id) : undefined;

  return (
    <div>
      <div className="row spread page-title">
        <div>
          <h1>研究路线</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>{m.ext.home?.summary.question ?? m.project.goal}</p>
        </div>
        <div className="row">
          <div className="seg" role="group" aria-label="显示方式">
            <button type="button" aria-pressed={!list} onClick={() => navigate('#/map')}>图</button>
            <button type="button" aria-pressed={list} onClick={() => navigate('#/map?view=list')}>列表</button>
          </div>
          <a className="btn" href="#/compare">比较路线</a>
        </div>
      </div>

      {list ? (
        <ListView m={m} />
      ) : (
        <>
          <div className="row" style={{ marginBottom: 12 }} role="group" aria-label="显示哪些路线">
            {m.branches.map((b) => {
              const on = !hidden.has(b.id);
              return (
                <label key={b.id} className={`route-toggle ${on ? '' : 'off'}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => {
                      const next = new Set(hidden);
                      if (e.target.checked) next.delete(b.id);
                      else next.add(b.id);
                      setHidden(next);
                    }}
                  />
                  <span className="swatch" style={{ background: routeColor(m, b.id) }} aria-hidden="true" />
                  {branchShort(m, b.id)}
                </label>
              );
            })}
          </div>
          <div className="map-shell">
            <ReactFlowProvider>
              <Canvas m={m} hidden={hidden} setHidden={setHidden} />
            </ReactFlowProvider>
            <aside className="card" aria-label="选中的研究单元" style={{ margin: 0 }}>
              {viewing ? (
                <div className="stack">
                  <div className="label">{branchShort(m, viewing.branch_id)}</div>
                  <h2>{viewing.title}</h2>
                  <div className="row">
                    <Badge table={WORK_STATE} value={viewing.work_state} />
                    {session ? <span className="marker executing">正在执行</span> : null}
                  </div>
                  <p className="small" style={{ color: 'var(--text-2)' }}>{viewing.question}</p>
                  <a className="btn primary" href={`#/unit/${viewing.id}`} style={{ alignSelf: 'flex-start' }}>打开</a>
                </div>
              ) : (
                <p className="muted small">点一下图中的方块，在这里看简介；双击直接打开。</p>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
