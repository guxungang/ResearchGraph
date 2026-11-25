import { describe, expect, it } from 'vitest';
import {
  checkApplyPrincipal, checkCapability, checkProposalPremises, checkRevision, grantCovers, isReviewCurrent, reviewCurrency, wouldCreateCycle,
  ASSESSMENT, DECISION, REVIEW,
} from './index.ts';

const grant = (over: Record<string, unknown> = {}) => ({
  id: 'grt_x', revision: 1, status: 'active', subject_principal_ids: ['svc_policy'], actions: ['unit.revise'],
  scope: { kind: 'units', project_id: 'prj_x', unit_ids: ['unt_a'] }, expires_at: '2026-12-05T00:00:00Z', application_policy: 'policy_within_scope', ...over,
});
const svc = { principal_id: 'svc_policy', kind: 'service' as const };
const human = { principal_id: 'usr_owner', kind: 'human' as const };
const T = (over: Record<string, unknown> = {}) => ({ projectId: 'prj_x', unitId: 'unt_a', ...over });
const NOW = '2026-11-25T00:00:00Z';

describe('授权覆盖', () => {
  it('范围内的动作被覆盖（AC-004）', () => expect(grantCovers(grant(), 'unit.revise', T(), svc, NOW).ok).toBe(true));
  it('范围外的单元不被覆盖', () => expect(grantCovers(grant(), 'unit.revise', T({ unitId: 'unt_b' }), svc, NOW).ok).toBe(false));
  it('未包含的动作不被覆盖（AC-003）', () => expect(grantCovers(grant(), 'branch.promote', T(), svc, NOW).ok).toBe(false));
  it('撤销后不再覆盖新动作（AC-038）', () => expect(grantCovers(grant({ status: 'revoked' }), 'unit.revise', T(), svc, NOW).ok).toBe(false));
  it('到期后不再覆盖，即使状态仍标为有效', () => expect(grantCovers(grant(), 'unit.revise', T(), svc, '2026-12-06T00:00:00Z').ok).toBe(false));
  it('不是授予该执行者的授权不能用', () => expect(grantCovers(grant(), 'unit.revise', T(), { principal_id: 'svc_other', kind: 'service' }, NOW).ok).toBe(false));
  it('其他项目的授权不能用', () => expect(grantCovers(grant(), 'unit.revise', T({ projectId: 'prj_y' }), svc, NOW).ok).toBe(false));
  it('模型凭任何授权都不能应用（AC-041）', () => expect(grantCovers(grant({ subject_principal_ids: ['agt_x'] }), 'unit.revise', T(), { principal_id: 'agt_x', kind: 'agent' }, NOW).ok).toBe(false));
  it('只能由人使用的授权，服务不能用', () =>
    expect(grantCovers(grant({ subject_principal_ids: ['svc_policy', 'usr_owner'], application_policy: 'human_only' }), 'unit.revise', T(), svc, NOW).ok).toBe(false));
  it('只能由人使用的授权，人可以用', () =>
    expect(grantCovers(grant({ subject_principal_ids: ['usr_owner'], application_policy: 'human_only' }), 'unit.revise', T(), human, NOW).ok).toBe(true));
  it('绑定提案的授权只覆盖那个提案的那个版本', () => {
    const g = grant({ application_policy: 'policy_exact_proposal', actions: ['decision.accept'], scope: { kind: 'proposal', project_id: 'prj_x', proposal_id: 'pro_a', proposal_revision: 2 } });
    expect(grantCovers(g, 'decision.accept', T({ proposalId: 'pro_a', proposalRevision: 2 }), svc, NOW).ok).toBe(true);
    expect(grantCovers(g, 'decision.accept', T({ proposalId: 'pro_a', proposalRevision: 3 }), svc, NOW).ok).toBe(false);
  });
  it('要求绑定提案、但范围不是提案的授权无效', () =>
    expect(grantCovers(grant({ application_policy: 'policy_exact_proposal' }), 'unit.revise', T(), svc, NOW).ok).toBe(false));
});

describe('身份与版本', () => {
  it('模型不能调用人工采用接口（AC-001）', () => expect(checkApplyPrincipal('agent')?.status).toBe(403));
  it('服务令牌也不等于人类', () => expect(checkApplyPrincipal('service')?.status).toBe(403));
  it('人类可以调用', () => expect(checkApplyPrincipal('human')).toBeNull());
  it('项目版本不一致返回409（AC-006）', () => expect(checkRevision(7, 8)?.status).toBe(409));
  it('候选依据的任何一项已更新，整体拒绝', () => {
    const cur: Record<string, number> = { brn_main: 7, dec_no_network: 1 };
    const err = checkProposalPremises([{ entity_id: 'brn_main', revision: 6 }, { entity_id: 'dec_no_network', revision: 1 }], (id) => cur[id]);
    expect(err?.status).toBe(409);
    expect(err?.message).toContain('brn_main');
    expect(checkProposalPremises([{ entity_id: 'dec_no_network', revision: 1 }], (id) => cur[id])).toBeNull();
  });
});

describe('图与审阅', () => {
  it('探索谱系不能成环（AC-023）', () => expect(wouldCreateCycle([{ source: 'A', target: 'B' }], 'B', 'A')).toBe(true));
  it('无环的新边允许', () => expect(wouldCreateCycle([{ source: 'A', target: 'B' }], 'B', 'C')).toBe(false));
  it('新修订不继承旧审阅（AC-021）', () => expect(isReviewCurrent(1, 2)).toBe(false));
  it('同一人对同一版本先后两次审阅，只有后一次是当前的', () => {
    const r = (id: string, at: string, rev = 2) => ({ id, target_id: 'unt_a', reviewed_revision: rev, review_kind: 'user_review', created_at: at, reviewer: { principal_id: 'usr_owner' } });
    const cur = reviewCurrency([r('rev_1', '2026-11-25T01:00:00Z'), r('rev_2', '2026-11-25T02:00:00Z'), r('rev_0', '2026-11-20T00:00:00Z', 1)], () => 2);
    expect(cur.get('rev_2')).toEqual({ is_current: true, superseded_by: null });
    expect(cur.get('rev_1')).toEqual({ is_current: false, superseded_by: 'rev_2' });
    expect(cur.get('rev_0')).toEqual({ is_current: false, superseded_by: null });
  });
});

describe('能力降级', () => {
  it('不支持的控制返回501（AC-017）', () => expect(checkCapability('unsupported', '中断', '去原客户端')?.status).toBe(501));
  it('未核验也视为不可用（AC-030）', () => expect(checkCapability('unverified', '中断', '去原客户端')?.code).toBe('capability_unverified'));
});

describe('显示语义', () => {
  it('“审阅通过”与“采用方案”不是同一个词（§4.5）', () => expect(REVIEW.accepted.text).not.toBe(DECISION.accepted.text));
  it('supported 显示为有条件支持，而不是“正确”', () => expect(ASSESSMENT.supported.text).toBe('有条件支持'));
});
