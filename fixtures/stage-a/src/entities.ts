// 阶段A虚构项目的领域实体（当前修订）。字段遵循 packages/contracts/schema/domain.schema.json v1.0.0。
import { actor, base, fakeCommit, loc, provenance, sha, PROJECT_ID } from './helpers.ts';

export const SESSION_CALIB = 'codex-sess-2c91';
export const SESSION_ALLOC = 'codex-sess-7f3a';
export const SESSION_IMPORT = 'claude-export-0915';

const OWNER_GRANT = 'grt_owner_core';

// 研究负责人在项目界面上的明确操作。
const ua = (id: string, at: string, what: string, surface = 'decision-card') => loc.userAction(id, at, `研究负责人的界面操作：${what}`, surface);
const ownerObserved = (id: string, at: string, what: string, surface?: string) =>
  provenance('observed', [ua(id, at, what, surface)], actor.owner(OWNER_GRANT));

// ---------------------------------------------------------------- 项目
export const project = {
  ...base('prj_mcs', 18, '2026-09-01T02:00:00Z', '2026-11-23T07:50:00Z', ownerObserved('act_create_project', '2026-09-01T02:00:00Z', '创建项目并填写目标', 'project-setup')),
  project_id: PROJECT_ID,
  name: '移动群智感知任务分配（阶段A虚构示例）',
  goal: '在车辆位置预测存在误差时，提高有限预算下移动群智感知任务的完成率。',
  problem_statement:
    '平台把“到某个区域采集信息”的任务分给正在行驶的车辆。分配器需要估计每辆车能否在时限内到达目标区域，但只能依据有误差的位置预测。现有做法直接使用预测模型给出的到达概率；如果这些概率系统性偏高，分配器会把任务交给实际到不了的车辆，任务因此失败。',
  in_scope: ['到达概率的可靠性诊断与校准', '任务分配方法的对照实验', '分配评分中各项机制是否必要的检验'],
  out_of_scope: ['车辆通信协议设计', '新的轨迹预测网络结构（除非证据表明预测精度是主要瓶颈）'],
  constraints: [
    {
      id: 'cst_complexity',
      text: '增加方法复杂度之前，必须先说明它对核心问题（任务完成率）的贡献依据。',
      source_ref: ua('act_create_project', '2026-09-01T02:00:00Z', '在项目设置中写入约束', 'project-setup'),
    },
    {
      id: 'cst_same_conditions',
      text: '比较不同路线的任务完成率时，必须使用相同的数据划分、预算、时限和随机种子集合。',
      source_ref: ua('act_add_constraint', '2026-10-12T03:00:00Z', '在项目设置中追加约束', 'project-setup'),
    },
  ],
  main_branch_id: 'brn_main',
  focus_unit_id: 'unt_alloc_exp',
  status: 'active',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
};

// ---------------------------------------------------------------- 分支（研究路线）
export const branches = [
  {
    ...base('brn_main', 6, '2026-09-01T02:00:00Z', '2026-11-19T02:00:00Z', ownerObserved('act_create_project', '2026-09-01T02:00:00Z', '创建项目时建立初始路线', 'project-setup')),
    name: '主线：路线B 先校准再分配',
    purpose: '先检验并修正到达概率的可靠性，再把校准后的概率交给原有分配器，验证最终任务完成率是否提高。分配器本身不改动。',
    state: 'active',
    derived_from_branch_id: null,
    base_unit_id: null,
    base_checkpoint_id: null,
    context_revision: 6,
    effective_decision_ids: ['dec_route_b', 'dec_no_network', 'dec_calib_method', 'dec_eval_v2'],
    open_claim_ids: ['clm_completion', 'clm_calib_all_periods', 'clm_paper_s4'],
    closure_reason: null,
  },
  {
    ...base('brn_a', 2, '2026-10-03T01:00:00Z', '2026-10-08T06:40:00Z', ownerObserved('act_fork_a', '2026-10-03T01:00:00Z', '从共同基线新建路线A', 'map')),
    name: '路线A：直接使用预测到达概率',
    purpose: '保留原方法作为对照：分配器直接使用预测模型输出的到达概率，改进只能来自分配算法本身。',
    state: 'paused',
    derived_from_branch_id: 'brn_main',
    base_unit_id: 'unt_baseline',
    base_checkpoint_id: null,
    context_revision: 2,
    effective_decision_ids: ['dec_eval_v2'],
    open_claim_ids: [],
    closure_reason: null,
  },
  {
    ...base('brn_net', 2, '2026-10-04T02:00:00Z', '2026-10-09T08:00:00Z', ownerObserved('act_fork_net', '2026-10-04T02:00:00Z', '从文献调研新建备选路线', 'map')),
    name: '备选：增加复杂预测网络',
    purpose: '评估更复杂的轨迹预测网络能否提高到达预测精度，进而提高任务完成率。',
    state: 'closed',
    derived_from_branch_id: 'brn_main',
    base_unit_id: 'unt_lit',
    base_checkpoint_id: null,
    context_revision: 2,
    effective_decision_ids: [],
    open_claim_ids: [],
    closure_reason:
      '基线失败分解显示，失败主要发生在“预测概率高但车辆没按时到达”的情形，而不是位置误差最大的情形，因此提高预测精度没有针对主要原因；增加网络还会显著提高实现与解释成本，不符合约束“先说明复杂度贡献”。恢复条件：任务分配对照实验显示校准后的概率仍是任务失败的主要瓶颈。可复用发现：文献调研中整理的三类预测误差来源。',
  },
  {
    ...base('brn_c', 1, '2026-11-23T07:30:00Z', '2026-11-23T07:30:00Z', ownerObserved('act_fork_c', '2026-11-23T07:30:00Z', '从快照 ckp_calib 继续，新建路线C', 'checkpoint')),
    name: '路线C：简化分配评分',
    purpose: '检验分配评分中的“可靠性加权项”是否必要：用只含距离与时限的简化评分，与完整评分在相同条件下比较任务完成率。',
    state: 'proposed',
    derived_from_branch_id: 'brn_main',
    base_unit_id: 'unt_baseline',
    base_checkpoint_id: 'ckp_calib',
    context_revision: 1,
    effective_decision_ids: ['dec_eval_v2', 'dec_calib_method'],
    open_claim_ids: ['clm_weight_needed'],
    closure_reason: null,
  },
];

// ---------------------------------------------------------------- 研究单元
const unit = (
  id: string,
  revision: number,
  created: string,
  updated: string,
  actionId: string,
  fields: Record<string, unknown>,
) => ({
  ...base(id, revision, created, updated, ownerObserved(actionId, updated, '创建或修订研究单元', 'unit-detail')),
  ...fields,
  owner_principal_id: 'usr_owner',
});

export const researchUnits = [
  unit('unt_problem', 2, '2026-09-03T01:00:00Z', '2026-09-10T08:00:00Z', 'act_finish_problem', {
    branch_id: 'brn_main',
    title: '问题建模：到达不确定时的任务分配',
    question: '当车辆能否按时到达目标区域不确定时，任务分配问题的输入、决策、目标和约束分别是什么？',
    purpose: '为所有路线确定共同的问题定义和评价口径，避免各实验自行定义“任务完成”。',
    work_state: 'finished',
    parent_unit_ids: [],
    claim_ids: [],
    decision_ids: [],
    evidence_ids: [],
    artifact_version_ids: ['art_problem_doc_v1', 'art_problem_doc_v2'],
    acceptance_criteria: [
      { id: 'acc_problem_def', description: '写出包含输入、决策变量、目标与约束的问题定义，并经研究负责人审阅。', required_evidence_kind: 'human_review', mandatory: true },
    ],
    blocker: null,
    next_action: '无。后续单元沿用本单元的问题定义。',
    completion: {
      kind: 'criteria_satisfied',
      basis: '问题定义文档第2版（art_problem_doc_v2）已由研究负责人审阅通过（rev_problem）。',
      evidence_ids: [],
      review_ids: ['rev_problem'],
      completed_at: '2026-09-10T08:00:00Z',
    },
  }),
  unit('unt_lit', 2, '2026-09-08T01:00:00Z', '2026-09-20T09:00:00Z', 'act_finish_lit', {
    branch_id: 'brn_main',
    title: '文献调研：到达预测误差与概率校准',
    question: '已有工作怎样处理车辆位置预测的误差？概率校准方法能否直接用于“是否按时到达”的概率？',
    purpose: '在决定改预测模型还是改分配方法之前，了解已有工作在哪些环节处理预测误差。',
    work_state: 'finished',
    parent_unit_ids: ['unt_problem'],
    claim_ids: [],
    decision_ids: [],
    evidence_ids: ['evd_lit_calib'],
    artifact_version_ids: ['art_lit_survey'],
    acceptance_criteria: [
      { id: 'acc_lit', description: '整理至少10篇相关文献，并给出按“处理误差的环节”分类的比较表。', required_evidence_kind: 'source', mandatory: true },
    ],
    blocker: null,
    next_action: '无。文献比较表供后续方法选择引用。',
    completion: {
      kind: 'criteria_satisfied',
      basis: '已登记14篇虚构文献，并按三个环节完成比较表；方法选择依据见 evd_lit_calib。',
      evidence_ids: ['evd_lit_calib'],
      review_ids: [],
      completed_at: '2026-09-20T09:00:00Z',
    },
  }),
  unit('unt_baseline', 3, '2026-09-25T01:00:00Z', '2026-10-14T03:00:00Z', 'act_finish_baseline', {
    branch_id: 'brn_main',
    title: '共同基线：评价条件与原方法表现',
    question: '在固定的数据划分、预算和时限下，直接使用预测概率的原方法任务完成率是多少？失败的分配主要发生在什么情形？',
    purpose: '在固定条件下测出原方法的任务完成率，作为所有路线的比较基线。',
    work_state: 'finished',
    parent_unit_ids: ['unt_lit'],
    claim_ids: [],
    decision_ids: ['dec_eval_v1', 'dec_eval_v2'],
    evidence_ids: ['evd_baseline_completion'],
    artifact_version_ids: ['art_eval_config_v1', 'art_eval_config_v2', 'art_baseline_results', 'art_dataset_manifest'],
    acceptance_criteria: [
      { id: 'acc_base_run', description: '按现行评价规则（dec_eval_v2）完成5个随机种子的基线运行，结果可复核。', required_evidence_kind: 'experiment', mandatory: true },
    ],
    blocker: null,
    next_action: '无。基线结果被路线A、B、C共同引用。',
    completion: {
      kind: 'criteria_satisfied',
      basis: 'run_baseline 按 dec_eval_v2 完成5个随机种子，配置、环境与结果文件均已登记（evd_baseline_completion）。',
      evidence_ids: ['evd_baseline_completion'],
      review_ids: [],
      completed_at: '2026-10-14T03:00:00Z',
    },
  }),
  unit('unt_a_diag', 2, '2026-10-03T01:00:00Z', '2026-10-07T07:00:00Z', 'act_finish_a_diag', {
    branch_id: 'brn_a',
    title: '路线A诊断：直接使用的概率是否过于自信',
    question: '原方法使用的到达概率，在高概率区间是否高估了车辆实际按时到达的比例？',
    purpose: '检查原方法使用的概率本身是否系统性偏高，判断任务失败是否与“过度相信概率”有关。',
    work_state: 'finished',
    parent_unit_ids: ['unt_baseline'],
    claim_ids: ['clm_overconf'],
    decision_ids: [],
    evidence_ids: ['evd_reliability_a'],
    artifact_version_ids: ['art_a_reliability'],
    acceptance_criteria: [
      { id: 'acc_a_curve', description: '在验证划分上画出可靠性曲线，并报告高概率区间的实际到达比例。', required_evidence_kind: 'experiment', mandatory: true },
    ],
    blocker: null,
    next_action: '无。路线A暂缓并作为对照保留；若路线B对照实验没有改善，再回到本路线考虑改进分配算法。',
    completion: {
      kind: 'criteria_satisfied',
      basis: '可靠性曲线与高概率区间统计已完成（evd_reliability_a）。',
      evidence_ids: ['evd_reliability_a'],
      review_ids: [],
      completed_at: '2026-10-07T07:00:00Z',
    },
  }),
  unit('unt_net_eval', 3, '2026-10-04T02:00:00Z', '2026-10-09T08:00:00Z', 'act_archive_net', {
    branch_id: 'brn_net',
    title: '备选评估：是否需要更复杂的预测网络',
    question: '基线中的任务失败，主要来自预测位置误差大，还是来自预测概率被过度相信？',
    purpose: '在投入大量实现成本之前，判断提高预测精度是否针对了任务失败的主要原因。',
    work_state: 'archived',
    parent_unit_ids: ['unt_lit'],
    claim_ids: ['clm_failure_source'],
    decision_ids: ['dec_no_network'],
    evidence_ids: ['evd_failure_analysis'],
    artifact_version_ids: ['art_failure_analysis'],
    acceptance_criteria: [],
    blocker: null,
    next_action: '无。若模型再次建议增加网络，先对照本节点的关闭理由与恢复条件。',
    completion: {
      kind: 'closed_with_limitations',
      basis: '依据基线失败分解（evd_failure_analysis）作出“暂不增加网络”的决定（dec_no_network）。没有训练新网络，因此不知道新网络能把误差降低多少。',
      evidence_ids: ['evd_failure_analysis'],
      review_ids: [],
      completed_at: '2026-10-09T08:00:00Z',
    },
  }),
  unit('unt_calib_design', 2, '2026-10-15T01:00:00Z', '2026-10-22T08:00:00Z', 'act_finish_design', {
    branch_id: 'brn_main',
    title: '方法设计：用温度缩放校准到达概率',
    question: '用哪种校准方法修正到达概率的系统性偏高，同时不改变分配算法和车辆之间的概率排序？',
    purpose: '在不改动分配算法的前提下修正概率偏差，使后续任务完成率的变化可以归因于概率可靠性。',
    work_state: 'finished',
    parent_unit_ids: ['unt_baseline'],
    claim_ids: [],
    decision_ids: ['dec_calib_method'],
    evidence_ids: ['evd_lit_calib'],
    artifact_version_ids: ['art_calib_code'],
    acceptance_criteria: [
      { id: 'acc_design_doc', description: '写明候选校准方法的区别与选择依据，并经研究负责人确认。', required_evidence_kind: 'human_review', mandatory: true },
      { id: 'acc_design_impl', description: '实现与方法说明一一对应，经实现审阅。', required_evidence_kind: 'human_review', mandatory: true },
    ],
    blocker: null,
    next_action: '无。实验在单元“实验：校准对概率可靠性的影响”中进行。',
    completion: {
      kind: 'criteria_satisfied',
      basis: '决定 dec_calib_method 已采用；实现 art_calib_code 经实现审阅通过（rev_calib_design）。',
      evidence_ids: ['evd_lit_calib'],
      review_ids: ['rev_calib_design'],
      completed_at: '2026-10-22T08:00:00Z',
    },
  }),
  unit('unt_calib_exp', 3, '2026-10-23T01:00:00Z', '2026-11-18T07:30:00Z', 'act_reclose_calib', {
    branch_id: 'brn_main',
    title: '实验：校准对概率可靠性的影响',
    question: '温度缩放之后，到达概率与车辆实际按时到达的频率是否更一致？这种改善在不同时段是否都成立？',
    purpose: '在比较任务完成率之前，先确认校准确实让到达概率更可靠。',
    work_state: 'finished',
    parent_unit_ids: ['unt_calib_design'],
    claim_ids: ['clm_calib_test', 'clm_calib_all_periods'],
    decision_ids: [],
    evidence_ids: ['evd_ece_test', 'evd_peak'],
    artifact_version_ids: ['art_calib_results', 'art_peak_results'],
    acceptance_criteria: [
      { id: 'acc_ece', description: '在测试划分上用5个随机种子比较校准前后的期望校准误差（ECE）。', required_evidence_kind: 'experiment', mandatory: true },
      { id: 'acc_period', description: '按时段检查校准效果是否一致。', required_evidence_kind: 'experiment', mandatory: false },
    ],
    blocker: null,
    next_action: '无。晚高峰问题在对照实验中按时段单独报告。',
    completion: {
      kind: 'closed_with_limitations',
      basis:
        '测试划分上的ECE比较已完成（5个随机种子，evd_ece_test）。按时段检查发现晚高峰子集校准后仍明显偏离（evd_peak），原因未查明；该问题作为反证记入主张 clm_calib_all_periods，并在对照实验中按时段单独报告，本单元不再继续调查。',
      evidence_ids: ['evd_ece_test', 'evd_peak'],
      review_ids: [],
      completed_at: '2026-11-18T07:30:00Z',
    },
  }),
  unit('unt_alloc_exp', 2, '2026-11-19T02:00:00Z', '2026-11-21T02:00:00Z', 'act_create_alloc', {
    branch_id: 'brn_main',
    title: '对照实验：校准是否提高任务完成率',
    question: '在相同数据划分、预算、时限和随机种子下，把校准后的概率交给同一分配器，任务完成率是否高于直接使用原始概率？',
    purpose: '检验路线B的核心假设：概率更可靠能带来更多按时完成的任务。',
    work_state: 'active',
    parent_unit_ids: ['unt_calib_exp'],
    claim_ids: ['clm_completion', 'clm_paper_s4'],
    decision_ids: ['dec_eval_v2'],
    evidence_ids: ['evd_peak'],
    artifact_version_ids: ['art_alloc_config', 'art_alloc_v1_log'],
    acceptance_criteria: [
      { id: 'acc_alloc_ctrl', description: '完成预算50、100、200三档、各5个随机种子的对照实验，并保存可复核的配置与结果。', required_evidence_kind: 'experiment', mandatory: true },
      { id: 'acc_alloc_review', description: '研究负责人审阅结果解释，确认结论措辞与证据范围一致。', required_evidence_kind: 'human_review', mandatory: true },
    ],
    blocker: null,
    next_action:
      '等待 run_alloc_v2 完成后，按预算50、100、200三档比较两组的任务完成率；同时统计每组的失败分配次数（分配给车辆但车辆没有按时到达），晚高峰时段单独报告。',
    completion: null,
  }),
  unit('unt_c_weight', 1, '2026-11-23T07:30:00Z', '2026-11-23T07:30:00Z', 'act_fork_c', {
    branch_id: 'brn_c',
    title: '路线C：可靠性加权项是否必要',
    question: '如果分配评分只保留距离与时限两项，在相同条件下任务完成率是否与完整评分相同？',
    purpose: '按项目约束“先说明复杂度贡献”，检验评分中的可靠性加权项是否值得它带来的复杂度。',
    work_state: 'planned',
    parent_unit_ids: ['unt_baseline'],
    claim_ids: ['clm_weight_needed'],
    decision_ids: ['dec_start_c'],
    evidence_ids: ['evd_ece_test', 'evd_peak'],
    artifact_version_ids: [],
    acceptance_criteria: [
      { id: 'acc_c_ctrl', description: '在路线B对照实验相同的条件下增加“简化评分”组，比较三组的任务完成率。', required_evidence_kind: 'experiment', mandatory: true },
    ],
    blocker: null,
    next_action: '等待研究负责人决定开展时机（待决定事项 dec_start_c）。',
    completion: null,
  }),
];

// ---------------------------------------------------------------- 图关系
type EdgeSpec = [id: string, source: string, sourceRev: number, relation: string, target: string, targetRev: number, branch: string | null, rationale: string, currency?: string, at?: string];
const edgeSpecs: EdgeSpec[] = [
  ['edg_l1', 'unt_problem', 2, 'continues_to', 'unt_lit', 1, 'brn_main', '问题定义完成后，调研已有工作如何处理预测误差。', 'current', '2026-09-08T01:00:00Z'],
  ['edg_l2', 'unt_lit', 2, 'continues_to', 'unt_baseline', 1, 'brn_main', '调研之后，在固定条件下测量原方法作为共同基线。', 'current', '2026-09-25T01:00:00Z'],
  ['edg_la', 'unt_baseline', 2, 'continues_to', 'unt_a_diag', 1, 'brn_a', '基线显示失败集中在高概率区间，派生路线A诊断概率本身。', 'current', '2026-10-03T01:00:00Z'],
  ['edg_ln', 'unt_lit', 2, 'continues_to', 'unt_net_eval', 1, 'brn_net', '文献中“改进预测模型”一类方法，派生为备选路线评估。', 'current', '2026-10-04T02:00:00Z'],
  ['edg_l3', 'unt_baseline', 3, 'continues_to', 'unt_calib_design', 1, 'brn_main', '采用路线B（dec_route_b）后，设计校准方法。', 'current', '2026-10-15T01:00:00Z'],
  ['edg_l4', 'unt_calib_design', 2, 'continues_to', 'unt_calib_exp', 1, 'brn_main', '方法确定后，先检验校准是否让概率更可靠。', 'current', '2026-10-23T01:00:00Z'],
  ['edg_l5', 'unt_calib_exp', 3, 'continues_to', 'unt_alloc_exp', 1, 'brn_main', '概率可靠性改善后，检验它能否提高任务完成率。', 'current', '2026-11-19T02:00:00Z'],
  ['edg_lc', 'unt_baseline', 3, 'continues_to', 'unt_c_weight', 1, 'brn_c', '从快照 ckp_calib 继续，派生路线C检验评分复杂度。', 'current', '2026-11-23T07:30:00Z'],
  ['edg_d1', 'unt_alloc_exp', 2, 'depends_on', 'unt_calib_exp', 3, 'brn_main', '对照实验需要已拟合的温度参数和校准代码。', 'current', '2026-11-21T02:00:00Z'],
  ['edg_d2', 'unt_c_weight', 1, 'depends_on', 'unt_calib_exp', 3, 'brn_c', '路线C的三组比较使用校准后的概率。', 'current', '2026-11-23T07:30:00Z'],
  ['edg_s1', 'evd_reliability_a', 1, 'supports', 'clm_overconf', 2, null, '验证划分0.8–0.9区间实际到达比例0.62，直接支持“高概率区间被高估”。', 'current', '2026-10-07T07:00:00Z'],
  ['edg_s2', 'evd_ece_test', 1, 'supports', 'clm_calib_test', 2, null, '测试划分5个种子的ECE比较，只支持测试划分上的可靠性改善。', 'current', '2026-11-01T08:00:00Z'],
  ['edg_s3', 'evd_ece_test', 1, 'supports', 'clm_calib_all_periods', 2, null, '建立于主张第2版（当时表述为全天改善成立）；主张已修订为第3版，本关系需要重新核验。', 'needs_revalidation', '2026-11-01T08:00:00Z'],
  ['edg_c1', 'evd_peak', 1, 'contradicts', 'clm_calib_all_periods', 3, null, '晚高峰子集校准后ECE仍为0.113，挑战“所有时段都改善”。', 'current', '2026-11-18T07:20:00Z'],
  ['edg_s4', 'evd_failure_analysis', 1, 'supports', 'clm_failure_source', 2, null, '失败分解统计直接对应该主张；只说明同时出现，不是因果证明。', 'current', '2026-10-09T07:00:00Z'],
  ['edg_u1', 'unt_calib_design', 2, 'uses', 'evd_lit_calib', 1, 'brn_main', '方法选择依据。', 'current', '2026-10-21T03:00:00Z'],
  ['edg_u2', 'unt_c_weight', 1, 'uses', 'evd_ece_test', 1, 'brn_c', '跨分支复用路线B的证据：测试划分上校准有效。以引用方式使用，不复制。', 'current', '2026-11-23T07:30:00Z'],
  ['edg_u3', 'unt_alloc_exp', 2, 'uses', 'dec_eval_v2', 1, 'brn_main', '对照实验遵循现行评价规则（5个随机种子）。', 'current', '2026-11-19T02:00:00Z'],
  ['edg_u4', 'unt_alloc_exp', 2, 'uses', 'evd_peak', 1, 'brn_main', '带入已知反证：晚高峰时段需单独报告。', 'current', '2026-11-19T02:00:00Z'],
  ['edg_u5', 'unt_c_weight', 1, 'uses', 'evd_peak', 1, 'brn_c', '从旧快照继续时带上快照之后发现的反证。', 'current', '2026-11-23T07:30:00Z'],
  ['edg_p1', 'unt_problem', 2, 'produces', 'art_problem_doc_v2', 1, 'brn_main', '问题定义文档第2版。', 'current', '2026-09-10T08:00:00Z'],
  ['edg_p2', 'unt_calib_design', 2, 'produces', 'art_calib_code', 1, 'brn_main', '校准实现。', 'current', '2026-10-22T08:00:00Z'],
  ['edg_p3', 'unt_calib_exp', 3, 'produces', 'art_calib_results', 1, 'brn_main', '测试划分ECE结果。', 'current', '2026-11-18T07:30:00Z'],
  ['edg_p4', 'unt_calib_exp', 3, 'produces', 'art_peak_results', 1, 'brn_main', '按时段的ECE结果。', 'current', '2026-11-18T07:30:00Z'],
  ['edg_p5', 'unt_baseline', 3, 'produces', 'art_baseline_results', 1, 'brn_main', '基线5个种子结果。', 'current', '2026-10-14T03:00:00Z'],
  ['edg_p6', 'unt_alloc_exp', 2, 'produces', 'art_alloc_config', 1, 'brn_main', '对照实验配置。', 'current', '2026-11-21T01:20:00Z'],
  ['edg_ss', 'dec_eval_v2', 1, 'supersedes', 'dec_eval_v1', 2, null, '比较路线前改用5个随机种子；旧规则只作历史。', 'current', '2026-10-12T03:00:00Z'],
];

export const graphEdges = edgeSpecs.map(([id, source, sourceRev, relation, target, targetRev, branch, rationale, currency = 'current', at = '2026-11-01T00:00:00Z']) => ({
  ...base(id, 1, at, at, ownerObserved(`act_link_${id.slice(4)}`, at, '建立或确认关系', 'unit-detail')),
  source_id: source,
  target_id: target,
  relation,
  branch_id: branch,
  rationale,
  state: 'active',
  source_revision: sourceRev,
  target_revision: targetRev,
  binding_semantics: relation === 'continues_to' ? 'identity_lineage' : 'exact_revision',
  currency,
}));

// ---------------------------------------------------------------- 主张
const claim = (id: string, revision: number, created: string, updated: string, fields: Record<string, unknown>, prov = ownerObserved(`act_claim_${id.slice(4)}`, updated, '记录或评估主张', 'evidence')) => ({
  ...base(id, revision, created, updated, prov),
  assessed_by_review_ids: [],
  supersedes_claim_id: null,
  ...fields,
});

export const claims = [
  claim('clm_overconf', 2, '2026-10-05T02:00:00Z', '2026-10-07T07:00:00Z', {
    text: '原方法直接使用的到达概率，在0.8以上区间高估了车辆实际按时到达的比例。',
    claim_kind: 'finding',
    assessment: 'supported',
    conditions: '验证划分（2026年8月城市A车辆轨迹，虚构）；预测模型 pred-v3；只针对0.8以上的概率区间。',
    evidence_ids: ['evd_reliability_a'],
    branch_ids: ['brn_a', 'brn_main'],
  }),
  claim('clm_failure_source', 2, '2026-10-06T02:00:00Z', '2026-10-09T07:00:00Z', {
    text: '基线中失败的分配，主要集中在“预测概率高但车辆没有按时到达”的情形，而不是预测位置误差最大的情形。',
    claim_kind: 'finding',
    assessment: 'supported',
    conditions: '基线 run_baseline 的612次失败分配；描述的是同时出现的规律，不是因果证明。',
    evidence_ids: ['evd_failure_analysis'],
    branch_ids: ['brn_net', 'brn_main'],
  }),
  claim('clm_calib_test', 2, '2026-10-23T02:00:00Z', '2026-11-01T08:00:00Z', {
    text: '温度缩放降低了测试划分上到达概率的期望校准误差（ECE）。',
    claim_kind: 'finding',
    assessment: 'supported',
    conditions: '测试划分；5个随机种子；预测模型 pred-v3；温度参数只在验证划分上拟合。不涉及任务完成率。',
    evidence_ids: ['evd_ece_test'],
    branch_ids: ['brn_main', 'brn_c'],
  }),
  claim('clm_calib_all_periods', 3, '2026-10-23T02:00:00Z', '2026-11-18T07:20:00Z', {
    text: '温度缩放在一天中的所有时段都改善了到达概率的可靠性。',
    claim_kind: 'hypothesis',
    assessment: 'mixed',
    conditions: '全天测试划分上改善成立（evd_ece_test）；晚高峰（17:00–19:00）子集校准后仍明显偏离（evd_peak），原因未查明。',
    evidence_ids: ['evd_ece_test', 'evd_peak'],
    branch_ids: ['brn_main', 'brn_c'],
  }),
  claim('clm_completion', 1, '2026-10-08T06:30:00Z', '2026-10-08T06:30:00Z', {
    text: '把校准后的概率交给同一分配器，可以在有限预算下提高任务完成率。',
    claim_kind: 'hypothesis',
    assessment: 'unassessed',
    conditions: '尚无相同条件下的对照结果。run_alloc_v1 因执行环境错误中止，不构成反证；run_alloc_v2 正在运行。',
    evidence_ids: [],
    branch_ids: ['brn_main'],
  }),
  claim(
    'clm_paper_s4',
    1,
    '2026-11-24T03:00:00Z',
    '2026-11-24T03:00:00Z',
    {
      text: '论文草稿第4.2节写道：“校准显著提高了任务完成率。”',
      claim_kind: 'paper_claim',
      assessment: 'unassessed',
      conditions: '来自论文草稿 v3（art_paper_draft_v3）第4.2节。目前没有任何对应证据；相关主张 clm_completion 仍未评估。',
      evidence_ids: [],
      branch_ids: ['brn_main'],
    },
    provenance(
      'observed',
      [loc.file('art_paper_draft_v3', 'paper/draft.tex', '2026-11-24T03:00:00Z', '论文草稿 v3 第4.2节第2段', { section: '4.2', content: '校准显著提高了任务完成率' })],
      actor.adapter(),
    ),
  ),
  claim('clm_weight_needed', 1, '2026-11-23T07:30:00Z', '2026-11-23T07:30:00Z', {
    text: '分配评分中的可靠性加权项对任务完成率有必要贡献。',
    claim_kind: 'hypothesis',
    assessment: 'unassessed',
    conditions: '待路线C在路线B对照条件下检验。',
    evidence_ids: [],
    branch_ids: ['brn_c'],
  }),
];

// ---------------------------------------------------------------- 证据
const runLoc = (runId: string, at: string, what: string, path: string, art: string | null, metric: string | null) => loc.experiment(runId, at, what, path, art, metric);
const evidence = (id: string, at: string, fields: Record<string, unknown>, sourceLocator: ReturnType<typeof runLoc> | ReturnType<typeof loc.file>) => ({
  ...base(id, 1, at, at, provenance('observed', [sourceLocator], actor.owner(OWNER_GRANT))),
  ...fields,
  source_locator: sourceLocator,
});

export const evidenceList = [
  evidence(
    'evd_lit_calib',
    '2026-09-18T03:00:00Z',
    {
      title: '［虚构文献］车联网到达概率校准方法综述（2024），第5.2节',
      evidence_kind: 'paper',
      statement: '综述比较了温度缩放与保序回归：温度缩放只有一个参数、不改变概率的排序，校准样本较少时更稳定；保序回归更灵活，但需要更多校准样本。',
      artifact_version_ids: ['art_lit_survey'],
      experiment_run_id: null,
      scope: '方法选择依据，描述的是文献中的结果，不是本项目的实验结果。',
      limitations: '综述中的实验来自出租车数据，车辆行驶模式与本项目的社会车辆不同。',
      availability: 'available',
      verification_status: 'source_checked',
    },
    loc.file('art_lit_survey', 'library/calibration-survey-2024.pdf', '2026-09-18T03:00:00Z', '综述第7页，第5.2节“校准方法比较”第1–2段', { page: 7, section: '5.2' }),
  ),
  evidence(
    'evd_baseline_completion',
    '2026-10-13T09:00:00Z',
    {
      title: '原方法基线任务完成率（5个随机种子）',
      evidence_kind: 'experiment_result',
      statement: '原方法（直接使用预测概率）在预算100、时限30分钟下的任务完成率为0.71（5个随机种子均值，最小0.69，最大0.73）。',
      artifact_version_ids: ['art_baseline_results', 'art_eval_config_v2'],
      experiment_run_id: 'run_baseline',
      scope: '测试划分；预算100；时限30分钟；随机种子11–15。',
      limitations: '只测了预算100一档。早先单一种子得到的0.74（run_baseline_1s）与本结果不可直接比较。',
      availability: 'available',
      verification_status: 'reproduced',
    },
    runLoc('run_baseline', '2026-10-13T09:00:00Z', '基线运行的汇总指标', 'results/baseline_5seeds.json#/summary/task_completion_rate', 'art_baseline_results', 'task_completion_rate'),
  ),
  evidence(
    'evd_reliability_a',
    '2026-10-06T08:00:00Z',
    {
      title: '验证划分上原始到达概率的可靠性曲线',
      evidence_kind: 'experiment_result',
      statement: '验证划分中，预测概率在0.8–0.9之间的1,840次“车辆—任务”配对，实际按时到达的比例为0.62；0.5以下区间预测与实际基本一致。',
      artifact_version_ids: ['art_a_reliability'],
      experiment_run_id: 'run_a_diag',
      scope: '验证划分；预测模型 pred-v3；约2.1万次配对，按概率分为10组。',
      limitations: '没有查明偏高的原因；只诊断概率，没有检验修正后的任务完成率。',
      availability: 'available',
      verification_status: 'source_checked',
    },
    runLoc('run_a_diag', '2026-10-06T08:00:00Z', '0.8–0.9区间的分组统计', 'results/reliability_val.json#/bins/8', 'art_a_reliability', 'observed_arrival_rate'),
  ),
  evidence(
    'evd_failure_analysis',
    '2026-10-08T03:00:00Z',
    {
      title: '基线失败分配的分解统计',
      evidence_kind: 'derivation',
      statement: '基线5个种子合计612次失败分配中，71%发生在预测概率不低于0.8、车辆却没有按时到达的情形；预测位置误差位于最高四分之一的分配只占失败的18%。',
      artifact_version_ids: ['art_failure_analysis', 'art_baseline_results'],
      experiment_run_id: 'run_baseline',
      scope: '基线 run_baseline 的全部失败分配。',
      limitations: '统计的是同时出现的规律，不能单独证明“过度相信概率”就是失败原因。',
      availability: 'available',
      verification_status: 'source_checked',
    },
    loc.file('art_failure_analysis', 'results/failure_breakdown.json', '2026-10-08T03:00:00Z', '失败分解表 #/by_probability_and_error', { section: 'by_probability_and_error' }),
  ),
  evidence(
    'evd_ece_test',
    '2026-10-30T10:00:00Z',
    {
      title: '测试划分上校准前后的期望校准误差（ECE）',
      evidence_kind: 'experiment_result',
      statement: '测试划分上，温度缩放把ECE从0.142降到0.058（5个随机种子均值；拟合出的温度参数T约为1.84）。',
      artifact_version_ids: ['art_calib_results', 'art_calib_code'],
      experiment_run_id: 'run_calib',
      scope: '测试划分全天数据；5个随机种子；预测模型 pred-v3。',
      limitations: '这是预测层指标，不能说明任务完成率是否提高。',
      availability: 'available',
      verification_status: 'source_checked',
    },
    runLoc('run_calib', '2026-10-30T10:00:00Z', '校准前后ECE汇总', 'results/ece.json#/summary', 'art_calib_results', 'ece'),
  ),
  evidence(
    'evd_peak',
    '2026-11-18T07:10:00Z',
    {
      title: '晚高峰时段校准后的ECE',
      evidence_kind: 'experiment_result',
      statement: '晚高峰（17:00–19:00）子集上，校准后ECE为0.113，明显高于全天测试划分的0.058。',
      artifact_version_ids: ['art_peak_results'],
      experiment_run_id: 'run_calib_peak',
      scope: '测试划分中17:00–19:00的配对，约占样本9%（n=2,310）；5个随机种子。',
      limitations: '子集样本较少；偏离原因（例如晚高峰拥堵模式与训练时段不同）尚未检验。',
      availability: 'available',
      verification_status: 'source_checked',
    },
    runLoc('run_calib_peak', '2026-11-18T07:10:00Z', '按时段ECE中的晚高峰一行', 'results/ece_by_period.json#/periods/evening_peak', 'art_peak_results', 'ece'),
  ),
];

export const C_OPTIONS = [
      { id: 'opt_c_now', label: '现在并行开展', description: '新建独立代码工作区，与路线B的对照实验同时运行。', expected_benefit: '大约提前两天知道可靠性加权项是否必要。', cost_and_risk: '额外约6小时计算，与正在运行的 run_alloc_v2 争用同一GPU；需要新的工作区避免两条实验修改同一份评分代码。', evidence_ids: ['evd_ece_test'] },
      { id: 'opt_c_after', label: '等路线B对照实验完成后再开展', description: '复用路线B对照实验的配置，再增加简化评分组。', expected_benefit: '不争用计算资源；可以直接复用已核对的对照配置。', cost_and_risk: '推迟约两天。', evidence_ids: ['evd_ece_test'] },
      { id: 'opt_c_drop', label: '不开展路线C', description: '保留完整评分，不检验其必要性。', expected_benefit: '节省计算与审阅时间。', cost_and_risk: '无法回答“可靠性加权项是否值得它的复杂度”，与约束 cst_complexity 的要求不一致。', evidence_ids: [] },
    ];

// ---------------------------------------------------------------- 决策
const decisionBase = (id: string, revision: number, created: string, updated: string, actionId: string) => base(id, revision, created, updated, ownerObserved(actionId, updated, '在决策卡上作出选择', 'decision-card'));
const accepted = (grantRevision: number, at: string, actionId: string) => ({
  authorized_by_grant_id: OWNER_GRANT,
  acceptance_source: ua(actionId, at, '在决策卡上选择方案'),
  authorization_grant_revision: grantRevision,
  accepted_at: at,
});

export const decisions = [
  {
    ...decisionBase('dec_eval_v1', 2, '2026-09-26T02:00:00Z', '2026-10-12T03:00:00Z', 'act_dec_eval_v1'),
    question: '基线阶段的任务完成率用几个随机种子报告？',
    options: [
      { id: 'opt_seed_one', label: '单一随机种子（seed=11）', description: '只运行一次，先得到数量级。', expected_benefit: '最快得到初步结果。', cost_and_risk: '结果可能偶然偏高或偏低，不适合比较路线。', evidence_ids: [] },
      { id: 'opt_seed_five', label: '5个随机种子', description: '重复5次并报告范围。', expected_benefit: '能看出波动范围。', cost_and_risk: '计算时间约为5倍。', evidence_ids: [] },
    ],
    status: 'superseded',
    accepted_option_id: 'opt_seed_one',
    rationale: '项目初期只需要数量级，先用单一种子。',
    evidence_ids: [],
    branch_ids: ['brn_main'],
    ...accepted(1, '2026-09-26T02:00:00Z', 'act_dec_eval_v1'),
    superseded_by_decision_id: 'dec_eval_v2',
    reconsider_when: '开始比较不同路线时。',
  },
  {
    ...decisionBase('dec_eval_v2', 1, '2026-10-12T03:00:00Z', '2026-10-12T03:00:00Z', 'act_dec_eval_v2'),
    question: '比较不同路线时，任务完成率用几个随机种子报告？',
    options: [
      { id: 'opt_five', label: '5个随机种子，报告均值、最小值和最大值', description: '每条路线用同一组种子11–15。', expected_benefit: '能看出结果是否只是偶然；计算量可接受。', cost_and_risk: '若路线差距小于种子间波动，仍难以区分。', evidence_ids: [] },
      { id: 'opt_ten', label: '10个随机种子', description: '每条路线用种子11–20。', expected_benefit: '波动估计更稳定。', cost_and_risk: '计算时间翻倍，目前没有必要。', evidence_ids: [] },
    ],
    status: 'accepted',
    accepted_option_id: 'opt_five',
    rationale: '单一种子得到的0.74可能偶然偏高；路线比较需要看到波动范围。10个种子的额外成本暂不需要。',
    evidence_ids: [],
    branch_ids: ['brn_main', 'brn_a', 'brn_c'],
    ...accepted(1, '2026-10-12T03:00:00Z', 'act_dec_eval_v2'),
    superseded_by_decision_id: null,
    reconsider_when: '若不同路线的差距小于种子之间的波动范围。',
  },
  {
    ...decisionBase('dec_route_b', 1, '2026-10-08T06:30:00Z', '2026-10-08T06:30:00Z', 'act_dec_route_b'),
    question: '主线继续直接使用预测概率（路线A），还是先校准概率再分配（路线B）？',
    options: [
      { id: 'opt_a_continue', label: '继续路线A：改进分配算法', description: '概率保持原样，在分配算法上为不确定性留余量。', expected_benefit: '不需要额外的校准步骤。', cost_and_risk: '如果概率本身偏高，分配算法的改进可能只是在补偿错误输入。', evidence_ids: ['evd_reliability_a'] },
      { id: 'opt_b', label: '路线B：先校准概率，分配算法保持不变', description: '在预测与分配之间加入概率校准。', expected_benefit: '可以单独检验“概率是否可靠”对任务完成率的作用。', cost_and_risk: '如果偏差在不同时段方向不同，单一参数的校准可能修正不了。', evidence_ids: ['evd_reliability_a', 'evd_failure_analysis'] },
      { id: 'opt_net', label: '增加更复杂的预测网络', description: '提高位置预测精度。', expected_benefit: '可能同时降低误差和偏差。', cost_and_risk: '实现与解释成本高；失败分解显示位置误差不是失败的主要来源。', evidence_ids: ['evd_failure_analysis'] },
    ],
    status: 'accepted',
    accepted_option_id: 'opt_b',
    rationale: '路线A诊断显示高概率区间存在系统性高估（evd_reliability_a），且失败主要发生在概率高却没到达的情形（evd_failure_analysis）。路线B不改动分配器，可以单独检验概率可靠性的作用。',
    evidence_ids: ['evd_reliability_a', 'evd_failure_analysis'],
    branch_ids: ['brn_main', 'brn_a'],
    ...accepted(1, '2026-10-08T06:30:00Z', 'act_dec_route_b'),
    superseded_by_decision_id: null,
    reconsider_when: '若任务分配对照实验显示校准后完成率没有提高，或晚高峰偏离被证实影响分配结果。',
  },
  {
    ...decisionBase('dec_no_network', 1, '2026-10-09T08:00:00Z', '2026-10-09T08:00:00Z', 'act_dec_no_network'),
    question: '现在是否开展更复杂的轨迹预测网络？',
    options: [
      { id: 'opt_net_now', label: '现在开展', description: '训练时空图网络等更复杂的预测模型。', expected_benefit: '可能提高位置预测精度。', cost_and_risk: '预计两到三周；失败主要不来自位置误差，收益不确定。', evidence_ids: ['evd_failure_analysis'] },
      { id: 'opt_net_later', label: '暂不开展，记录恢复条件', description: '关闭备选路线，保留可复用发现。', expected_benefit: '把精力集中在针对失败主要原因的路线B。', cost_and_risk: '如果之后发现预测精度确实是瓶颈，需要重新启动。', evidence_ids: ['evd_failure_analysis'] },
    ],
    status: 'accepted',
    accepted_option_id: 'opt_net_later',
    rationale: '失败分解显示位置误差最大的四分之一只占失败的18%；按约束 cst_complexity，增加网络前需要说明它对任务完成率的贡献，目前没有依据。',
    evidence_ids: ['evd_failure_analysis'],
    branch_ids: ['brn_net', 'brn_main'],
    ...accepted(1, '2026-10-09T08:00:00Z', 'act_dec_no_network'),
    superseded_by_decision_id: null,
    reconsider_when: '任务分配对照实验显示校准后的概率仍是任务失败的主要瓶颈。',
  },
  {
    ...decisionBase('dec_calib_method', 1, '2026-10-21T03:00:00Z', '2026-10-21T03:00:00Z', 'act_dec_calib_method'),
    question: '到达概率的校准方法用温度缩放还是保序回归？',
    options: [
      { id: 'opt_temp', label: '温度缩放', description: '把预测模型的原始分数统一除以温度T，只学习一个参数。', expected_benefit: '不改变车辆之间的概率排序；样本较少时稳定；容易解释。', cost_and_risk: '只能整体缩放，若不同时段偏差方向不同则修正不了。', evidence_ids: ['evd_lit_calib'] },
      { id: 'opt_iso', label: '保序回归', description: '学习一条只升不降的映射曲线。', expected_benefit: '能修正更复杂的偏差形状。', cost_and_risk: '需要更多校准样本；映射曲线较难解释。', evidence_ids: ['evd_lit_calib'] },
    ],
    status: 'accepted',
    accepted_option_id: 'opt_temp',
    rationale: '路线B要求不改变分配器看到的车辆排序，温度缩放满足这一点；验证划分样本有限，单参数方法更稳定（evd_lit_calib）。',
    evidence_ids: ['evd_lit_calib'],
    branch_ids: ['brn_main'],
    ...accepted(1, '2026-10-21T03:00:00Z', 'act_dec_calib_method'),
    superseded_by_decision_id: null,
    reconsider_when: '若需要按时段分别校准（例如晚高峰偏离被证实影响分配结果）。',
  },
  {
    ...base(
      'dec_start_c',
      1,
      '2026-11-23T07:50:00Z',
      '2026-11-23T07:50:00Z',
      provenance('observed', [ua('act_open_dec_c', '2026-11-23T07:50:00Z', '采用候选 pro_c_open，建立待决定事项')], actor.owner(OWNER_GRANT)),
    ),
    question: '是否现在开展路线C（简化分配评分检验）？',
    options: C_OPTIONS,
    status: 'proposed',
    accepted_option_id: null,
    rationale: '模型整理了三个选项并建议并行开展（候选 pro_c_timing）；研究负责人尚未选择。',
    evidence_ids: ['evd_ece_test'],
    branch_ids: ['brn_c', 'brn_main'],
    authorized_by_grant_id: null,
    acceptance_source: null,
    superseded_by_decision_id: null,
    reconsider_when: '路线B对照实验出现结果时。',
    authorization_grant_revision: null,
    accepted_at: null,
  },
];

// ---------------------------------------------------------------- 成果版本
type ArtSpec = [id: string, logical: string, title: string, media: string, label: string, path: string, produced: string | null, previous: string | null, at: string, kind?: 'local' | 'external', availability?: 'available' | 'external_unchecked' | 'missing'];
const artSpecs: ArtSpec[] = [
  ['art_problem_doc_v1', 'lga_problem_doc', '问题定义文档', 'text/markdown', '第1版', 'docs/problem.md', 'unt_problem', null, '2026-09-05T03:00:00Z'],
  ['art_problem_doc_v2', 'lga_problem_doc', '问题定义文档', 'text/markdown', '第2版', 'docs/problem.md', 'unt_problem', 'art_problem_doc_v1', '2026-09-09T06:00:00Z'],
  ['art_lit_survey', 'lga_lit_survey', '［虚构文献］车联网到达概率校准方法综述（2024）', 'application/pdf', '出版版', 'library/calibration-survey-2024.pdf', null, null, '2026-09-12T02:00:00Z'],
  ['art_dataset_manifest', 'lga_dataset', '车辆轨迹数据清单（2026年8月，城市A，虚构）', 'application/json', '2026-08', 'data/manifest-2026-08.json', null, null, '2026-09-25T02:00:00Z'],
  ['art_raw_trajectories', 'lga_raw_traj', '原始车辆轨迹（远端存储）', 'application/vnd.apache.parquet', '2026-08 全量', 'lab-storage://mcs/trajectories-2026-08/', null, null, '2026-09-25T02:00:00Z', 'external', 'external_unchecked'],
  ['art_eval_config_v1', 'lga_eval_config', '评价配置', 'application/yaml', '第1版（单一种子）', 'configs/eval.yaml', 'unt_baseline', null, '2026-09-26T03:00:00Z'],
  ['art_eval_config_v2', 'lga_eval_config', '评价配置', 'application/yaml', '第2版（5个种子）', 'configs/eval.yaml', 'unt_baseline', 'art_eval_config_v1', '2026-10-12T04:00:00Z'],
  ['art_env_lock', 'lga_env_lock', '运行环境锁文件', 'text/plain', '2026-10-01', 'requirements.lock', null, null, '2026-10-01T02:00:00Z'],
  ['art_baseline_results', 'lga_baseline_results', '基线结果（5个种子）', 'application/json', 'run_baseline', 'results/baseline_5seeds.json', 'unt_baseline', null, '2026-10-13T09:00:00Z'],
  ['art_a_reliability', 'lga_a_reliability', '验证划分可靠性分组统计', 'application/json', 'run_a_diag', 'results/reliability_val.json', 'unt_a_diag', null, '2026-10-06T08:00:00Z'],
  ['art_failure_analysis', 'lga_failure_analysis', '基线失败分解表', 'application/json', '2026-10-08', 'results/failure_breakdown.json', 'unt_net_eval', null, '2026-10-08T03:00:00Z'],
  ['art_calib_code', 'lga_calib_code', '校准实现 src/calibration.py', 'text/x-python', `提交 ${fakeCommit('calib').slice(0, 7)}`, 'src/calibration.py', 'unt_calib_design', null, '2026-10-20T09:00:00Z'],
  ['art_calib_results', 'lga_calib_results', '测试划分ECE结果', 'application/json', 'run_calib', 'results/ece.json', 'unt_calib_exp', null, '2026-10-30T10:00:00Z'],
  ['art_peak_results', 'lga_peak_results', '按时段ECE结果', 'application/json', 'run_calib_peak', 'results/ece_by_period.json', 'unt_calib_exp', null, '2026-11-18T06:40:00Z'],
  ['art_alloc_config', 'lga_alloc_config', '对照实验配置', 'application/yaml', '第1版', 'configs/alloc_compare.yaml', 'unt_alloc_exp', null, '2026-11-21T01:20:00Z'],
  ['art_alloc_v1_log', 'lga_alloc_v1_log', '第一次对照运行日志（中止）', 'text/plain', 'run_alloc_v1', 'logs/run_alloc_v1.log', 'unt_alloc_exp', null, '2026-11-21T01:34:00Z'],
  ['art_paper_draft_v3', 'lga_paper_draft', '论文草稿', 'application/x-tex', '第3版', 'paper/draft.tex', null, null, '2026-11-24T03:00:00Z'],
];

export const artifactVersions = artSpecs.map(([id, logical, title, media, label, path, produced, previous, at, kind = 'local', availability = 'available']) => ({
  ...base(id, 1, at, at, provenance('observed', [loc.file(id, path, at, `登记时读取的文件 ${path}`)], actor.owner(OWNER_GRANT))),
  logical_artifact_id: logical,
  title,
  media_type: media,
  version_label: label,
  storage_ref: { kind, location: path },
  sha256: availability === 'available' ? sha(`${id}:${path}:${label}`) : null,
  byte_size: availability === 'available' ? 1024 + (sha(id).charCodeAt(0) % 97) * 431 : null,
  availability,
  previous_version_id: previous,
  produced_by_unit_id: produced,
  version_pinning: availability === 'available' ? 'content_verified' : 'metadata_only',
}));

// ---------------------------------------------------------------- 实验运行
const run = (id: string, fields: Record<string, unknown>, at: string, recordPath: string, art: string | null) => ({
  ...base(id, (fields.revision as number) ?? 1, at, (fields.last_observed_at as string) ?? at, provenance('observed', [loc.providerEvent((fields.session as string) ?? SESSION_CALIB, `evt-${id}`, at, '适配器采集的运行事件')], actor.adapter())),
  source_locator: loc.experiment(id, at, '运行记录', recordPath, art, null),
  external_job_id: null,
  ...Object.fromEntries(Object.entries(fields).filter(([k]) => k !== 'session' && k !== 'revision')),
});

const seeds5 = [11, 12, 13, 14, 15];
export const experimentRuns = [
  run('run_baseline_1s', {
    unit_id: 'unt_baseline', branch_id: 'brn_main', run_state: 'succeeded',
    command_display: 'python run_allocation.py --config configs/eval.yaml --method direct',
    code_commit: fakeCommit('baseline-1s'), config_artifact_version_id: 'art_eval_config_v1', dataset_artifact_version_ids: ['art_dataset_manifest'], environment_artifact_version_id: 'art_env_lock',
    random_seeds: [11], comparison_group_id: 'cmp_legacy_1seed', started_at: '2026-10-02T03:00:00Z', ended_at: '2026-10-02T03:41:00Z', last_observed_at: '2026-10-02T03:41:00Z', exit_code: 0,
    metrics: [{ name: 'task_completion_rate', value: 0.74, unit: 'ratio', split: 'test', aggregation: '单一种子（seed=11）', sample_count: 2000, direction: 'higher_better' }],
    output_artifact_version_ids: [], capture_completeness: 'complete', missing_fields: [], session: SESSION_IMPORT,
  }, '2026-10-02T03:00:00Z', 'results/baseline_seed11.json', null),
  run('run_baseline', {
    unit_id: 'unt_baseline', branch_id: 'brn_main', run_state: 'succeeded',
    command_display: 'python run_allocation.py --config configs/eval.yaml --method direct --seeds 11-15',
    code_commit: fakeCommit('baseline'), config_artifact_version_id: 'art_eval_config_v2', dataset_artifact_version_ids: ['art_dataset_manifest'], environment_artifact_version_id: 'art_env_lock',
    random_seeds: seeds5, comparison_group_id: 'cmp_budget100', started_at: '2026-10-13T05:00:00Z', ended_at: '2026-10-13T08:52:00Z', last_observed_at: '2026-10-13T08:52:00Z', exit_code: 0,
    metrics: [
      { name: 'task_completion_rate', value: 0.71, unit: 'ratio', split: 'test', aggregation: '5个种子均值（最小0.69，最大0.73）', sample_count: 10000, direction: 'higher_better' },
      { name: 'failed_assignments', value: 612, unit: '次', split: 'test', aggregation: '5个种子合计', sample_count: 10000, direction: 'lower_better' },
    ],
    output_artifact_version_ids: ['art_baseline_results'], capture_completeness: 'complete', missing_fields: [], session: SESSION_IMPORT,
  }, '2026-10-13T05:00:00Z', 'results/baseline_5seeds.json', 'art_baseline_results'),
  run('run_a_diag', {
    unit_id: 'unt_a_diag', branch_id: 'brn_a', run_state: 'succeeded',
    command_display: 'python diagnose_reliability.py --split val --bins 10',
    code_commit: fakeCommit('a-diag'), config_artifact_version_id: 'art_eval_config_v1', dataset_artifact_version_ids: ['art_dataset_manifest'], environment_artifact_version_id: 'art_env_lock',
    random_seeds: [], comparison_group_id: null, started_at: '2026-10-06T06:00:00Z', ended_at: '2026-10-06T06:12:00Z', last_observed_at: '2026-10-06T06:12:00Z', exit_code: 0,
    metrics: [
      { name: 'observed_arrival_rate_0.8_0.9', value: 0.62, unit: 'ratio', split: 'validation', aggregation: '预测概率0.8–0.9区间', sample_count: 1840, direction: 'descriptive' },
      { name: 'ece', value: 0.151, unit: 'ratio', split: 'validation', aggregation: '10组加权', sample_count: 21000, direction: 'lower_better' },
    ],
    output_artifact_version_ids: ['art_a_reliability'], capture_completeness: 'complete', missing_fields: [], session: SESSION_IMPORT,
  }, '2026-10-06T06:00:00Z', 'results/reliability_val.json', 'art_a_reliability'),
  run('run_calib', {
    unit_id: 'unt_calib_exp', branch_id: 'brn_main', run_state: 'succeeded',
    command_display: 'python scripts/eval_calibration.py --split test --seeds 11-15',
    code_commit: fakeCommit('calib'), config_artifact_version_id: 'art_eval_config_v2', dataset_artifact_version_ids: ['art_dataset_manifest'], environment_artifact_version_id: 'art_env_lock',
    random_seeds: seeds5, comparison_group_id: 'cmp_ece_test', started_at: '2026-10-30T08:00:00Z', ended_at: '2026-10-30T09:46:00Z', last_observed_at: '2026-10-30T09:46:00Z', exit_code: 0,
    metrics: [
      { name: 'ece_before', value: 0.142, unit: 'ratio', split: 'test', aggregation: '5个种子均值', sample_count: 25600, direction: 'lower_better' },
      { name: 'ece_after', value: 0.058, unit: 'ratio', split: 'test', aggregation: '5个种子均值', sample_count: 25600, direction: 'lower_better' },
      { name: 'temperature', value: 1.84, unit: '无量纲', split: 'validation', aggregation: '5个种子均值', sample_count: null, direction: 'descriptive' },
    ],
    output_artifact_version_ids: ['art_calib_results'], capture_completeness: 'complete', missing_fields: [], session: SESSION_CALIB,
  }, '2026-10-30T08:00:00Z', 'results/ece.json', 'art_calib_results'),
  run('run_calib_peak', {
    unit_id: 'unt_calib_exp', branch_id: 'brn_main', run_state: 'succeeded',
    command_display: 'python scripts/eval_calibration.py --split test --by-period --seeds 11-15',
    code_commit: fakeCommit('calib-peak'), config_artifact_version_id: 'art_eval_config_v2', dataset_artifact_version_ids: ['art_dataset_manifest'], environment_artifact_version_id: 'art_env_lock',
    random_seeds: seeds5, comparison_group_id: 'cmp_ece_period', started_at: '2026-11-18T06:00:00Z', ended_at: '2026-11-18T06:38:00Z', last_observed_at: '2026-11-18T06:38:00Z', exit_code: 0,
    metrics: [{ name: 'ece_after_evening_peak', value: 0.113, unit: 'ratio', split: 'test（17:00–19:00）', aggregation: '5个种子均值', sample_count: 2310, direction: 'lower_better' }],
    output_artifact_version_ids: ['art_peak_results'], capture_completeness: 'complete', missing_fields: [], session: SESSION_CALIB,
  }, '2026-11-18T06:00:00Z', 'results/ece_by_period.json', 'art_peak_results'),
  run('run_alloc_v1', {
    unit_id: 'unt_alloc_exp', branch_id: 'brn_main', run_state: 'failed',
    command_display: 'python run_allocation.py --config configs/alloc_compare.yaml',
    code_commit: fakeCommit('alloc-v1'), config_artifact_version_id: 'art_alloc_config', dataset_artifact_version_ids: ['art_dataset_manifest'], environment_artifact_version_id: 'art_env_lock',
    random_seeds: seeds5, comparison_group_id: 'cmp_alloc', started_at: '2026-11-21T01:30:00Z', ended_at: '2026-11-21T01:34:00Z', last_observed_at: '2026-11-21T01:34:00Z', exit_code: 2,
    metrics: [], output_artifact_version_ids: ['art_alloc_v1_log'], capture_completeness: 'complete', missing_fields: [], session: SESSION_ALLOC,
  }, '2026-11-21T01:30:00Z', 'logs/run_alloc_v1.log', 'art_alloc_v1_log'),
  run('run_alloc_v2', {
    revision: 3,
    unit_id: 'unt_alloc_exp', branch_id: 'brn_main', run_state: 'running',
    command_display: 'python run_allocation.py --config configs/alloc_compare.yaml',
    code_commit: fakeCommit('alloc-v2'), config_artifact_version_id: 'art_alloc_config', dataset_artifact_version_ids: ['art_dataset_manifest'], environment_artifact_version_id: 'art_env_lock',
    random_seeds: seeds5, comparison_group_id: 'cmp_alloc', started_at: '2026-11-25T02:10:00Z', ended_at: null, last_observed_at: '2026-11-25T03:52:00Z', exit_code: null,
    metrics: [], output_artifact_version_ids: [], capture_completeness: 'partial', missing_fields: ['ended_at', 'exit_code', 'metrics', 'output_artifact_version_ids'], session: SESSION_ALLOC,
  }, '2026-11-25T02:10:00Z', 'logs/run_alloc_v2.log', null),
];

// ---------------------------------------------------------------- 快照
export const checkpoints = [
  {
    ...base('ckp_calib', 1, '2026-11-02T06:00:00Z', '2026-11-02T06:00:00Z', ownerObserved('act_ckp_calib', '2026-11-02T06:00:00Z', '建立快照', 'checkpoint')),
    title: '校准实验第一次结束后的快照',
    branch_id: 'brn_main',
    unit_id: 'unt_calib_exp',
    project_revision: 10,
    branch_context_revision: 4,
    entity_revision_refs: [
      { entity_id: 'unt_calib_exp', revision: 2 },
      { entity_id: 'clm_calib_test', revision: 2 },
      { entity_id: 'clm_calib_all_periods', revision: 2 },
      { entity_id: 'clm_completion', revision: 1 },
      { entity_id: 'dec_route_b', revision: 1 },
      { entity_id: 'dec_calib_method', revision: 1 },
      { entity_id: 'dec_eval_v2', revision: 1 },
      { entity_id: 'evd_ece_test', revision: 1 },
    ],
    effective_decision_ids: ['dec_route_b', 'dec_no_network', 'dec_calib_method', 'dec_eval_v2'],
    known_claim_ids: ['clm_overconf', 'clm_failure_source', 'clm_calib_test', 'clm_calib_all_periods', 'clm_completion'],
    file_manifest: [
      { artifact_version_id: 'art_calib_code', relative_path: 'src/calibration.py', sha256: sha('art_calib_code:src/calibration.py:' + `提交 ${fakeCommit('calib').slice(0, 7)}`), restore_role: 'source', availability: 'available' },
      { artifact_version_id: 'art_eval_config_v2', relative_path: 'configs/eval.yaml', sha256: sha('art_eval_config_v2:configs/eval.yaml:第2版（5个种子）'), restore_role: 'config', availability: 'available' },
      { artifact_version_id: 'art_env_lock', relative_path: 'requirements.lock', sha256: sha('art_env_lock:requirements.lock:2026-10-01'), restore_role: 'environment', availability: 'available' },
      { artifact_version_id: 'art_dataset_manifest', relative_path: 'data/manifest-2026-08.json', sha256: sha('art_dataset_manifest:data/manifest-2026-08.json:2026-08'), restore_role: 'data', availability: 'available' },
      { artifact_version_id: 'art_raw_trajectories', relative_path: 'lab-storage://mcs/trajectories-2026-08/', sha256: null, restore_role: 'data', availability: 'external_unchecked' },
      { artifact_version_id: 'art_calib_results', relative_path: 'results/ece.json', sha256: sha('art_calib_results:results/ece.json:run_calib'), restore_role: 'output', availability: 'available' },
    ],
    git_snapshot: { repository_alias: 'mcs-allocation', commit_sha: fakeCommit('calib'), dirty_patch_artifact_version_id: null, untracked_artifact_version_ids: [] },
    restore_readiness: 'partial',
    limitations: ['原始车辆轨迹存放在远端存储，快照只记录了清单，没有复制实体文件；可以恢复认知状态、代码与配置，但不能直接复现当时的实验。'],
  },
];

// ---------------------------------------------------------------- 候选变更
const msg = (session: string, id: string, role: 'user' | 'assistant', at: string, what: string, text: string) => loc.message(session, id, role, at, what, text);

export const MSG_ADD_NETWORK = '对照实验之外，我建议加入时空图神经网络来提升到达预测精度，预计能显著改善任务完成率。';
export const MSG_C_TIMING = '路线C可以现在就并行开始，这样两天后就能同时得到两条路线的结论。';
export const MSG_GRANT = '这个对照实验里的下一步说明和产物登记你直接更新就行，不用每次问我。';
export const MSG_ALLOC_METRICS = '建议在对照实验里同时统计失败分配次数，便于解释完成率的变化。';

export const proposals = [
  {
    ...base('pro_add_network', 1, '2026-11-24T07:20:00Z', '2026-11-24T07:20:00Z', provenance('inferred', [msg(SESSION_ALLOC, 'msg-0388', 'assistant', '2026-11-24T07:19:00Z', '会话中的模型建议', MSG_ADD_NETWORK)], actor.codex())),
    title: '建议：增加时空图神经网络以提高到达预测精度',
    summary: '模型建议在主线上新建研究单元，实现时空图预测网络。该建议尚未获准。',
    status: 'candidate',
    base_project_revision: 18,
    target_revision_refs: [{ entity_id: 'brn_main', revision: 6 }, { entity_id: 'dec_no_network', revision: 1 }],
    commands: [
      {
        kind: 'create_research_unit',
        branch_id: 'brn_main',
        title: '实现时空图预测网络',
        question: '加入时空图网络后，车辆到达预测的误差能降低多少？',
        purpose: '提高到达预测精度，期望进而提高任务完成率。',
        parent_unit_ids: ['unt_alloc_exp'],
        acceptance_criteria: [],
      },
    ],
    evidence_ids: [],
    expected_impact: '会把主线重心从对照实验转向预测模型开发。',
    risk_and_uncertainty: '模型自述“预计能显著改善任务完成率”，但没有给出证据；实现约需两到三周。',
    requested_grant_actions: ['unit.create'],
    created_by: actor.codex(),
    applied_by_event_id: null,
  },
  {
    ...base('pro_c_timing', 1, '2026-11-23T08:10:00Z', '2026-11-23T08:10:00Z', provenance('inferred', [msg(SESSION_ALLOC, 'msg-0351', 'assistant', '2026-11-23T08:09:00Z', '会话中的模型建议', MSG_C_TIMING)], actor.codex())),
    title: '建议：现在并行开展路线C',
    summary: '模型建议对待决定事项 dec_start_c 选择“现在并行开展”。这是建议，不是决定。',
    status: 'candidate',
    base_project_revision: 18,
    target_revision_refs: [{ entity_id: 'dec_start_c', revision: 1 }, { entity_id: 'brn_c', revision: 1 }],
    commands: [{ kind: 'decide_decision', decision_id: 'dec_start_c', status: 'accepted', accepted_option_id: 'opt_c_now', reason: '模型建议：并行开展可以更早得到结论。' }],
    evidence_ids: ['evd_ece_test'],
    expected_impact: '路线C与路线B的对照实验同时运行。',
    risk_and_uncertainty: '与 run_alloc_v2 争用同一GPU；两条实验若共用工作目录会互相修改评分代码。',
    requested_grant_actions: ['decision.accept'],
    created_by: actor.codex(),
    applied_by_event_id: null,
  },
  {
    ...base('pro_alloc_metrics', 2, '2026-11-21T01:50:00Z', '2026-11-21T02:00:00Z', provenance('inferred', [msg(SESSION_ALLOC, 'msg-0302', 'assistant', '2026-11-21T01:49:00Z', '会话中的模型建议', MSG_ALLOC_METRICS)], actor.codex())),
    title: '更新对照实验的下一步：加入失败分配次数统计',
    summary: '在比较任务完成率之外，统计每组的失败分配次数。属于已授权范围内的常规更新。',
    status: 'applied',
    base_project_revision: 15,
    target_revision_refs: [{ entity_id: 'unt_alloc_exp', revision: 1 }],
    commands: [
      {
        kind: 'revise_research_unit',
        unit_id: 'unt_alloc_exp',
        title: '对照实验：校准是否提高任务完成率',
        question: '在相同数据划分、预算、时限和随机种子下，把校准后的概率交给同一分配器，任务完成率是否高于直接使用原始概率？',
        purpose: '检验路线B的核心假设：概率更可靠能带来更多按时完成的任务。',
        acceptance_criteria: [
          { id: 'acc_alloc_ctrl', description: '完成预算50、100、200三档、各5个随机种子的对照实验，并保存可复核的配置与结果。', required_evidence_kind: 'experiment', mandatory: true },
          { id: 'acc_alloc_review', description: '研究负责人审阅结果解释，确认结论措辞与证据范围一致。', required_evidence_kind: 'human_review', mandatory: true },
        ],
        next_action:
          '等待 run_alloc_v2 完成后，按预算50、100、200三档比较两组的任务完成率；同时统计每组的失败分配次数（分配给车辆但车辆没有按时到达），晚高峰时段单独报告。',
        reason: '在用户授权 grt_routine 的范围内更新下一步说明。',
      },
    ],
    evidence_ids: [],
    expected_impact: '对照实验结果更容易解释；不改变研究问题、主张或决定。',
    risk_and_uncertainty: '无科学判断变化。',
    requested_grant_actions: ['unit.revise'],
    created_by: actor.codex(),
    applied_by_event_id: 'evt_1019',
  },
  {
    ...base('pro_c_open', 2, '2026-11-23T07:40:00Z', '2026-11-23T07:50:00Z', provenance('inferred', [msg(SESSION_ALLOC, 'msg-0348', 'assistant', '2026-11-23T07:39:00Z', '会话中的模型整理', '路线C的开展时机有三个选项：现在并行、等B完成、不开展。')], actor.codex())),
    title: '建立待决定事项：路线C的开展时机',
    summary: '模型整理了三个选项；研究负责人采用后成为待决定事项 dec_start_c。',
    status: 'applied',
    base_project_revision: 17,
    target_revision_refs: [{ entity_id: 'brn_c', revision: 1 }],
    commands: [
      {
        kind: 'propose_decision',
        question: '是否现在开展路线C（简化分配评分检验）？',
        options: C_OPTIONS,
        branch_ids: ['brn_c', 'brn_main'],
        evidence_ids: ['evd_ece_test'],
        rationale: '模型整理了三个选项并建议并行开展；研究负责人尚未选择。',
      },
    ],
    evidence_ids: ['evd_ece_test'],
    expected_impact: '在决策中心出现一项待决定事项。',
    risk_and_uncertainty: '无。',
    requested_grant_actions: ['decision.accept'],
    created_by: actor.codex(),
    applied_by_event_id: 'evt_1110',
  },
];

// ---------------------------------------------------------------- 审阅
const review = (id: string, at: string, fields: Record<string, unknown>) => ({
  ...base(id, 1, at, at, ownerObserved(`act_${id}`, at, '记录审阅', 'review-panel')),
  reviewer: actor.owner(OWNER_GRANT),
  evidence_ids: [],
  ...fields,
});

export const reviews = [
  review('rev_problem', '2026-09-10T07:30:00Z', {
    target_id: 'art_problem_doc_v2', reviewed_revision: 1, review_kind: 'user_review', status: 'accepted', understanding_status: 'not_reported',
    findings: ['问题定义与数据集的预算口径一致。'], is_current: true, source_revision_refs: [{ entity_id: 'art_problem_doc_v2', revision: 1 }],
  }),
  review('rev_route_b', '2026-10-08T06:40:00Z', {
    target_id: 'dec_route_b', reviewed_revision: 1, review_kind: 'user_review', status: 'accepted', understanding_status: 'self_reported_understood',
    findings: ['选择路线B的依据清楚；接受的是工作方向，不表示“校准能提高完成率”已经成立。'], evidence_ids: ['evd_reliability_a', 'evd_failure_analysis'], is_current: true, source_revision_refs: [{ entity_id: 'dec_route_b', revision: 1 }],
  }),
  review('rev_calib_design', '2026-10-22T07:30:00Z', {
    target_id: 'art_calib_code', reviewed_revision: 1, review_kind: 'implementation_review', status: 'accepted', understanding_status: 'not_reported',
    findings: ['fit_temperature() 只使用验证划分；apply_temperature() 不改变概率排序。分配器代码没有改动。'], is_current: true, source_revision_refs: [{ entity_id: 'art_calib_code', revision: 1 }, { entity_id: 'unt_calib_design', revision: 2 }],
  }),
  review('rev_calib_exp', '2026-11-02T01:00:00Z', {
    target_id: 'unt_calib_exp', reviewed_revision: 2, review_kind: 'scientific_review', status: 'accepted', understanding_status: 'self_reported_understood',
    findings: ['测试划分上的ECE比较方法合理，结论范围限定在预测层。'], evidence_ids: ['evd_ece_test'], is_current: false, source_revision_refs: [{ entity_id: 'unt_calib_exp', revision: 2 }, { entity_id: 'evd_ece_test', revision: 1 }],
  }),
  review('rev_brief_alloc', '2026-11-22T01:30:00Z', {
    target_id: 'brf_alloc_exp', reviewed_revision: 1, review_kind: 'user_review', status: 'needs_changes', understanding_status: 'needs_explanation',
    findings: ['说明里没有解释“ECE下降”和“任务完成率”之间是什么关系，读到“还需要对照实验”时不知道为什么。'], is_current: false, source_revision_refs: [{ entity_id: 'brf_alloc_exp', revision: 1 }],
  }),
];

// ---------------------------------------------------------------- 会话绑定
export const sessionBindings = [
  {
    ...base('ses_calib', 4, '2026-10-29T01:00:00Z', '2026-11-18T09:30:00Z', ownerObserved('act_bind_calib', '2026-10-29T01:00:00Z', '把会话绑定到研究单元', 'unit-detail')),
    connection_mode: 'sidecar', harness_instance_id: 'src_codex_cli', provider_session_id: SESSION_CALIB, provider_turn_id: 'turn-0207',
    unit_id: 'unt_calib_exp', branch_id: 'brn_main', context_bundle_id: 'ctx_calib', worktree_ref: 'mcs-allocation（主工作目录）',
    base_project_revision: 9, binding_revision: 1, state: 'completed', last_observed_at: '2026-11-18T09:30:00Z',
    coverage: 'partial', coverage_note: '伴随模式：通过Hook采集用户消息与本地工具事件；部分托管工具不经过本地Hook，可能漏记（虚构探测结果）。',
    interrupt_request_id: null, interrupt_confirmed_at: null,
  },
  {
    ...base('ses_alloc', 3, '2026-11-25T02:05:00Z', '2026-11-25T03:52:00Z', ownerObserved('act_bind_alloc', '2026-11-25T02:05:00Z', '把会话绑定到研究单元', 'unit-detail')),
    connection_mode: 'sidecar', harness_instance_id: 'src_codex_cli', provider_session_id: SESSION_ALLOC, provider_turn_id: 'turn-0412',
    unit_id: 'unt_alloc_exp', branch_id: 'brn_main', context_bundle_id: 'ctx_alloc_exp', worktree_ref: 'mcs-allocation（主工作目录）',
    base_project_revision: 18, binding_revision: 1, state: 'running', last_observed_at: '2026-11-25T03:52:00Z',
    coverage: 'partial', coverage_note: '伴随模式：通过Hook采集用户消息与本地工具事件；部分托管工具不经过本地Hook，可能漏记（虚构探测结果）。',
    interrupt_request_id: null, interrupt_confirmed_at: null,
  },
];

// ---------------------------------------------------------------- 能力清单
const cap = (support: 'supported' | 'partial' | 'unsupported' | 'unverified', scope: string, limitations: string[], urls: string[] = [], probed: string | null = '2026-11-25T02:00:00Z') => ({
  support, scope, limitations, evidence_urls: urls, probed_at: probed,
});
const HOOKS = 'https://learn.chatgpt.com/docs/hooks';
const APPSERVER = 'https://learn.chatgpt.com/docs/app-server';

export const capabilityManifests = [
  {
    ...base('cap_codex_cli', 3, '2026-10-29T01:00:00Z', '2026-11-25T02:00:00Z', provenance('observed', [loc.providerEvent(SESSION_ALLOC, 'probe-1125', '2026-11-25T02:00:00Z', '连接时执行的能力探测')], actor.adapter())),
    harness_instance_id: 'src_codex_cli', provider: 'codex', surface: 'cli', provider_version: '虚构版本（样机未连接真实Harness）', adapter_version: '0.1.0-stage-a', protocol_version: 'hooks（虚构探测）',
    connection_mode: 'sidecar', status: 'degraded',
    capabilities: {
      readHistory: cap('partial', '只读取用户选定的会话。', ['不扫描其他会话。']),
      observeMessages: cap('supported', '用户消息与模型回复。', [], [HOOKS]),
      observeTools: cap('partial', '本地工具调用。', ['部分托管工具不经过本地Hook，可能漏记。'], [HOOKS]),
      injectAtSessionStart: cap('supported', '会话开始时提供上下文包。', [], [HOOKS]),
      injectAtUserPrompt: cap('partial', '用户发送消息前追加简短提示。', ['长度受限；无法确认模型实际遵循。'], [HOOKS]),
      injectAfterCompaction: cap('unverified', '压缩后重新提供背景。', ['本版本未探测。'], [], null),
      createSession: cap('unsupported', '伴随模式不创建会话。', ['托管模式需通过 app-server 正式接口。'], [APPSERVER]),
      resumeSession: cap('unsupported', '伴随模式不恢复会话。', [], [APPSERVER]),
      forkSession: cap('unsupported', '伴随模式不分叉会话。', [], [APPSERVER]),
      steerTurn: cap('unsupported', '伴随模式不能转向正在进行的回合。', ['请在原客户端中操作。']),
      interruptTurn: cap('unsupported', '伴随模式不能中断进程。', ['请在原客户端中按停止。']),
      mediateToolApproval: cap('unsupported', '工具审批仍由原客户端处理。', []),
      checkpointFiles: cap('unsupported', '不使用宿主的文件检查点。', ['项目快照由工作台自行建立。']),
    },
  },
  {
    ...base('cap_claude_import', 1, '2026-09-15T02:00:00Z', '2026-09-15T02:00:00Z', provenance('observed', [loc.userAction('act_import', '2026-09-15T02:00:00Z', '研究负责人选择导入的会话导出文件', 'import')], actor.importer())),
    harness_instance_id: 'src_claude_export', provider: 'claude_code', surface: 'import', provider_version: '导出文件（虚构）', adapter_version: '0.1.0-stage-a', protocol_version: '导出文件格式（虚构）',
    connection_mode: 'archive', status: 'connected',
    capabilities: {
      readHistory: cap('supported', '只导入用户选定的导出文件。', [], [], '2026-09-15T02:00:00Z'),
      observeMessages: cap('unsupported', '档案模式不观察实时消息。', [], [], '2026-09-15T02:00:00Z'),
      observeTools: cap('unsupported', '档案模式不观察实时工具调用。', [], [], '2026-09-15T02:00:00Z'),
      injectAtSessionStart: cap('unsupported', '档案模式不注入上下文。', ['可生成交接材料供手动粘贴。'], [], '2026-09-15T02:00:00Z'),
      injectAtUserPrompt: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      injectAfterCompaction: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      createSession: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      resumeSession: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      forkSession: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      steerTurn: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      interruptTurn: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      mediateToolApproval: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
      checkpointFiles: cap('unsupported', '—', [], [], '2026-09-15T02:00:00Z'),
    },
  },
];

// ---------------------------------------------------------------- 授权
export const grants = [
  {
    ...base('grt_owner_core', 1, '2026-09-01T02:00:00Z', '2026-09-01T02:00:00Z', ownerObserved('act_create_project', '2026-09-01T02:00:00Z', '创建项目时确认人工操作授权', 'project-setup')),
    status: 'active',
    subject_principal_ids: ['usr_owner'],
    actions: [
      'goal.change', 'assumption.change', 'decision.accept', 'decision.reject', 'decision.supersede', 'branch.promote', 'branch.create', 'branch.archive', 'branch.merge',
      'unit.create', 'unit.update', 'unit.revise', 'unit.reorganize', 'claim.create', 'claim.revise', 'claim.assess', 'evidence.create', 'evidence.revise', 'evidence.attach',
      'artifact.register', 'graph.link', 'graph.correct', 'checkpoint.create', 'session.start', 'session.interrupt', 'review.record',
    ],
    scope: { kind: 'project', project_id: PROJECT_ID },
    issued_by: actor.owner(),
    authorization_source: ua('act_create_project', '2026-09-01T02:00:00Z', '创建项目时确认人工操作授权', 'project-setup'),
    expires_at: null,
    max_cost_usd: null,
    revoked_at: null,
    reason: '项目负责人本人的操作授权（样机假设：创建项目时生成，见设计决定 D-004）。所有改变都需本人操作，不允许自动应用。',
    application_policy: 'human_only',
  },
  {
    ...base('grt_routine', 1, '2026-11-20T09:13:00Z', '2026-11-20T09:13:00Z', provenance('observed', [msg(SESSION_ALLOC, 'msg-0290', 'user', '2026-11-20T09:12:00Z', '研究负责人在会话中的明确授权', MSG_GRANT)], actor.owner(OWNER_GRANT))),
    status: 'active',
    subject_principal_ids: ['svc_policy'],
    actions: ['unit.update', 'unit.revise', 'artifact.register'],
    scope: { kind: 'units', project_id: PROJECT_ID, unit_ids: ['unt_alloc_exp'] },
    issued_by: actor.owner(),
    authorization_source: msg(SESSION_ALLOC, 'msg-0290', 'user', '2026-11-20T09:12:00Z', '研究负责人在会话中的明确授权', MSG_GRANT),
    expires_at: '2026-12-05T00:00:00Z',
    max_cost_usd: null,
    revoked_at: null,
    reason: '允许在对照实验单元内自动应用常规整理：更新下一步说明、登记实验产物。不包括主张评估、决定和目标变化。',
    application_policy: 'policy_within_scope',
  },
  {
    ...base('grt_calib_routine', 2, '2026-10-29T01:10:00Z', '2026-11-05T00:00:00Z', ownerObserved('act_grant_calib', '2026-10-29T01:10:00Z', '为校准实验单元给出常规整理授权', 'unit-detail')),
    status: 'expired',
    subject_principal_ids: ['svc_policy'],
    actions: ['unit.update', 'artifact.register'],
    scope: { kind: 'units', project_id: PROJECT_ID, unit_ids: ['unt_calib_exp'] },
    issued_by: actor.owner(),
    authorization_source: ua('act_grant_calib', '2026-10-29T01:10:00Z', '为校准实验单元给出常规整理授权', 'unit-detail'),
    expires_at: '2026-11-05T00:00:00Z',
    max_cost_usd: null,
    revoked_at: null,
    reason: '校准实验期间的常规整理授权，已到期；导入历史或回到旧快照都不会使它重新生效。',
    application_policy: 'policy_within_scope',
  },
];
