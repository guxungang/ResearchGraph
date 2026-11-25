// 用阶段A夹具检验样机内模拟服务的语义。对应合同 acceptance-cases.json 中的若干场景（只在样机层面）。
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ProjectSnapshot } from '@rw/contracts';
import { ancestors, buildModel, changesRequested, currentPath, emptyFlags, reviewQueue, todo, unitBrief, unitDepth, type AnyEntity, type LocalEvent, type Model } from './model.ts';
import { attentionItems, buildHandoff, claimEvidence, compareRoutes } from './derive.ts';
import { hrefFor } from './format.ts';
import * as svc from './service.ts';

const root = new URL('../../../../', import.meta.url);
const snapshot = JSON.parse(readFileSync(new URL('fixtures/stage-a/stage-a.snapshot.json', root), 'utf8')) as ProjectSnapshot;
const ext = JSON.parse(readFileSync(new URL('fixtures/stage-a/stage-a.extensions.json', root), 'utf8'));

const fresh = () => buildModel(snapshot, ext, [], emptyFlags());
const apply = (m: Model, r: svc.Result): Model => {
  if (!r.ok) throw new Error(`${r.error.status} ${r.error.message}`);
  return buildModel(snapshot, ext, [...m.local, ...((r.events ?? []) as LocalEvent[])], { ...m.flags, ...(r.flags ?? {}) });
};

describe('权限', () => {
  it('模型身份尝试采用候选：403，状态不变（AC-001）', () => {
    const m = fresh();
    const r = svc.agentApplyAttempt(m, { proposalId: 'pro_add_network' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.status).toBe(403);
    expect(m.proposals.find((p) => p.id === 'pro_add_network')?.status).toBe('candidate');
  });
  it('范围授权内的常规更新直接应用，执行者是服务并引用授权（AC-004、AC-041）', () => {
    const m = fresh();
    const m2 = apply(m, svc.policyApplyRoutine(m, { grantId: 'grt_routine', unitId: 'unt_alloc_exp', nextAction: '新的下一步' }));
    expect(m2.local.at(-1)?.actor.kind).toBe('service');
    expect(m2.local.at(-1)?.actor.grant_id).toBe('grt_routine');
    expect(m2.units.find((u) => u.id === 'unt_alloc_exp')?.revision).toBe(3);
  });
  it('范围外的单元不会被自动应用', () => {
    const m = fresh();
    expect(svc.policyApplyRoutine(m, { grantId: 'grt_routine', unitId: 'unt_c_weight', nextAction: 'x' }).ok).toBe(false);
  });
  it('撤销授权后，原本范围内的更新也被拒绝（AC-038）', () => {
    const m = fresh();
    const m2 = apply(m, svc.revokeGrant(m, { grantId: 'grt_routine', expectedRevision: m.project.revision, reason: '测试' }));
    expect(svc.policyApplyRoutine(m2, { grantId: 'grt_routine', unitId: 'unt_alloc_exp', nextAction: 'x' }).ok).toBe(false);
  });
  it('已过期的授权不会因为回看历史而复活', () => {
    const m = fresh();
    expect(svc.policyApplyRoutine(m, { grantId: 'grt_calib_routine', unitId: 'unt_calib_exp', nextAction: 'x' }).ok).toBe(false);
  });
});

describe('并发', () => {
  it('项目版本过期时整体拒绝，不产生事件（AC-006）', () => {
    const m = fresh();
    const r = svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_after', reason: '', expectedRevision: m.project.revision - 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.status).toBe(409);
  });
  it('采用决定后，依赖旧版本的模型建议变为“前提已变化”', () => {
    const m = fresh();
    const m2 = apply(m, svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_after', reason: '', expectedRevision: m.project.revision }));
    expect(m2.decisions.find((d) => d.id === 'dec_start_c')?.status).toBe('accepted');
    expect(m2.proposals.find((p) => p.id === 'pro_c_timing')?.status).toBe('stale');
    expect(m2.project.revision).toBe(m.project.revision + 1);
  });
});

describe('状态分离', () => {
  it('采用方案不改变主张评估，也不改变路线状态（§4.5）', () => {
    const m = fresh();
    const m2 = apply(m, svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_now', reason: '', expectedRevision: m.project.revision, viaProposalId: 'pro_c_timing' }));
    expect(m2.claims.find((c) => c.id === 'clm_weight_needed')?.assessment).toBe('unassessed');
    expect(m2.branches.find((b) => b.id === 'brn_c')?.state).toBe('proposed');
    expect(m2.proposals.find((p) => p.id === 'pro_c_timing')?.status).toBe('applied');
  });
  it('实验成功退出不改变主张（AC-020）', () => {
    const m = fresh();
    expect(m.runs.find((r) => r.id === 'run_calib')?.run_state).toBe('succeeded');
    expect(m.claims.find((c) => c.id === 'clm_completion')?.assessment).toBe('unassessed');
  });
  it('新修订让旧审阅不再是当前审阅（AC-021）', () => {
    const m = fresh();
    const m2 = apply(m, svc.recordReview(m, { targetId: 'unt_calib_exp', status: 'accepted', findings: '' }));
    expect(m2.reviews.filter((r) => r.target_id === 'unt_calib_exp' && r.is_current)).toHaveLength(1);
    const m3 = apply(m2, svc.reviseNextAction(m2, { unitId: 'unt_calib_exp', nextAction: '新的说明', expectedRevision: m2.project.revision }));
    expect(m3.reviews.filter((r) => r.target_id === 'unt_calib_exp' && r.is_current)).toHaveLength(0);
  });
  it('理解状态只能由本人标记，且不改变审阅结论（AC-022）', () => {
    const m = fresh();
    const m2 = apply(m, svc.markUnderstanding(m, { targetId: 'brf_alloc_exp', understanding: 'self_reported_understood' }));
    const r = m2.reviews.find((x) => x.target_id === 'brf_alloc_exp' && x.is_current)!;
    expect(r.understanding_status).toBe('self_reported_understood');
    expect(r.status).toBe('unreviewed');
  });
});

describe('会话与分支', () => {
  it('伴随模式不能中断：501，状态不变（AC-017）', () => {
    const m = fresh();
    const r = svc.interruptSession(m, { sessionId: 'ses_alloc' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.status).toBe(501);
    expect(m.sessions.find((s) => s.id === 'ses_alloc')?.state).toBe('running');
  });
  it('从快照继续：新建分支、带上后来的反证与限制、原路线不变（AC-025、AC-040）', () => {
    const m = fresh();
    const preview = svc.forkPreview(m, 'ckp_calib')!;
    const peak = preview.later.find((x) => x.evidence.id === 'evd_peak')!;
    expect(peak.relations).toEqual([{ claim_id: 'clm_calib_all_periods', role: 'limits' }]);
    expect(preview.revalidate.map((x) => x.id)).toContain('clm_calib_all_periods');
    const m2 = apply(m, svc.forkFromCheckpoint(m, { checkpointId: 'ckp_calib', name: '路线D', question: '分时段校准？', createWorktree: true, expectedRevision: m.project.revision }));
    const newBranch = m2.branches.find((b) => b.base_checkpoint_id === 'ckp_calib' && b.id !== 'brn_c')!;
    expect(newBranch.state).toBe('proposed');
    expect(m2.edges.some((e) => e.relation === 'uses' && e.target_id === 'evd_peak' && e.branch_id === newBranch.id)).toBe(true);
    expect(m2.project.main_branch_id).toBe('brn_main');
    expect(m2.units.find((u) => u.id === 'unt_calib_exp')?.revision).toBe(3);
  });
  it('点击浏览不改变执行绑定（AC-015）：模型中没有“选中”状态写入会话', () => {
    const m = fresh();
    expect(m.sessions.find((s) => s.id === 'ses_alloc')?.unit_id).toBe('unt_alloc_exp');
  });
});

// 以下对应外部审查后修正的问题（D-007）
const localEvent = (m: Model, entities: AnyEntity[]): LocalEvent => ({
  seq: m.lastSeq + 1, at: '2026-11-26T00:00:00Z', type: 'test.changed', actor: { principal_id: 'usr_owner', kind: 'human', authentication_ref: 'auth_local_session', grant_id: 'grt_owner_core' },
  summary: '测试用的变化', entities, refs: entities.map((e) => e.id), projectRevisionAfter: m.project.revision,
});
const bump = (m: Model, id: string): Model => {
  const e = m.byId.get(id)!;
  return buildModel(snapshot, ext, [...m.local, localEvent(m, [{ ...e, revision: e.revision + 1 }])], m.flags);
};

describe('证据关系（R04）', () => {
  it('晚高峰结果只是限制，不是“所有时段都改善”的反证', () => {
    const m = fresh();
    const claim = m.claims.find((c) => c.id === 'clm_calib_all_periods')!;
    const rel = claimEvidence(m, claim);
    expect(rel.contradicts).toHaveLength(0);
    expect(rel.limits.map((l) => l.evidence_id)).toEqual(['evd_peak']);
    expect(claim.assessment).toBe('inconclusive');
  });
});

describe('首页与待处理同源（R02）', () => {
  it('作出决定后，首页不再显示这件事；顶栏计数同步减少', () => {
    const m = fresh();
    expect(attentionItems(m).open.map((a) => a.id)).toContain('att_dec_c');
    const m2 = apply(m, svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_after', reason: '先保证对照实验', expectedRevision: m.project.revision }));
    expect(attentionItems(m2).open.map((a) => a.id)).not.toContain('att_dec_c');
    expect(todo(m2).count).toBe(todo(m).count - 1);
  });
  it('审阅之后，首页的“待审阅”提醒消失', () => {
    const m = fresh();
    const m2 = apply(m, svc.recordReview(m, { targetId: 'unt_calib_exp', status: 'accepted', findings: '' }));
    expect(attentionItems(m2).open.map((a) => a.id)).not.toContain('att_review_calib');
  });
  it('待处理里有、但手写提醒没覆盖的事项，首页也会自动列出', () => {
    const m = fresh();
    const m2 = apply(m, svc.reviseNextAction(m, { unitId: 'unt_alloc_exp', nextAction: '改一下', expectedRevision: m.project.revision }));
    const ids = new Set(attentionItems(m2).open.flatMap((a) => a.refs));
    for (const r of todo(m2).reviews) expect(ids.has(r.id)).toBe(true);
  });
});

describe('新建路线后各处同步（R07、R15）', () => {
  it('新路线进入比较页，有基础说明，并记录独立工作区请求', () => {
    const m = fresh();
    const m2 = apply(m, svc.forkFromCheckpoint(m, { checkpointId: 'ckp_calib', name: '路线D', question: '分时段校准能否降低晚高峰误差？', createWorktree: true, expectedRevision: m.project.revision }));
    const b = m2.branches.find((x) => x.name === '路线D')!;
    const card = compareRoutes(m2).find((r) => r.branch.id === b.id)!;
    expect(card.curated).toBe(false);
    expect(card.worktreeRequested).toBe(true);
    const unit = m2.units.find((u) => u.branch_id === b.id)!;
    const brief = unitBrief(m2, unit.id)!;
    expect(brief.generation.mode).toBe('template');
    expect(brief.evidence_links.map((l) => [l.evidence_id, l.relationship])).toEqual([['evd_peak', 'limitation']]);
    expect(brief.generation.input_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(m2.worktreeRequests).toEqual([expect.objectContaining({ branch_id: b.id, status: 'requested' })]);
  });
  it('不要求独立工作区时，不记录请求', () => {
    const m = fresh();
    const m2 = apply(m, svc.forkFromCheckpoint(m, { checkpointId: 'ckp_calib', name: '路线E', question: '问题', createWorktree: false, expectedRevision: m.project.revision }));
    expect(m2.worktreeRequests).toHaveLength(0);
  });
});

describe('精确版本（R08）', () => {
  it('引用旧版本时打开那个版本，引用当前版本时打开当前页面', () => {
    const m = fresh();
    expect(hrefFor(m, 'unt_calib_exp', 2)).toBe('#/at/unt_calib_exp/2');
    expect(hrefFor(m, 'unt_calib_exp', 3)).toBe('#/unit/unt_calib_exp');
    expect(m.history.get('unt_calib_exp')?.some((e) => e.revision === 2)).toBe(true);
  });
});

describe('审阅（R09）', () => {
  it('同一版本先“通过”后“需要修改”：只有后一条是当前的，并进入“等待修改”', () => {
    const m = fresh();
    const m2 = apply(m, svc.recordReview(m, { targetId: 'unt_calib_exp', status: 'accepted', findings: '' }));
    const m3 = apply(m2, svc.recordReview(m2, { targetId: 'unt_calib_exp', status: 'needs_changes', findings: '结论范围写得太宽' }));
    const cur = m3.reviews.filter((r) => r.target_id === 'unt_calib_exp' && r.is_current);
    expect(cur.map((r) => r.status)).toEqual(['needs_changes']);
    expect(m3.reviews.find((r) => r.target_id === 'unt_calib_exp' && r.status === 'accepted' && r.reviewed_revision === 3)?.superseded_by).toBe(cur[0].id);
    expect(reviewQueue(m3).some((q) => q.id === 'unt_calib_exp')).toBe(false);
    expect(changesRequested(m3).map((x) => x.id)).toContain('unt_calib_exp');
  });
  it('“需要修改”必须写明改什么', () => {
    const r = svc.recordReview(fresh(), { targetId: 'unt_calib_exp', status: 'needs_changes', findings: '  ' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.status).toBe(400);
  });
});

describe('理由（R10）', () => {
  it('写了理由就保存；没写就如实记为“没有填写理由”，不替用户编造', () => {
    const m = fresh();
    const m2 = apply(m, svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_after', reason: 'GPU 先给对照实验', expectedRevision: m.project.revision }));
    expect(m2.decisions.find((d) => d.id === 'dec_start_c')?.rationale).toBe('GPU 先给对照实验');
    const m3 = apply(m, svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_after', reason: '', expectedRevision: m.project.revision }));
    expect(m3.decisions.find((d) => d.id === 'dec_start_c')?.rationale).toBe('研究负责人没有填写理由。');
    const m4 = apply(m, svc.rejectProposal(m, { proposalId: 'pro_add_network', reason: '这条路线已经关闭过' }));
    expect(m4.proposals.find((p) => p.id === 'pro_add_network')?.summary).toContain('拒绝理由：这条路线已经关闭过');
  });
});

describe('交接材料（R11）', () => {
  it('上下文包里的内容已更新时，按当前版本改写，并附上之后的变化', () => {
    const m = fresh();
    expect(buildHandoff(m, 'unt_alloc_exp').replaced).toHaveLength(0);
    const m2 = apply(m, svc.revokeGrant(m, { grantId: 'grt_routine', expectedRevision: m.project.revision, reason: '测试' }));
    const h = buildHandoff(m2, 'unt_alloc_exp');
    expect(h.replaced.map((r) => r.entity_id)).toContain('grt_routine');
    expect(h.text).toContain('已撤销');
    expect(h.changesSince.some((c) => c.summary.includes('grt_routine'))).toBe(true);
  });
});

describe('授权与候选的前提（R12）', () => {
  it('候选依据的对象已经更新时，不能采用', () => {
    const m = bump(fresh(), 'brn_main');
    const p = m.proposals.find((x) => x.id === 'pro_add_network')!;
    const r = svc.applyCreateUnitProposal(m, { proposalId: p.id, expectedRevision: m.project.revision, expectedTargetRevision: p.revision });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.status).toBe(409);
  });
  it('经由前提已变的候选作出选择：决定照常记录，但不算采用该候选', () => {
    const m = bump(fresh(), 'brn_c');
    const m2 = apply(m, svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_now', reason: '', expectedRevision: m.project.revision, viaProposalId: 'pro_c_timing' }));
    expect(m2.decisions.find((d) => d.id === 'dec_start_c')?.status).toBe('accepted');
    expect(m2.proposals.find((p) => p.id === 'pro_c_timing')?.status).toBe('stale');
  });
});

describe('多个上级（R13）', () => {
  it('一个单元有两个上级时，主线路径包含两条来源，深度取较深的一条', () => {
    const m = fresh();
    const unit = { ...m.byId.get('unt_c_weight')!, id: 'unt_merge', revision: 1, branch_id: 'brn_main', parent_unit_ids: ['unt_calib_exp', 'unt_a_diag'] };
    const edge = (id: string, source: string) => ({ ...m.edges[0], id, revision: 1, source_id: source, target_id: 'unt_merge', relation: 'continues_to', state: 'active' }) as unknown as AnyEntity;
    const project = { ...(m.project as unknown as AnyEntity), revision: m.project.revision + 1, focus_unit_id: 'unt_merge' };
    const m2 = buildModel(snapshot, ext, [localEvent(m, [unit as AnyEntity, edge('edg_t1', 'unt_calib_exp'), edge('edg_t2', 'unt_a_diag'), project])], m.flags);
    const path = currentPath(m2);
    expect(path.has('unt_calib_exp') && path.has('unt_a_diag') && path.has('unt_problem')).toBe(true);
    expect(ancestors(m2, 'unt_merge').size).toBeGreaterThan(ancestors(m2, 'unt_calib_exp').size);
    expect(unitDepth(m2, 'unt_merge')).toBe(Math.max(unitDepth(m2, 'unt_calib_exp'), unitDepth(m2, 'unt_a_diag')) + 1);
  });
});

describe('交接材料带上当前主张与修改意见', () => {
  it('旧上下文里没有的主张按当前评估列出；“需要修改”的意见交给模型', () => {
    const m = fresh();
    const m2 = apply(m, svc.recordReview(m, { targetId: 'unt_calib_exp', status: 'needs_changes', findings: '结论只适用于测试划分' }));
    const h = buildHandoff(m2, 'unt_calib_exp');
    expect(h.text).toContain('证据不足');
    expect(h.text).toContain('研究负责人要求修改');
    expect(h.text).toContain('结论只适用于测试划分');
  });
});
