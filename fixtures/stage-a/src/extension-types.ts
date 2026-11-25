// 阶段A样机扩展数据的类型。
// 这些内容是方案正文要求、但合同 v1.0.0 没有实体或接口的部分（见 docs/decisions/0002）。
// 它们只供样机使用，不是合同的一部分；进入阶段B之前必须通过合同修订（提升版本、迁移、测试）正式定义。

export type Ref = string;

/** 一段说明写作时依据的对象版本。对象之后有新版本，说明就标记为过时（方案 §5.6）。 */
export interface RevisionRef {
  entity_id: Ref;
  revision: number;
}

/**
 * 待关注事项在什么状态下仍然成立。条件不成立时，界面自动不再显示这条提醒；
 * 提醒是否还有效由项目状态计算，不依靠手工维护的列表。
 */
export type AttentionCheck =
  | { kind: 'decision_pending'; decision_id: Ref }
  | { kind: 'proposal_open'; proposal_id: Ref }
  | { kind: 'review_needed'; target_id: Ref }
  | { kind: 'claim_without_evidence'; claim_id: Ref }
  | { kind: 'artifact_not_local'; artifact_version_id: Ref }
  | { kind: 'capability_missing'; capability_id: Ref; capability: string };

export type AttentionKind = 'decision' | 'drift' | 'evidence_gap' | 'review' | 'source' | 'capability' | 'blocker';

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  title: string;
  /** 触发依据：哪条可核实的规则或状态产生了这条提醒。 */
  basis: string;
  refs: Ref[];
  affected: Ref[];
  suggested_action: string;
  /** 一句话说明，首页只显示这一句。 */
  short: string;
  action_label: string;
  /** 1 为最高。排序依据写在 priority_reason 中，不使用模型自报置信度。 */
  priority: number;
  priority_reason: string;
  target: string;
  /** 这条提醒在什么状态下仍然成立。 */
  open_while: AttentionCheck;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  /** 在正文中自动标出的写法；短符号（如 T）不自动匹配，避免把不同含义合并。 */
  match: string[];
  plain: string;
  formal: string | null;
  /** null 表示全项目适用。 */
  scope_branch_ids: Ref[] | null;
  scope_note: string;
  valid_from_project_revision: number;
  source: { entity_id: Ref; note: string };
  example: string | null;
}

export interface Activity {
  at: string;
  kind: 'user_message' | 'assistant_message' | 'tool' | 'run' | 'file' | 'system' | 'policy';
  text: string;
  observation_kind: 'observed' | 'reported' | 'inferred';
  precision: 'exact' | 'correlated' | 'unavailable';
  source: string;
}

export interface UnitDetail {
  kind_label: string;
  work_agreement: {
    question: string;
    allowed_scope: string[];
    expected_outputs: string[];
    check_method: string;
    /** null 表示用户未设置；界面显示“未设置”，不虚构额度。 */
    budget: string | null;
  };
  example: string | null;
  change_basis: { text: string; refs: Ref[] }[];
  method_layer: {
    inputs: string[];
    outputs: string[];
    steps: string[];
    comparison: { title: string; columns: string[]; rows: { label: string; cells: string[] }[] } | null;
  };
  implementation_layer: {
    formulas: { label: string; expression: string; variables: { symbol: string; meaning: string }[] }[];
    parameters: { name: string; value: string; source: string }[];
    pseudocode: string | null;
    file_changes: {
      artifact_version_id: Ref | null;
      path: string;
      summary: string;
      diff_excerpt: string | null;
      model_claim: string | null;
      conflict: string | null;
    }[];
    /** 关键陈述到实现版本的对应；artifact_version_id 为 null 表示尚未建立对应关系。 */
    mappings: { statement: string; artifact_version_id: Ref | null; locator: string | null }[];
  };
  activities: Activity[];
}

export type DimKey = 'problem' | 'assumptions' | 'support' | 'counter' | 'open' | 'cost' | 'interpretability' | 'decision';

export interface Comparison {
  question: string;
  dimension_labels: Record<DimKey, string>;
  /** dims 中的 null 显示为“未知”。 */
  routes: {
    branch_id: Ref;
    label: string;
    /** 卡片上只显示的几句话；null 显示为“未知”。 */
    card: { aim: string; evidence_for: string | null; evidence_against: string | null; completion: string | null; cost: '低' | '中' | '高'; status: string };
    /** 这张卡片写作时依据的对象版本。 */
    basis: RevisionRef[];
    dims: Record<DimKey, { text: string; refs: Ref[] } | null>;
  }[];
  groups: { id: string; label: string; comparable: boolean; note: string }[];
  metrics: {
    route_branch_id: Ref;
    metric: string;
    layer: '系统层' | '预测层';
    value: number | null;
    range: string | null;
    condition: string;
    definition: string;
    group_id: string;
    run_id: Ref | null;
  }[];
}

export interface ReliabilityCurve {
  id: string;
  title: string;
  evidence_id: Ref;
  split: string;
  series: { label: string; points: { predicted: number; observed: number; n: number }[] }[];
}

export interface StageAExtensions {
  extension_version: '0.1.0-stage-a';
  notice: string;
  /** 没有自然标题的对象（授权、会话、约束等）在界面上的简短名称。 */
  display_names: Record<Ref, string>;
  /** 路线在图上和标签里使用的短名称；没有时用路线全名。 */
  short_names: Record<Ref, string>;
  /**
   * 证据“限制主张的适用范围”，但既不支持也不反驳它（例如缺少对照，只能说明某个条件下结果仍不理想）。
   * 合同 v1.0.0 的证据关系只有支持与反驳，v1.1 需要正式补上（D-007）。
   */
  evidence_limits: { evidence_id: Ref; claim_id: Ref; note: string }[];
  /** 列表中显示的一句话说明（决定为什么要现在选、候选是什么、运行测了什么）。 */
  one_liners: Record<Ref, string>;
  /** 实验运行的关键结果，一句话。 */
  run_results: Record<Ref, string>;
  contract_gaps: { topic: string; spec_section: string; decision_record: string }[];
  viewer: { principal_id: Ref; display_name: string; last_visit_at: string; now: string };
  home: {
    /**
     * 首页的要点：问题、主线、已知、未知。每项一句话，并记下写作时依据的对象版本。
     * “正在做”不在这里：它由项目当前的焦点单元和执行会话算出。
     */
    summary: {
      question: string;
      mainline: { text: string; basis: RevisionRef[] };
      known: { text: string; detail: string; ref: Ref; basis: RevisionRef[] };
      unknown: { text: string; detail: string; ref: Ref; basis: RevisionRef[] };
    };
    brief_paragraphs: string[];
    changes_since_last_visit: { at: string; text: string; short: string; refs: Ref[] }[];
    biggest_uncertainty: { text: string; refs: Ref[] };
    recent_output_ids: Ref[];
  };
  connections: { harness_instance_id: Ref; label: string; last_sync_at: string; capture_scope: string; not_captured: string[] }[];
  attention_items: AttentionItem[];
  glossary: GlossaryEntry[];
  unit_details: Record<Ref, UnitDetail>;
  branch_notes: Record<Ref, { status_note: string; resume_condition: string | null; reusable_findings: string[] }>;
  comparison: Comparison;
  reliability_curves: ReliabilityCurve[];
  rule_checks: Record<Ref, { rule: string; detail: string; refs: Ref[] }[]>;
  test_materials: Record<Ref, { harness_summary: string; summary_note: string }>;
}
