// 第二个内置项目：一个很小、和阶段A示例完全不同的虚构项目（综述写作），并且没有任何扩展数据。
// 用途：验证“换一个项目不需要改前端代码”（D-007 工作包一）。真实导入的项目一开始也是这样：
// 只有合同里的对象，没有手写的首页要点、路线比较、术语表或单元详情。
// 实体结构取自阶段A快照中的同类对象（保证字段齐全、符合合同），内容全部改写。全部为虚构。
// 运行：npm run fixtures
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const dir = new URL('.', import.meta.url).pathname;
const stageA = JSON.parse(readFileSync(join(dir, '../stage-a/stage-a.snapshot.json'), 'utf8'));
type E = Record<string, any>;

const PID = 'prj_review';
const sha = (t: string) => createHash('sha256').update(t).digest('hex');
const pick = (coll: string, id: string): E => structuredClone(stageA[coll].find((e: E) => e.id === id));
const owner = { principal_id: 'usr_owner', kind: 'human', authentication_ref: 'auth_local_session', grant_id: 'grt_review_owner' };
const action = (id: string, at: string, what: string) => ({
  kind: 'user_action', precision: 'exact', correlation_method: 'direct_id', content_sha256: null, captured_at: at,
  description: `研究负责人的界面操作：${what}`, action_id: id, ui_surface: 'workbench', request_id: `req-${id}`,
});
const prov = (id: string, at: string, what: string) => ({
  observation_kind: 'observed', source_refs: [action(id, at, what)], created_by: owner, derivation_note: '最小虚构项目：只用于验证界面不依赖特定项目。',
});
/** 用模板实体的结构，换成本项目的编号、时间、来源和内容。 */
const make = (template: E, id: string, at: string, fields: E, revision = 1): E => ({
  ...template, id, revision, project_id: PID, created_at: at, updated_at: at, valid_time: { from: at, to: null }, provenance: prov(`act_${id}`, at, `建立 ${id}`), ...fields,
});

const T0 = '2026-10-01T02:00:00Z';
const T1 = '2026-10-08T03:00:00Z';
const T2 = '2026-10-20T05:00:00Z';

const project = make(stageA.project, PID, T0, {
  name: '综述写作：位置不确定下的任务分配方法（最小示例）',
  goal: '写出一节按方法类别组织、并说明每类方法评价条件的综述，让读者能判断哪些结果可以互相比较。',
  problem_statement: '已有文献的评价条件差异很大，直接并列结果会误导读者。',
  in_scope: ['文献筛选与分类', '评价条件的整理与对照'],
  out_of_scope: ['复现文献中的实验'],
  constraints: [{ id: 'cst_traceable', text: '综述里的每个结论都要能追溯到具体文献的页码。', source_ref: action('act_setup', T0, '写入约束') }],
  main_branch_id: 'brn_by_method',
  focus_unit_id: 'unt_screen',
  status: 'active',
}, 3);

const branches = [
  make(stageA.branches[0], 'brn_by_method', T0, {
    name: '按方法类别组织', purpose: '先按方法类别分节，每节说明该类方法的评价条件。', state: 'active',
    derived_from_branch_id: null, base_unit_id: null, base_checkpoint_id: null, context_revision: 1, effective_decision_ids: [], open_claim_ids: ['clm_eval_gap'], closure_reason: null,
  }),
  make(stageA.branches[0], 'brn_by_scene', T2, {
    name: '按应用场景组织', purpose: '按应用场景分节，同一场景下比较不同方法。', state: 'proposed',
    derived_from_branch_id: 'brn_by_method', base_unit_id: 'unt_scope', base_checkpoint_id: null, context_revision: 1, effective_decision_ids: [], open_claim_ids: [], closure_reason: null,
  }),
];

const unitT = stageA.research_units.find((u: E) => u.id === 'unt_c_weight');
const units = [
  make(unitT, 'unt_scope', T0, {
    branch_id: 'brn_by_method', title: '确定综述范围', question: '综述只覆盖哪些问题设定？', purpose: '划定范围，避免把不可比的工作放在一起。',
    work_state: 'finished', parent_unit_ids: [], claim_ids: [], decision_ids: [], evidence_ids: [], artifact_version_ids: [], acceptance_criteria: [],
    blocker: null, next_action: '无。', completion: { kind: 'criteria_satisfied', basis: '范围已写入项目说明。', evidence_ids: [], review_ids: [], completed_at: T1 },
  }, 2),
  make(unitT, 'unt_screen', T1, {
    branch_id: 'brn_by_method', title: '筛选文献并记录评价条件', question: '候选文献分别在什么数据、预算和时限下评价？', purpose: '为每类方法整理可比较的评价条件。',
    work_state: 'active', parent_unit_ids: ['unt_scope'], claim_ids: ['clm_assume_exact', 'clm_eval_gap'], decision_ids: [], evidence_ids: ['evd_screen'], artifact_version_ids: ['art_screen_log'],
    acceptance_criteria: [{ id: 'acc_screen', description: '每篇入选文献都记录数据集、预算、时限和页码。', required_evidence_kind: 'source', mandatory: true }],
    blocker: null, next_action: '补完剩余 11 篇文献的评价条件。',
  }),
  make(unitT, 'unt_scene_outline', T2, {
    branch_id: 'brn_by_scene', title: '按场景重排大纲', question: '按应用场景组织，读者是否更容易比较？', purpose: '检验另一种组织方式。',
    work_state: 'planned', parent_unit_ids: ['unt_scope'], claim_ids: [], decision_ids: ['dec_structure'], evidence_ids: [], artifact_version_ids: [], acceptance_criteria: [],
    blocker: null, next_action: '等待决定综述按什么组织（dec_structure）。',
  }),
];

const edgeT = stageA.graph_edges.find((e: E) => e.relation === 'continues_to');
const supT = stageA.graph_edges.find((e: E) => e.relation === 'supports' && e.currency === 'current');
const edges = [
  make(edgeT, 'edg_r1', T1, { source_id: 'unt_scope', target_id: 'unt_screen', source_revision: 2, target_revision: 1, branch_id: 'brn_by_method', rationale: '范围确定后开始筛选。', state: 'active', currency: 'current' }),
  make(edgeT, 'edg_r2', T2, { source_id: 'unt_scope', target_id: 'unt_scene_outline', source_revision: 2, target_revision: 1, branch_id: 'brn_by_scene', rationale: '另一种组织方式。', state: 'active', currency: 'current' }),
  make(supT, 'edg_r3', T2, { source_id: 'evd_screen', target_id: 'clm_assume_exact', source_revision: 1, target_revision: 1, branch_id: null, rationale: '筛选记录直接给出了比例。', state: 'active', currency: 'current' }),
];

const claimT = stageA.claims.find((c: E) => c.id === 'clm_completion');
const claims = [
  make(claimT, 'clm_assume_exact', T2, {
    text: '多数候选文献假设车辆位置预测没有误差。', claim_kind: 'finding', assessment: 'supported',
    conditions: '只针对本次筛选的 42 篇候选文献；31 篇在方法部分明确这样假设。', evidence_ids: ['evd_screen'], branch_ids: ['brn_by_method'],
  }),
  make(claimT, 'clm_eval_gap', T2, {
    text: '不同方法的结果差异主要来自评价条件不同，而不是方法本身。', claim_kind: 'hypothesis', assessment: 'unassessed',
    conditions: '还没有把评价条件整理完，无法判断。', evidence_ids: [], branch_ids: ['brn_by_method'],
  }),
];

const art = make(stageA.artifact_versions[0], 'art_screen_log', T2, {
  logical_artifact_id: 'lga_screen_log', title: '文献筛选表', media_type: 'text/csv', version_label: '第1版',
  storage_ref: { kind: 'local', location: 'review/screening.csv' }, sha256: sha('screening.csv:v1'), byte_size: 4096, availability: 'available',
  previous_version_id: null, produced_by_unit_id: 'unt_screen', version_pinning: 'content_verified',
});

const fileLoc = {
  kind: 'file', precision: 'exact', correlation_method: 'content_hash', content_sha256: sha('screening.csv:v1'), captured_at: T2,
  description: '筛选表的汇总行', artifact_version_id: 'art_screen_log', relative_path: 'review/screening.csv', page_number: null, section: null, span: null,
};
const evidence = [
  make(stageA.evidence.find((e: E) => e.id === 'evd_lit_calib'), 'evd_screen', T2, {
    title: '筛选记录：42 篇候选文献中 31 篇假设位置无误差', evidence_kind: 'dataset',
    statement: '在 42 篇候选文献中，31 篇在方法部分明确假设车辆位置预测没有误差。', artifact_version_ids: ['art_screen_log'], experiment_run_id: null,
    scope: '本次检索得到的候选文献。', limitations: '检索只覆盖两个数据库，可能漏掉会议短文。', availability: 'available', verification_status: 'source_checked',
    source_locator: fileLoc,
  }),
];

const decisionT = stageA.decisions.find((d: E) => d.id === 'dec_start_c');
const decisions = [
  make(decisionT, 'dec_structure', T2, {
    question: '综述按方法类别组织，还是按应用场景组织？',
    options: [
      { id: 'opt_by_method', label: '按方法类别', description: '每节一类方法，节内说明评价条件。', expected_benefit: '与现有筛选表一致，改动少。', cost_and_risk: '同一场景的方法分散在不同节。', evidence_ids: ['evd_screen'] },
      { id: 'opt_by_scene', label: '按应用场景', description: '每节一个场景，节内比较不同方法。', expected_benefit: '读者更容易比较同一场景下的方法。', cost_and_risk: '需要重排大纲，约两天。', evidence_ids: [] },
    ],
    status: 'proposed', accepted_option_id: null, rationale: '两种组织方式各有利弊，尚未选择。', evidence_ids: ['evd_screen'],
    authorized_by_grant_id: null, authorization_grant_revision: null, acceptance_source: null, accepted_at: null, superseded_by_decision_id: null,
  }),
];

const grants = [
  make(stageA.grants.find((g: E) => g.id === 'grt_owner_core'), 'grt_review_owner', T0, {
    subject_principal_ids: ['usr_owner'], scope: { kind: 'project', project_id: PID }, status: 'active', expires_at: null, revoked_at: null,
    reason: '创建项目时签发给项目负责人的人工操作授权（样机假设，见 D-004）。',
  }),
];

const snapshot = {
  schema_version: '1.0.0',
  export_kind: 'project_snapshot',
  exported_at: '2026-11-26T00:00:00Z',
  example_notice: '最小虚构项目：全部为虚构，只用于验证界面不依赖特定项目，且在没有扩展数据时照样能用。',
  event_history_scope: 'excerpt',
  last_event_seq: 12,
  project,
  branches,
  research_units: units,
  graph_edges: edges,
  claims,
  evidence,
  decisions,
  artifact_versions: [art],
  experiment_runs: [],
  checkpoints: [],
  proposals: [],
  reviews: [],
  session_bindings: [],
  capability_manifests: [],
  context_bundles: [],
  reading_briefs: [],
  grants,
  events: [],
};

writeFileSync(join(dir, 'mini.snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
console.log('已生成 mini.snapshot.json（没有扩展数据）');
