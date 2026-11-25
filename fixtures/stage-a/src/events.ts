// 事件节选（event_history_scope = excerpt）：只包含历史视图、审阅语义和“历史记录回放 / 现在回看”所需的事件。
// 每个事件的 payload.after_entities 保存本次改变后的完整实体修订（合同 README 第八节）。
import { actor, loc, sha, type Actor, type Locator } from './helpers.ts';
import {
  branches, checkpoints, claims, decisions, evidenceList, experimentRuns, graphEdges, grants, project, proposals, researchUnits, reviews, sessionBindings,
  MSG_GRANT, MSG_ADD_NETWORK, MSG_C_TIMING, SESSION_ALLOC,
} from './entities.ts';
import { briefAllocV1, readingBriefs } from './briefs.ts';

type Entity = { id: string; revision: number } & Record<string, unknown>;
const all = [project, ...branches, ...researchUnits, ...graphEdges, ...claims, ...evidenceList, ...decisions, ...experimentRuns, ...checkpoints, ...proposals, ...reviews, ...sessionBindings, ...grants, ...readingBriefs] as Entity[];
const cur = (id: string): Entity => {
  const e = all.find((x) => x.id === id);
  if (!e) throw new Error(`unknown entity ${id}`);
  return e;
};
// 以当前修订为模板构造较早的修订（仅用于事件中的历史实体）。
const older = (id: string, revision: number, at: string, patch: Record<string, unknown>): Entity => {
  const e = structuredClone(cur(id));
  return { ...e, revision, updated_at: at, ...patch } as Entity;
};

type Spec = {
  seq: number;
  type: string;
  at: string;
  actor: Actor;
  projectRevisionAfter: number;
  subject: Entity;
  summary: string;
  after?: Entity[];
  before?: { entity_id: string; revision: number }[];
  command?: Record<string, unknown> | null;
  related?: string[];
  kind?: 'observed' | 'reported' | 'inferred';
  source: { instance: string; eventId: string; locator: Locator; sequence?: number | null };
  correlation?: 'exact' | 'correlated' | 'unknown';
  causation?: string[];
  raw?: string | null;
};

const subjectKind = (id: string) =>
  ({ prj: 'Project', brn: 'Branch', unt: 'ResearchUnit', edg: 'GraphEdge', clm: 'Claim', evd: 'Evidence', dec: 'Decision', art: 'ArtifactVersion', run: 'ExperimentRun', ckp: 'Checkpoint', pro: 'Proposal', rev: 'ReviewRecord', ses: 'SessionBinding', cap: 'CapabilityManifest', ctx: 'ContextBundle', brf: 'ReadingBrief', grt: 'Grant' })[id.slice(0, 3)] ?? 'Unknown';

const build = (s: Spec) => {
  const payload = {
    subject_id: s.subject.id,
    subject_kind: subjectKind(s.subject.id),
    subject_revision: s.subject.revision,
    summary: s.summary,
    command: s.command ?? null,
    related_entity_ids: s.related ?? [],
    before_revision_refs: s.before ?? [],
    after_entities: s.after ?? [s.subject],
    raw_source_artifact_version_id: s.raw ?? null,
  };
  return {
    id: `evt_${s.seq}`,
    revision: 1,
    project_id: 'prj_mcs',
    schema_version: '1.0.0',
    event_seq: s.seq,
    project_revision_after: s.projectRevisionAfter,
    event_type: s.type,
    actor: s.actor,
    occurred_at: s.at,
    recorded_at: s.at,
    valid_time: { from: s.at, to: null },
    observation_kind: s.kind ?? 'observed',
    source_instance_id: s.source.instance,
    source_event_id: s.source.eventId,
    source_sequence: s.source.sequence ?? null,
    correlation_id: `cor_${s.seq}`,
    correlation_quality: s.correlation ?? 'exact',
    causation_event_ids: s.causation ?? [],
    idempotency_key: `${s.source.instance}:${s.source.eventId}`,
    source_locator: s.source.locator,
    payload_sha256: sha(JSON.stringify(payload)),
    payload,
  };
};

const ui = (actionId: string, at: string, what: string, surface = 'decision-card') => ({
  instance: 'src_workbench_ui',
  eventId: actionId,
  locator: loc.userAction(actionId, at, `研究负责人的界面操作：${what}`, surface),
});
const adapter = (eventId: string, at: string, what: string, seq: number, tool: string | null = null) => ({
  instance: 'src_codex_cli',
  eventId,
  sequence: seq,
  locator: loc.providerEvent(SESSION_ALLOC, eventId, at, what, tool),
});
const owner = actor.owner('grt_owner_core');

// ------- 历史修订
const project1 = older('prj_mcs', 1, '2026-09-01T02:00:00Z', { constraints: [(project.constraints as unknown[])[0]] });
const allPeriods2 = older('clm_calib_all_periods', 2, '2026-11-01T08:00:00Z', {
  assessment: 'supported',
  conditions: '测试划分全天数据；5个随机种子；当时尚未按时段检查。',
  evidence_ids: ['evd_ece_test'],
});
const calibExp2 = older('unt_calib_exp', 2, '2026-11-01T08:05:00Z', {
  question: '温度缩放之后，到达概率与车辆实际按时到达的频率是否更一致？',
  evidence_ids: ['evd_ece_test'],
  artifact_version_ids: ['art_calib_results'],
  completion: {
    kind: 'criteria_satisfied',
    basis: '测试划分上的ECE比较已完成（5个随机种子，evd_ece_test）。',
    evidence_ids: ['evd_ece_test'],
    review_ids: [],
    completed_at: '2026-11-01T08:05:00Z',
  },
});
const reviewCalibCurrentAtTime = { ...cur('rev_calib_exp'), is_current: true };
const allocUnit1 = older('unt_alloc_exp', 1, '2026-11-19T02:00:00Z', {
  next_action: '等待第二次运行完成后，按预算50、100、200三档比较两组的任务完成率。',
  artifact_version_ids: [],
});
const reviewBriefAtTime = { ...cur('rev_brief_alloc'), is_current: true };
const session1 = older('ses_alloc', 1, '2026-11-25T02:05:00Z', { state: 'pending', last_observed_at: '2026-11-25T02:05:00Z' });
const session2 = older('ses_alloc', 2, '2026-11-25T02:10:00Z', { state: 'running', last_observed_at: '2026-11-25T02:10:00Z' });
const runV2_1 = older('run_alloc_v2', 1, '2026-11-25T02:10:00Z', { run_state: 'running', last_observed_at: '2026-11-25T02:10:00Z' });
const proAllocCandidate = older('pro_alloc_metrics', 1, '2026-11-21T01:50:00Z', { status: 'candidate', applied_by_event_id: null });
const proOpenCandidate = older('pro_c_open', 1, '2026-11-23T07:40:00Z', { status: 'candidate', applied_by_event_id: null });

const specs: Spec[] = [
  { seq: 1, type: 'project.created', at: '2026-09-01T02:00:00Z', actor: actor.owner(), projectRevisionAfter: 1, subject: project1, summary: '研究负责人创建项目，写入目标与第一条约束，并建立初始路线。', after: [project1, older('brn_main', 1, '2026-09-01T02:00:00Z', {})], source: ui('act_create_project', '2026-09-01T02:00:00Z', '创建项目', 'project-setup') },
  { seq: 2, type: 'grant.issued', at: '2026-09-01T02:00:00Z', actor: actor.owner(), projectRevisionAfter: 2, subject: cur('grt_owner_core'), summary: '研究负责人确认本人的人工操作授权（样机假设 D-004）。', source: ui('act_create_project', '2026-09-01T02:00:00Z', '确认授权', 'project-setup'), causation: ['evt_1'] },
  { seq: 214, type: 'decision.accepted', at: '2026-10-08T06:30:00Z', actor: owner, projectRevisionAfter: 6, subject: cur('dec_route_b'), summary: '研究负责人采用路线B：先校准到达概率，分配算法保持不变。', command: { kind: 'decide_decision', decision_id: 'dec_route_b', status: 'accepted', accepted_option_id: 'opt_b', reason: '高概率区间系统性高估，失败主要来自过度相信概率。' }, source: ui('act_dec_route_b', '2026-10-08T06:30:00Z', '选择路线B') },
  { seq: 402, type: 'claim.changed', at: '2026-11-01T08:00:00Z', actor: owner, projectRevisionAfter: 9, subject: allPeriods2, summary: '主张“所有时段都改善可靠性”评估为有条件支持（当时只有全天测试数据）。', command: { kind: 'assess_claim', claim_id: 'clm_calib_all_periods', assessment: 'supported', conditions: '测试划分全天数据；5个随机种子；当时尚未按时段检查。', evidence_ids: ['evd_ece_test'], review_ids: [], reason: '全天ECE从0.142降到0.058。' }, before: [{ entity_id: 'clm_calib_all_periods', revision: 1 }], source: ui('act_assess_all_periods_1', '2026-11-01T08:00:00Z', '评估主张', 'evidence') },
  { seq: 405, type: 'unit.changed', at: '2026-11-01T08:05:00Z', actor: owner, projectRevisionAfter: 10, subject: calibExp2, summary: '校准实验单元结束：完成条件已满足。', command: { kind: 'update_work_state', unit_id: 'unt_calib_exp', new_state: 'finished', reason: '测试划分ECE比较完成。', completion: calibExp2.completion }, before: [{ entity_id: 'unt_calib_exp', revision: 1 }], source: ui('act_finish_calib_1', '2026-11-01T08:05:00Z', '结束研究单元', 'unit-detail') },
  { seq: 411, type: 'review.recorded', at: '2026-11-02T01:00:00Z', actor: owner, projectRevisionAfter: 10, subject: reviewCalibCurrentAtTime, summary: '研究负责人对校准实验单元第2版作科学审阅：审阅通过。', after: [reviewCalibCurrentAtTime], source: ui('act_rev_calib_exp', '2026-11-02T01:00:00Z', '审阅通过', 'review-panel') },
  { seq: 415, type: 'checkpoint.created', at: '2026-11-02T06:00:00Z', actor: owner, projectRevisionAfter: 10, subject: cur('ckp_calib'), summary: '建立快照“校准实验第一次结束后的快照”；原始轨迹在远端，快照为部分可恢复。', source: ui('act_ckp_calib', '2026-11-02T06:00:00Z', '建立快照', 'checkpoint') },
  { seq: 820, type: 'experiment.observed', at: '2026-11-18T06:38:00Z', actor: actor.adapter(), projectRevisionAfter: 10, subject: cur('run_calib_peak'), summary: '按时段的校准评价运行成功结束（进程成功，不等于任何主张成立）。', source: adapter('evt-run_calib_peak', '2026-11-18T06:38:00Z', '运行结束事件', 9120, 'call_peak_eval') },
  { seq: 826, type: 'evidence.registered', at: '2026-11-18T07:10:00Z', actor: owner, projectRevisionAfter: 11, subject: cur('evd_peak'), summary: '研究负责人登记证据：晚高峰校准后ECE为0.113。', related: ['run_calib_peak', 'art_peak_results'], source: ui('act_register_peak', '2026-11-18T07:10:00Z', '登记证据', 'evidence') },
  { seq: 829, type: 'claim.changed', at: '2026-11-18T07:20:00Z', actor: owner, projectRevisionAfter: 12, subject: cur('clm_calib_all_periods'), summary: '主张“所有时段都改善可靠性”改为证据混合：晚高峰子集仍偏离。', command: { kind: 'assess_claim', claim_id: 'clm_calib_all_periods', assessment: 'mixed', conditions: (cur('clm_calib_all_periods') as Record<string, unknown>).conditions, evidence_ids: ['evd_ece_test', 'evd_peak'], review_ids: [], reason: '晚高峰反证 evd_peak。' }, before: [{ entity_id: 'clm_calib_all_periods', revision: 2 }], source: ui('act_assess_all_periods_2', '2026-11-18T07:20:00Z', '重新评估主张', 'evidence'), causation: ['evt_826'] },
  { seq: 831, type: 'unit.changed', at: '2026-11-18T07:30:00Z', actor: owner, projectRevisionAfter: 13, subject: cur('unt_calib_exp'), summary: '校准实验单元重新给出结束依据：有限制地结束，并记录晚高峰问题。旧审阅（针对第2版）保留但不再是当前审阅。', command: { kind: 'update_work_state', unit_id: 'unt_calib_exp', new_state: 'finished', reason: '补充晚高峰发现，改为有限制地结束。', completion: (cur('unt_calib_exp') as Record<string, unknown>).completion }, before: [{ entity_id: 'unt_calib_exp', revision: 2 }], related: ['rev_calib_exp'], source: ui('act_reclose_calib', '2026-11-18T07:30:00Z', '重新结束研究单元', 'unit-detail'), causation: ['evt_829'] },
  { seq: 905, type: 'unit.created', at: '2026-11-19T02:00:00Z', actor: owner, projectRevisionAfter: 14, subject: allocUnit1, summary: '研究负责人新建对照实验单元。', after: [allocUnit1, cur('edg_l5')], source: ui('act_create_alloc', '2026-11-19T02:00:00Z', '新建研究单元', 'map') },
  { seq: 960, type: 'grant.issued', at: '2026-11-20T09:13:00Z', actor: owner, projectRevisionAfter: 15, subject: cur('grt_routine'), summary: '根据研究负责人在会话中的明确消息，建立对照实验单元的常规整理授权（有效至12月5日）。', kind: 'observed', source: { instance: 'src_codex_cli', eventId: 'msg-0290', sequence: 8811, locator: loc.message(SESSION_ALLOC, 'msg-0290', 'user', '2026-11-20T09:12:00Z', '研究负责人在会话中的明确授权', MSG_GRANT) } },
  { seq: 1012, type: 'experiment.observed', at: '2026-11-21T01:34:00Z', actor: actor.adapter(), projectRevisionAfter: 15, subject: cur('run_alloc_v1'), summary: '第一次对照运行失败：FileNotFoundError: data/splits/test_v2.parquet。执行环境问题，不是反证。', source: adapter('evt-run_alloc_v1', '2026-11-21T01:34:00Z', '运行失败事件', 9402, 'call_alloc_v1') },
  { seq: 1015, type: 'proposal.submitted', at: '2026-11-21T01:50:00Z', actor: actor.codex(), projectRevisionAfter: 15, subject: proAllocCandidate, summary: '模型提交候选：在对照实验的下一步中加入失败分配次数统计。', kind: 'inferred', source: adapter('msg-0302', '2026-11-21T01:49:00Z', '会话中的模型建议', 9409) },
  { seq: 1019, type: 'proposal.applied', at: '2026-11-21T02:00:00Z', actor: actor.policy('grt_routine'), projectRevisionAfter: 16, subject: cur('pro_alloc_metrics'), summary: '策略服务在既有授权 grt_routine 范围内应用候选，没有再次询问研究负责人。', after: [cur('pro_alloc_metrics'), cur('unt_alloc_exp')], before: [{ entity_id: 'pro_alloc_metrics', revision: 1 }, { entity_id: 'unt_alloc_exp', revision: 1 }], command: (cur('pro_alloc_metrics').commands as Record<string, unknown>[])[0], source: { instance: 'src_policy_service', eventId: 'apply-pro_alloc_metrics', locator: loc.userAction('act_policy_apply_1019', '2026-11-21T02:00:00Z', '策略服务依据授权 grt_routine 自动应用（引用授权，不冒充人工操作）', 'policy') }, causation: ['evt_960', 'evt_1015'] },
  { seq: 1021, type: 'brief.created', at: '2026-11-21T03:00:00Z', actor: actor.briefWriter(), projectRevisionAfter: 16, subject: briefAllocV1 as Entity, summary: '生成对照实验单元的阅读说明第1版。', kind: 'inferred', source: { instance: 'src_fixture_build', eventId: 'brief-alloc-1', locator: loc.userAction('act_build_brf_alloc_1', '2026-11-21T03:00:00Z', '夹具作者撰写阅读说明', 'fixture') } },
  { seq: 1060, type: 'review.recorded', at: '2026-11-22T01:30:00Z', actor: owner, projectRevisionAfter: 16, subject: reviewBriefAtTime, summary: '研究负责人把阅读说明第1版标记为“需要补背景”。这不改变任何主张的状态。', after: [reviewBriefAtTime], source: ui('act_rev_brief_alloc', '2026-11-22T01:30:00Z', '标记需要补背景', 'review-panel') },
  { seq: 1088, type: 'brief.created', at: '2026-11-23T02:00:00Z', actor: actor.briefWriter(), projectRevisionAfter: 16, subject: cur('brf_alloc_exp'), summary: '阅读说明第2版：补充“预测层指标与系统层指标”的区别。旧审阅保留，但只适用于第1版。', kind: 'inferred', before: [{ entity_id: 'brf_alloc_exp', revision: 1 }], related: ['rev_brief_alloc'], source: { instance: 'src_fixture_build', eventId: 'brief-alloc-2', locator: loc.userAction('act_build_brf_alloc_2', '2026-11-23T02:00:00Z', '夹具作者撰写阅读说明', 'fixture') }, causation: ['evt_1060'] },
  { seq: 1102, type: 'branch.created', at: '2026-11-23T07:30:00Z', actor: owner, projectRevisionAfter: 17, subject: cur('brn_c'), summary: '研究负责人从快照 ckp_calib 继续，新建路线C；带上快照之后发现的晚高峰反证，原工作目录不变。', after: [cur('brn_c'), cur('unt_c_weight'), cur('edg_lc'), cur('edg_u2'), cur('edg_u5')], related: ['ckp_calib', 'evd_peak'], source: ui('act_fork_c', '2026-11-23T07:30:00Z', '从快照继续', 'checkpoint') },
  { seq: 1105, type: 'proposal.submitted', at: '2026-11-23T07:40:00Z', actor: actor.codex(), projectRevisionAfter: 17, subject: proOpenCandidate, summary: '模型整理路线C开展时机的三个选项。', kind: 'inferred', source: adapter('msg-0348', '2026-11-23T07:39:00Z', '会话中的模型整理', 9730) },
  { seq: 1110, type: 'proposal.applied', at: '2026-11-23T07:50:00Z', actor: owner, projectRevisionAfter: 18, subject: cur('pro_c_open'), summary: '研究负责人采用候选，建立待决定事项 dec_start_c（尚未选择任何选项）。', after: [cur('pro_c_open'), cur('dec_start_c')], before: [{ entity_id: 'pro_c_open', revision: 1 }], command: (cur('pro_c_open').commands as Record<string, unknown>[])[0], source: ui('act_open_dec_c', '2026-11-23T07:50:00Z', '采用候选') },
  { seq: 1115, type: 'proposal.submitted', at: '2026-11-23T08:10:00Z', actor: actor.codex(), projectRevisionAfter: 18, subject: cur('pro_c_timing'), summary: '模型建议选择“现在并行开展”。只是候选，模型不能批准自己的建议。', kind: 'inferred', source: { ...adapter('msg-0351', '2026-11-23T08:09:00Z', '会话中的模型建议', 9741), locator: loc.message(SESSION_ALLOC, 'msg-0351', 'assistant', '2026-11-23T08:09:00Z', '会话中的模型建议', MSG_C_TIMING) } },
  { seq: 1201, type: 'proposal.submitted', at: '2026-11-24T07:20:00Z', actor: actor.codex(), projectRevisionAfter: 18, subject: cur('pro_add_network'), summary: '模型建议增加时空图神经网络。规则检查：与已关闭路线重复，且未说明复杂度贡献。', kind: 'inferred', source: { ...adapter('msg-0388', '2026-11-24T07:19:00Z', '会话中的模型建议', 9911), locator: loc.message(SESSION_ALLOC, 'msg-0388', 'assistant', '2026-11-24T07:19:00Z', '会话中的模型建议', MSG_ADD_NETWORK) } },
  { seq: 1240, type: 'session.bound', at: '2026-11-25T02:05:00Z', actor: owner, projectRevisionAfter: 18, subject: session1, summary: '研究负责人选择“在此开展工作”：会话 codex-sess-7f3a 绑定到对照实验单元，使用上下文包 ctx_alloc_exp。', after: [session1], related: ['ctx_alloc_exp'], source: ui('act_bind_alloc', '2026-11-25T02:05:00Z', '在此开展工作', 'unit-detail') },
  { seq: 1244, type: 'experiment.observed', at: '2026-11-25T02:10:00Z', actor: actor.adapter(), projectRevisionAfter: 18, subject: runV2_1, summary: '第二次对照运行开始。', after: [runV2_1, session2], source: adapter('evt-run_alloc_v2-start', '2026-11-25T02:10:00Z', '运行开始事件', 10021, 'call_alloc_v2') },
  { seq: 1281, type: 'source.ingested', at: '2026-11-25T02:41:00Z', actor: actor.adapter(), projectRevisionAfter: 18, subject: cur('ses_alloc'), summary: '文件 results/partial_seed11.json 出现；只按时间窗口关联到本会话（没有工具调用ID），属于推断关联。', after: [], correlation: 'correlated', source: { instance: 'src_codex_cli', eventId: 'fs-0241', sequence: 10102, locator: loc.file('art_alloc_config', 'results/partial_seed11.json', '2026-11-25T02:41:00Z', '文件变化（时间窗口关联）', { precision: 'correlated' }) } },
  { seq: 1284, type: 'session.observed', at: '2026-11-25T03:52:00Z', actor: actor.adapter(), projectRevisionAfter: 18, subject: cur('ses_alloc'), summary: '最近一次可靠活动：run_alloc_v2 正在运行预算100、种子13。', after: [cur('ses_alloc'), cur('run_alloc_v2')], source: adapter('evt-heartbeat-0352', '2026-11-25T03:52:00Z', '运行心跳', 10233) },
];

export const events = specs.map(build);
export const LAST_EVENT_SEQ = 1284;
