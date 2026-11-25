// 领域不变量的纯函数实现（方案 §10.6、§14.4、合同 README 第五节）。
// 阶段A样机用这些函数在浏览器内模拟服务端检查；阶段B由本地事务服务调用同一套函数。

export type PrincipalKind = 'human' | 'agent' | 'service' | 'importer';

export interface ServiceError {
  status: 400 | 403 | 404 | 409 | 422 | 429 | 501 | 503;
  code: string;
  message: string;
  recovery: string;
}

export interface GrantLike {
  id: string;
  revision: number;
  status: string;
  subject_principal_ids: string[];
  actions: string[];
  scope: { kind: string; project_id: string; branch_ids?: string[]; unit_ids?: string[]; proposal_id?: string; proposal_revision?: number };
  expires_at: string | null;
  application_policy: string;
}

export interface GrantTarget {
  projectId: string;
  unitId?: string;
  branchId?: string;
  proposalId?: string;
  proposalRevision?: number;
}

export interface GrantActor {
  principal_id: string;
  kind: PrincipalKind;
}

/**
 * 授权是否覆盖“某个执行者”对“某个目标”做“某个动作”。依次检查：状态与期限、执行者身份、项目、动作、范围、应用策略。
 * 过期、撤销的授权永不覆盖（不变量：旧快照或历史消息不能重新激活授权）。任何授权都不让模型应用变更（合同：应用策略说明）。
 */
export function grantCovers(grant: GrantLike, action: string, target: GrantTarget, actor: GrantActor, now: string): { ok: true } | { ok: false; reason: string } {
  if (grant.status !== 'active') return { ok: false, reason: `授权 ${grant.id} 状态为 ${grant.status === 'expired' ? '已过期' : '已撤销'}，不能用于新的动作。` };
  if (grant.expires_at && grant.expires_at <= now) return { ok: false, reason: `授权 ${grant.id} 已于 ${grant.expires_at} 到期。` };
  if (actor.kind === 'agent') return { ok: false, reason: '模型不能凭任何授权应用变更。' };
  if (!grant.subject_principal_ids.includes(actor.principal_id)) return { ok: false, reason: `授权 ${grant.id} 不是授予 ${actor.principal_id} 的。` };
  const s = grant.scope;
  if (s.project_id !== target.projectId) return { ok: false, reason: `授权 ${grant.id} 属于项目 ${s.project_id}，不能用于项目 ${target.projectId}。` };
  if (!grant.actions.includes(action)) return { ok: false, reason: `授权 ${grant.id} 不包含动作 ${action}。` };
  if (s.kind === 'units' && !(target.unitId && s.unit_ids?.includes(target.unitId))) return { ok: false, reason: `授权 ${grant.id} 只覆盖单元 ${s.unit_ids?.join('、')}。` };
  if (s.kind === 'branches' && !(target.branchId && s.branch_ids?.includes(target.branchId))) return { ok: false, reason: `授权 ${grant.id} 只覆盖分支 ${s.branch_ids?.join('、')}。` };
  if (s.kind === 'proposal' && !(target.proposalId === s.proposal_id && target.proposalRevision === s.proposal_revision))
    return { ok: false, reason: `授权 ${grant.id} 只覆盖提案 ${s.proposal_id} 第${s.proposal_revision}版。` };
  if (grant.application_policy === 'human_only' && actor.kind !== 'human') return { ok: false, reason: `授权 ${grant.id} 只能由人亲自使用。` };
  if (grant.application_policy === 'policy_exact_proposal' && s.kind !== 'proposal') return { ok: false, reason: `授权 ${grant.id} 要求绑定一个具体的提案版本。` };
  return { ok: true };
}

/** 候选依据的对象修订必须仍是当前修订；任何一项已更新都整体拒绝，不部分应用（方案 §14.4）。 */
export function checkProposalPremises(refs: { entity_id: string; revision: number }[], currentRevision: (id: string) => number | undefined): ServiceError | null {
  const changed = refs
    .map((r) => ({ ...r, current: currentRevision(r.entity_id) }))
    .filter((r) => r.current !== r.revision);
  if (!changed.length) return null;
  return {
    status: 409,
    code: 'revision_conflict',
    message: `候选依据的内容已经变化：${changed.map((r) => (r.current === undefined ? `${r.entity_id} 已不存在` : `${r.entity_id} 从第${r.revision}版变为第${r.current}版`)).join('；')}。`,
    recovery: '候选不会被应用。请按当前内容重新生成或重新判断。',
  };
}

/**
 * 审阅的当前性。同一审阅者、同一对象、同一修订、同一类审阅中，只有最新的一条是当前审阅；更早的保留为历史（被更正）。
 * 对象产生新修订后，旧修订上的审阅都不再是当前审阅（AC-021）。
 */
export function reviewCurrency<R extends { id: string; target_id: string; reviewed_revision: number; review_kind: string; created_at: string; reviewer: { principal_id: string } }>(
  reviews: R[],
  currentRevision: (id: string) => number | undefined,
): Map<string, { is_current: boolean; superseded_by: string | null }> {
  const out = new Map<string, { is_current: boolean; superseded_by: string | null }>();
  const latest = new Map<string, R>();
  const key = (r: R) => [r.target_id, r.reviewed_revision, r.reviewer.principal_id, r.review_kind].join('|');
  for (const r of reviews) {
    const k = key(r);
    const cur = latest.get(k);
    if (!cur || r.created_at > cur.created_at || (r.created_at === cur.created_at && r.id > cur.id)) latest.set(k, r);
  }
  for (const r of reviews) {
    const newest = latest.get(key(r))!;
    const supersededBy = newest.id === r.id ? null : newest.id;
    out.set(r.id, { is_current: supersededBy === null && currentRevision(r.target_id) === r.reviewed_revision, superseded_by: supersededBy });
  }
  return out;
}

/** HTTP apply 只允许人类（AC-001、AC-041）。 */
export function checkApplyPrincipal(kind: PrincipalKind): ServiceError | null {
  if (kind === 'human') return null;
  return {
    status: 403,
    code: 'forbidden',
    message: kind === 'agent' ? '模型不能批准或应用候选变更，包括它自己提出的建议。' : '该身份不能调用人工采用接口。',
    recovery: '由研究负责人在决策中心作出选择；已有范围授权的常规变更由内部策略服务处理。',
  };
}

/** 项目语义版本检查：不匹配时整体拒绝、不部分提交（AC-006）。 */
export function checkRevision(expected: number, current: number, what = '项目'): ServiceError | null {
  if (expected === current) return null;
  return {
    status: 409,
    code: 'revision_conflict',
    message: `${what}已从第${expected}版变为第${current}版。`,
    recovery: '查看差异后，按新版本重新判断。',
  };
}

/** 新边是否会在有向图中形成环（AC-023）。 */
export function wouldCreateCycle(edges: { source: string; target: string }[], source: string, target: string): boolean {
  const adj = new Map<string, string[]>();
  for (const e of edges) adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]);
  const stack = [target];
  const seen = new Set<string>();
  while (stack.length) {
    const n = stack.pop()!;
    if (n === source) return true;
    if (seen.has(n)) continue;
    seen.add(n);
    stack.push(...(adj.get(n) ?? []));
  }
  return false;
}

/** 审阅只针对一个精确修订；对象产生新修订后旧审阅不再是当前审阅（AC-021）。 */
export const isReviewCurrent = (reviewedRevision: number, currentRevision: number) => reviewedRevision === currentRevision;

/** 宿主能力不足时明确拒绝，不用提示词假装控制成功（AC-017、AC-030）。 */
export function checkCapability(support: string | undefined, capabilityLabel: string, manual: string): ServiceError | null {
  if (support === 'supported') return null;
  return {
    status: 501,
    code: support === 'unverified' || support === undefined ? 'capability_unverified' : 'capability_unsupported',
    message: `当前连接${support === 'partial' ? '只部分支持' : support === 'unverified' || support === undefined ? '未核验' : '不支持'}“${capabilityLabel}”。`,
    recovery: manual,
  };
}

/** 运行成功退出只说明执行完成，不能改变主张评估（AC-020）。 */
export const runOutcomeAffectsClaim = (_runState: string) => false;
