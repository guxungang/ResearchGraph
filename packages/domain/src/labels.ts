// 状态的显示语义。每个状态同时给出文字、图标和语气；颜色只是辅助，不能单独承载含义（方案 §6.2、§6.7）。
// 关键区分（方案 §4.5）：审阅的 accepted 显示“审阅通过”，决策的 accepted 显示“采用方案”，二者不能合并为“已确认”。

export type Tone = 'neutral' | 'info' | 'positive' | 'caution' | 'negative' | 'muted';
export interface StateLabel {
  text: string;
  icon: string;
  tone: Tone;
  hint: string;
}

const L = (text: string, icon: string, tone: Tone, hint: string): StateLabel => ({ text, icon, tone, hint });

export const WORK_STATE: Record<string, StateLabel> = {
  planned: L('计划中', '○', 'neutral', '已定义问题，尚未开始。'),
  active: L('进行中', '●', 'info', '正在开展工作。'),
  blocked: L('被阻塞', '⛔', 'negative', '有明确的阻塞原因。'),
  paused: L('暂停', '‖', 'muted', '暂时停下，可恢复。'),
  finished: L('工作已结束', '■', 'neutral', '声明的工作范围已结束；不代表主张成立、审阅通过或已被理解。'),
  archived: L('已归档', '▫', 'muted', '不再日常显示，历史保留。'),
};

export const ASSESSMENT: Record<string, StateLabel> = {
  unassessed: L('未评估', '?', 'neutral', '还没有对这条主张作出评估。'),
  supported: L('有条件支持', '◐', 'positive', '在列出的条件下有证据支持；不等于绝对正确。'),
  contradicted: L('受到反证', '✕', 'negative', '有证据挑战这条主张。'),
  mixed: L('证据混合', '◑', 'caution', '同时存在支持与反证。'),
  inconclusive: L('证据不足', '…', 'neutral', '现有证据不足以判断。'),
  withdrawn: L('已撤回', '⌀', 'muted', '主张已撤回。'),
};

export const DECISION: Record<string, StateLabel> = {
  proposed: L('待决定', '◇', 'caution', '尚未作出选择。'),
  accepted: L('采用方案', '◆', 'info', '允许按该选择推进；不表示科学上已证明。'),
  rejected: L('未采用', '◇', 'muted', '选择了不采用。'),
  superseded: L('已被替代', '↷', 'muted', '只用于历史查询，不作为当前约束。'),
};

export const REVIEW: Record<string, StateLabel> = {
  unreviewed: L('未审阅', '○', 'neutral', '这个版本还没有人审阅。'),
  needs_changes: L('需要修改', '✎', 'caution', '审阅者要求修改。'),
  accepted: L('审阅通过', '✓', 'positive', '针对这一个版本的审阅；不授权执行，也不表示结论成立。'),
};

export const UNDERSTANDING: Record<string, StateLabel> = {
  not_reported: L('未报告理解情况', '·', 'muted', '只有你本人可以标记；打开页面不等于理解。'),
  needs_explanation: L('需要补背景', '?', 'caution', '你标记这个版本需要更多背景。'),
  self_reported_understood: L('本人标记已理解', '✓', 'neutral', '你本人标记的理解状态，不影响任何科学判断。'),
};

export const SESSION_STATE: Record<string, StateLabel> = {
  pending: L('等待开始', '○', 'neutral', '已建立绑定，尚未观测到开始事件。'),
  running: L('正在执行', '▶', 'info', '观测到的最近状态为运行中。'),
  interrupt_requested: L('等待停止回执', '⏸', 'caution', '已请求停止，尚未收到终态证据。'),
  interrupted: L('已中断', '■', 'muted', '收到了中断的终态回执。'),
  completed: L('会话已结束', '■', 'neutral', '会话结束；不代表研究单元完成。'),
  failed: L('会话失败', '✕', 'negative', '会话以失败结束。'),
  unknown: L('状态未知', '?', 'caution', '无法确认当前状态；显示最后可靠活动。'),
};

export const RUN_STATE: Record<string, StateLabel> = {
  queued: L('排队中', '○', 'neutral', '等待执行。'),
  running: L('运行中', '▶', 'info', '观测到的最近状态为运行中。'),
  succeeded: L('进程成功结束', '■', 'neutral', '只表示执行完成；不改变任何主张的状态。'),
  failed: L('执行失败', '✕', 'negative', '执行问题；不等于科学上的反证。'),
  cancel_requested: L('等待取消回执', '⏸', 'caution', '已请求取消，等待终态。'),
  cancelled: L('已取消', '■', 'muted', '收到取消终态。'),
  unknown: L('状态未知', '?', 'caution', '连接中断或没有终态证据；不等于失败。'),
};

export const PROPOSAL: Record<string, StateLabel> = {
  candidate: L('候选，未获准', '◇', 'caution', '提交不执行；未应用前不改变项目状态。'),
  ready: L('可应用，待人接受', '◇', 'info', '结构与来源检查已满足；不表示已被人接受。'),
  applied: L('已应用', '◆', 'neutral', '已有对应的应用事件。'),
  rejected: L('已拒绝', '✕', 'muted', '保留拒绝原因。'),
  stale: L('前提已变化', '↻', 'caution', '依赖的对象已变化，需要重建或重新核对。'),
};

export const BRANCH_STATE: Record<string, StateLabel> = {
  proposed: L('待开始', '◇', 'caution', '路线已建立，尚未开展。'),
  active: L('进行中', '●', 'info', '正在开展的路线。'),
  paused: L('暂缓', '‖', 'muted', '暂时停下，可按恢复条件重启。'),
  closed: L('已关闭', '▫', 'muted', '已关闭；保留原因、恢复条件与可复用发现。'),
};

export const SUPPORT: Record<string, StateLabel> = {
  supported: L('支持', '✓', 'positive', '已在实际连接上探测到。'),
  partial: L('部分支持', '◐', 'caution', '有限制，见说明。'),
  unsupported: L('不支持', '✕', 'muted', '当前连接不提供；相关控制会被禁用。'),
  unverified: L('未核验', '?', 'caution', '未探测或无法确认；视为不可用。'),
};

export const AVAILABILITY: Record<string, StateLabel> = {
  available: L('可获取', '■', 'neutral', '本地可读取，内容摘要已核验。'),
  partial: L('部分可获取', '◧', 'caution', '只有部分内容可读取。'),
  missing: L('缺失', '✕', 'negative', '原始文件不存在。'),
  external_unchecked: L('外部未核验', '?', 'caution', '只登记了位置或元数据，内容未在本地核验。'),
};

export const VERIFICATION: Record<string, StateLabel> = {
  not_checked: L('未核对来源', '○', 'caution', '还没有人对照原始来源核对。'),
  source_checked: L('已核对来源', '✓', 'neutral', '已对照原始来源；不等于支持任何主张。'),
  reproduced: L('已复现', '✓✓', 'positive', '结果已重新运行得到。'),
  disputed: L('有争议', '!', 'negative', '来源或结果存在争议。'),
};

export const PRECISION: Record<string, StateLabel> = {
  exact: L('精确定位', '⌖', 'neutral', '有稳定标识与内容摘要或认证操作。'),
  correlated: L('推断关联（待核）', '≈', 'caution', '只按时间或语义关联；不是确定的来源。'),
  unavailable: L('来源不可用', '✕', 'negative', '原始来源缺失。'),
};

export const OBSERVATION: Record<string, StateLabel> = {
  observed: L('直接观测', '◉', 'neutral', '直接采集的事件或原始文件。'),
  reported: L('他人陈述', '❝', 'caution', '某人（或模型）的陈述，不等于事实。'),
  inferred: L('推断', '≈', 'caution', '模型或规则的推断。'),
};

export const RESTORE: Record<string, StateLabel> = {
  ready: L('可完整恢复', '■', 'positive', '所有清单项可获取。'),
  partial: L('部分可恢复', '◧', 'caution', '有清单项缺失或未核验。'),
  knowledge_only: L('只能恢复认知状态', '◌', 'caution', '只能恢复决定、主张等认知记录。'),
};

export const PINNING: Record<string, StateLabel> = {
  content_verified: L('内容已核验', '⌖', 'neutral', '按实际字节计算了摘要。'),
  metadata_only: L('只有元数据', '?', 'caution', '没有读取字节；不能声称版本已固定。'),
  unknown: L('版本未知', '?', 'caution', '无法确认版本。'),
};

export const CAPTURE: Record<string, StateLabel> = {
  complete: L('记录完整', '■', 'neutral', '配置、环境等必需字段齐全。'),
  partial: L('记录不完整', '◧', 'caution', '有缺项，已列出。'),
  unknown: L('记录完整性未知', '?', 'caution', '无法判断。'),
};

export const RELATION: Record<string, string> = {
  continues_to: '探索派生',
  depends_on: '依赖',
  supports: '支持',
  contradicts: '挑战',
  supersedes: '替代',
  uses: '引用',
  produces: '产出',
  reorganizes_to: '整理为',
};

export const CURRENCY: Record<string, StateLabel> = {
  current: L('当前', '·', 'neutral', '两端修订与当前一致。'),
  needs_revalidation: L('需要重新核验', '↻', 'caution', '端点已产生新修订；旧关系不自动适用于新版本。'),
  historical: L('历史关系', '·', 'muted', '只用于历史查询。'),
};

export const label = (table: Record<string, StateLabel>, key: string | null | undefined): StateLabel =>
  (key && table[key]) || L(key ?? '未知', '?', 'neutral', '未定义的状态。');
