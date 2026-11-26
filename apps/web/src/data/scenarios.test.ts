// 连续使用场景测试（D-007 工作包一）：检验“人能否连续、可靠地使用这些功能”，而不只是单个函数是否符合设计。
// 每个场景对应第二轮外部审查第八节表格中的一行。
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ProjectSnapshot } from '@rw/contracts';
import { buildModel, emptyFlags, unitBrief, type AnyEntity, type LocalEvent, type Model } from './model.ts';
import { attentionItems, buildHandoff, claimEvidence, compareRoutes, homeSummary, planCheck } from './derive.ts';
import * as svc from './service.ts';

const root = new URL('../../../../', import.meta.url);
const readJson = (p: string) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const stageA = { snapshot: readJson('fixtures/stage-a/stage-a.snapshot.json') as ProjectSnapshot, ext: readJson('fixtures/stage-a/stage-a.extensions.json') };
const mini = { snapshot: readJson('fixtures/mini/mini.snapshot.json') as ProjectSnapshot, ext: undefined };
type Project = typeof stageA | typeof mini;

const open = (p: Project = stageA) => buildModel(p.snapshot, p.ext, [], emptyFlags());
/** 执行一个操作；失败就让测试失败，并带上原因。 */
const act = (m: Model, r: svc.Result, p: Project = stageA): Model => {
  if (!r.ok) throw new Error(`${r.error.status} ${r.error.message}`);
  return buildModel(p.snapshot, p.ext, [...m.local, ...((r.events ?? []) as LocalEvent[])], { ...m.flags, ...(r.flags ?? {}) });
};
const unit = (m: Model, id: string) => m.units.find((u) => u.id === id)!;
/** 研究单元的基本不变量：parent_unit_ids 与谱系入边一致；有阅读说明；负责人是本机用户。 */
const unitInvariants = (m: Model, id: string) => {
  const u = unit(m, id);
  const parents = m.edges.filter((e) => e.relation === 'continues_to' && e.state === 'active' && e.target_id === id).map((e) => e.source_id).sort();
  return { parentsMatch: JSON.stringify(parents) === JSON.stringify([...u.parent_unit_ids].sort()), hasBrief: !!unitBrief(m, id), owner: u.owner_principal_id };
};

describe('场景1：确认一个研究决定后，各处没有矛盾', () => {
  it('首页、路线、下一步和交接材料一致；按决定更新下一步之后提醒消失', () => {
    let m = act(open(), svc.decide(open(), { decisionId: 'dec_start_c', optionId: 'opt_c_now', reason: '想尽早知道可靠性项是否必要', expectedRevision: open().project.revision }));
    const items = attentionItems(m).open.map((a) => a.id);
    expect(items).not.toContain('att_dec_c');
    expect(items).toContain('gen_plan_unt_c_weight');
    const plan = planCheck(m, unit(m, 'unt_c_weight'));
    expect(plan.stale).toBe(true);
    expect(plan.suggestion).toContain('现在并行开展');
    const h = buildHandoff(m, 'unt_c_weight');
    expect(h.planStale).toBe(true);
    expect(h.text).toContain('注意：这条下一步写于相关决定之前');
    expect(h.text).toContain('采用方案：现在并行开展');
    expect(compareRoutes(m).find((r) => r.branch.id === 'brn_c')!.stale.length).toBeGreaterThan(0);

    m = act(m, svc.reviseNextAction(m, { unitId: 'unt_c_weight', nextAction: plan.suggestion, expectedRevision: m.project.revision }));
    expect(planCheck(m, unit(m, 'unt_c_weight')).stale).toBe(false);
    expect(attentionItems(m).open.map((a) => a.id)).not.toContain('gen_plan_unt_c_weight');
    expect(buildHandoff(m, 'unt_c_weight').text).not.toContain('注意：这条下一步写于相关决定之前');
  });
});

describe('场景2：修改下一步后，各处以最新安排为准', () => {
  it('交接材料用新安排；阅读说明里的旧建议只作参考', () => {
    const m = act(open(), svc.reviseNextAction(open(), { unitId: 'unt_alloc_exp', nextAction: '先核对第二次运行的数据路径，再比较三档预算。', expectedRevision: open().project.revision }));
    expect(unit(m, 'unt_alloc_exp').next_action).toBe('先核对第二次运行的数据路径，再比较三档预算。');
    expect(buildHandoff(m, 'unt_alloc_exp').text).toContain('下一步：先核对第二次运行的数据路径');
    expect(unitBrief(m, 'unt_alloc_exp')!.recommended_next_step).not.toBe(unit(m, 'unt_alloc_exp').next_action);
  });
});

describe('场景3：审阅意见和“读懂了”互不覆盖', () => {
  it('先提修改意见再标读懂了：意见完整保留，并交给模型', () => {
    let m = act(open(), svc.recordReview(open(), { targetId: 'unt_calib_exp', status: 'needs_changes', findings: '结论只适用于测试数据' }));
    m = act(m, svc.markUnderstanding(m, { targetId: 'unt_calib_exp', understanding: 'self_reported_understood' }));
    const cur = m.reviews.find((r) => r.target_id === 'unt_calib_exp' && r.is_current)!;
    expect([cur.status, cur.understanding_status, cur.findings]).toEqual(['needs_changes', 'self_reported_understood', ['结论只适用于测试数据']]);
    expect(buildHandoff(m, 'unt_calib_exp').text).toContain('结论只适用于测试数据');
  });
  it('先标读懂了再审阅通过：理解标记保留', () => {
    let m = act(open(), svc.markUnderstanding(open(), { targetId: 'unt_calib_exp', understanding: 'needs_explanation' }));
    m = act(m, svc.recordReview(m, { targetId: 'unt_calib_exp', status: 'accepted', findings: '' }));
    const cur = m.reviews.find((r) => r.target_id === 'unt_calib_exp' && r.is_current)!;
    expect([cur.status, cur.understanding_status]).toEqual(['accepted', 'needs_explanation']);
  });
});

describe('场景4：从不同入口新建研究单元，结果一致', () => {
  it('从快照继续和采用模型建议：都有谱系、基础说明，负责人都是本机用户', () => {
    const m0 = open();
    const a = act(m0, svc.forkFromCheckpoint(m0, { checkpointId: 'ckp_calib', name: '路线D', question: '分时段校准能否降低晚高峰误差？', createWorktree: false, expectedRevision: m0.project.revision }));
    const p = m0.proposals.find((x) => x.id === 'pro_add_network')!;
    const b = act(m0, svc.applyCreateUnitProposal(m0, { proposalId: p.id, expectedRevision: m0.project.revision, expectedTargetRevision: p.revision }));
    const newA = a.units.find((u) => !m0.byId.has(u.id))!;
    const newB = b.units.find((u) => !m0.byId.has(u.id))!;
    expect(unitInvariants(a, newA.id)).toEqual({ parentsMatch: true, hasBrief: true, owner: 'usr_owner' });
    expect(unitInvariants(b, newB.id)).toEqual({ parentsMatch: true, hasBrief: true, owner: 'usr_owner' });
    expect(unitBrief(a, newA.id)!.generation.mode).toBe('template');
    expect(unitBrief(b, newB.id)!.generation.mode).toBe('template');
    // 采用模型建议时，规则检查发现的问题写进说明，而不是丢掉
    expect(unitBrief(b, newB.id)!.not_yet_established.join('')).toContain('采用时规则检查发现');
  });
});

describe('场景5：主张修改后，旧证据不能未经核验就算支持', () => {
  it('需要重新核验和历史关系都不计入当前支持', () => {
    const m = open();
    const claim = m.claims.find((c) => c.id === 'clm_calib_all_periods')!;
    let ev = claimEvidence(m, claim);
    expect([ev.supports.length, ev.revalidate.length, ev.limits.length]).toEqual([0, 1, 1]);
    // 把一条当前有效的支持关系改为“已被替代”，它就只出现在历史里
    const e = m.edges.find((x) => x.id === 'edg_s2')! as unknown as AnyEntity;
    const m2 = buildModel(stageA.snapshot, stageA.ext, [{ ...localEvent(m), entities: [{ ...e, revision: e.revision + 1, state: 'superseded' }] }], m.flags);
    ev = claimEvidence(m2, m2.claims.find((c) => c.id === 'clm_calib_test')!);
    expect([ev.supports.length, ev.historical.length]).toEqual([0, 1]);
  });
});

describe('场景6：拒绝一条路线后继续相关工作，模型能拿到否定的原因', () => {
  it('交接材料带上拒绝理由、已关闭的路线和重新考虑的条件', () => {
    const m = act(open(), svc.rejectProposal(open(), { proposalId: 'pro_add_network', reason: '无法直接支撑核心研究目标' }));
    const h = buildHandoff(m, 'unt_alloc_exp').text;
    expect(h).toContain('已否定的路线及原因');
    expect(h).toContain('无法直接支撑核心研究目标');
    expect(h).toContain('已关闭的路线');
    expect(h).toContain('重新考虑的条件');
  });
});

describe('场景7：从历史节点重新探索', () => {
  it('新路线带上快照之后发现的限制，原路线不变', () => {
    const m0 = open();
    const m = act(m0, svc.forkFromCheckpoint(m0, { checkpointId: 'ckp_calib', name: '路线D', question: '分时段校准？', createWorktree: true, expectedRevision: m0.project.revision }));
    const u = m.units.find((x) => !m0.byId.has(x.id))!;
    expect(buildHandoff(m, u.id).text).toContain('晚高峰时段校准后的ECE');
    expect(unit(m, 'unt_calib_exp').revision).toBe(unit(m0, 'unt_calib_exp').revision);
  });
});

describe('场景8：打开一个完全不同、没有扩展数据的项目', () => {
  it('首页、待处理、路线比较、交接材料都能用，不需要改前端代码', () => {
    const m = open(mini);
    const s = homeSummary(m);
    expect(s.curated).toBe(false);
    expect(s.question).toBe(m.project.goal);
    expect(s.known?.ref).toBe('clm_assume_exact');
    expect(attentionItems(m).open.map((a) => a.refs[0])).toContain('dec_structure');
    expect(compareRoutes(m).map((r) => [r.branch.id, r.curated])).toEqual([['brn_by_method', false], ['brn_by_scene', false]]);
    for (const u of m.units) expect(() => buildHandoff(m, u.id)).not.toThrow();
  });
  it('人工操作使用该项目自己的授权；决定之后，依赖它的下一步标为可能已过时', () => {
    const m0 = open(mini);
    const m = act(m0, svc.decide(m0, { decisionId: 'dec_structure', optionId: 'opt_by_method', reason: '与筛选表一致', expectedRevision: m0.project.revision }), mini);
    expect(m.local.at(-1)!.actor.grant_id).toBe('grt_review_owner');
    expect(planCheck(m, unit(m, 'unt_scene_outline')).stale).toBe(true);
  });
});

describe('权限与状态转换', () => {
  const revokedOwner = () => {
    const m = open();
    const g = m.byId.get('grt_owner_core')!;
    return buildModel(stageA.snapshot, stageA.ext, [{ ...localEvent(m), entities: [{ ...g, revision: g.revision + 1, status: 'revoked' }] }], m.flags);
  };
  it('本人授权失效后，审阅、理解标记、拒绝候选、撤销授权都被拒绝', () => {
    const m = revokedOwner();
    expect(svc.recordReview(m, { targetId: 'unt_calib_exp', status: 'accepted', findings: '' }).ok).toBe(false);
    expect(svc.markUnderstanding(m, { targetId: 'brf_alloc_exp', understanding: 'self_reported_understood' }).ok).toBe(false);
    expect(svc.rejectProposal(m, { proposalId: 'pro_add_network', reason: '' }).ok).toBe(false);
    expect(svc.revokeGrant(m, { grantId: 'grt_routine', expectedRevision: m.project.revision, reason: '' }).ok).toBe(false);
  });
  it('已拒绝的候选不能经由“作出决定”变成已采用', () => {
    let m = act(open(), svc.rejectProposal(open(), { proposalId: 'pro_c_timing', reason: '先不急' }));
    m = act(m, svc.decide(m, { decisionId: 'dec_start_c', optionId: 'opt_c_now', reason: '', expectedRevision: m.project.revision, viaProposalId: 'pro_c_timing' }));
    expect(m.proposals.find((p) => p.id === 'pro_c_timing')!.status).toBe('rejected');
    expect(m.decisions.find((d) => d.id === 'dec_start_c')!.status).toBe('accepted');
  });
});

describe('前端业务代码不写死任何项目的对象编号', () => {
  it('apps/web/src 里（测试除外）没有夹具对象编号', () => {
    const dir = new URL('apps/web/src/', root).pathname;
    const files = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? files(join(d, f)) : [join(d, f)]));
    const hits = files(dir)
      .filter((f) => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts'))
      .flatMap((f) => (readFileSync(f, 'utf8').match(/'(?:unt|brn|dec|clm|evd|pro|grt|run|ckp|ses|cap|brf|ctx|art|prj)_[a-z0-9_]+'/g) ?? []).map((x) => `${f.slice(dir.length)} ${x}`));
    expect(hits).toEqual([]);
  });
});

function localEvent(m: Model): LocalEvent {
  return {
    seq: m.lastSeq + 1, at: '2026-11-26T00:00:00Z', type: 'test.changed', actor: { principal_id: 'usr_owner', kind: 'human', authentication_ref: 'auth_local_session', grant_id: null },
    summary: '测试用的变化', entities: [], refs: [], projectRevisionAfter: m.project.revision,
  };
}
