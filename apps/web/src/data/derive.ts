// 由项目状态推出的展示内容（D-007）。界面上的待关注事项、路线卡片、交接材料都从这里取，
// 不再直接读手写的扩展数据：手写的说明只作为“写作时的版本”，依据的对象更新后标记为过时。
import type { ArtifactVersion, Branch, CapabilityManifest, Claim, Decision, Evidence, ExperimentRun, GraphEdge, Grant, Proposal, ResearchUnit } from '@rw/contracts';
import type { AttentionCheck, AttentionItem, DimKey, RevisionRef } from '@fixtures/src/extension-types.ts';
import { ASSESSMENT, BRANCH_STATE, DECISION, RUN_STATE, WORK_STATE, label } from '@rw/domain';
import { get, reviewQueue, reviewsFor, staleRefs, todo, unitBrief, type AnyEntity, type Model } from './model.ts';
import { displayName, fmtTime, kindName, routeColor, versionText } from './format.ts';

// ---------------------------------------------------------------- 证据与主张的关系
export type EvidenceRole = 'supports' | 'contradicts' | 'limits';
export const ROLE_TEXT: Record<EvidenceRole, string> = { supports: '支持', contradicts: '反证', limits: '限制' };

/** 一条主张的证据，按关系分开：支持、反证（图关系），限制适用范围（扩展，合同 v1.1 补上）。 */
export function claimEvidence(m: Model, claim: Claim) {
  const edges = m.edges.filter((e) => e.target_id === claim.id && (e.relation === 'supports' || e.relation === 'contradicts'));
  const limits = m.ext.evidence_limits.filter((l) => l.claim_id === claim.id);
  return {
    supports: edges.filter((e) => e.relation === 'supports'),
    contradicts: edges.filter((e) => e.relation === 'contradicts'),
    limits,
  };
}

/** 一条证据与哪些主张有关、是什么关系。 */
export function evidenceClaims(m: Model, evidenceIds: string[]) {
  const out: { evidence_id: string; claim_id: string; role: EvidenceRole; edge?: GraphEdge }[] = [];
  for (const g of m.edges) if (evidenceIds.includes(g.source_id) && (g.relation === 'supports' || g.relation === 'contradicts')) out.push({ evidence_id: g.source_id, claim_id: g.target_id, role: g.relation, edge: g });
  for (const l of m.ext.evidence_limits) if (evidenceIds.includes(l.evidence_id)) out.push({ evidence_id: l.evidence_id, claim_id: l.claim_id, role: 'limits' });
  return out;
}

// ---------------------------------------------------------------- 说明的当前性
/** 一段手写说明依据的对象里，哪些后来有了新版本。 */
export const staleBasis = (m: Model, basis: RevisionRef[]) => staleRefs(m, basis);

// ---------------------------------------------------------------- 待关注事项
export interface AttentionView {
  id: string;
  kind: AttentionItem['kind'];
  title: string;
  short: string;
  action_label: string;
  target: string;
  priority: number;
  /** 由项目状态自动补出的事项（手写列表里没有）。 */
  generated: boolean;
  refs: string[];
}

/** 这条提醒现在是否仍然成立。 */
export function attentionStillOpen(m: Model, c: AttentionCheck): boolean {
  switch (c.kind) {
    case 'decision_pending':
      return get<Decision>(m, c.decision_id)?.status === 'proposed';
    case 'proposal_open': {
      const s = get<Proposal>(m, c.proposal_id)?.status;
      return s === 'candidate' || s === 'ready';
    }
    case 'review_needed':
      return reviewQueue(m).some((r) => r.id === c.target_id);
    case 'claim_without_evidence': {
      const claim = get<Claim>(m, c.claim_id);
      return !!claim && claim.evidence_ids.length === 0 && claim.assessment !== 'withdrawn';
    }
    case 'artifact_not_local':
      return get<ArtifactVersion>(m, c.artifact_version_id)?.availability !== 'available';
    case 'capability_missing': {
      const cap = get<CapabilityManifest>(m, c.capability_id);
      return (cap?.capabilities as Record<string, { support: string }> | undefined)?.[c.capability]?.support !== 'supported';
    }
  }
}

/**
 * 首页“需要你处理”：手写的提醒里仍然成立的那些，加上“待处理”里有、但手写列表没覆盖到的事项。
 * 两处数据同源，所以首页和顶栏的计数不会互相矛盾。
 */
export function attentionItems(m: Model): { open: AttentionView[]; deferred: AttentionView[] } {
  const isDeferred = (id: string, refs: string[]) => !!m.flags.deferred[id] || refs.some((r) => m.flags.deferred[r]);
  const curated: AttentionView[] = m.ext.attention_items
    .filter((a) => attentionStillOpen(m, a.open_while))
    .map((a) => ({ id: a.id, kind: a.kind, title: a.title, short: a.short, action_label: a.action_label, target: a.target, priority: a.priority, generated: false, refs: a.refs }));
  const covered = new Set(curated.flatMap((a) => a.refs));
  const t = todo(m);
  const generated: AttentionView[] = [
    ...t.decisions.filter((d) => !covered.has(d.id)).map((d) => ({
      id: `gen_${d.id}`, kind: 'decision' as const, title: '有一项待决定', short: m.ext.one_liners[d.id] ?? d.question, action_label: '去决定',
      target: `#/decisions?focus=${d.id}`, priority: 100, generated: true, refs: [d.id],
    })),
    ...t.proposals.filter((p) => !covered.has(p.id)).map((p) => ({
      id: `gen_${p.id}`, kind: 'decision' as const, title: '有一条候选变更', short: m.ext.one_liners[p.id] ?? p.title, action_label: '查看',
      target: `#/decisions?focus=${p.id}`, priority: 110, generated: true, refs: [p.id],
    })),
    ...t.reviews.filter((r) => !covered.has(r.id)).map((r) => {
      const unitId = r.id.startsWith('brf_') ? (get<AnyEntity>(m, r.id)?.unit_id as string) : r.id;
      return {
        id: `gen_${r.id}`, kind: 'review' as const, title: '有一个新版本待审阅', short: `${displayName(m, r.id)}${versionText(r.revision)}还没审阅`, action_label: '去审阅',
        target: `#/unit/${unitId}?tab=history`, priority: 120, generated: true, refs: [r.id],
      };
    }),
  ];
  const all = [...curated, ...generated].sort((a, b) => a.priority - b.priority);
  return { open: all.filter((a) => !isDeferred(a.id, a.refs)), deferred: all.filter((a) => isDeferred(a.id, a.refs)) };
}

// ---------------------------------------------------------------- 路线比较
export interface RouteCardView {
  branch: Branch;
  label: string;
  color: string;
  card: { aim: string; evidence_for: string | null; evidence_against: string | null; completion: string | null; cost: string | null; status: string };
  dims: Record<DimKey, { text: string; refs: string[] } | null>;
  /** false 表示这条路线没有手写的比较内容，卡片由路线对象推出。 */
  curated: boolean;
  stale: ReturnType<typeof staleRefs>;
  worktreeRequested: boolean;
}

const EMPTY_DIMS: Record<DimKey, null> = { problem: null, assumptions: null, support: null, counter: null, open: null, cost: null, interpretability: null, decision: null };

/** 路线比较：项目里的每一条路线都在，不论是否有手写的比较内容。主线在前，其余按建立先后。 */
export function compareRoutes(m: Model): RouteCardView[] {
  const order = [...m.branches].sort((a, b) =>
    a.id === m.project.main_branch_id ? -1 : b.id === m.project.main_branch_id ? 1 : a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
  );
  return order.map((b) => {
    const worktreeRequested = m.worktreeRequests.some((w) => w.branch_id === b.id);
    const r = m.ext.comparison.routes.find((x) => x.branch_id === b.id);
    if (r) return { branch: b, label: r.label, color: routeColor(m, b.id), card: r.card, dims: r.dims, curated: true, stale: staleBasis(m, r.basis), worktreeRequested };
    const decisions = b.effective_decision_ids.map((id) => get<Decision>(m, id)).filter(Boolean) as Decision[];
    const open = b.open_claim_ids.map((id) => get<Claim>(m, id)).filter(Boolean) as Claim[];
    return {
      branch: b,
      label: b.name,
      color: routeColor(m, b.id),
      card: {
        aim: b.purpose,
        evidence_for: null,
        evidence_against: null,
        completion: null,
        cost: null,
        status: `${label(BRANCH_STATE, b.state).text} · ${fmtTime(b.created_at)}新建`,
      },
      dims: {
        ...EMPTY_DIMS,
        problem: { text: b.purpose, refs: [] },
        open: open.length ? { text: `需要按当前证据重新判断：${open.map((c) => displayName(m, c.id)).join('；')}`, refs: open.map((c) => c.id) } : null,
        decision: decisions.length ? { text: `继承的决定：${decisions.map((d) => displayName(m, d.id)).join('；')}`, refs: decisions.map((d) => d.id) } : null,
      },
      curated: false,
      stale: [],
      worktreeRequested,
    };
  });
}

// ---------------------------------------------------------------- 交接材料
/** 一个对象按当前版本的一句话状态，用来替换交接材料中已过时的描述。 */
export function currentLine(m: Model, id: string): string {
  const e = m.byId.get(id) as AnyEntity | undefined;
  if (!e) return `${id}（找不到这个对象）`;
  switch (id.slice(0, 3)) {
    case 'unt': {
      const u = e as unknown as ResearchUnit;
      return `研究单元“${u.title}”：${label(WORK_STATE, u.work_state).text}。下一步：${u.next_action}`;
    }
    case 'clm': {
      const c = e as unknown as Claim;
      return `主张：${c.text}（当前评估：${label(ASSESSMENT, c.assessment).text}；条件：${c.conditions}）`;
    }
    case 'evd': {
      const v = e as unknown as Evidence;
      return `证据：${v.statement}（局限：${v.limitations}）`;
    }
    case 'dec': {
      const d = e as unknown as Decision;
      const opt = d.options.find((o) => o.id === d.accepted_option_id);
      return `决定：${d.question} → ${label(DECISION, d.status).text}${opt ? `：${opt.label}` : ''}`;
    }
    case 'run': {
      const r = e as unknown as ExperimentRun;
      return `${displayName(m, r.id)}：${label(RUN_STATE, r.run_state).text}`;
    }
    case 'grt': {
      const g = e as unknown as Grant;
      return `${displayName(m, g.id)}：${({ active: '有效', revoked: '已撤销', expired: '已过期' } as Record<string, string>)[g.status] ?? g.status}`;
    }
    default:
      return `${kindName(id)}“${displayName(m, id)}”（${versionText(e.revision)}）`;
  }
}

export interface Handoff {
  text: string;
  /** 交接材料依据的上下文包；没有时为 null。 */
  basedOn: { id: string; created_at: string; project_revision: number } | null;
  /** 上下文包或说明里已过时、已按当前版本替换的内容。 */
  replaced: { entity_id: string; from: number; to: number }[];
  /** 上下文包生成之后发生、与本单元有关的变化。 */
  changesSince: { at: string; summary: string }[];
  briefStale: boolean;
}

/**
 * 交接材料：给原客户端里的模型继续工作用。
 * 以最近的上下文包为底稿，但逐条检查它引用的对象版本：已更新的条目按当前版本重写，并列出上下文包之后的变化，
 * 避免把当前约束和已被替代的旧结论混在一起交给模型（方案：新会话接收有效背景，不能把已被推翻的条件当成事实）。
 */
export function buildHandoff(m: Model, unitId: string): Handoff {
  const unit = get<ResearchUnit>(m, unitId)!;
  const branch = get<Branch>(m, unit.branch_id);
  const ctx = m.contexts.filter((c) => c.unit_id === unitId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  const brief = unitBrief(m, unitId);
  const replaced: Handoff['replaced'] = [];
  const lines = [
    `# 交接材料：${unit.title}（${versionText(unit.revision)}）`,
    `按项目第${m.project.revision}版整理。`,
    '',
    `项目目标：${m.project.goal}`,
    ...(m.project.constraints as { text: string }[]).map((c) => `约束：${c.text}`),
    `本单元问题：${unit.question}`,
    '',
  ];

  const included = new Set<string>();
  if (ctx) {
    lines.push('## 有效背景');
    for (const it of ctx.items) {
      if (it.entity_id === m.project.id) continue;
      included.add(it.entity_id);
      const cur = m.byId.get(it.entity_id);
      if (cur && cur.revision !== it.revision) {
        replaced.push({ entity_id: it.entity_id, from: it.revision, to: cur.revision });
        lines.push(`- ${currentLine(m, it.entity_id)}（已按${versionText(cur.revision)}更新；上下文包里是${versionText(it.revision)}）`);
      } else lines.push(`- ${it.text}`);
    }
  } else if (brief) {
    lines.push('## 已知与未知（来自阅读说明）');
    lines.push(...brief.key_findings.map((f) => `已知：${f}`), ...brief.not_yet_established.map((f) => `尚未证明：${f}`));
  }

  // 本单元或所在路线当前有效、但上下文里没有的决定
  const decisionIds = new Set([...unit.decision_ids, ...(branch?.effective_decision_ids ?? [])]);
  const missing = [...decisionIds].filter((id) => !included.has(id) && get<Decision>(m, id)?.status === 'accepted');
  if (missing.length) lines.push('', '## 当前有效的决定', ...missing.map((id) => `- ${currentLine(m, id)}`));

  // 本单元的主张按当前评估列出（上下文里已有的已在上面按当前版本处理）
  const claims = unit.claim_ids.filter((id) => !included.has(id) && m.byId.has(id));
  if (claims.length) lines.push('', '## 本单元的主张（当前评估）', ...claims.map((id) => `- ${currentLine(m, id)}`));

  // 研究负责人对当前版本提出的修改意见：交给模型时必须带上
  const review = reviewsFor(m, unit.id).find((r) => r.is_current && r.status === 'needs_changes');
  if (review) lines.push('', `## 研究负责人要求修改（针对${versionText(review.reviewed_revision)}）`, ...review.findings.map((f) => `- ${f}`));

  // 上下文包生成之后的变化
  const scope = new Set([unit.id, unit.branch_id, ...included, ...decisionIds]);
  const changesSince = ctx
    ? m.timeline
        .filter((t) => t.at > ctx.created_at && [...t.entityIds, ...t.related].some((id) => scope.has(id)))
        .map((t) => ({ at: t.at, summary: t.summary }))
    : [];
  if (changesSince.length) lines.push('', `## ${fmtTime(ctx!.created_at)}之后的变化`, ...changesSince.map((c) => `- ${fmtTime(c.at)} ${c.summary}`));

  const briefStale = !ctx && !!brief && staleRefs(m, brief.source_revision_refs).some((r) => r.entity_id !== m.project.id);
  lines.push('', `下一步：${unit.next_action}`);
  return {
    text: lines.join('\n'),
    basedOn: ctx ? { id: ctx.id, created_at: ctx.created_at, project_revision: ctx.base_project_revision } : null,
    replaced,
    changesSince,
    briefStale,
  };
}
