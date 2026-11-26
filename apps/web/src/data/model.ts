// 投影：夹具快照 + 样机本地模拟事件 → 当前对象视图。
// 与方案 §9.3 一致：事件是真源，当前对象是由事件计算出的投影；界面只读取投影。
import type {
  ActorRef, ArtifactVersion, Branch, CapabilityManifest, Checkpoint, Claim, ContextBundle, Decision, Event, Evidence, ExperimentRun, Grant,
  GraphEdge, Project, ProjectSnapshot, Proposal, ReadingBrief, ResearchUnit, ReviewRecord, SessionBinding,
} from '@rw/contracts';
import type { StageAExtensions } from '@fixtures/src/extension-types.ts';
import { reviewCurrency } from '@rw/domain';

export type { StageAExtensions };

/** 扩展数据缺省时补成空值；首页要点、路线比较、查看者可以不存在（界面会由状态整理）。 */
export function normalizeExt(raw: Partial<StageAExtensions> | null | undefined): StageAExtensions {
  const r = raw ?? {};
  return {
    extension_version: r.extension_version ?? 'none',
    notice: r.notice ?? '',
    display_names: r.display_names ?? {},
    short_names: r.short_names ?? {},
    evidence_limits: r.evidence_limits ?? [],
    one_liners: r.one_liners ?? {},
    run_results: r.run_results ?? {},
    contract_gaps: r.contract_gaps ?? [],
    viewer: r.viewer,
    home: r.home,
    connections: r.connections ?? [],
    attention_items: r.attention_items ?? [],
    glossary: r.glossary ?? [],
    unit_details: r.unit_details ?? {},
    branch_notes: r.branch_notes ?? {},
    comparison: r.comparison,
    reliability_curves: r.reliability_curves ?? [],
    rule_checks: r.rule_checks ?? {},
    test_materials: r.test_materials ?? {},
  };
}
export type AnyEntity = { id: string; revision: number; updated_at?: string } & Record<string, unknown>;

/**
 * 新建路线时“需要独立代码工作区”的请求。合同 v1.0.0 的路线对象没有这一字段（D-007），
 * 样机把请求记在事件上，界面一直显示“尚未创建”，直到真实系统回报工作区已建立。
 */
export interface WorktreeRequest {
  branch_id: string;
  unit_id: string;
  requested_at: string;
  status: 'requested';
}

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
  requests?: WorktreeRequest[];
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
  reviews: ReviewView[];
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
  worktreeRequests: WorktreeRequest[];
}

/** 审阅加上“被谁更正”：同一人对同一版本先后审阅时，旧的一条保留为历史。 */
export type ReviewView = ReviewRecord & { superseded_by: string | null };

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

export function buildModel(snapshot: ProjectSnapshot, rawExt: Partial<StageAExtensions> | null | undefined, local: LocalEvent[], flags: Flags): Model {
  const ext = normalizeExt(rawExt);
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

  // 审阅的当前性：目标对象的当前修订（AC-021），且同一人对同一版本以最新一条为准
  const rawReviews = collect<ReviewRecord>('rev');
  const currency = reviewCurrency(rawReviews, (id) => byId.get(id)?.revision);
  const reviews: ReviewView[] = rawReviews.map((r) => ({ ...r, ...currency.get(r.id)! }));

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
    worktreeRequests: local.flatMap((e) => e.requests ?? []),
  };
}

// ---------------------------------------------------------------- 查询辅助
export const get = <T,>(m: Model, id: string | null | undefined): T | undefined => (id ? (m.byId.get(id) as unknown as T) : undefined);

export const revisionAt = (m: Model, id: string, revision: number): AnyEntity | undefined => m.history.get(id)?.find((e) => e.revision === revision);

export const unitBrief = (m: Model, unitId: string): ReadingBrief | undefined => m.briefs.find((b) => b.unit_id === unitId);

/**
 * 说明引用的对象已有更新修订，或已经找不到时，说明过时（方案 §5.6）。
 * 找不到的对象记为 current = undefined：来源缺失不能当作“没有变化”。
 */
export function staleRefs(m: Model, refs: { entity_id: string; revision: number }[]) {
  return refs
    .map((r) => ({ ...r, current: m.byId.get(r.entity_id)?.revision as number | undefined }))
    .filter((r) => r.current !== r.revision);
}

export const runningSessionFor = (m: Model, unitId: string) =>
  m.sessions.find((s) => s.unit_id === unitId && ['pending', 'running', 'interrupt_requested'].includes(s.state));

export const activeSessions = (m: Model) => m.sessions.filter((s) => ['pending', 'running', 'interrupt_requested', 'unknown'].includes(s.state));

export const reviewsFor = (m: Model, targetId: string) =>
  m.reviews.filter((r) => r.target_id === targetId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

export const edgesTo = (m: Model, id: string, relation?: string) => m.edges.filter((e) => e.target_id === id && (!relation || e.relation === relation));
export const edgesFrom = (m: Model, id: string, relation?: string) => m.edges.filter((e) => e.source_id === id && (!relation || e.relation === relation));

export const capabilityOf = (m: Model, harnessInstanceId: string) => m.caps.find((c) => c.harness_instance_id === harnessInstanceId);

const lineageOf = (m: Model) => m.edges.filter((e) => e.relation === 'continues_to' && e.state === 'active');

/** 一个单元的全部来源：沿 continues_to 向上走过所有上级（多条路线汇合时，每条来源都算）。 */
export function ancestors(m: Model, unitId: string): Set<string> {
  const lineage = lineageOf(m);
  const out = new Set<string>();
  const stack = [unitId];
  while (stack.length) {
    const cur = stack.pop()!;
    if (out.has(cur)) continue;
    out.add(cur);
    for (const e of lineage) if (e.target_id === cur) stack.push(e.source_id);
  }
  return out;
}

/** 主线当前路径：焦点单元及其所有来源。 */
export const currentPath = (m: Model): Set<string> => (m.project.focus_unit_id ? ancestors(m, m.project.focus_unit_id) : new Set());

/** 单元在谱系中的深度：到根单元的最长路径（有多个上级时取最深的一条，保证排在所有来源之后）。 */
export function unitDepth(m: Model, unitId: string): number {
  const lineage = lineageOf(m);
  const memo = new Map<string, number>();
  const depth = (id: string, seen: Set<string>): number => {
    if (memo.has(id)) return memo.get(id)!;
    if (seen.has(id)) return 0;
    const parents = lineage.filter((e) => e.target_id === id).map((e) => e.source_id);
    const d = parents.length ? Math.max(...parents.map((p) => depth(p, new Set(seen).add(id)))) + 1 : 0;
    memo.set(id, d);
    return d;
  };
  return depth(unitId, new Set());
}

/** 一个对象当前修订上、你本人最新的审阅（没有则为空）。 */
export const currentReview = (m: Model, targetId: string) => reviewsFor(m, targetId).find((r) => r.is_current);

/**
 * 待审阅：对象有过审阅，但当前修订上还没有你的审阅结论（新修订不继承旧审阅）。
 * 你已经标“需要修改”的不在这里：那是在等新版本，见 changesRequested。
 */
export function reviewQueue(m: Model) {
  const out: { id: string; revision: number; previous: number; previousStatus: string }[] = [];
  for (const e of [...m.units, ...m.briefs] as { id: string; revision: number }[]) {
    const rs = reviewsFor(m, e.id);
    if (!rs.length) continue;
    const cur = rs.find((r) => r.is_current);
    const settled = cur && (cur.status !== 'unreviewed' || e.id.startsWith('brf_'));
    if (!settled) {
      const prev = rs.find((r) => r.status !== 'unreviewed') ?? rs[0];
      out.push({ id: e.id, revision: e.revision, previous: prev.reviewed_revision, previousStatus: prev.status });
    }
  }
  return out;
}

/** 你要求修改、正在等新版本的对象。它们不算你的待办，但要一直看得见，修改意见也要看得见。 */
export function changesRequested(m: Model) {
  return [...m.units, ...m.briefs]
    .map((e) => ({ id: e.id, revision: e.revision, review: currentReview(m, e.id) }))
    .filter((x): x is { id: string; revision: number; review: ReviewView } => x.review?.status === 'needs_changes');
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
