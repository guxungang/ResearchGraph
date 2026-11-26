// 由项目状态推出的展示内容（D-007）。界面上的首页要点、待关注事项、路线卡片、交接材料都从这里取。
// 原则：当前状态优先于此前写好的说明。手写或模型写的说明只是“写作时的版本”，依据更新后标出可能已过时；
// 项目没有手写说明时（例如新导入的项目），由状态直接整理，不让页面空着，也不编造内容。
import type { ArtifactVersion, Branch, CapabilityManifest, Claim, Decision, Evidence, ExperimentRun, GraphEdge, Grant, Proposal, ResearchUnit } from '@rw/contracts';
import type { AttentionCheck, AttentionItem, DimKey, RevisionRef } from '@fixtures/src/extension-types.ts';
import { ASSESSMENT, BRANCH_STATE, DECISION, RUN_STATE, WORK_STATE, label } from '@rw/domain';
import { currentPath, get, reviewQueue, reviewsFor, staleRefs, todo, unitBrief, type AnyEntity, type Model } from './model.ts';
import { displayName, fmtTime, kindName, routeColor, versionText } from './format.ts';

const ID_RE = /\b(?:unt|brn|dec|clm|evd|pro|run|art|ckp|grt)_[A-Za-z0-9][A-Za-z0-9._-]*/g;
const idsIn = (text: string) => [...new Set(text.match(ID_RE) ?? [])];

// ---------------------------------------------------------------- 证据与主张的关系：关系类型 + 有效性
export type EvidenceRole = 'supports' | 'contradicts' | 'limits';
export const ROLE_TEXT: Record<EvidenceRole, string> = { supports: '支持', contradicts: '反证', limits: '限制' };

/**
 * 关系是否仍然有效：current 可以计入当前判断；revalidate 是两端有一端改过，需要重新核验后才能计入；
 * historical 是已被替代或只作历史的关系，只供参考。一项实验曾经支持某个主张，不代表它仍然支持修改后的主张。
 */
export type Validity = 'current' | 'revalidate' | 'historical';
export const VALIDITY_TEXT: Record<Validity, string> = { current: '当前有效', revalidate: '需要重新核验', historical: '历史，仅供参考' };
export const validityOf = (e: GraphEdge): Validity =>
  e.state !== 'active' || e.currency === 'historical' ? 'historical' : e.currency === 'needs_revalidation' ? 'revalidate' : 'current';

/** 一条主张的证据：当前有效的支持、反证与限制分开计数；需要重新核验的和历史关系单独列出，不计入当前判断。 */
export function claimEvidence(m: Model, claim: Claim) {
  const edges = m.edges.filter((e) => e.target_id === claim.id && (e.relation === 'supports' || e.relation === 'contradicts'));
  const current = edges.filter((e) => validityOf(e) === 'current');
  return {
    supports: current.filter((e) => e.relation === 'supports'),
    contradicts: current.filter((e) => e.relation === 'contradicts'),
    limits: m.ext.evidence_limits.filter((l) => l.claim_id === claim.id),
    revalidate: edges.filter((e) => validityOf(e) === 'revalidate'),
    historical: edges.filter((e) => validityOf(e) === 'historical'),
  };
}

/** 一组证据与哪些主张有关、是什么关系、关系是否仍然有效。 */
export function evidenceClaims(m: Model, evidenceIds: string[]) {
  const out: { evidence_id: string; claim_id: string; role: EvidenceRole; validity: Validity; edge?: GraphEdge }[] = [];
  for (const g of m.edges)
    if (evidenceIds.includes(g.source_id) && (g.relation === 'supports' || g.relation === 'contradicts'))
      out.push({ evidence_id: g.source_id, claim_id: g.target_id, role: g.relation, validity: validityOf(g), edge: g });
  for (const l of m.ext.evidence_limits) if (evidenceIds.includes(l.evidence_id)) out.push({ evidence_id: l.evidence_id, claim_id: l.claim_id, role: 'limits', validity: 'current' });
  return out;
}

// ---------------------------------------------------------------- 说明的当前性
/** 一段说明依据的对象里，哪些后来有了新版本，或已经找不到（来源缺失也算过时，不能当作没变）。 */
export const staleBasis = (m: Model, basis: RevisionRef[]) => staleRefs(m, basis);

// ---------------------------------------------------------------- 当前安排（下一步）
const decidedAt = (d: Decision) => (d.accepted_at as string | null | undefined) ?? d.updated_at;

/**
 * “下一步”是否写于相关决定作出之前。决定不会自动改写下一步（采用方案不直接改变执行），
 * 但写于决定之前、又依赖这项决定的安排要标为可能已过时，并给出按决定改写的建议，由研究负责人确认。
 */
export function planCheck(m: Model, unit: ResearchUnit) {
  const ids = new Set([...unit.decision_ids, ...idsIn(unit.next_action).filter((id) => id.startsWith('dec_'))]);
  const decisions = [...ids]
    .map((id) => get<Decision>(m, id))
    .filter((d): d is Decision => !!d && d.status !== 'proposed' && decidedAt(d) > unit.updated_at);
  const suggestion = decisions
    .map((d) => {
      const opt = d.options.find((o) => o.id === d.accepted_option_id);
      return opt ? `已选择“${opt.label}”：${opt.description}` : `已决定不采用（${d.question}）。`;
    })
    .join(' ');
  return { stale: decisions.length > 0, decisions, suggestion };
}

// ---------------------------------------------------------------- 首页要点
export interface HomeSummary {
  question: string;
  mainline: { text: string; basis: RevisionRef[] };
  known: { text: string; detail: string; ref: string; basis: RevisionRef[] } | null;
  unknown: { text: string; detail: string; ref: string; basis: RevisionRef[] } | null;
  /** false：项目没有写好的要点，这里由当前状态整理。 */
  curated: boolean;
}

export function homeSummary(m: Model): HomeSummary {
  const h = m.ext.home?.summary;
  if (h) return { ...h, curated: true };
  const main = get<Branch>(m, m.project.main_branch_id);
  const path = currentPath(m);
  const onPath = m.units.filter((u) => path.has(u.id));
  const claimIds = [...new Set([...onPath.flatMap((u) => u.claim_ids), ...(main?.open_claim_ids ?? [])])];
  const claims = claimIds.map((id) => get<Claim>(m, id)).filter(Boolean) as Claim[];
  const known = claims.find((c) => c.assessment === 'supported');
  const unknown = claims.find((c) => c.assessment === 'unassessed' || c.assessment === 'inconclusive' || c.assessment === 'mixed');
  const ref = (c: Claim) => [{ entity_id: c.id, revision: c.revision }];
  return {
    question: m.project.goal,
    mainline: { text: main ? `主线：${main.name}。${main.purpose}` : '还没有指定主线。', basis: [] },
    known: known ? { text: known.text, detail: `适用条件：${known.conditions}`, ref: known.id, basis: ref(known) } : null,
    unknown: unknown ? { text: unknown.text, detail: `当前评估：${label(ASSESSMENT, unknown.assessment).text}。${unknown.conditions}`, ref: unknown.id, basis: ref(unknown) } : null,
    curated: false,
  };
}

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
 * 首页“需要你处理”：手写的提醒里仍然成立的那些，加上“待处理”里有、但手写列表没覆盖到的事项，
 * 以及写于决定之前、可能已过时的“下一步”。待处理里的每一项都会出现在这里，所以首页和顶栏计数不会互相矛盾。
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
    ...m.units
      .filter((u) => u.work_state !== 'archived' && planCheck(m, u).stale)
      .map((u) => ({
        id: `gen_plan_${u.id}`, kind: 'drift' as const, title: '下一步可能已过时', short: `“${u.title}”的下一步写于相关决定之前`, action_label: '去更新',
        target: `#/unit/${u.id}`, priority: 90, generated: true, refs: [u.id],
      })),
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
  /** false 表示这条路线没有写好的比较内容，卡片由路线对象推出。 */
  curated: boolean;
  stale: ReturnType<typeof staleRefs>;
  worktreeRequested: boolean;
}

const EMPTY_DIMS: Record<DimKey, null> = { problem: null, assumptions: null, support: null, counter: null, open: null, cost: null, interpretability: null, decision: null };

/** 路线比较：项目里的每一条路线都在，不论是否有写好的比较内容。主线在前，其余按建立先后。 */
export function compareRoutes(m: Model): RouteCardView[] {
  const order = [...m.branches].sort((a, b) =>
    a.id === m.project.main_branch_id ? -1 : b.id === m.project.main_branch_id ? 1 : a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
  );
  return order.map((b) => {
    const worktreeRequested = m.worktreeRequests.some((w) => w.branch_id === b.id);
    const r = m.ext.comparison?.routes.find((x) => x.branch_id === b.id);
    if (r) return { branch: b, label: r.label, color: routeColor(m, b.id), card: r.card, dims: r.dims, curated: true, stale: staleBasis(m, r.basis), worktreeRequested };
    const decisions = b.effective_decision_ids.map((id) => get<Decision>(m, id)).filter(Boolean) as Decision[];
    const open = b.open_claim_ids.map((id) => get<Claim>(m, id)).filter(Boolean) as Claim[];
    // 没有写好的比较内容时，用这条路线上主张的当前评估：有条件支持的算支持，受到反证或证据混合的算不利
    const claims = m.claims.filter((c) => c.branch_ids.includes(b.id));
    const sup = claims.filter((c) => c.assessment === 'supported');
    const against = claims.filter((c) => c.assessment === 'contradicted' || c.assessment === 'mixed');
    return {
      branch: b,
      label: b.name,
      color: routeColor(m, b.id),
      card: {
        aim: b.purpose,
        evidence_for: sup.length ? sup.map((c) => c.text).join('；') : null,
        evidence_against: against.length ? against.map((c) => c.text).join('；') : null,
        completion: null,
        cost: null,
        status: `${label(BRANCH_STATE, b.state).text} · ${fmtTime(b.created_at)}建立`,
      },
      dims: {
        ...EMPTY_DIMS,
        problem: { text: b.purpose, refs: [] },
        support: sup.length ? { text: sup.map((c) => `${c.text}（${c.conditions}）`).join('；'), refs: sup.map((c) => c.id) } : null,
        counter: against.length ? { text: against.map((c) => c.text).join('；'), refs: against.map((c) => c.id) } : null,
        open: open.length ? { text: `需要按当前证据判断：${open.map((c) => displayName(m, c.id)).join('；')}`, refs: open.map((c) => c.id) } : null,
        decision: decisions.length ? { text: `有效的决定：${decisions.map((d) => displayName(m, d.id)).join('；')}`, refs: decisions.map((d) => d.id) } : null,
      },
      curated: false,
      stale: [],
      worktreeRequested,
    };
  });
}

// ---------------------------------------------------------------- 交接材料
/** 一个对象按当前版本的一句话状态，用来替换已过时的描述。 */
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
    case 'dec':
      return decisionLine(m, e as unknown as Decision);
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

function decisionLine(m: Model, d: Decision): string {
  const opt = d.options.find((o) => o.id === d.accepted_option_id);
  const reconsider = (d as { reconsider_when?: string | null }).reconsider_when;
  return `决定：${d.question} → ${label(DECISION, d.status).text}${opt ? `：${opt.label}` : ''}。理由：${d.rationale}${reconsider ? `　重新考虑的条件：${reconsider}` : ''}`;
}

export interface Handoff {
  text: string;
  /** 交接材料依据的上下文包；没有时为 null。 */
  basedOn: { id: string; created_at: string; project_revision: number } | null;
  /** 上下文包里已过时、已按当前版本改写的内容。 */
  replaced: { entity_id: string; from: number; to: number }[];
  /** 上下文包里已经找不到来源的内容（没有交给模型）。 */
  missing: string[];
  /** 上下文包生成之后发生、与本单元有关的变化。 */
  changesSince: { at: string; summary: string }[];
  briefStale: boolean;
  planStale: boolean;
}

/**
 * 交接材料：给原客户端里的模型继续这项工作用。它不是旧摘要的更新版，而是按当前任务重新整理的工作背景：
 * 目标与约束 → 本轮问题 → 已有发现及适用条件 → 有效决定及理由 → 已否定的路线及原因 → 进度与阻塞 → 修改意见 → 下一步与完成条件。
 * 以最近的上下文包为底稿，但逐条检查它引用的对象版本：已更新的按当前版本改写，找不到的明确标出（方案：新会话接收有效背景，
 * 附必要的失败经验和后来反证，不能把已被推翻的条件当成事实）。
 */
export function buildHandoff(m: Model, unitId: string): Handoff {
  const unit = get<ResearchUnit>(m, unitId)!;
  const branch = get<Branch>(m, unit.branch_id);
  const ctx = m.contexts.filter((c) => c.unit_id === unitId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  const brief = unitBrief(m, unitId);
  const replaced: Handoff['replaced'] = [];
  const missing: string[] = [];

  // 上下文包的条目：逐条检查版本
  const ctxItems = (ctx?.items ?? [])
    .filter((it) => it.entity_id !== m.project.id)
    .flatMap((it) => {
      const cur = m.byId.get(it.entity_id);
      if (!cur) {
        missing.push(it.entity_id);
        return [];
      }
      if (cur.revision !== it.revision) {
        replaced.push({ entity_id: it.entity_id, from: it.revision, to: cur.revision });
        return [{ role: it.role, id: it.entity_id, text: `${currentLine(m, it.entity_id)}（已按${versionText(cur.revision)}更新）` }];
      }
      return [{ role: it.role, id: it.entity_id, text: it.text }];
    });
  const included = new Set(ctxItems.map((x) => x.id));
  const sec = (title: string, items: string[]) => (items.length ? ['', `## ${title}`, ...items.map((x) => `- ${x}`)] : []);

  // 1. 目标与硬性约束
  const goal = sec('目标与硬性约束', [`目标：${m.project.goal}`, ...(m.project.constraints as { text: string }[]).map((c) => `约束：${c.text}`)]);

  // 2. 本轮问题与工作范围
  const agreement = m.ext.unit_details[unit.id]?.work_agreement;
  const scope = sec('本轮问题与工作范围', [
    `问题：${unit.question}`,
    `目的：${unit.purpose}`,
    ...(agreement?.allowed_scope ?? []).map((s) => `允许范围：${s}`),
  ]);

  // 3. 已有发现及适用条件（证据与主张都按当前版本）
  const claimLines = unit.claim_ids.filter((id) => !included.has(id) && m.byId.has(id)).map((id) => currentLine(m, id));
  const evidenceLines = ctxItems.filter((x) => x.role === 'evidence' || x.role === 'counterevidence').map((x) => x.text);
  const questionLines = ctxItems.filter((x) => x.role === 'question').map((x) => `待检验：${x.text}`);
  const briefLines = !ctx && brief ? [...brief.key_findings.map((f) => `已知：${f}`), ...brief.not_yet_established.map((f) => `尚未证明：${f}`)] : [];
  const findings = sec('已有发现及适用条件', [...evidenceLines, ...claimLines, ...questionLines, ...briefLines]);

  // 4. 当前有效的决定及理由
  const decisionIds = new Set([...unit.decision_ids, ...(branch?.effective_decision_ids ?? []), ...ctxItems.filter((x) => x.role === 'decision').map((x) => x.id)]);
  const decisions = sec('当前有效的决定及理由', [...decisionIds].map((id) => get<Decision>(m, id)).filter((d): d is Decision => d?.status === 'accepted').map((d) => decisionLine(m, d)));

  // 5. 已否定的路线及原因：避免重复失败，同时写明重新考虑的条件（样机项目小，取全项目；真实项目要按相关性挑选）
  const closed = m.branches.filter((b) => b.state === 'closed').map((b) => {
    const resume = m.ext.branch_notes[b.id]?.resume_condition;
    return `已关闭的路线“${b.name}”：${b.closure_reason ?? '没有记录关闭理由'}${resume ? `　重新考虑的条件：${resume}` : ''}`;
  });
  const rejectedDecisions = m.decisions.filter((d) => d.status === 'rejected' || d.status === 'superseded').map((d) => decisionLine(m, d));
  const rejectedProposals = m.proposals.filter((p) => p.status === 'rejected').map((p) => {
    const reason = p.summary.includes('拒绝理由：') ? p.summary.split('拒绝理由：').pop() : '没有记录理由';
    return `已拒绝的建议“${p.title.replace(/^建议：/, '')}”：${reason}`;
  });
  const negatives = sec('已否定的路线及原因（不要重复，除非满足重新考虑的条件）', [...closed, ...rejectedProposals, ...rejectedDecisions]);

  // 6. 进度与阻塞
  const runs = m.runs.filter((r) => r.unit_id === unit.id).map((r) => `${displayName(m, r.id)}：${label(RUN_STATE, r.run_state).text}`);
  const scope2 = new Set([unit.id, unit.branch_id, ...included, ...decisionIds]);
  const changesSince = ctx
    ? m.timeline.filter((t) => t.at > ctx.created_at && [...t.entityIds, ...t.related].some((id) => scope2.has(id))).map((t) => ({ at: t.at, summary: t.summary }))
    : [];
  const progress = sec('进度与阻塞', [
    `状态：${label(WORK_STATE, unit.work_state).text}${unit.blocker ? `；阻塞：${typeof unit.blocker === 'string' ? unit.blocker : JSON.stringify(unit.blocker)}` : ''}`,
    ...runs,
    ...ctxItems.filter((x) => x.role === 'recent_state').map((x) => x.text),
    ...changesSince.map((c) => `${fmtTime(c.at)} ${c.summary}`),
  ]);

  // 7. 研究负责人的修改意见
  const review = reviewsFor(m, unit.id).find((r) => r.is_current && r.status === 'needs_changes');
  const changes = review ? sec(`研究负责人要求修改（针对${versionText(review.reviewed_revision)}）`, review.findings.length ? review.findings : ['没有写明具体意见']) : [];

  // 8. 下一步与完成条件（当前安排优先；写于决定之前的要提示）
  const plan = planCheck(m, unit);
  const next = sec('下一步与完成条件', [
    `下一步：${unit.next_action}`,
    ...(plan.stale ? [`注意：这条下一步写于相关决定之前。之后已经决定：${plan.suggestion} 开始前请先和研究负责人确认下一步。`] : []),
    ...unit.acceptance_criteria.map((a) => `完成条件${a.mandatory ? '' : '（可选）'}：${a.description}`),
  ]);

  // 其他工作范围内的约束性条目（例如授权范围）
  const others = sec('其他约束', ctxItems.filter((x) => x.role === 'constraint' || x.role === 'goal').map((x) => x.text));

  const briefStale = !ctx && !!brief && staleRefs(m, brief.source_revision_refs).some((r) => r.entity_id !== m.project.id);
  const lines = [
    `# 交接材料：${unit.title}（${versionText(unit.revision)}）`,
    `按项目第${m.project.revision}版整理。${missing.length ? `上下文里有 ${missing.length} 条内容找不到来源，没有交给模型。` : ''}`,
    ...goal, ...scope, ...findings, ...decisions, ...negatives, ...progress, ...changes, ...others, ...next,
  ];
  return {
    text: lines.join('\n'),
    basedOn: ctx ? { id: ctx.id, created_at: ctx.created_at, project_revision: ctx.base_project_revision } : null,
    replaced,
    missing,
    changesSince,
    briefStale,
    planStale: plan.stale,
  };
}
