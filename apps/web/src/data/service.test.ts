// 用阶段A夹具检验样机内模拟服务的语义。对应合同 acceptance-cases.json 中的若干场景（只在样机层面）。
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ProjectSnapshot } from '@rw/contracts';
import { buildModel, emptyFlags, type LocalEvent, type Model } from './model.ts';
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
  it('从快照继续：新建分支、带上后来的反证、原路线不变（AC-025、AC-040）', () => {
    const m = fresh();
    const preview = svc.forkPreview(m, 'ckp_calib')!;
    expect(preview.counterevidence.map((e) => e.id)).toContain('evd_peak');
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
