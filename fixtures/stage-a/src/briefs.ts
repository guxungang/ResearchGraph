// 阅读说明（给人看）与上下文包（给模型用）。两者引用同一组对象修订，但分别撰写（方案 §5.1）。
// 阅读说明由夹具作者人工撰写，用于阶段A理解测试；generation.mode = 'human'。
import { actor, base, loc, provenance, sha } from './helpers.ts';
import { evidenceList, project, MSG_GRANT, SESSION_ALLOC } from './entities.ts';

const BG =
  '本项目研究移动群智感知中的任务分配：平台把“到某个区域采集信息”的任务分给正在行驶的车辆，车辆在时限内到达并完成采集，任务才算完成。平台只能根据有误差的位置预测，估计每辆车按时到达的可能性（称为“到达概率”），再据此分配任务。如果到达概率系统性偏高，分配器就会把任务交给实际到不了的车辆，任务因此失败。';

type Ref = { entity_id: string; revision: number };
const evd = (id: string) => {
  const e = evidenceList.find((x) => x.id === id);
  if (!e) throw new Error(`unknown evidence ${id}`);
  return e;
};
const link = (id: string, relationship: 'supports' | 'contradicts' | 'background' | 'limitation', label?: string) => ({
  evidence_id: id,
  label: label ?? (evd(id) as unknown as { title: string }).title,
  relationship,
  source_locator: evd(id).source_locator,
});

const brief = (
  id: string,
  revision: number,
  unitId: string,
  at: string,
  refs: Ref[],
  fields: Record<string, unknown> & { readability?: { source_gaps?: string[]; status?: 'pass' | 'needs_revision' | 'not_checked' } },
) => {
  const { readability, ...rest } = fields;
  const source_revision_refs = [{ entity_id: project.id, revision: project.revision }, ...refs];
  return {
    ...base(
      id,
      revision,
      at,
      at,
      provenance('inferred', [loc.userAction(`act_build_${id}`, at, '夹具作者撰写阅读说明', 'fixture')], actor.briefWriter(), '阶段A虚构夹具：阅读说明由人工撰写，用于理解测试；不代表模型生成质量。'),
    ),
    unit_id: unitId,
    audience: 'general_researcher',
    source_revision_refs,
    project_background: BG,
    decision_request: null,
    limitations: [],
    readability_checks: {
      unexplained_terms: [],
      unresolved_references: [],
      source_gaps: readability?.source_gaps ?? [],
      status: readability?.status ?? 'pass',
    },
    generation: {
      mode: 'human',
      model_provider: null,
      model_id: null,
      prompt_template_id: null,
      template_version: '1.0.0-stage-a',
      input_sha256: sha(JSON.stringify(source_revision_refs)),
      generated_at: at,
      processing_command_id: null,
    },
    ...rest,
  };
};

const term = (t: string, plain: string, why: string) => ({ term: t, plain_explanation: plain, why_needed: why });

const P_ARRIVAL = term('到达概率', '预测模型给出的“这辆车会在时限内到达目标区域”的可能性，取值0到1。', '分配器依据它决定把任务交给哪辆车。');
const P_CALIB = term(
  '概率校准',
  '检查模型报出的概率与实际发生的频率是否一致，并修正系统性的偏差。例如模型说“八成会到”的那些车辆，实际也应该约有八成按时到达。',
  '这是路线B的核心操作。',
);
const P_RELIABILITY = term(
  '可靠性曲线',
  '把预测按概率大小分组（例如0.8–0.9为一组），比较每组“预测概率的平均值”和“实际按时到达的比例”。两条数越接近，概率越可靠。',
  '用来直观地看出概率在哪个区间偏高或偏低。',
);
const P_ECE = term(
  '期望校准误差（ECE）',
  '把可靠性曲线浓缩成一个数：每组“预测平均值”与“实际比例”的差距，按组内样本量加权平均。0表示完全一致，数值越小越可靠。',
  '用来比较校准前后概率的可靠程度。',
);
const P_SEED = term('随机种子', '控制实验中随机因素（例如任务出现的顺序）的数字。用多个种子重复实验，可以看出结果是否只是偶然。', '本项目的路线比较统一使用种子11–15。');

// ---------------------------------------------------------------- 阅读说明
export const readingBriefs = [
  brief('brf_problem', 1, 'unt_problem', '2026-09-10T09:00:00Z', [{ entity_id: 'unt_problem', revision: 2 }, { entity_id: 'art_problem_doc_v2', revision: 1 }], {
    title: '怎样定义“到达不确定时的任务分配”问题',
    why_this_work: '后续所有路线都要比较“任务完成率”。如果每个实验各自定义什么叫完成、预算怎么算，结果就无法比较。本单元先固定一个共同的问题定义。',
    current_question: '当车辆能否按时到达不确定时，任务分配问题的输入、决策、目标和约束分别是什么？',
    prerequisites: [
      term('移动群智感知', '由大量普通参与者（这里是车辆）在日常移动中顺带采集信息的方式，例如车辆经过路口时拍摄路况。', '决定了“任务完成”依赖车辆实际怎么行驶。'),
      P_ARRIVAL,
    ],
    method_explanation:
      '把问题写成一个带预算的分配问题。输入是任务列表（目标区域、时限）和每辆车对每个任务的到达概率；决策是每个任务分给哪辆车，每辆车同一时段最多接一个任务；目标是在总激励预算内，让按时完成的任务数最多。评价指标“任务完成率”等于按时完成的任务数除以发布的任务数。',
    key_findings: [
      '形成问题定义文档第2版（art_problem_doc_v2），规定了任务完成率的计算方式和预算口径。',
      '确定后续路线都用同一套输入格式；路线之间只允许改变“到达概率从哪里来”和“分配评分怎么算”。',
    ],
    not_yet_established: ['问题定义没有考虑车辆中途拒绝任务的情况；这一简化是否影响结论，尚未检验。'],
    implementation_changes: [{ what_changed: '问题定义文档从第1版改为第2版', why: '把预算口径从“按任务个数计”改为“按激励金额计”，与数据集一致。', artifact_version_ids: ['art_problem_doc_v1', 'art_problem_doc_v2'] }],
    project_impact: '为任务完成率、预算和时限提供了统一口径，后续各路线的结果才能放在一起比较。',
    recommended_next_step: '无需操作；后续单元沿用本定义。',
    evidence_links: [],
    limitations: ['未建模车辆拒单。'],
    readability: { source_gaps: [], status: 'pass' },
  }),
  brief('brf_lit', 1, 'unt_lit', '2026-09-20T10:00:00Z', [{ entity_id: 'unt_lit', revision: 2 }, { entity_id: 'evd_lit_calib', revision: 1 }], {
    title: '已有工作怎样处理到达预测的误差',
    why_this_work: '在决定改预测模型还是改分配方法之前，需要知道已有工作在哪些环节处理预测误差，以及概率校准是否适用于“是否按时到达”这种是或否的概率。',
    current_question: '已有工作怎样处理车辆位置预测的误差？概率校准方法能否直接用于到达概率？',
    prerequisites: [P_ARRIVAL, P_CALIB],
    method_explanation:
      '按“在哪个环节处理误差”把14篇虚构文献分成三类：①改进预测模型本身；②在分配时为不确定性留余量，例如只选概率最高的车；③先修正概率，再交给分配器。比较的维度是：需要的额外数据、是否改动分配算法、实验所用车辆类型。',
    key_findings: [
      '第③类“先修正概率再分配”不需要改动分配算法，便于单独检验概率可靠性的作用。',
      '综述（evd_lit_calib）报告：温度缩放只有一个参数、不改变概率排序，样本较少时比保序回归稳定。',
    ],
    not_yet_established: ['文献中的实验多用出租车数据；对本项目的社会车辆是否同样成立，尚无证据。'],
    implementation_changes: [],
    project_impact: '为路线B（先校准再分配）和备选的复杂网络路线提供了依据，也说明了它们各自的代价。',
    recommended_next_step: '无需操作。',
    evidence_links: [link('evd_lit_calib', 'background')],
    limitations: ['文献为虚构，仅用于测试阅读体验。'],
  }),
  brief(
    'brf_baseline',
    1,
    'unt_baseline',
    '2026-10-14T04:00:00Z',
    [{ entity_id: 'unt_baseline', revision: 3 }, { entity_id: 'evd_baseline_completion', revision: 1 }, { entity_id: 'dec_eval_v2', revision: 1 }, { entity_id: 'dec_eval_v1', revision: 2 }],
    {
      title: '原方法在共同评价条件下的任务完成率',
      why_this_work: '要判断任何改进是否有效，需要先在固定条件下测出原方法（直接使用预测概率）的任务完成率，作为所有路线共同的比较基线。',
      current_question: '在固定的数据划分、预算和时限下，直接使用预测概率的原方法，任务完成率是多少？',
      prerequisites: [P_SEED, term('数据划分', '把数据按日期分成训练、验证、测试三部分：训练用于建模型，验证用于调参数，测试只用于最终评价。', '保证所有路线在同一份测试数据上比较。')],
      method_explanation:
        '使用2026年8月城市A的虚构车辆轨迹数据，按日期划分为训练、验证和测试三部分。在测试部分模拟任务发布：预算100（激励单位）、时限30分钟，分配器每次选择评分最高的车辆。按现行评价规则（决定 dec_eval_v2），用随机种子11–15重复5次，报告均值、最小值和最大值。',
      key_findings: ['原方法的任务完成率为0.71（5个种子均值，范围0.69–0.73），见 evd_baseline_completion。', '5个种子合计有612次失败分配：任务分给了车辆，但车辆没有按时到达。'],
      not_yet_established: ['只测了预算100一档；其他预算下的表现尚未测量。', '为什么会失败，本单元没有分析（失败分解见“备选评估”单元）。'],
      implementation_changes: [{ what_changed: '评价配置 configs/eval.yaml 第2版：随机种子从1个改为5个', why: '执行决定 dec_eval_v2，避免单次结果偶然偏高。', artifact_version_ids: ['art_eval_config_v2'] }],
      project_impact: '给出所有路线共用的比较基线。失败集中出现的情形，推动了路线A诊断和路线B。',
      recommended_next_step: '无需操作；基线已被后续单元引用。',
      evidence_links: [link('evd_baseline_completion', 'supports', '基线任务完成率0.71（5个种子）')],
      limitations: ['早先按单一种子（旧规则 dec_eval_v1，已被替代）得到的0.74，与本结果不可直接比较。'],
    },
  ),
  brief(
    'brf_a_diag',
    1,
    'unt_a_diag',
    '2026-10-07T08:00:00Z',
    [{ entity_id: 'unt_a_diag', revision: 2 }, { entity_id: 'clm_overconf', revision: 2 }, { entity_id: 'evd_reliability_a', revision: 1 }],
    {
      title: '直接使用的到达概率在高概率区间偏高',
      why_this_work: '基线中有大量“分给了车辆、车辆却没按时到”的失败。需要直接检查：预测模型给出的概率本身是否系统性偏高。如果偏高，分配器就会持续把任务交给实际到不了的车。',
      current_question: '原方法使用的到达概率，在高概率区间是否高估了车辆实际按时到达的比例？',
      prerequisites: [P_RELIABILITY, term('过度自信', '预测概率系统性高于实际发生的比例，例如说有九成把握，实际只有六成。', '本单元要检查的就是这种偏差。')],
      method_explanation: '在验证数据上，把约2.1万次“车辆—任务”配对按预测到达概率分成10组，计算每组实际按时到达的比例，画成可靠性曲线（见证据层）。不改动分配算法，也不训练新模型。',
      key_findings: ['预测概率在0.8–0.9之间的1,840次配对，实际按时到达的比例只有0.62（evd_reliability_a）。', '0.5以下的区间，预测与实际基本一致；偏差集中在高概率区间。'],
      not_yet_established: ['偏高的原因没有查明（一种可能是训练数据时段与验证时段的交通状况不同）。', '本单元只诊断概率，没有检验“修正概率后任务完成率会提高”。'],
      implementation_changes: [{ what_changed: '新增诊断脚本 diagnose_reliability.py 与结果 results/reliability_val.json', why: '计算每个概率区间的实际到达比例。', artifact_version_ids: ['art_a_reliability'] }],
      project_impact: '这是选择路线B（先校准再分配，决定 dec_route_b）的主要依据之一。路线A因此暂缓，只作为对照保留。',
      recommended_next_step: '无需操作。若路线B的对照实验没有改善，再回到本路线考虑改进分配算法。',
      evidence_links: [link('evd_reliability_a', 'supports', '0.8–0.9区间实际到达比例0.62')],
      limitations: ['只用了验证划分；测试划分上的检查在路线B的实验中完成。'],
    },
  ),
  brief(
    'brf_net_eval',
    1,
    'unt_net_eval',
    '2026-10-09T09:00:00Z',
    [{ entity_id: 'unt_net_eval', revision: 3 }, { entity_id: 'clm_failure_source', revision: 2 }, { entity_id: 'evd_failure_analysis', revision: 1 }, { entity_id: 'dec_no_network', revision: 1 }],
    {
      title: '为什么暂不增加更复杂的预测网络',
      why_this_work: '提高位置预测精度是一个直观的改进方向，但更复杂的网络实现和解释成本都很高。需要先判断：任务失败主要来自预测误差大，还是来自概率被过度相信。',
      current_question: '基线中的任务失败，主要来自预测位置误差大，还是来自预测概率被过度相信？',
      prerequisites: [P_ARRIVAL, term('四分位', '把数据按大小排序后平均分成四段；“最高四分之一”就是数值最大的那25%。', '用来定义“预测位置误差最大”的那部分分配。')],
      method_explanation: '把基线的612次失败分配按两个维度分组：预测位置误差的大小（按四分位分段）和预测概率的高低，统计失败落在哪些组。没有训练新网络。',
      key_findings: ['71%的失败发生在预测概率不低于0.8、车辆却没有按时到达的情形；位置误差最大的四分之一只占失败的18%（evd_failure_analysis）。', '据此决定暂不增加复杂网络（决定 dec_no_network），本路线关闭。'],
      not_yet_established: ['没有实际训练更复杂的网络，所以不知道它能把误差降低多少。', '这一统计只说明失败与“高概率”同时出现，不是因果证明。'],
      implementation_changes: [{ what_changed: '新增失败分解表 results/failure_breakdown.json', why: '按概率与误差两个维度统计失败分配。', artifact_version_ids: ['art_failure_analysis'] }],
      project_impact: '避免在证据不足时增加一项昂贵的机制。恢复条件已记录：如果对照实验显示校准后的概率仍是主要瓶颈，再重新评估。',
      recommended_next_step: '无需操作。如果模型再次建议增加网络，先对照本节点的关闭理由与恢复条件。',
      evidence_links: [link('evd_failure_analysis', 'supports', '失败分解：71%与18%')],
      limitations: ['失败分解只基于预算100一档。'],
    },
  ),
  brief(
    'brf_calib_design',
    1,
    'unt_calib_design',
    '2026-10-22T09:00:00Z',
    [{ entity_id: 'unt_calib_design', revision: 2 }, { entity_id: 'dec_calib_method', revision: 1 }, { entity_id: 'evd_lit_calib', revision: 1 }, { entity_id: 'art_calib_code', revision: 1 }],
    {
      title: '用温度缩放修正到达概率，分配算法保持不变',
      why_this_work: '路线A诊断发现到达概率在高概率区间偏高。路线B要在不改动分配算法的前提下修正这种偏差；这样后面任务完成率若有变化，才能归因于“概率是否可靠”，而不是分配算法的改动。',
      current_question: '用哪种校准方法修正到达概率的系统性偏高，同时不改变分配算法和车辆之间的概率排序？',
      prerequisites: [
        P_CALIB,
        term('温度缩放', '在预测模型把原始分数转换成概率之前，先把分数统一除以一个数T（称为“温度”）。T大于1时，概率整体变得不那么极端，从而纠正过度自信。只有T一个参数需要学习。', '本单元选用的方法。'),
        term('保序回归', '一种更灵活的校准方法：学习一条只升不降的映射曲线，把原概率映射成修正后的概率。能修正更复杂的偏差，但需要更多样本。', '被比较但未选用的候选。'),
        term('验证划分', '不参与训练、专门用来调参数的一部分数据；测试划分则只用于最终评价。', '温度T只在验证划分上拟合，避免用测试数据调参。'),
      ],
      method_explanation:
        '预测模型 pred-v3 保持不变。在它输出原始分数之后增加一步：分数除以T，再转换成概率。T在验证划分上选择，使预测概率与实际到达尽量一致。校准后的概率直接替换原概率交给分配器，分配器代码不改。方法层的对比表列出了温度缩放与保序回归的区别。',
      key_findings: ['选定温度缩放（决定 dec_calib_method）：只有一个参数，不改变车辆之间的概率排序，样本较少时更稳定（依据 evd_lit_calib）。', '实现位于 src/calibration.py（art_calib_code），实现审阅确认分配器代码没有改动（rev_calib_design）。'],
      not_yet_established: ['温度缩放只能整体缩放；如果不同时段的偏差方向不同，它可能修正不了。本单元结束时这一风险尚未检验。'],
      implementation_changes: [{ what_changed: '新增 src/calibration.py：fit_temperature() 与 apply_temperature()', why: '实现温度缩放，供分配器读取校准后的概率。', artifact_version_ids: ['art_calib_code'] }],
      project_impact: '确定了路线B的具体做法，并把“只改概率、不改分配器”作为后续对照实验的前提。',
      recommended_next_step: '无需操作；实验在单元“实验：校准对概率可靠性的影响”中进行。',
      evidence_links: [link('evd_lit_calib', 'background', '综述：温度缩放与保序回归的比较')],
      limitations: [],
    },
  ),
  brief(
    'brf_calib_exp',
    1,
    'unt_calib_exp',
    '2026-11-18T08:00:00Z',
    [
      { entity_id: 'unt_calib_exp', revision: 3 },
      { entity_id: 'clm_calib_test', revision: 2 },
      { entity_id: 'clm_calib_all_periods', revision: 3 },
      { entity_id: 'evd_ece_test', revision: 1 },
      { entity_id: 'evd_peak', revision: 1 },
    ],
    {
      title: '校准改善了测试数据上的概率可靠性，晚高峰是否改善还不知道',
      why_this_work: '在比较任务完成率之前，需要先确认校准确实让到达概率更可靠。否则即使完成率有变化，也说不清原因。',
      current_question: '温度缩放之后，到达概率与车辆实际按时到达的频率是否更一致？这种改善在不同时段是否都成立？',
      prerequisites: [P_ECE, P_RELIABILITY],
      method_explanation:
        '在测试划分上比较校准前后的ECE和可靠性曲线，用随机种子11–15重复5次（种子影响验证样本的抽取，从而影响拟合出的T）。11月18日又按时段把测试数据分组，单独计算每个时段校准后的ECE。',
      key_findings: [
        '全天测试数据上，ECE从0.142降到0.058（5个种子均值，T约为1.84），见 evd_ece_test。这支持一个较窄的结论：校准改善了测试划分上的概率可靠性。',
        '晚高峰（17:00–19:00）子集上，校准后ECE为0.113，高于全天的0.058（evd_peak）。但这次没有计算晚高峰校准前的ECE，所以只能说“校准后晚高峰误差仍较高”，不能说“校准在晚高峰没有效果”；“校准在所有时段都改善可靠性”目前证据不足。',
      ],
      not_yet_established: ['以上都是预测层指标。还没有在相同预算、数据和分配算法下比较最终任务完成率，因此不能认定校准改善了整个系统。', '校准在晚高峰是否有改善（缺少校准前的值）；晚高峰误差偏高的原因，以及它是否会影响分配结果。'],
      implementation_changes: [
        { what_changed: '新增评价脚本 scripts/eval_calibration.py 及结果 results/ece.json', why: '计算校准前后的ECE与分组数据。', artifact_version_ids: ['art_calib_results'] },
        { what_changed: '新增按时段结果 results/ece_by_period.json', why: '检查校准效果在不同时段是否一致。', artifact_version_ids: ['art_peak_results'] },
      ],
      project_impact: '路线B的前提基本成立（测试数据上概率更可靠），可以进入任务分配对照实验；同时留下晚高峰这一需要补算和跟踪的问题。',
      recommended_next_step: '无需操作。晚高峰问题已记入主张 clm_calib_all_periods（证据不足）；对照实验会按时段单独报告，并补算晚高峰校准前的ECE。',
      evidence_links: [link('evd_ece_test', 'supports', '测试划分ECE：0.142 → 0.058'), link('evd_peak', 'limitation', '晚高峰校准后ECE 0.113，没有校准前的值')],
      limitations: ['晚高峰子集只占约9%的样本（n=2,310）。', '按时段只计算了校准后的ECE。'],
    },
  ),
  brief(
    'brf_alloc_exp',
    2,
    'unt_alloc_exp',
    '2026-11-23T02:00:00Z',
    [
      { entity_id: 'unt_alloc_exp', revision: 2 },
      { entity_id: 'clm_completion', revision: 1 },
      { entity_id: 'clm_paper_s4', revision: 1 },
      { entity_id: 'evd_ece_test', revision: 1 },
      { entity_id: 'evd_peak', revision: 1 },
      { entity_id: 'run_alloc_v1', revision: 1 },
      { entity_id: 'run_alloc_v2', revision: 3 },
    ],
    {
      title: '为什么下一步需要任务分配对照实验',
      why_this_work:
        '上一项实验表明，校准让到达概率更可靠，但这只是预测层的改进。分配结果还受预算、时限和车辆之间竞争的影响，所以概率更准不一定带来更多完成的任务。必须把校准放进同一个分配过程中直接比较。',
      current_question: '在相同数据划分、预算、时限和随机种子下，把校准后的概率交给同一分配器，任务完成率是否高于直接使用原始概率？',
      prerequisites: [
        term('预测层指标与系统层指标', 'ECE衡量“概率准不准”，属于预测层；任务完成率衡量“最后完成了多少任务”，属于系统层。前者改善不能自动推出后者改善。', '本节点要检验的正是两者之间的联系。（根据读者反馈在第2版补充）'),
        term('对照实验', '只改变一个因素、其余条件全部保持相同的实验；这样结果的差异才能归因于这个因素。', '本节点只切换“是否校准”。'),
        P_ECE,
      ],
      method_explanation:
        '固定数据划分、分配算法和随机种子11–15，分别在预算50、100、200三档下运行两组：A组直接使用原始概率，B组使用校准后的概率。比较两组的任务完成率和失败分配次数。两组的相同条件写在同一份配置 configs/alloc_compare.yaml（art_alloc_config）中。',
      key_findings: [
        '11月21日的第一次运行 run_alloc_v1 因找不到数据文件而中止。这是执行环境问题，不是对假设的反证，不改变任何主张的状态。',
        '第二次运行 run_alloc_v2 自11月25日10:10（北京时间）开始，仍在进行，尚无结果。',
      ],
      not_yet_established: ['还不知道校准能否提高任务完成率；主张 clm_completion 仍为“未评估”。', '论文草稿第4.2节已经写了“校准显著提高了任务完成率”，目前没有任何证据支持这句话。'],
      implementation_changes: [{ what_changed: '新增 configs/alloc_compare.yaml', why: '把两组实验的相同条件写在同一份配置中，防止两组条件不一致。', artifact_version_ids: ['art_alloc_config'] }],
      project_impact: '这个实验决定是否把校准纳入主线方法，也决定论文第4节能写什么结论；同时是决定是否开展路线C的参考。',
      recommended_next_step: '等待 run_alloc_v2 完成后，按三档预算比较任务完成率和失败分配次数；晚高峰时段单独报告。',
      evidence_links: [link('evd_ece_test', 'background', '前提：测试划分上校准有效（预测层）'), link('evd_peak', 'limitation', '已知限制：晚高峰校准后误差仍偏高')],
      limitations: ['结果出来之前，本说明不包含任何关于任务完成率的结论。'],
      readability: { source_gaps: ['run_alloc_v2 尚无输出文件。'], status: 'pass' },
    },
  ),
  brief(
    'brf_c_weight',
    1,
    'unt_c_weight',
    '2026-11-23T08:30:00Z',
    [{ entity_id: 'unt_c_weight', revision: 1 }, { entity_id: 'clm_weight_needed', revision: 1 }, { entity_id: 'dec_start_c', revision: 1 }, { entity_id: 'evd_ece_test', revision: 1 }, { entity_id: 'evd_peak', revision: 1 }, { entity_id: 'ckp_calib', revision: 1 }],
    {
      title: '路线C：检验分配评分中的可靠性加权项是否必要',
      why_this_work:
        '当前分配评分由三项组成：车辆到目标区域的距离、剩余时限、按到达概率加权的“可靠性项”。可靠性项增加了实现与解释成本。按项目约束，保留复杂机制需要说明它对任务完成率的贡献，所以需要检验去掉这一项会不会更差。',
      current_question: '如果分配评分只保留距离与时限两项，在相同条件下任务完成率是否与完整评分相同？',
      prerequisites: [
        term('分配评分', '分配器给每个“车辆—任务”配对打的分，分数最高的配对优先分配。', '路线C要比较的是两种评分方式。'),
        term('从快照继续', '从过去保存的项目状态（快照）开始一条新路线。系统会新建分支，并带上快照之后才发现的反证和限制，不会覆盖当前的工作。', '路线C从11月2日的快照 ckp_calib 继续，并带上了11月18日发现的晚高峰限制。'),
      ],
      method_explanation: '计划在路线B对照实验的相同条件下增加第三组：使用校准后的概率，但评分只含距离与时限两项，然后比较三组的任务完成率。需要独立的代码工作区，避免与路线B正在运行的实验修改同一份评分代码。',
      key_findings: ['尚未开展。可复用路线B的证据 evd_ece_test（测试划分上校准有效）；这条证据来自另一分支，以引用方式使用。'],
      not_yet_established: ['可靠性加权项是否必要，目前完全未知（主张 clm_weight_needed 未评估）。', '快照 ckp_calib 的原始轨迹数据在远端存储，只能恢复认知状态与代码配置，不能直接复现当时的实验。'],
      implementation_changes: [],
      project_impact: '如果简化评分同样有效，项目可以去掉一项难以解释的机制；如果更差，就有证据支持保留它。',
      recommended_next_step: '需要研究负责人决定开展时机（见下方待决定事项）。',
      decision_request: { question: '是否现在开展路线C？', proposal_id: 'pro_c_timing', options: ['现在并行开展', '等路线B对照实验完成后再开展', '不开展路线C'] },
      evidence_links: [link('evd_ece_test', 'background', '复用：测试划分上校准有效（来自主线）'), link('evd_peak', 'limitation', '带入的限制：晚高峰校准后误差仍偏高')],
      limitations: [],
      readability: { source_gaps: ['尚无本路线自己的实验证据。'], status: 'pass' },
    },
  ),
];

// 第1版的对照实验说明（被读者标记“需要补背景”，已由第2版替代；用于历史视图）。
export const briefAllocV1 = (() => {
  const v2 = readingBriefs.find((b) => b.id === 'brf_alloc_exp')!;
  const v1 = structuredClone(v2) as typeof v2 & Record<string, unknown>;
  v1.revision = 1;
  v1.created_at = '2026-11-21T03:00:00Z';
  v1.updated_at = '2026-11-21T03:00:00Z';
  v1.valid_time = { from: '2026-11-21T03:00:00Z', to: '2026-11-23T02:00:00Z' };
  (v1 as Record<string, unknown>).why_this_work = '上一项实验表明校准让到达概率更可靠。下一步需要对照实验。';
  (v1 as Record<string, unknown>).prerequisites = [P_ECE];
  (v1 as Record<string, unknown>).source_revision_refs = [
    { entity_id: 'prj_mcs', revision: 16 },
    { entity_id: 'unt_alloc_exp', revision: 2 },
    { entity_id: 'clm_completion', revision: 1 },
    { entity_id: 'evd_ece_test', revision: 1 },
    { entity_id: 'run_alloc_v1', revision: 1 },
  ];
  (v1 as Record<string, unknown>).key_findings = ['11月21日的第一次运行 run_alloc_v1 因找不到数据文件而中止。这是执行环境问题，不是对假设的反证。'];
  (v1 as Record<string, unknown>).not_yet_established = ['还不知道校准能否提高任务完成率。'];
  v1.generation = { ...v1.generation, generated_at: '2026-11-21T03:00:00Z', input_sha256: sha('brf_alloc_exp@1') };
  return v1;
})();

// ---------------------------------------------------------------- 上下文包
const ownerMsgGrant = loc.message(SESSION_ALLOC, 'msg-0290', 'user', '2026-11-20T09:12:00Z', '研究负责人在会话中的明确授权', MSG_GRANT);
const ua = (id: string, at: string, what: string) => loc.userAction(id, at, what);

export const contextBundles = [
  {
    ...base('ctx_alloc_exp', 1, '2026-11-25T02:04:00Z', '2026-11-25T02:04:00Z', provenance('inferred', [ua('act_build_ctx_alloc', '2026-11-25T02:04:00Z', '研究负责人在单元详情中选择“在此开展工作”')], actor.adapter())),
    branch_id: 'brn_main',
    unit_id: 'unt_alloc_exp',
    branch_context_revision: 6,
    built_for: 'session_start',
    base_project_revision: 18,
    items: [
      { entity_id: 'prj_mcs', revision: 18, role: 'goal', text: '目标：在车辆位置预测存在误差时，提高有限预算下移动群智感知任务的完成率。', source_refs: [ua('act_create_project', '2026-09-01T02:00:00Z', '创建项目并填写目标')], validity_note: '当前项目目标。' },
      { entity_id: 'prj_mcs', revision: 18, role: 'constraint', text: '约束：增加方法复杂度之前，必须先说明它对任务完成率的贡献依据。', source_refs: [ua('act_create_project', '2026-09-01T02:00:00Z', '写入约束')], validity_note: '硬约束，预算不足时也不得删除。' },
      { entity_id: 'prj_mcs', revision: 18, role: 'constraint', text: '约束：比较不同路线的任务完成率时，必须使用相同的数据划分、预算、时限和随机种子集合（11–15）。', source_refs: [ua('act_add_constraint', '2026-10-12T03:00:00Z', '追加约束')], validity_note: '硬约束。' },
      { entity_id: 'dec_route_b', revision: 1, role: 'decision', text: '已采用：主线为路线B，先用温度缩放校准到达概率，分配算法保持不变。', source_refs: [ua('act_dec_route_b', '2026-10-08T06:30:00Z', '选择路线B')], validity_note: '当前有效决定；采用方案不等于“校准能提高完成率”已成立。' },
      { entity_id: 'dec_eval_v2', revision: 1, role: 'decision', text: '已采用：任务完成率用随机种子11–15报告均值、最小值与最大值。', source_refs: [ua('act_dec_eval_v2', '2026-10-12T03:00:00Z', '采用评价规则')], validity_note: '替代了单一种子的旧规则 dec_eval_v1。' },
      { entity_id: 'evd_ece_test', revision: 1, role: 'evidence', text: '测试划分上，温度缩放把ECE从0.142降到0.058（预测层指标）。', source_refs: [evidenceList.find((e) => e.id === 'evd_ece_test')!.source_locator], validity_note: '不能据此推出任务完成率提高。' },
      { entity_id: 'evd_peak', revision: 1, role: 'evidence', text: '晚高峰（17:00–19:00）校准后ECE为0.113，高于全天；没有校准前的值，不能判断校准在晚高峰是否有效。需在结果中单独报告。', source_refs: [evidenceList.find((e) => e.id === 'evd_peak')!.source_locator], validity_note: '后来发现的限制，必须保留；不要写成“校准在晚高峰无效”。' },
      { entity_id: 'clm_completion', revision: 1, role: 'question', text: '待检验：校准后的概率能否在有限预算下提高任务完成率。目前未评估。', source_refs: [ua('act_claim_completion', '2026-10-08T06:30:00Z', '记录待检验主张')], validity_note: '不得在结果出来前写成已成立。' },
      { entity_id: 'run_alloc_v1', revision: 1, role: 'recent_state', text: '上一次运行因找不到数据文件 data/splits/test_v2.parquet 中止（环境问题，已修正配置）。', source_refs: [loc.providerEvent(SESSION_ALLOC, 'evt-run_alloc_v1', '2026-11-21T01:34:00Z', '运行失败事件')], validity_note: '执行问题，不是反证。' },
      { entity_id: 'grt_routine', revision: 1, role: 'constraint', text: '授权范围：可直接更新本单元的下一步说明与登记实验产物；不包括评估主张、作出决定或改变目标。', source_refs: [ownerMsgGrant], validity_note: '有效至2026-12-05。' },
    ],
    excluded_items: [
      { entity_id: 'dec_eval_v1', reason: '已被 dec_eval_v2 替代，只作为历史保留，不作为当前约束注入。' },
      { entity_id: 'pro_add_network', reason: '未经采用的候选建议；保留检索入口，但不作为当前任务指令。' },
      { entity_id: 'brn_net', reason: '已关闭路线；只在用户询问“为何放弃”时作为历史解释返回。' },
    ],
    token_budget: 4000,
    estimated_tokens: 940,
    token_measurement: 'estimated',
    snapshot_mode: 'current_valid',
    counterevidence_included: true,
    sha256: sha('ctx_alloc_exp@1'),
    history_basis: 'not_applicable',
    as_of_time: null,
    history_label: 'current_valid',
    reconstruction_note: '',
    generation: { mode: 'template', model_provider: null, model_id: null, prompt_template_id: 'ctx-session-start', template_version: '1.0.0-stage-a', input_sha256: sha('ctx_alloc_exp:inputs'), generated_at: '2026-11-25T02:04:00Z', processing_command_id: null },
  },
  {
    ...base('ctx_calib', 1, '2026-10-29T01:00:00Z', '2026-10-29T01:00:00Z', provenance('inferred', [ua('act_build_ctx_calib', '2026-10-29T01:00:00Z', '研究负责人在单元详情中选择“在此开展工作”')], actor.adapter())),
    branch_id: 'brn_main',
    unit_id: 'unt_calib_exp',
    branch_context_revision: 4,
    built_for: 'session_start',
    base_project_revision: 9,
    items: [
      { entity_id: 'prj_mcs', revision: 9, role: 'goal', text: '目标：在车辆位置预测存在误差时，提高有限预算下移动群智感知任务的完成率。', source_refs: [ua('act_create_project', '2026-09-01T02:00:00Z', '创建项目并填写目标')], validity_note: '当时的项目目标。' },
      { entity_id: 'dec_calib_method', revision: 1, role: 'decision', text: '已采用：使用温度缩放，温度参数只在验证划分上拟合。', source_refs: [ua('act_dec_calib_method', '2026-10-21T03:00:00Z', '选择温度缩放')], validity_note: '当时有效决定。' },
    ],
    excluded_items: [],
    token_budget: 4000,
    estimated_tokens: 410,
    token_measurement: 'estimated',
    snapshot_mode: 'current_valid',
    counterevidence_included: true,
    sha256: sha('ctx_calib@1'),
    history_basis: 'not_applicable',
    as_of_time: null,
    history_label: 'current_valid',
    reconstruction_note: '',
    generation: { mode: 'template', model_provider: null, model_id: null, prompt_template_id: 'ctx-session-start', template_version: '1.0.0-stage-a', input_sha256: sha('ctx_calib:inputs'), generated_at: '2026-10-29T01:00:00Z', processing_command_id: null },
  },
];
