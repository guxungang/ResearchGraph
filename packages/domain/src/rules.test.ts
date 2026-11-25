import { describe, expect, it } from 'vitest';
import { checkApplyPrincipal, checkCapability, checkRevision, grantCovers, isReviewCurrent, wouldCreateCycle, ASSESSMENT, DECISION, REVIEW } from './index.ts';

const grant = (over: Record<string, unknown> = {}) => ({
  id: 'grt_x', revision: 1, status: 'active', subject_principal_ids: ['svc_policy'], actions: ['unit.revise'],
  scope: { kind: 'units', project_id: 'prj_x', unit_ids: ['unt_a'] }, expires_at: '2026-12-05T00:00:00Z', application_policy: 'policy_within_scope', ...over,
});

describe('授权覆盖', () => {
  it('范围内的动作被覆盖（AC-004）', () => expect(grantCovers(grant(), 'unit.revise', { unitId: 'unt_a' }, '2026-11-25T00:00:00Z').ok).toBe(true));
  it('范围外的单元不被覆盖', () => expect(grantCovers(grant(), 'unit.revise', { unitId: 'unt_b' }, '2026-11-25T00:00:00Z').ok).toBe(false));
  it('未包含的动作不被覆盖（AC-003）', () => expect(grantCovers(grant(), 'branch.promote', { unitId: 'unt_a' }, '2026-11-25T00:00:00Z').ok).toBe(false));
  it('撤销后不再覆盖新动作（AC-038）', () => expect(grantCovers(grant({ status: 'revoked' }), 'unit.revise', { unitId: 'unt_a' }, '2026-11-25T00:00:00Z').ok).toBe(false));
  it('到期后不再覆盖，即使状态仍标为有效', () => expect(grantCovers(grant(), 'unit.revise', { unitId: 'unt_a' }, '2026-12-06T00:00:00Z').ok).toBe(false));
});

describe('身份与版本', () => {
  it('模型不能调用人工采用接口（AC-001）', () => expect(checkApplyPrincipal('agent')?.status).toBe(403));
  it('服务令牌也不等于人类', () => expect(checkApplyPrincipal('service')?.status).toBe(403));
  it('人类可以调用', () => expect(checkApplyPrincipal('human')).toBeNull());
  it('项目版本不一致返回409（AC-006）', () => expect(checkRevision(7, 8)?.status).toBe(409));
});

describe('图与审阅', () => {
  it('探索谱系不能成环（AC-023）', () => expect(wouldCreateCycle([{ source: 'A', target: 'B' }], 'B', 'A')).toBe(true));
  it('无环的新边允许', () => expect(wouldCreateCycle([{ source: 'A', target: 'B' }], 'B', 'C')).toBe(false));
  it('新修订不继承旧审阅（AC-021）', () => expect(isReviewCurrent(1, 2)).toBe(false));
});

describe('能力降级', () => {
  it('不支持的控制返回501（AC-017）', () => expect(checkCapability('unsupported', '中断', '去原客户端')?.status).toBe(501));
  it('未核验也视为不可用（AC-030）', () => expect(checkCapability('unverified', '中断', '去原客户端')?.code).toBe('capability_unverified'));
});

describe('显示语义', () => {
  it('“审阅通过”与“采用方案”不是同一个词（§4.5）', () => expect(REVIEW.accepted.text).not.toBe(DECISION.accepted.text));
  it('supported 显示为有条件支持，而不是“正确”', () => expect(ASSESSMENT.supported.text).toBe('有条件支持'));
});
