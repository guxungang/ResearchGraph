// 样机内的“本地服务”模拟。阶段A没有真实服务端：这里在浏览器中按方案 §14.4 的顺序做检查
// （身份 → 版本 → 状态转换 → 图关系 → 授权），通过后生成新的对象修订和一条本地事件。
// 所有结果只保存在本机浏览器存储中，不写入任何项目；界面上有明确提示。
// 注意：这是模拟，不是权威实现。阶段B的服务端要把身份、授权、目标版本、状态转换和事务提交统一实现（D-007）。
import type { ActorRef, Checkpoint, Claim, Decision, Evidence, GraphEdge, Grant, Proposal, Provenance, ReadingBrief, ResearchUnit, ReviewRecord } from '@rw/contracts';
import {
  checkApplyPrincipal, checkCapability, checkProposalPremises, checkRevision, grantCovers, grantUsable, wouldCreateCycle, type GrantTarget, type ServiceError,
} from '@rw/domain';
import { get, revisionAt, type AnyEntity, type Flags, type LocalEvent, type Model } from './model.ts';
import { evidenceClaims, type EvidenceRole } from './derive.ts';
import { displayName, fmtTime, versionText } from './format.ts';
import { sha256Hex } from './sha256.ts';

export type Result = { ok: true; message: string; events?: LocalEvent[]; flags?: Partial<Flags> } | { ok: false; error: ServiceError; flags?: Partial<Flags> };

const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

let counter = 0;
const localId = (prefix: string, seq: number) => `${prefix}_local${seq}${counter++ ? `_${counter}` : ''}`;

const notFound = (what: string): Result => ({ ok: false, error: { status: 404, code: 'not_found', message: `${what}不存在。`, recovery: '刷新后重试。' } });

// ---------------------------------------------------------------- 本机用户与授权（从项目数据中找，不写死对象编号）
/** 本机用户（研究负责人），以及只能由其本人使用的项目级授权。授权失效时仍返回它，让检查给出明确的拒绝理由。 */
export function ownerOf(m: Model): { actor: ActorRef; grant?: Grant } {
  const principal = m.ext.viewer?.principal_id ?? 'usr_owner';
  const own = m.grants.filter((g) => g.application_policy === 'human_only' && g.subject_principal_ids.includes(principal));
  const grant = own.find((g) => g.status === 'active') ?? own[0];
  return { actor: { principal_id: principal, kind: 'human', authentication_ref: 'auth_local_session', grant_id: grant?.id ?? null }, grant };
}

const userLocator = (actionId: string, at: string, description: string, surface: string) => ({
  kind: 'user_action' as const,
  precision: 'exact' as const,
  correlation_method: 'direct_id' as const,
  content_sha256: null,
  captured_at: at,
  description: `研究负责人的界面操作（样机模拟）：${description}`,
  action_id: actionId,
  ui_surface: surface,
  request_id: `req-${actionId}`,
});

const prov = (m: Model, actionId: string, at: string, description: string, surface: string): Provenance => ({
  observation_kind: 'observed' as const,
  source_refs: [userLocator(actionId, at, description, surface)],
  created_by: ownerOf(m).actor,
  derivation_note: '阶段A样机中的模拟操作，只保存在本机浏览器。',
});

function revise<T extends AnyEntity>(m: Model, e: T, at: string, patch: Partial<T>, actionId: string, what: string, surface: string): T {
  return { ...e, ...patch, revision: e.revision + 1, updated_at: at, provenance: prov(m, actionId, at, what, surface) } as T;
}

const forbidden = (message: string): ServiceError => ({ status: 403, code: 'forbidden', message, recovery: '这类操作需要你本人有效的授权。' });

/** 人工动作的授权检查：执行者是本机用户，授权覆盖这个动作和目标。 */
function ownerGrantCheck(m: Model, action: string, target: Omit<GrantTarget, 'projectId'> = {}): ServiceError | null {
  const { actor, grant } = ownerOf(m);
  if (!grant) return forbidden('找不到你本人的人工操作授权。');
  const res = grantCovers(grant, action, { projectId: m.project.id, ...target }, actor, nowIso());
  return res.ok ? null : forbidden(res.reason);
}

/** 合同里没有对应动作的人工操作（如拒绝候选）：至少要求授权本身可用。合同 v1.1 需要补上动作（D-002）。 */
function ownerUsableCheck(m: Model): ServiceError | null {
  const { actor, grant } = ownerOf(m);
  if (!grant) return forbidden('找不到你本人的人工操作授权。');
  const res = grantUsable(grant, { projectId: m.project.id }, actor, nowIso());
  return res.ok ? null : forbidden(res.reason);
}

const event = (m: Model, type: string, summary: string, entities: AnyEntity[], refs: string[], projectRevisionAfter: number, at: string): LocalEvent => ({
  seq: m.lastSeq + 1,
  at,
  type,
  actor: ownerOf(m).actor,
  summary,
  entities,
  refs,
  projectRevisionAfter,
});

const bumpProject = (m: Model, at: string, actionId: string) => revise(m, m.project as unknown as AnyEntity, at, {}, actionId, '项目语义版本递增', 'workbench');

/** 候选依据的对象修订是否仍是当前修订。 */
const premisesOf = (m: Model, p: Proposal) => checkProposalPremises(p.target_revision_refs, (id) => m.byId.get(id)?.revision);
const isOpenProposal = (p: Proposal) => p.status === 'candidate' || p.status === 'ready';

/** 用户没写理由时如实记录，不替用户编造理由。 */
const reasonOrGap = (reason: string | undefined) => reason?.trim() || '研究负责人没有填写理由。';

// ---------------------------------------------------------------- 审阅与理解
// 审阅结论（通过 / 需要修改 + 意见）与“读懂了没有”是两件事：记录其中一件时，另一件原样带过去，不互相覆盖。
function userReview(m: Model, a: { seq: number; at: string; actionId: string; what: string; targetId: string; revision: number; previous?: ReviewRecord; patch: Partial<ReviewRecord> }): ReviewRecord {
  return {
    id: localId('rev', a.seq),
    revision: 1,
    project_id: m.project.id,
    created_at: a.at,
    updated_at: a.at,
    valid_time: { from: a.at, to: null },
    provenance: prov(m, a.actionId, a.at, a.what, 'review-panel'),
    target_id: a.targetId,
    reviewed_revision: a.revision,
    review_kind: 'user_review',
    status: a.previous?.status ?? 'unreviewed',
    reviewer: ownerOf(m).actor,
    understanding_status: a.previous?.understanding_status ?? 'not_reported',
    findings: a.previous?.findings ?? [],
    evidence_ids: a.previous?.evidence_ids ?? [],
    is_current: true,
    source_revision_refs: [{ entity_id: a.targetId, revision: a.revision }],
    ...a.patch,
  } as ReviewRecord;
}

const currentOwnReview = (m: Model, targetId: string, revision: number) =>
  m.reviews.find((r) => r.target_id === targetId && r.reviewed_revision === revision && r.is_current && r.reviewer.principal_id === ownerOf(m).actor.principal_id);

export function recordReview(m: Model, args: { targetId: string; status: 'accepted' | 'needs_changes'; findings: string }): Result {
  const at = nowIso();
  const err = ownerGrantCheck(m, 'review.record');
  if (err) return { ok: false, error: err };
  const target = m.byId.get(args.targetId);
  if (!target) return notFound('审阅对象');
  if (args.status === 'needs_changes' && !args.findings.trim())
    return { ok: false, error: { status: 400, code: 'validation_failed', message: '“需要修改”要写明改什么。', recovery: '写一句需要修改的地方，再提交。' } };
  const seq = m.lastSeq + 1;
  const previous = currentOwnReview(m, args.targetId, target.revision);
  const review = userReview(m, {
    seq, at, actionId: `act_review_${seq}`, what: '记录审阅', targetId: args.targetId, revision: target.revision, previous,
    // 新的结论替换旧的结论和意见；理解状态原样保留
    patch: { status: args.status, findings: args.findings.trim() ? [args.findings.trim()] : [], evidence_ids: [] },
  });
  const name = displayName(m, args.targetId);
  const verdict = args.status === 'accepted' ? '审阅通过' : '需要修改';
  return {
    ok: true,
    message: `已记录：你对“${name}”${versionText(target.revision)}的审阅为“${verdict}”${previous && previous.status !== 'unreviewed' ? `（更正了你之前对同一版本的“${previous.status === 'accepted' ? '审阅通过' : '需要修改'}”，旧记录保留在历史中）` : ''}。审阅只针对这个版本；它不授权执行，也不改变任何主张的评估。`,
    events: [event(m, 'review.recorded', `研究负责人对“${name}”${versionText(target.revision)}的审阅：${verdict}。`, [review as unknown as AnyEntity], [args.targetId], m.project.revision, at)],
  };
}

export function markUnderstanding(m: Model, args: { targetId: string; understanding: 'needs_explanation' | 'self_reported_understood' }): Result {
  const at = nowIso();
  const err = ownerGrantCheck(m, 'review.record');
  if (err) return { ok: false, error: err };
  const target = m.byId.get(args.targetId);
  if (!target) return notFound('对象');
  const seq = m.lastSeq + 1;
  const previous = currentOwnReview(m, args.targetId, target.revision);
  // 只改理解状态；审阅结论、修改意见和关联证据原样带过去（“读懂了”不等于认可，也不撤销修改意见）
  const review = userReview(m, { seq, at, actionId: `act_understanding_${seq}`, what: '标记理解状态', targetId: args.targetId, revision: target.revision, previous, patch: { understanding_status: args.understanding } });
  const label = args.understanding === 'needs_explanation' ? '需要补背景' : '已理解';
  return {
    ok: true,
    message: `已记录你本人的标记“${label}”（只针对${versionText(target.revision)}）。理解状态不影响任何科学判断，也不改变你的审阅结论和意见。`,
    events: [event(m, 'review.recorded', `研究负责人标记“${displayName(m, args.targetId)}”${versionText(target.revision)}：${label}。`, [review as unknown as AnyEntity], [args.targetId], m.project.revision, at)],
  };
}

// ---------------------------------------------------------------- 修订研究单元
export function reviseNextAction(m: Model, args: { unitId: string; nextAction: string; expectedRevision: number }): Result {
  const at = nowIso();
  const unit = get<ResearchUnit>(m, args.unitId);
  if (!unit) return notFound('研究单元');
  const conflict = checkRevision(args.expectedRevision, m.project.revision);
  if (conflict) return { ok: false, error: conflict };
  const err = ownerGrantCheck(m, 'unit.revise', { unitId: unit.id, branchId: unit.branch_id });
  if (err) return { ok: false, error: err };
  if (!args.nextAction.trim()) return { ok: false, error: { status: 400, code: 'validation_failed', message: '下一步说明不能为空。', recovery: '填写下一步后再保存。' } };
  const seq = m.lastSeq + 1;
  const updated = revise(m, unit as unknown as AnyEntity, at, { next_action: args.nextAction.trim() }, `act_revise_${seq}`, '修订下一步说明', 'unit-detail');
  const project = bumpProject(m, at, `act_revise_${seq}`);
  const oldReviews = m.reviews.filter((r) => r.target_id === unit.id && r.is_current).length;
  return {
    ok: true,
    message: `“${unit.title}”的下一步已更新（${versionText(updated.revision)}），各处都以它为准。${oldReviews ? `此前针对${versionText(unit.revision)}的审阅保留，但不再是当前审阅。` : ''}阅读说明里原来的建议保留为参考。`,
    events: [event(m, 'unit.changed', `研究负责人修订“${unit.title}”的下一步说明（${versionText(updated.revision)}）。`, [updated, project], [unit.id], project.revision, at)],
  };
}

// ---------------------------------------------------------------- 决策
export function decide(m: Model, args: { decisionId: string; optionId: string | null; reason: string; expectedRevision: number; viaProposalId?: string }): Result {
  const at = nowIso();
  const dec = get<Decision>(m, args.decisionId);
  if (!dec) return notFound('决定');
  const conflict = checkRevision(args.expectedRevision, m.project.revision);
  if (conflict) return { ok: false, error: conflict };
  if (dec.status !== 'proposed')
    return { ok: false, error: { status: 422, code: 'invalid_transition', message: `这项决定当前为“${dec.status}”，不能再次选择。`, recovery: '如需改变已采用的决定，请新建决定并替代旧决定。' } };
  const action = args.optionId ? 'decision.accept' : 'decision.reject';
  const err = ownerGrantCheck(m, action);
  if (err) return { ok: false, error: err };
  if (args.optionId && !dec.options.some((o) => o.id === args.optionId))
    return { ok: false, error: { status: 400, code: 'validation_failed', message: '所选选项不属于这项决定。', recovery: '重新选择。' } };

  const seq = m.lastSeq + 1;
  const actionId = `act_decide_${seq}`;
  const { actor, grant } = ownerOf(m);
  const reason = reasonOrGap(args.reason);
  const updatedDecision = revise(m, dec as unknown as AnyEntity, at, {
    status: args.optionId ? 'accepted' : 'rejected',
    accepted_option_id: args.optionId,
    rationale: reason,
    authorized_by_grant_id: grant!.id,
    authorization_grant_revision: grant!.revision,
    acceptance_source: userLocator(actionId, at, '在决策卡上作出选择', 'decision-card'),
    accepted_at: args.optionId ? at : null,
  } as Partial<AnyEntity>, actionId, '在决策卡上作出选择', 'decision-card');

  const entities: AnyEntity[] = [updatedDecision];
  const command = { kind: 'decide_decision', decision_id: dec.id, status: args.optionId ? 'accepted' : 'rejected', accepted_option_id: args.optionId, reason };
  // 经由模型的候选作出选择：候选必须仍是待处理状态，且依据的对象仍是当前版本；否则按研究负责人自己的选择记录，候选状态不变
  const candidate = args.viaProposalId ? get<Proposal>(m, args.viaProposalId) : undefined;
  const candidateProblem = !candidate ? null : !isOpenProposal(candidate) ? `该候选已经是“${candidate.status}”状态` : premisesOf(m, candidate) ? '该候选所依据的内容已经变化' : null;
  const via = candidate && !candidateProblem ? candidate : undefined;
  const usedProposalId = via ? via.id : localId('pro', seq);
  if (via) {
    entities.push(revise(m, via as unknown as AnyEntity, at, { status: 'applied', applied_by_event_id: `evt_${seq}` } as Partial<AnyEntity>, actionId, '人工采用模型建议', 'decision-card'));
  } else {
    entities.push({
      id: usedProposalId, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
      provenance: prov(m, actionId, at, '在决策卡上作出选择', 'decision-card'),
      title: `研究负责人选择：${dec.question}`, summary: '人工提出并立即采用的决定。', status: 'applied', base_project_revision: m.project.revision,
      target_revision_refs: [{ entity_id: dec.id, revision: dec.revision }], commands: [command], evidence_ids: dec.evidence_ids,
      expected_impact: '', risk_and_uncertainty: '', requested_grant_actions: [action], created_by: actor, applied_by_event_id: `evt_${seq}`,
    });
  }
  // 依赖旧版本这项决定、仍待处理的其他候选变为“前提已变化”
  for (const p of m.proposals) {
    if (p.id === usedProposalId || !isOpenProposal(p)) continue;
    if (p.target_revision_refs.some((r) => r.entity_id === dec.id && r.revision === dec.revision))
      entities.push(revise(m, p as unknown as AnyEntity, at, { status: 'stale' } as Partial<AnyEntity>, actionId, '前提已变化', 'decision-card'));
  }
  const project = bumpProject(m, at, actionId);
  entities.push(project);
  const opt = dec.options.find((o) => o.id === args.optionId);
  const summary = opt ? `研究负责人采用方案“${opt.label}”（${dec.question}）。理由：${reason}` : `研究负责人决定不采用（${dec.question}）。理由：${reason}`;
  return {
    ok: true,
    message: `${opt ? `已采用方案“${opt.label}”。这表示允许按此推进，不表示科学上已证明；相关路线的状态和执行会话不会因此自动改变，写于决定之前的“下一步”会标为可能已过时。` : '已记录“不采用”。原决定的选项和依据保留在历史中。'}${args.reason?.trim() ? '理由已保存。' : '你没有填写理由，记录里会写明“没有填写理由”。'}${candidateProblem ? `${candidateProblem}，因此没有把这次选择算作采用该候选。` : ''}`,
    events: [event(m, opt ? 'decision.accepted' : 'decision.rejected', summary, entities, [dec.id], project.revision, at)],
  };
}

export function rejectProposal(m: Model, args: { proposalId: string; reason: string }): Result {
  const at = nowIso();
  const err = ownerUsableCheck(m);
  if (err) return { ok: false, error: err };
  const p = get<Proposal>(m, args.proposalId);
  if (!p) return notFound('候选');
  if (!isOpenProposal(p))
    return { ok: false, error: { status: 422, code: 'invalid_transition', message: `候选当前为“${p.status}”，不能拒绝。`, recovery: '无需操作。' } };
  const seq = m.lastSeq + 1;
  const reason = reasonOrGap(args.reason);
  const updated = revise(m, p as unknown as AnyEntity, at, { status: 'rejected', summary: `${p.summary}　拒绝理由：${reason}` } as Partial<AnyEntity>, `act_reject_${seq}`, '拒绝候选', 'decision-card');
  return {
    ok: true,
    message: `已拒绝“${p.title}”。${args.reason?.trim() ? '拒绝理由已保存' : '你没有填写理由，记录里会写明“没有填写理由”'}；之后交给模型的材料会带上这次拒绝和理由。`,
    events: [event(m, 'proposal.rejected', `研究负责人拒绝候选“${p.title}”。理由：${reason}`, [updated], [p.id, ...p.target_revision_refs.map((r) => r.entity_id)], m.project.revision, at)],
  };
}

// ---------------------------------------------------------------- 新建研究单元：所有入口走同一个函数
/**
 * 一个新研究单元需要的全部东西：单元本身、谱系关系（不成环）、带上的证据关系、按模板整理的基础说明。
 * 从快照继续、采用模型建议，以及以后从对话识别、拆分、合并、导入，都必须经过这里，保证同样的不变量和初始化规则。
 */
interface UnitSeed {
  branchId: string;
  /** 所在路线的修订号（新建路线时为 1）。 */
  branchRevision: number;
  title: string;
  question: string;
  purpose: string;
  parents: string[];
  nextAction: string;
  claimIds: string[];
  decisionIds: string[];
  acceptance: ResearchUnit['acceptance_criteria'];
  /** 带进新单元的证据，以及它与已知主张的关系。 */
  evidence: { evidence: Evidence; role: EvidenceRole }[];
  brief: { why: string; findings: string[]; open: string[]; limitations: string[]; gaps: string[] };
  lineageNote: string;
  origin: string;
}

function createUnit(m: Model, ctx: { seq: number; at: string; actionId: string }, seed: UnitSeed): { entities: AnyEntity[]; unitId: string } | { error: ServiceError } {
  if (!seed.title.trim() || !seed.question.trim())
    return { error: { status: 400, code: 'validation_failed', message: '名称和研究问题都需要填写。', recovery: '补全后再建立。' } };
  const lineage = m.edges.filter((e) => e.relation === 'continues_to' && e.state === 'active').map((e) => ({ source: e.source_id, target: e.target_id }));
  const unitId = localId('unt', ctx.seq);
  for (const parent of seed.parents) {
    if (!get<ResearchUnit>(m, parent)) return { error: { status: 422, code: 'invalid_graph', message: `上级单元 ${parent} 不存在。`, recovery: '调整上级单元。' } };
    if (wouldCreateCycle(lineage, parent, unitId)) return { error: { status: 422, code: 'invalid_graph', message: '这条派生关系会形成环。', recovery: '调整上级单元。' } };
  }
  const { actor } = ownerOf(m);
  const unit = {
    id: unitId, revision: 1, project_id: m.project.id, created_at: ctx.at, updated_at: ctx.at, valid_time: { from: ctx.at, to: null },
    provenance: prov(m, ctx.actionId, ctx.at, seed.origin, 'workbench'),
    branch_id: seed.branchId, title: seed.title.trim(), question: seed.question.trim(), purpose: seed.purpose, work_state: 'planned',
    parent_unit_ids: seed.parents, claim_ids: seed.claimIds, decision_ids: seed.decisionIds, evidence_ids: seed.evidence.map((x) => x.evidence.id),
    artifact_version_ids: [], acceptance_criteria: seed.acceptance, blocker: null, next_action: seed.nextAction, owner_principal_id: actor.principal_id, completion: null,
  } as unknown as ResearchUnit;
  const entities: AnyEntity[] = [unit as unknown as AnyEntity];
  for (const parent of seed.parents) {
    const p = get<ResearchUnit>(m, parent)!;
    entities.push(newEdge(m, `edg_local${ctx.seq}_${parent}`, parent, p.revision, 'continues_to', unitId, 1, seed.branchId, seed.lineageNote, ctx.at, ctx.actionId));
  }
  for (const x of seed.evidence)
    entities.push(newEdge(m, `edg_local${ctx.seq}_${x.evidence.id}`, unitId, 1, 'uses', x.evidence.id, x.evidence.revision, seed.branchId, `新单元带上的证据（${x.role === 'contradicts' ? '反证' : x.role === 'limits' ? '限制' : '支持'}）。`, ctx.at, ctx.actionId));
  entities.push(basicBrief(m, ctx, unit, seed) as unknown as AnyEntity);
  return { entities, unitId };
}

/**
 * 新单元的基础说明：只用已有记录按固定模板整理，不做新的分析（generation.mode = template）。
 * 这样新单元一建立就有可读的说明，而不是空白；模型或人工之后再补充（方案 §5.1：说明单独生成）。
 */
function basicBrief(m: Model, ctx: { seq: number; at: string; actionId: string }, unit: ResearchUnit, seed: UnitSeed): ReadingBrief {
  const cur = (id: string) => ({ entity_id: id, revision: m.byId.get(id)!.revision });
  const refs: ReadingBrief['source_revision_refs'] = [
    { entity_id: m.project.id, revision: m.project.revision + 1 },
    { entity_id: seed.branchId, revision: seed.branchRevision },
    { entity_id: unit.id, revision: 1 },
    ...seed.parents.map(cur),
    ...seed.decisionIds.filter((id) => m.byId.has(id)).map(cur),
    ...seed.claimIds.filter((id) => m.byId.has(id)).map(cur),
    ...seed.evidence.map((x) => ({ entity_id: x.evidence.id, revision: x.evidence.revision })),
  ];
  // 合同规定“已经知道”最多3条：多出的并入第3条
  const findings = seed.brief.findings.length > 3 ? [...seed.brief.findings.slice(0, 2), seed.brief.findings.slice(2).join(' ')] : seed.brief.findings;
  const templateActor: ActorRef = { principal_id: 'svc_brief_template', kind: 'service', authentication_ref: 'auth_internal_template', grant_id: null };
  const problem = (m.project as { problem_statement?: string }).problem_statement ?? '';
  return {
    id: localId('brf', ctx.seq),
    revision: 1,
    project_id: m.project.id,
    created_at: ctx.at,
    updated_at: ctx.at,
    valid_time: { from: ctx.at, to: null },
    provenance: {
      observation_kind: 'inferred',
      source_refs: [userLocator(ctx.actionId, ctx.at, '新建研究单元时按模板生成基础说明', 'workbench')],
      created_by: templateActor,
      derivation_note: '按固定模板整理已有记录，没有模型参与，也没有新的分析。',
    },
    unit_id: unit.id,
    audience: 'general_researcher',
    source_revision_refs: refs,
    title: unit.title,
    project_background: `${m.project.goal}${problem}`,
    why_this_work: seed.brief.why,
    current_question: unit.question,
    prerequisites: [],
    method_explanation: '还没有方法说明。开始工作前需要补充做法和完成条件。',
    key_findings: findings as ReadingBrief['key_findings'],
    not_yet_established: [...seed.brief.open, '这项工作自己的结果：还没有开始。'],
    implementation_changes: [],
    project_impact: '尚未开展，暂时不影响其他工作。',
    recommended_next_step: unit.next_action,
    decision_request: null,
    evidence_links: seed.evidence.map((x) => ({
      evidence_id: x.evidence.id,
      label: x.evidence.title,
      relationship: x.role === 'contradicts' ? ('contradicts' as const) : x.role === 'limits' ? ('limitation' as const) : ('supports' as const),
      source_locator: x.evidence.source_locator,
    })),
    limitations: ['这是系统按模板生成的基础说明，只整理了已有记录，没有新的分析。', ...seed.brief.limitations],
    readability_checks: { unexplained_terms: [], unresolved_references: [], source_gaps: ['还没有方法说明，也没有这项工作自己的证据。', ...seed.brief.gaps], status: 'not_checked' },
    generation: {
      mode: 'template',
      model_provider: null,
      model_id: null,
      prompt_template_id: null,
      template_version: 'unit-basic-0.2',
      input_sha256: sha256Hex(JSON.stringify(refs)),
      generated_at: ctx.at,
      processing_command_id: null,
    },
  } as ReadingBrief;
}

function newEdge(m: Model, id: string, source: string, sourceRev: number, relation: string, target: string, targetRev: number, branchId: string | null, rationale: string, at: string, actionId: string): AnyEntity {
  const edge: GraphEdge = {
    id, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
    provenance: prov(m, actionId, at, '建立关系', 'workbench'),
    source_id: source, target_id: target, relation: relation as GraphEdge['relation'], branch_id: branchId, rationale, state: 'active',
    source_revision: sourceRev, target_revision: targetRev, binding_semantics: relation === 'continues_to' ? 'identity_lineage' : 'exact_revision', currency: 'current',
  };
  return edge as unknown as AnyEntity;
}

/** 人工采用一个创建研究单元的候选（例如模型建议的新单元）。 */
export function applyCreateUnitProposal(m: Model, args: { proposalId: string; expectedRevision: number; expectedTargetRevision: number }): Result {
  const at = nowIso();
  const p = get<Proposal>(m, args.proposalId);
  if (!p) return notFound('候选');
  const conflict = checkRevision(args.expectedRevision, m.project.revision) ?? checkRevision(args.expectedTargetRevision, p.revision, '候选');
  if (conflict) return { ok: false, error: conflict };
  if (!isOpenProposal(p))
    return { ok: false, error: { status: 422, code: 'invalid_transition', message: `候选当前为“${p.status}”，不能采用。`, recovery: '无需操作。' } };
  const premises = premisesOf(m, p);
  if (premises) return { ok: false, error: premises };
  for (const action of p.requested_grant_actions) {
    const err = ownerGrantCheck(m, action);
    if (err) return { ok: false, error: err };
  }
  const seq = m.lastSeq + 1;
  const actionId = `act_apply_${seq}`;
  const entities: AnyEntity[] = [];
  const checks = m.ext.rule_checks[p.id] ?? [];
  const evidence = p.evidence_ids.map((id) => get<Evidence>(m, id)).filter(Boolean) as Evidence[];
  for (const cmd of p.commands) {
    if (cmd.kind !== 'create_research_unit') return { ok: false, error: { status: 501, code: 'capability_unsupported', message: `样机未实现命令 ${cmd.kind}。`, recovery: '阶段A只演示部分命令。' } };
    const branch = m.branches.find((b) => b.id === cmd.branch_id);
    const created = createUnit(m, { seq, at, actionId }, {
      branchId: cmd.branch_id,
      branchRevision: branch?.revision ?? 1,
      title: cmd.title,
      question: cmd.question,
      purpose: cmd.purpose,
      parents: cmd.parent_unit_ids,
      nextAction: checks.length ? '尚未开始。先处理采用时规则检查发现的问题（见说明的“还不知道”）。' : '尚未开始。',
      claimIds: [],
      decisionIds: [],
      acceptance: cmd.acceptance_criteria,
      evidence: [],
      brief: {
        why: `采用了模型的建议“${p.title.replace(/^建议：/, '')}”。建议的内容：${p.summary}`,
        findings: evidence.length ? [`建议时引用的依据：${evidence.map((e) => e.title).join('；')}。`] : [],
        open: [
          ...(evidence.length ? [] : ['这条建议声称的效果还没有任何证据。']),
          ...checks.map((c) => `采用时规则检查发现：${c.rule}。`),
        ],
        limitations: p.risk_and_uncertainty ? [`建议本身写明的风险与不确定：${p.risk_and_uncertainty}`] : [],
        gaps: [],
      },
      lineageNote: '采用候选后新建的后继单元。',
      origin: '采用候选，新建研究单元',
    });
    if ('error' in created) return { ok: false, error: created.error };
    entities.push(...created.entities);
  }
  entities.push(revise(m, p as unknown as AnyEntity, at, { status: 'applied', applied_by_event_id: `evt_${seq}` } as Partial<AnyEntity>, actionId, '人工采用候选', 'decision-card'));
  const project = bumpProject(m, at, actionId);
  entities.push(project);
  return {
    ok: true,
    message: `已采用“${p.title}”，新建了一个计划中的研究单元，并生成了基础说明。规则检查发现的问题写进了说明，也保留在记录中。`,
    events: [event(m, 'proposal.applied', `研究负责人采用候选“${p.title}”。`, entities, [p.id], project.revision, at)],
  };
}

/** 演示：模型凭证尝试调用 HTTP apply（AC-001）。不改变任何状态。 */
export function agentApplyAttempt(m: Model, args: { proposalId: string }): Result {
  const err = checkApplyPrincipal('agent')!;
  const at = nowIso();
  return {
    ok: false,
    error: err,
    flags: { ruleDemos: [...m.flags.ruleDemos, { at, action: `模型尝试采用“${displayName(m, args.proposalId)}”`, status: err.status, code: err.code, message: err.message }] },
  };
}

// ---------------------------------------------------------------- 待关注事项（界面层标记，不改变项目状态）
export function defer(m: Model, args: { id: string; reason: string }): Result {
  return { ok: true, message: '已暂缓。没有新证据时不会再次提醒；出现新的重大反证会重新打开并说明原因。', flags: { deferred: { ...m.flags.deferred, [args.id]: { at: nowIso(), reason: args.reason } } } };
}
export function undefer(m: Model, args: { id: string }): Result {
  const { [args.id]: _removed, ...rest } = m.flags.deferred;
  return { ok: true, message: '已恢复提醒。', flags: { deferred: rest } };
}
export function requestInfo(m: Model, args: { targetId: string; text: string }): Result {
  const at = nowIso();
  return {
    ok: true,
    message: '已记录补充信息的请求。样机不连接模型，因此不会自动产生回复；真实系统会在下一个可用回合把请求交给模型。',
    flags: { infoRequests: [...m.flags.infoRequests, { id: `req_${at}`, targetId: args.targetId, text: args.text, at }] },
  };
}
export function briefFeedback(m: Model, args: { briefId: string; revision: number; kind: string }): Result {
  return {
    ok: true,
    message: `已记录反馈“${args.kind}”（针对说明${versionText(args.revision)}）。反馈用于修订说明，不改变项目的科学状态。`,
    flags: { feedback: [...m.flags.feedback, { ...args, at: nowIso() }] },
  };
}

// ---------------------------------------------------------------- 会话控制（按能力清单诚实降级）
export function interruptSession(m: Model, args: { sessionId: string }): Result {
  const s = m.sessions.find((x) => x.id === args.sessionId);
  if (!s) return notFound('会话');
  const cap = m.caps.find((c) => c.harness_instance_id === s.harness_instance_id);
  const support = (cap?.capabilities as Record<string, { support: string }> | undefined)?.interruptTurn?.support;
  const err = checkCapability(support, '中断回合', '请切换到原客户端中按停止。工作台不会显示“已停止”，直到观测到真实的终态事件。');
  if (err) return { ok: false, error: err };
  return { ok: true, message: '已请求中断，等待停止回执。' };
}

export function startWorkHere(m: Model, args: { unitId: string }): Result {
  const running = m.sessions.find((s) => s.unit_id === args.unitId && ['pending', 'running', 'interrupt_requested'].includes(s.state));
  if (running)
    return { ok: false, error: { status: 409, code: 'revision_conflict', message: `该单元已有正在执行的会话（${running.provider_session_id}）。`, recovery: '如需并行或转移，请先在原客户端确认，避免两个执行者修改同一工作目录。' } };
  const cap = m.caps.find((c) => c.connection_mode === 'sidecar');
  const support = (cap?.capabilities as Record<string, { support: string }> | undefined)?.createSession?.support;
  const err = checkCapability(support, '创建会话', '当前连接不能从工作台启动会话：请在原客户端中继续对话。你可以复制下方的交接材料并手动粘贴；未收到会话回执之前，工作台不会显示“已同步”。');
  if (err) return { ok: false, error: err };
  return { ok: true, message: '已请求启动托管会话。' };
}

// ---------------------------------------------------------------- 从快照继续（默认新建分支，不覆盖当前目录）
export interface ForkPreview {
  checkpoint: Checkpoint;
  inherit: { id: string; note: string }[];
  history: { id: string; note: string }[];
  revalidate: { id: string; note: string }[];
  /** 快照之后发现、挑战或限制快照时已知主张的证据。从快照继续时必须带上，不能悄悄恢复已知不成立的假设（方案 §4.6）。 */
  later: { evidence: Evidence; relations: { claim_id: string; role: EvidenceRole }[] }[];
}

export function forkPreview(m: Model, checkpointId: string): ForkPreview | null {
  const ckp = get<Checkpoint>(m, checkpointId);
  if (!ckp) return null;
  const inherit: ForkPreview['inherit'] = [];
  const history: ForkPreview['history'] = [];
  for (const id of ckp.effective_decision_ids) {
    const d = get<Decision>(m, id);
    if (!d) continue;
    if (d.status === 'accepted') inherit.push({ id, note: '仍然有效，作为当前约束继承。' });
    else history.push({ id, note: `快照之后状态变为“${d.status}”，只作历史保留。` });
  }
  const revalidate: ForkPreview['revalidate'] = [];
  for (const ref of ckp.entity_revision_refs) {
    if (!ref.entity_id.startsWith('clm_')) continue;
    const now = get<Claim>(m, ref.entity_id);
    const then = revisionAt(m, ref.entity_id, ref.revision) as unknown as Claim | undefined;
    if (now && now.revision !== ref.revision)
      revalidate.push({ id: ref.entity_id, note: `快照时为${versionText(ref.revision)}（${then?.assessment ?? '未知'}），现在为${versionText(now.revision)}（${now.assessment}）。需要按当前证据重新判断。` });
  }
  const known = new Set(ckp.known_claim_ids);
  const later = m.evidence
    .filter((e) => e.created_at > ckp.created_at)
    .map((e) => ({
      evidence: e,
      relations: evidenceClaims(m, [e.id]).filter((r) => known.has(r.claim_id) && r.role !== 'supports' && r.validity !== 'historical').map((r) => ({ claim_id: r.claim_id, role: r.role })),
    }))
    .filter((x) => x.relations.length);
  return { checkpoint: ckp, inherit, history, revalidate, later };
}

export function forkFromCheckpoint(m: Model, args: { checkpointId: string; name: string; question: string; createWorktree: boolean; expectedRevision: number }): Result {
  const at = nowIso();
  const preview = forkPreview(m, args.checkpointId);
  if (!preview) return notFound('快照');
  const conflict = checkRevision(args.expectedRevision, m.project.revision);
  if (conflict) return { ok: false, error: conflict };
  const err = ownerGrantCheck(m, 'branch.create');
  if (err) return { ok: false, error: err };
  if (!args.name.trim() || !args.question.trim())
    return { ok: false, error: { status: 400, code: 'validation_failed', message: '路线名称和研究问题都需要填写。', recovery: '补全后再建立。' } };
  const ckp = preview.checkpoint;
  const seq = m.lastSeq + 1;
  const actionId = `act_fork_${seq}`;
  const branchId = localId('brn', seq);
  const baseUnit = get<ResearchUnit>(m, ckp.unit_id)!;
  const inheritedDecisions = preview.inherit.map((x) => x.id);
  const branch = {
    id: branchId, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
    provenance: prov(m, actionId, at, `从快照“${ckp.title}”继续`, 'checkpoint'),
    name: args.name.trim(), purpose: args.question.trim(), state: 'proposed', derived_from_branch_id: ckp.branch_id, base_unit_id: ckp.unit_id, base_checkpoint_id: ckp.id,
    context_revision: 1, effective_decision_ids: inheritedDecisions, open_claim_ids: preview.revalidate.map((x) => x.id), closure_reason: null,
  };
  const created = createUnit(m, { seq, at, actionId }, {
    branchId,
    branchRevision: 1,
    title: args.name,
    question: args.question,
    purpose: `从快照“${ckp.title}”继续的新路线。`,
    parents: [ckp.unit_id],
    nextAction: '补充完成条件，并决定开展时机。',
    claimIds: preview.revalidate.map((x) => x.id),
    decisionIds: inheritedDecisions,
    acceptance: [],
    evidence: preview.later.map((x) => ({ evidence: x.evidence, role: x.relations.some((r) => r.role === 'contradicts') ? 'contradicts' : 'limits' })),
    brief: {
      why: `这条路线从快照“${ckp.title}”（${fmtTime(ckp.created_at)}）继续，出发点是“${baseUnit.title}”。你给出的研究问题是：${args.question.trim()}`,
      findings: [
        ...(preview.inherit.length ? [`继承的决定：${preview.inherit.map((x) => displayName(m, x.id)).join('；')}。`] : []),
        ...(preview.later.length ? [`快照之后发现、已经带上的反证或限制：${preview.later.map((x) => x.evidence.title).join('；')}。`] : []),
      ],
      open: preview.revalidate.map((x) => `需要按当前证据重新判断：${displayName(m, x.id)}`),
      limitations: [],
      gaps: [],
    },
    lineageNote: `从快照“${ckp.title}”继续。`,
    origin: '从快照继续，新建起始研究单元',
  });
  if ('error' in created) return { ok: false, error: created.error };
  const entities: AnyEntity[] = [branch as unknown as AnyEntity, ...created.entities];
  const project = bumpProject(m, at, actionId);
  entities.push(project);
  const n = preview.later.length;
  return {
    ok: true,
    message: `已新建路线“${args.name.trim()}”（待开始），并生成了一份基础说明。当前工作目录保持不变。${args.createWorktree ? '已记录“需要独立代码工作区”的请求；样机不能创建工作区，界面会一直标为“尚未创建”。' : ''}${n ? `已带上 ${n} 条快照之后发现的反证或限制。` : ''}`,
    events: [{
      ...event(m, 'branch.created', `研究负责人从快照“${ckp.title}”继续，新建路线“${args.name.trim()}”${args.createWorktree ? '，并要求独立代码工作区（尚未创建）' : ''}。`, entities, [ckp.id, ...preview.later.map((x) => x.evidence.id)], project.revision, at),
      requests: args.createWorktree ? [{ branch_id: branchId, unit_id: created.unitId, requested_at: at, status: 'requested' as const }] : undefined,
    }],
  };
}

// ---------------------------------------------------------------- 授权撤销（AC-038：撤销后阻止新动作，不伪装回滚已发生的副作用）
export function revokeGrant(m: Model, args: { grantId: string; expectedRevision: number; reason: string }): Result {
  const at = nowIso();
  const err = ownerUsableCheck(m);
  if (err) return { ok: false, error: err };
  const g = get<AnyEntity & { status: string; revision: number }>(m, args.grantId);
  if (!g) return notFound('授权');
  const conflict = checkRevision(args.expectedRevision, m.project.revision);
  if (conflict) return { ok: false, error: conflict };
  if (g.status !== 'active') return { ok: false, error: { status: 422, code: 'invalid_transition', message: '这项授权已经不是有效状态。', recovery: '无需操作。' } };
  const seq = m.lastSeq + 1;
  const actionId = `act_revoke_${seq}`;
  const updated = revise(m, g, at, { status: 'revoked', revoked_at: at, reason: `${g.reason as string}　撤销理由：${reasonOrGap(args.reason)}` } as Partial<AnyEntity>, actionId, '撤销授权', 'grants');
  const project = bumpProject(m, at, actionId);
  return {
    ok: true,
    message: '授权已撤销。之后的新动作会按新状态检查并被拒绝；已经发生的变更和外部副作用不会因此被撤回。如需停止正在运行的任务，请另行请求中断。',
    events: [event(m, 'grant.revoked', `研究负责人撤销授权 ${g.id}。`, [updated, project], [g.id], project.revision, at)],
  };
}

/** 模拟内部策略服务用某项授权自动应用常规变更（AC-004、AC-041、AC-038）。 */
export function policyApplyRoutine(m: Model, args: { grantId: string; unitId: string; nextAction: string }): Result {
  const at = nowIso();
  const g = get<Parameters<typeof grantCovers>[0]>(m, args.grantId);
  const unit = get<ResearchUnit>(m, args.unitId);
  if (!g || !unit) return notFound('授权或研究单元');
  const policyActor: ActorRef = { principal_id: 'svc_policy', kind: 'service', authentication_ref: 'auth_internal_policy', grant_id: g.id };
  const res = grantCovers(g, 'unit.revise', { projectId: m.project.id, unitId: unit.id, branchId: unit.branch_id }, policyActor, at);
  if (!res.ok) return { ok: false, error: { status: 403, code: 'forbidden', message: `策略服务没有应用：${res.reason}`, recovery: '候选会保留，等待你在决策中心处理。' } };
  const seq = m.lastSeq + 1;
  const actionId = `act_policy_${seq}`;
  const updated = {
    ...revise(m, unit as unknown as AnyEntity, at, { next_action: args.nextAction } as Partial<AnyEntity>, actionId, '策略服务依据授权应用', 'policy'),
    provenance: { observation_kind: 'observed', source_refs: [userLocator(actionId, at, `策略服务依据授权 ${g.id} 自动应用（引用授权，不冒充人工操作）`, 'policy')], created_by: policyActor, derivation_note: '阶段A样机中的模拟操作。' },
  };
  const project = bumpProject(m, at, actionId);
  return {
    ok: true,
    message: `策略服务在授权“${displayName(m, g.id)}”范围内更新了“${unit.title}”的下一步，没有再次询问你；事件记录的执行者是服务并引用该授权。`,
    events: [{ ...event(m, 'proposal.applied', `策略服务依据 ${g.id} 更新“${unit.title}”的下一步。`, [updated, project], [g.id, unit.id], project.revision, at), actor: policyActor }],
  };
}
