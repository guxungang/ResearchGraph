// 投影：夹具快照 + 样机本地模拟事件 → 当前对象视图。
// 与方案 §9.3 一致：事件是真源，当前对象是由事件计算出的投影；界面只读取投影。
import type {
  ActorRef, ArtifactVersion, Branch, CapabilityManifest, Checkpoint, Claim, ContextBundle, Decision, Event, Evidence, ExperimentRun, Grant,
  GraphEdge, Project, ProjectSnapshot, Proposal, ReadingBrief, ResearchUnit, ReviewRecord, SessionBinding,
} from '@rw/contracts';
import type { StageAExtensions } from '@fixtures/src/extension-types.ts';

export type { StageAExtensions };
export type AnyEntity = { id: string; revision: number; updated_at?: string } & Record<string, unknown>;

/** 样机在浏览器里模拟的事件：只存在于本机浏览器存储，不写入任何项目。 */
export interface LocalEvent {
  seq: number;
  at: string;
  type: string;
  actor: ActorRef;
  summary: string;
  entities: AnyEntity[];
  refs: string[];
  projectRevisionAfter: number;
}

export interface Flags {
  deferred: Record<string, { at: string; reason: string }>;
  infoRequests: { id: string; targetId: string; text: string; at: string }[];
  feedback: { briefId: string; revision: number; kind: string; at: string }[];
  ruleDemos: { at: string; action: string; status: number; code: string; message: string }[];
}
export const emptyFlags = (): Flags => ({ deferred: {}, infoRequests: [], feedback: [], ruleDemos: [] });

export interface TimelineEntry {
  seq: number;
  at: string;
  type: string;
  actor: ActorRef;
  summary: string;
  entityIds: string[];
  related: string[];
  local: boolean;
  correlation: string;
}

export interface Model {
  snapshot: ProjectSnapshot;
  ext: StageAExtensions;
  local: LocalEvent[];
  flags: Flags;
  project: Project;
  branches: Branch[];
  units: ResearchUnit[];
  edges: GraphEdge[];
  claims: Claim[];
  evidence: Evidence[];
  decisions: Decision[];
  artifacts: ArtifactVersion[];
  runs: ExperimentRun[];
  checkpoints: Checkpoint[];
  proposals: Proposal[];
  reviews: ReviewRecord[];
  sessions: SessionBinding[];
  caps: CapabilityManifest[];
  contexts: ContextBundle[];
  briefs: ReadingBrief[];
  grants: Grant[];
  byId: Map<string, AnyEntity>;
  /** 每个对象所有已知修订（来自事件节选、当前快照与本地模拟事件），按修订号升序。 */
  history: Map<string, AnyEntity[]>;
  timeline: TimelineEntry[];
  lastSeq: number;
}

const COLLECTIONS = {
  brn: 'branches', unt: 'units', edg: 'edges', clm: 'claims', evd: 'evidence', dec: 'decisions', art: 'artifacts', run: 'runs', ckp: 'checkpoints',
  pro: 'proposals', rev: 'reviews', ses: 'sessions', cap: 'caps', ctx: 'contexts', brf: 'briefs', grt: 'grants',
} as const;

const SNAPSHOT_KEYS: Record<string, keyof ProjectSnapshot> = {
  branches: 'branches', units: 'research_units', edges: 'graph_edges', claims: 'claims', evidence: 'evidence', decisions: 'decisions', artifacts: 'artifact_versions',
  runs: 'experiment_runs', checkpoints: 'checkpoints', proposals: 'proposals', reviews: 'reviews', sessions: 'session_bindings', caps: 'capability_manifests',
  contexts: 'context_bundles', briefs: 'reading_briefs', grants: 'grants',
};

const addRevision = (history: Map<string, AnyEntity[]>, e: AnyEntity) => {
  const list = history.get(e.id) ?? [];
  if (!list.some((x) => x.revision === e.revision)) list.push(e);
  list.sort((a, b) => a.revision - b.revision);
  history.set(e.id, list);
};

export function buildModel(snapshot: ProjectSnapshot, ext: StageAExtensions, local: LocalEvent[], flags: Flags): Model {
  const byId = new Map<string, AnyEntity>();
  const history = new Map<string, AnyEntity[]>();

  // 事件节选中的历史修订
  for (const ev of snapshot.events as Event[]) for (const e of ev.payload.after_entities as unknown as AnyEntity[]) addRevision(history, e);

  // 当前快照
  const put = (e: AnyEntity) => {
    byId.set(e.id, e);
    addRevision(history, e);
  };
  put(snapshot.project as unknown as AnyEntity);
  for (const key of Object.values(SNAPSHOT_KEYS)) for (const e of snapshot[key] as unknown as AnyEntity[]) put(e);

  // 本地模拟事件（按顺序应用；更高修订覆盖投影）
  for (const ev of local) {
    for (const e of ev.entities) {
      const cur = byId.get(e.id);
      if (!cur || e.revision >= cur.revision) byId.set(e.id, e);
      addRevision(history, e);
    }
  }

  const collect = <T,>(prefix: keyof typeof COLLECTIONS) =>
    [...byId.values()].filter((e) => e.id.startsWith(`${prefix}_`)) as unknown as T[];

  // 审阅的当前性由目标对象的当前修订计算（AC-021）
  const reviews = collect<ReviewRecord>('rev').map((r) => {
    const target = byId.get(r.target_id);
    return { ...r, is_current: !!target && target.revision === r.reviewed_revision };
  });

  const timeline: TimelineEntry[] = [
    ...(snapshot.events as Event[]).map((ev) => ({
      seq: ev.event_seq,
      at: ev.occurred_at,
      type: ev.event_type,
      actor: ev.actor,
      summary: ev.payload.summary,
      entityIds: [ev.payload.subject_id, ...(ev.payload.after_entities as unknown as AnyEntity[]).map((e) => e.id)],
      related: ev.payload.related_entity_ids,
      local: false,
      correlation: ev.correlation_quality,
    })),
    ...local.map((ev) => ({
      seq: ev.seq,
      at: ev.at,
      type: ev.type,
      actor: ev.actor,
      summary: ev.summary,
      entityIds: ev.entities.map((e) => e.id),
      related: ev.refs,
      local: true,
      correlation: 'exact',
    })),
  ].sort((a, b) => a.seq - b.seq);

  return {
    snapshot,
    ext,
    local,
    flags,
    project: byId.get(snapshot.project.id) as unknown as Project,
    branches: collect<Branch>('brn'),
    units: collect<ResearchUnit>('unt'),
    edges: collect<GraphEdge>('edg'),
    claims: collect<Claim>('clm'),
    evidence: collect<Evidence>('evd'),
    decisions: collect<Decision>('dec'),
    artifacts: collect<ArtifactVersion>('art'),
    runs: collect<ExperimentRun>('run'),
    checkpoints: collect<Checkpoint>('ckp'),
    proposals: collect<Proposal>('pro'),
    reviews,
    sessions: collect<SessionBinding>('ses'),
    caps: collect<CapabilityManifest>('cap'),
    contexts: collect<ContextBundle>('ctx'),
    briefs: collect<ReadingBrief>('brf'),
    grants: collect<Grant>('grt'),
    byId,
    history,
    timeline,
    lastSeq: Math.max(snapshot.last_event_seq, ...local.map((e) => e.seq)),
  };
}

// ---------------------------------------------------------------- 查询辅助
export const get = <T,>(m: Model, id: string | null | undefined): T | undefined => (id ? (m.byId.get(id) as unknown as T) : undefined);

export const revisionAt = (m: Model, id: string, revision: number): AnyEntity | undefined => m.history.get(id)?.find((e) => e.revision === revision);

export const unitBrief = (m: Model, unitId: string): ReadingBrief | undefined => m.briefs.find((b) => b.unit_id === unitId);

/** 阅读说明引用的对象已有更新修订时，说明过时（方案 §5.6）。 */
export function staleRefs(m: Model, refs: { entity_id: string; revision: number }[]) {
  return refs
    .map((r) => ({ ...r, current: m.byId.get(r.entity_id)?.revision }))
    .filter((r) => r.current !== undefined && r.current !== r.revision);
}

export const runningSessionFor = (m: Model, unitId: string) =>
  m.sessions.find((s) => s.unit_id === unitId && ['pending', 'running', 'interrupt_requested'].includes(s.state));

export const activeSessions = (m: Model) => m.sessions.filter((s) => ['pending', 'running', 'interrupt_requested', 'unknown'].includes(s.state));

export const reviewsFor = (m: Model, targetId: string) =>
  m.reviews.filter((r) => r.target_id === targetId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

export const edgesTo = (m: Model, id: string, relation?: string) => m.edges.filter((e) => e.target_id === id && (!relation || e.relation === relation));
export const edgesFrom = (m: Model, id: string, relation?: string) => m.edges.filter((e) => e.source_id === id && (!relation || e.relation === relation));

export const capabilityOf = (m: Model, harnessInstanceId: string) => m.caps.find((c) => c.harness_instance_id === harnessInstanceId);

/** 主线当前路径：从根单元到焦点单元的 continues_to 链。 */
export function currentPath(m: Model): Set<string> {
  const path = new Set<string>();
  let cur = m.project.focus_unit_id;
  const lineage = m.edges.filter((e) => e.relation === 'continues_to' && e.state === 'active');
  while (cur && !path.has(cur)) {
    path.add(cur);
    const parent = lineage.find((e) => e.target_id === cur);
    cur = parent?.source_id ?? null;
  }
  return path;
}

/** 待审阅：对象有过审阅，但当前修订没有当前审阅（新修订不继承旧审阅）。 */
export function reviewQueue(m: Model) {
  const out: { id: string; revision: number; previous: number; previousStatus: string }[] = [];
  for (const e of [...m.units, ...m.briefs] as { id: string; revision: number }[]) {
    const rs = reviewsFor(m, e.id);
    if (!rs.length) continue;
    const current = rs.some((r) => r.is_current && (r.status !== 'unreviewed' || e.id.startsWith('brf_')));
    if (!current) out.push({ id: e.id, revision: e.revision, previous: rs[0].reviewed_revision, previousStatus: rs[0].status });
  }
  return out;
}

/** “待处理”中的事项：待决定、待处理的候选、待审阅。暂缓的不计入。 */
export function todo(m: Model) {
  const decisions = m.decisions.filter((d) => d.status === 'proposed' && !m.flags.deferred[d.id]);
  const decidedIds = new Set(decisions.map((d) => d.id));
  const proposals = m.proposals.filter(
    (p) => (p.status === 'candidate' || p.status === 'ready') && !m.flags.deferred[p.id] &&
      !p.commands.some((c) => c.kind === 'decide_decision' && decidedIds.has((c as { decision_id: string }).decision_id)),
  );
  const reviews = reviewQueue(m);
  return { decisions, proposals, reviews, count: decisions.length + proposals.length + reviews.length };
}
