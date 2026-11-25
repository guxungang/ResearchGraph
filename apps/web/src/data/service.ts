// 样机内的“本地服务”模拟。阶段A没有真实服务端：这里在浏览器中按方案 §14.4 的顺序做检查
// （身份 → 版本 → 状态转换 → 图关系 → 授权），通过后生成新的对象修订和一条本地事件。
// 所有结果只保存在本机浏览器存储中，不写入任何项目；界面上有明确提示。
import type { ActorRef, Checkpoint, Claim, Decision, Evidence, GraphEdge, Proposal, Provenance, ResearchUnit, ReviewRecord } from '@rw/contracts';
import { checkApplyPrincipal, checkCapability, checkRevision, grantCovers, wouldCreateCycle, type ServiceError } from '@rw/domain';
import { get, revisionAt, type AnyEntity, type Flags, type LocalEvent, type Model } from './model.ts';
import { displayName, versionText } from './format.ts';

export type Result = { ok: true; message: string; events?: LocalEvent[]; flags?: Partial<Flags> } | { ok: false; error: ServiceError; flags?: Partial<Flags> };

const OWNER_GRANT = 'grt_owner_core';
const OWNER: ActorRef = { principal_id: 'usr_owner', kind: 'human', authentication_ref: 'auth_local_session', grant_id: OWNER_GRANT };
const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

let counter = 0;
const localId = (prefix: string, seq: number) => `${prefix}_local${seq}${counter++ ? `_${counter}` : ''}`;

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

const prov = (actionId: string, at: string, description: string, surface: string): Provenance => ({
  observation_kind: 'observed' as const,
  source_refs: [userLocator(actionId, at, description, surface)],
  created_by: OWNER,
  derivation_note: '阶段A样机中的模拟操作，只保存在本机浏览器。',
});

function revise<T extends AnyEntity>(e: T, at: string, patch: Partial<T>, actionId: string, what: string, surface: string): T {
  return { ...e, ...patch, revision: e.revision + 1, updated_at: at, provenance: prov(actionId, at, what, surface) } as T;
}

function ownerGrantCheck(m: Model, action: string, target: Parameters<typeof grantCovers>[2] = {}): ServiceError | null {
  const g = get<Parameters<typeof grantCovers>[0]>(m, OWNER_GRANT);
  if (!g) return { status: 403, code: 'forbidden', message: '找不到人工操作授权。', recovery: '在项目设置中确认授权。' };
  const res = grantCovers(g, action, target, nowIso());
  return res.ok ? null : { status: 403, code: 'forbidden', message: res.reason, recovery: '这类操作需要相应范围的授权。' };
}

const event = (m: Model, type: string, summary: string, entities: AnyEntity[], refs: string[], projectRevisionAfter: number, at: string): LocalEvent => ({
  seq: m.lastSeq + 1,
  at,
  type,
  actor: OWNER,
  summary,
  entities,
  refs,
  projectRevisionAfter,
});

const bumpProject = (m: Model, at: string, actionId: string) => revise(m.project as unknown as AnyEntity, at, {}, actionId, '项目语义版本递增', 'workbench');

// ---------------------------------------------------------------- 审阅与理解
export function recordReview(m: Model, args: { targetId: string; status: 'accepted' | 'needs_changes'; findings: string }): Result {
  const at = nowIso();
  const err = ownerGrantCheck(m, 'review.record');
  if (err) return { ok: false, error: err };
  const target = m.byId.get(args.targetId);
  if (!target) return { ok: false, error: { status: 404, code: 'not_found', message: '审阅对象不存在。', recovery: '刷新后重试。' } };
  const seq = m.lastSeq + 1;
  const previous = m.reviews.find((r) => r.target_id === args.targetId && r.reviewed_revision === target.revision && r.is_current);
  const review: ReviewRecord = {
    id: localId('rev', seq),
    revision: 1,
    project_id: m.project.id,
    created_at: at,
    updated_at: at,
    valid_time: { from: at, to: null },
    provenance: prov(`act_review_${seq}`, at, '记录审阅', 'review-panel'),
    target_id: args.targetId,
    reviewed_revision: target.revision,
    review_kind: 'user_review',
    status: args.status,
    reviewer: OWNER,
    understanding_status: (previous?.understanding_status ?? 'not_reported') as ReviewRecord['understanding_status'],
    findings: args.findings ? [args.findings] : [],
    evidence_ids: [],
    is_current: true,
    source_revision_refs: [{ entity_id: args.targetId, revision: target.revision }],
  };
  const name = displayName(m, args.targetId);
  const verdict = args.status === 'accepted' ? '审阅通过' : '需要修改';
  return {
    ok: true,
    message: `已记录：你对“${name}”${versionText(target.revision)}的审阅为“${verdict}”。审阅只针对这个版本；它不授权执行，也不改变任何主张的评估。`,
    events: [event(m, 'review.recorded', `研究负责人对“${name}”${versionText(target.revision)}的审阅：${verdict}。`, [review as unknown as AnyEntity], [args.targetId], m.project.revision, at)],
  };
}

export function markUnderstanding(m: Model, args: { targetId: string; understanding: 'needs_explanation' | 'self_reported_understood' }): Result {
  const at = nowIso();
  const target = m.byId.get(args.targetId);
  if (!target) return { ok: false, error: { status: 404, code: 'not_found', message: '对象不存在。', recovery: '刷新后重试。' } };
  const seq = m.lastSeq + 1;
  const previous = m.reviews.find((r) => r.target_id === args.targetId && r.reviewed_revision === target.revision && r.is_current);
  const review: ReviewRecord = {
    id: localId('rev', seq),
    revision: 1,
    project_id: m.project.id,
    created_at: at,
    updated_at: at,
    valid_time: { from: at, to: null },
    provenance: prov(`act_understanding_${seq}`, at, '标记理解状态', 'review-panel'),
    target_id: args.targetId,
    reviewed_revision: target.revision,
    review_kind: 'user_review',
    status: (previous?.status ?? 'unreviewed') as ReviewRecord['status'],
    reviewer: OWNER,
    understanding_status: args.understanding,
    findings: [],
    evidence_ids: [],
    is_current: true,
    source_revision_refs: [{ entity_id: args.targetId, revision: target.revision }],
  };
  const label = args.understanding === 'needs_explanation' ? '需要补背景' : '已理解';
  return {
    ok: true,
    message: `已记录你本人的标记“${label}”（只针对${versionText(target.revision)}）。理解状态不影响任何科学判断，也不批准任何决定。`,
    events: [event(m, 'review.recorded', `研究负责人标记“${displayName(m, args.targetId)}”${versionText(target.revision)}：${label}。`, [review as unknown as AnyEntity], [args.targetId], m.project.revision, at)],
  };
}

// ---------------------------------------------------------------- 修订研究单元
export function reviseNextAction(m: Model, args: { unitId: string; nextAction: string; expectedRevision: number }): Result {
  const at = nowIso();
  const unit = get<ResearchUnit>(m, args.unitId);
  if (!unit) return { ok: false, error: { status: 404, code: 'not_found', message: '研究单元不存在。', recovery: '刷新后重试。' } };
  const conflict = checkRevision(args.expectedRevision, m.project.revision);
  if (conflict) return { ok: false, error: conflict };
  const err = ownerGrantCheck(m, 'unit.revise', { unitId: unit.id, branchId: unit.branch_id });
  if (err) return { ok: false, error: err };
  if (!args.nextAction.trim()) return { ok: false, error: { status: 400, code: 'validation_failed', message: '下一步说明不能为空。', recovery: '填写下一步后再保存。' } };
  const seq = m.lastSeq + 1;
  const updated = revise(unit as unknown as AnyEntity, at, { next_action: args.nextAction.trim() }, `act_revise_${seq}`, '修订下一步说明', 'unit-detail');
  const project = bumpProject(m, at, `act_revise_${seq}`);
  const oldReviews = m.reviews.filter((r) => r.target_id === unit.id && r.is_current).length;
  return {
    ok: true,
    message: `“${unit.title}”已更新为${versionText(updated.revision)}。${oldReviews ? `此前针对${versionText(unit.revision)}的审阅保留，但不再是当前审阅；` : ''}引用旧版本的阅读说明会标记为过时，在新说明完成前保留旧版。`,
    events: [event(m, 'unit.changed', `研究负责人修订“${unit.title}”的下一步说明（${versionText(updated.revision)}）。`, [updated, project], [unit.id], project.revision, at)],
  };
}

// ---------------------------------------------------------------- 决策
export function decide(m: Model, args: { decisionId: string; optionId: string | null; reason: string; expectedRevision: number; viaProposalId?: string }): Result {
  const at = nowIso();
  const dec = get<Decision>(m, args.decisionId);
  if (!dec) return { ok: false, error: { status: 404, code: 'not_found', message: '决定不存在。', recovery: '刷新后重试。' } };
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
  const grant = get<{ revision: number }>(m, OWNER_GRANT)!;
  const updatedDecision = revise(dec as unknown as AnyEntity, at, {
    status: args.optionId ? 'accepted' : 'rejected',
    accepted_option_id: args.optionId,
    rationale: args.reason || dec.rationale,
    authorized_by_grant_id: OWNER_GRANT,
    authorization_grant_revision: grant.revision,
    acceptance_source: userLocator(actionId, at, '在决策卡上作出选择', 'decision-card'),
    accepted_at: args.optionId ? at : null,
  } as Partial<AnyEntity>, actionId, '在决策卡上作出选择', 'decision-card');

  const entities: AnyEntity[] = [updatedDecision];
  const command = { kind: 'decide_decision', decision_id: dec.id, status: args.optionId ? 'accepted' : 'rejected', accepted_option_id: args.optionId, reason: args.reason || '研究负责人的选择' };
  const via = args.viaProposalId ? get<Proposal>(m, args.viaProposalId) : undefined;
  const usedProposalId = via ? via.id : localId('pro', seq);
  if (via) {
    entities.push(revise(via as unknown as AnyEntity, at, { status: 'applied', applied_by_event_id: `evt_${seq}` } as Partial<AnyEntity>, actionId, '人工采用模型建议', 'decision-card'));
  } else {
    entities.push({
      id: usedProposalId, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
      provenance: prov(actionId, at, '在决策卡上作出选择', 'decision-card'),
      title: `研究负责人选择：${dec.question}`, summary: '人工提出并立即采用的决定。', status: 'applied', base_project_revision: m.project.revision,
      target_revision_refs: [{ entity_id: dec.id, revision: dec.revision }], commands: [command], evidence_ids: dec.evidence_ids,
      expected_impact: '', risk_and_uncertainty: '', requested_grant_actions: [action], created_by: OWNER, applied_by_event_id: `evt_${seq}`,
    });
  }
  // 依赖旧版本这项决定的其他候选变为“前提已变化”
  for (const p of m.proposals) {
    if (p.id === usedProposalId || p.status !== 'candidate') continue;
    if (p.target_revision_refs.some((r) => r.entity_id === dec.id && r.revision === dec.revision))
      entities.push(revise(p as unknown as AnyEntity, at, { status: 'stale' } as Partial<AnyEntity>, actionId, '前提已变化', 'decision-card'));
  }
  const project = bumpProject(m, at, actionId);
  entities.push(project);
  const opt = dec.options.find((o) => o.id === args.optionId);
  const summary = opt ? `研究负责人采用方案“${opt.label}”（${dec.question}）。` : `研究负责人决定不采用（${dec.question}）。`;
  return {
    ok: true,
    message: opt
      ? `已采用方案“${opt.label}”。这表示允许按此推进，不表示科学上已证明；相关路线的状态和执行会话不会因此自动改变。`
      : '已记录“不采用”。原决定的选项和依据保留在历史中。',
    events: [event(m, opt ? 'decision.accepted' : 'decision.rejected', summary, entities, [dec.id], project.revision, at)],
  };
}

export function rejectProposal(m: Model, args: { proposalId: string; reason: string }): Result {
  const at = nowIso();
  const p = get<Proposal>(m, args.proposalId);
  if (!p) return { ok: false, error: { status: 404, code: 'not_found', message: '候选不存在。', recovery: '刷新后重试。' } };
  if (p.status !== 'candidate' && p.status !== 'ready')
    return { ok: false, error: { status: 422, code: 'invalid_transition', message: `候选当前为“${p.status}”，不能拒绝。`, recovery: '无需操作。' } };
  const seq = m.lastSeq + 1;
  const updated = revise(p as unknown as AnyEntity, at, { status: 'rejected', summary: `${p.summary}　拒绝理由：${args.reason || '未填写'}` } as Partial<AnyEntity>, `act_reject_${seq}`, '拒绝候选', 'decision-card');
  return {
    ok: true,
    message: `已拒绝“${p.title}”。拒绝理由已保存；模型下次检索时会看到它已被拒绝。`,
    events: [event(m, 'proposal.rejected', `研究负责人拒绝候选“${p.title}”。`, [updated], [p.id], m.project.revision, at)],
  };
}

/** 人工采用一个创建研究单元的候选（例如模型建议的新单元）。 */
export function applyCreateUnitProposal(m: Model, args: { proposalId: string; expectedRevision: number; expectedTargetRevision: number }): Result {
  const at = nowIso();
  const p = get<Proposal>(m, args.proposalId);
  if (!p) return { ok: false, error: { status: 404, code: 'not_found', message: '候选不存在。', recovery: '刷新后重试。' } };
  const conflict = checkRevision(args.expectedRevision, m.project.revision) ?? checkRevision(args.expectedTargetRevision, p.revision, '候选');
  if (conflict) return { ok: false, error: conflict };
  if (p.status !== 'candidate' && p.status !== 'ready')
    return { ok: false, error: { status: 422, code: 'invalid_transition', message: `候选当前为“${p.status}”，不能采用。`, recovery: '无需操作。' } };
  for (const action of p.requested_grant_actions) {
    const err = ownerGrantCheck(m, action);
    if (err) return { ok: false, error: err };
  }
  const seq = m.lastSeq + 1;
  const actionId = `act_apply_${seq}`;
  const entities: AnyEntity[] = [];
  const lineage = m.edges.filter((e) => e.relation === 'continues_to').map((e) => ({ source: e.source_id, target: e.target_id }));
  for (const cmd of p.commands) {
    if (cmd.kind !== 'create_research_unit') return { ok: false, error: { status: 501, code: 'capability_unsupported', message: `样机未实现命令 ${cmd.kind}。`, recovery: '阶段A只演示部分命令。' } };
    const unitId = localId('unt', seq);
    entities.push({
      id: unitId, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
      provenance: prov(actionId, at, '采用候选，新建研究单元', 'decision-card'),
      branch_id: cmd.branch_id, title: cmd.title, question: cmd.question, purpose: cmd.purpose, work_state: 'planned', parent_unit_ids: cmd.parent_unit_ids,
      claim_ids: [], decision_ids: [], evidence_ids: [], artifact_version_ids: [], acceptance_criteria: cmd.acceptance_criteria, blocker: null,
      next_action: '尚未开始。', owner_principal_id: 'usr_owner', completion: null,
    });
    for (const parent of cmd.parent_unit_ids) {
      if (wouldCreateCycle(lineage, parent, unitId)) return { ok: false, error: { status: 422, code: 'invalid_graph', message: '这条派生关系会形成环。', recovery: '调整父单元。' } };
      const parentUnit = get<ResearchUnit>(m, parent)!;
      entities.push(newEdge(m, `edg_local${seq}_${parent}`, parent, parentUnit.revision, 'continues_to', unitId, 1, cmd.branch_id, '采用候选后新建的后继单元。', at, actionId));
    }
  }
  entities.push(revise(p as unknown as AnyEntity, at, { status: 'applied', applied_by_event_id: `evt_${seq}` } as Partial<AnyEntity>, actionId, '人工采用候选', 'decision-card'));
  const project = bumpProject(m, at, actionId);
  entities.push(project);
  return {
    ok: true,
    message: `已采用“${p.title}”，在地图上新建了一个计划中的研究单元。规则检查发现的冲突仍然保留在记录中。`,
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
  if (!s) return { ok: false, error: { status: 404, code: 'not_found', message: '会话不存在。', recovery: '刷新后重试。' } };
  const cap = m.caps.find((c) => c.harness_instance_id === s.harness_instance_id);
  const support = (cap?.capabilities as Record<string, { support: string }> | undefined)?.interruptTurn?.support;
  const err = checkCapability(support, '中断回合', '请切换到原客户端（Codex CLI）中按停止。工作台不会显示“已停止”，直到观测到真实的终态事件。');
  if (err) return { ok: false, error: err };
  return { ok: true, message: '已请求中断，等待停止回执。' };
}

export function startWorkHere(m: Model, args: { unitId: string }): Result {
  const running = m.sessions.find((s) => s.unit_id === args.unitId && ['pending', 'running', 'interrupt_requested'].includes(s.state));
  if (running)
    return { ok: false, error: { status: 409, code: 'revision_conflict', message: `该单元已有正在执行的会话（${running.provider_session_id}）。`, recovery: '如需并行或转移，请先在原客户端确认，避免两个执行者修改同一工作目录。' } };
  const cap = m.caps.find((c) => c.connection_mode === 'sidecar');
  const support = (cap?.capabilities as Record<string, { support: string }> | undefined)?.createSession?.support;
  const err = checkCapability(support, '创建会话', '当前是伴随模式：请在原客户端中继续对话。你可以复制下方的交接材料并手动粘贴；未收到会话回执之前，工作台不会显示“已同步”。');
  if (err) return { ok: false, error: err };
  return { ok: true, message: '已请求启动托管会话。' };
}

// ---------------------------------------------------------------- 从快照继续（默认新建分支，不覆盖当前目录）
export interface ForkPreview {
  checkpoint: Checkpoint;
  inherit: { id: string; note: string }[];
  history: { id: string; note: string }[];
  revalidate: { id: string; note: string }[];
  counterevidence: Evidence[];
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
  const counterevidence = m.evidence.filter(
    (e) => e.created_at > ckp.created_at && m.edges.some((g) => g.relation === 'contradicts' && g.source_id === e.id && known.has(g.target_id)),
  );
  return { checkpoint: ckp, inherit, history, revalidate, counterevidence };
}

function newEdge(m: Model, id: string, source: string, sourceRev: number, relation: string, target: string, targetRev: number, branchId: string | null, rationale: string, at: string, actionId: string): AnyEntity {
  const edge: GraphEdge = {
    id, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
    provenance: prov(actionId, at, '建立关系', 'checkpoint'),
    source_id: source, target_id: target, relation: relation as GraphEdge['relation'], branch_id: branchId, rationale, state: 'active',
    source_revision: sourceRev, target_revision: targetRev, binding_semantics: relation === 'continues_to' ? 'identity_lineage' : 'exact_revision', currency: 'current',
  };
  return edge as unknown as AnyEntity;
}

export function forkFromCheckpoint(m: Model, args: { checkpointId: string; name: string; question: string; createWorktree: boolean; expectedRevision: number }): Result {
  const at = nowIso();
  const preview = forkPreview(m, args.checkpointId);
  if (!preview) return { ok: false, error: { status: 404, code: 'not_found', message: '快照不存在。', recovery: '刷新后重试。' } };
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
  const unitId = localId('unt', seq);
  const baseUnit = get<ResearchUnit>(m, ckp.unit_id)!;
  const inheritedDecisions = preview.inherit.map((x) => x.id);
  const branch = {
    id: branchId, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
    provenance: prov(actionId, at, `从快照“${ckp.title}”继续`, 'checkpoint'),
    name: args.name.trim(), purpose: args.question.trim(), state: 'proposed', derived_from_branch_id: ckp.branch_id, base_unit_id: ckp.unit_id, base_checkpoint_id: ckp.id,
    context_revision: 1, effective_decision_ids: inheritedDecisions, open_claim_ids: preview.revalidate.map((x) => x.id), closure_reason: null,
  };
  const unit = {
    id: unitId, revision: 1, project_id: m.project.id, created_at: at, updated_at: at, valid_time: { from: at, to: null },
    provenance: prov(actionId, at, '新建起始研究单元', 'checkpoint'),
    branch_id: branchId, title: args.name.trim(), question: args.question.trim(), purpose: `从快照“${ckp.title}”继续的新路线。`, work_state: 'planned',
    parent_unit_ids: [ckp.unit_id], claim_ids: preview.revalidate.map((x) => x.id), decision_ids: inheritedDecisions,
    evidence_ids: preview.counterevidence.map((e) => e.id), artifact_version_ids: [], acceptance_criteria: [], blocker: null,
    next_action: '补充完成条件，并决定开展时机。', owner_principal_id: 'usr_owner', completion: null,
  };
  const entities: AnyEntity[] = [branch, unit, newEdge(m, `edg_local${seq}_lineage`, ckp.unit_id, baseUnit.revision, 'continues_to', unitId, 1, branchId, `从快照“${ckp.title}”继续。`, at, actionId)];
  for (const e of preview.counterevidence) entities.push(newEdge(m, `edg_local${seq}_${e.id}`, unitId, 1, 'uses', e.id, e.revision, branchId, '从旧快照继续时带上快照之后发现的反证。', at, actionId));
  const project = bumpProject(m, at, actionId);
  entities.push(project);
  return {
    ok: true,
    message: `已新建路线“${args.name.trim()}”（待开始）。当前工作目录保持不变${args.createWorktree ? '；样机不创建真实的代码工作区，只记录“需要独立工作区”' : ''}。已带上 ${preview.counterevidence.length} 条快照之后发现的反证。`,
    events: [event(m, 'branch.created', `研究负责人从快照“${ckp.title}”继续，新建路线“${args.name.trim()}”。`, entities, [ckp.id, ...preview.counterevidence.map((e) => e.id)], project.revision, at)],
  };
}

// ---------------------------------------------------------------- 授权撤销（AC-038：撤销后阻止新动作，不伪装回滚已发生的副作用）
export function revokeGrant(m: Model, args: { grantId: string; expectedRevision: number; reason: string }): Result {
  const at = nowIso();
  const g = get<AnyEntity & { status: string; revision: number }>(m, args.grantId);
  if (!g) return { ok: false, error: { status: 404, code: 'not_found', message: '授权不存在。', recovery: '刷新后重试。' } };
  const conflict = checkRevision(args.expectedRevision, m.project.revision);
  if (conflict) return { ok: false, error: conflict };
  if (g.status !== 'active') return { ok: false, error: { status: 422, code: 'invalid_transition', message: '这项授权已经不是有效状态。', recovery: '无需操作。' } };
  const seq = m.lastSeq + 1;
  const actionId = `act_revoke_${seq}`;
  const updated = revise(g, at, { status: 'revoked', revoked_at: at, reason: `${g.reason as string}　撤销理由：${args.reason || '未填写'}` } as Partial<AnyEntity>, actionId, '撤销授权', 'grants');
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
  if (!g || !unit) return { ok: false, error: { status: 404, code: 'not_found', message: '授权或研究单元不存在。', recovery: '刷新后重试。' } };
  const res = grantCovers(g, 'unit.revise', { unitId: unit.id, branchId: unit.branch_id }, at);
  if (!res.ok) return { ok: false, error: { status: 403, code: 'forbidden', message: `策略服务没有应用：${res.reason}`, recovery: '候选会保留，等待你在决策中心处理。' } };
  const seq = m.lastSeq + 1;
  const actionId = `act_policy_${seq}`;
  const policyActor: ActorRef = { principal_id: 'svc_policy', kind: 'service', authentication_ref: 'auth_internal_policy', grant_id: g.id };
  const updated = { ...revise(unit as unknown as AnyEntity, at, { next_action: args.nextAction } as Partial<AnyEntity>, actionId, '策略服务依据授权应用', 'policy'), provenance: { observation_kind: 'observed', source_refs: [userLocator(actionId, at, `策略服务依据授权 ${g.id} 自动应用（引用授权，不冒充人工操作）`, 'policy')], created_by: policyActor, derivation_note: '阶段A样机中的模拟操作。' } };
  const project = bumpProject(m, at, actionId);
  return {
    ok: true,
    message: `策略服务在授权“${displayName(m, g.id)}”范围内更新了“${unit.title}”的下一步，没有再次询问你；事件记录的执行者是服务并引用该授权。`,
    events: [{ ...event(m, 'proposal.applied', `策略服务依据 ${g.id} 更新“${unit.title}”的下一步。`, [updated, project], [g.id, unit.id], project.revision, at), actor: policyActor }],
  };
}
