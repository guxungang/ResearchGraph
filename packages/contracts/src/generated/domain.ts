/* 自动生成，请勿手改。来源：packages/contracts/schema/domain.schema.json（合同 v1.0.0）。
   重新生成：npm run contracts:types */

/**
 * 原始来源定位。exact 必须有稳定ID与内容摘要或经鉴权的操作ID；correlated 仅表示关联推断，不能显示为精确原始证据。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "SourceLocator".
 */
export type SourceLocator =
  | {
      kind: 'message';
      precision: 'exact' | 'correlated' | 'unavailable';
      correlation_method: 'direct_id' | 'content_hash' | 'manual' | 'time_window' | 'semantic_match' | 'none';
      content_sha256: string | null;
      captured_at: string;
      description: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      source_instance_id: string;
      session_id: string;
      message_id: string;
      message_role: 'user' | 'assistant' | 'tool' | 'system';
      span: TextSpan | null;
    }
  | {
      kind: 'file';
      precision: 'exact' | 'correlated' | 'unavailable';
      correlation_method: 'direct_id' | 'content_hash' | 'manual' | 'time_window' | 'semantic_match' | 'none';
      content_sha256: string | null;
      captured_at: string;
      description: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      artifact_version_id: string;
      relative_path: string;
      page_number: number | null;
      section: string | null;
      span: TextSpan | null;
    }
  | {
      kind: 'web';
      precision: 'exact' | 'correlated' | 'unavailable';
      correlation_method: 'direct_id' | 'content_hash' | 'manual' | 'time_window' | 'semantic_match' | 'none';
      content_sha256: string | null;
      captured_at: string;
      description: string;
      url: string;
      title: string;
      accessed_at: string;
      section: string | null;
      archived_artifact_version_id: string | null;
      span: TextSpan | null;
    }
  | {
      kind: 'experiment';
      precision: 'exact' | 'correlated' | 'unavailable';
      correlation_method: 'direct_id' | 'content_hash' | 'manual' | 'time_window' | 'semantic_match' | 'none';
      content_sha256: string | null;
      captured_at: string;
      description: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      experiment_run_id: string;
      artifact_version_id: string | null;
      metric_name: string | null;
      /**
       * JSON Pointer、表格单元格或日志行等精确位置；无定位必须 precision=unavailable。
       */
      record_path: string;
    }
  | {
      kind: 'provider_event';
      precision: 'exact' | 'correlated' | 'unavailable';
      correlation_method: 'direct_id' | 'content_hash' | 'manual' | 'time_window' | 'semantic_match' | 'none';
      content_sha256: string | null;
      captured_at: string;
      description: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      source_instance_id: string;
      session_id: string;
      source_event_id: string;
      tool_call_id: string | null;
    }
  | {
      kind: 'user_action';
      precision: 'exact' | 'correlated' | 'unavailable';
      correlation_method: 'direct_id' | 'content_hash' | 'manual' | 'time_window' | 'semantic_match' | 'none';
      content_sha256: string | null;
      captured_at: string;
      description: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      action_id: string;
      ui_surface: string;
      request_id: string;
    };
/**
 * 具有独立科研问题和结果的工作单元。finished 只表示该单元工作结束，不代表主张已证实、用户已读懂或审阅通过。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ResearchUnit".
 */
export type ResearchUnit = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  branch_id: string;
  title: string;
  question: string;
  purpose: string;
  work_state: 'planned' | 'active' | 'blocked' | 'paused' | 'finished' | 'archived';
  /**
   * 由 continues_to 入边派生的只读投影；不作为第二套关系真源。
   *
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  parent_unit_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  claim_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  decision_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  artifact_version_ids: string[];
  /**
   * @minItems 0
   */
  acceptance_criteria: AcceptanceCriterion[];
  blocker: string | null;
  next_action: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  owner_principal_id: string;
  completion: UnitCompletion | null;
};
/**
 * 有类型关系。continues_to 从前驱单元指向后继；depends_on 从工作单元指向前提；supports/contradicts 从Evidence指向Claim；supersedes 从新Decision指向旧Decision；uses 从单元指向资料或决策；produces 从单元指向成果。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "GraphEdge".
 */
export type GraphEdge = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  source_id: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  target_id: string;
  relation:
    'continues_to' | 'depends_on' | 'supports' | 'contradicts' | 'supersedes' | 'uses' | 'produces' | 'reorganizes_to';
  branch_id: string | null;
  rationale: string;
  state: 'active' | 'superseded';
  /**
   * 建立关系时明确引用的源实体修订。
   */
  source_revision: number;
  /**
   * 建立关系时明确引用的目标实体修订。
   */
  target_revision: number;
  binding_semantics: 'identity_lineage' | 'exact_revision';
  /**
   * 精确修订关系的端点更新时显示needs_revalidation，不自动继承为新修订的有效证据。谱系关系保留历史身份关联。
   */
  currency: 'current' | 'needs_revalidation' | 'historical';
};
/**
 * 科学主张、假设或建模前提。状态不能从进程退出码、节点完成或用户点击阅读自动推导。修改关键假设需有效 grant。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Claim".
 */
export type Claim = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  text: string;
  claim_kind: 'hypothesis' | 'finding' | 'assumption' | 'paper_claim';
  assessment: 'unassessed' | 'supported' | 'contradicted' | 'mixed' | 'inconclusive' | 'withdrawn';
  /**
   * 适用数据、模型、实验条件和不确定性边界。
   */
  conditions: string;
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  assessed_by_review_ids: string[];
  supersedes_claim_id: string | null;
  /**
   * @minItems 1
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  branch_ids: [string, ...string[]];
};
/**
 * 当前选择及历史依据。accepted 必须有存在且覆盖对应动作和范围的有效授权；AI建议和导入历史不能自行升级为当前用户批准。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Decision".
 */
export type Decision = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  question: string;
  /**
   * @minItems 1
   */
  options: [DecisionOption, ...DecisionOption[]];
  status: 'proposed' | 'accepted' | 'rejected' | 'superseded';
  accepted_option_id: string | null;
  rationale: string;
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_ids: string[];
  /**
   * @minItems 1
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  branch_ids: [string, ...string[]];
  authorized_by_grant_id: string | null;
  acceptance_source: SourceLocator | null;
  superseded_by_decision_id: string | null;
  reconsider_when: string;
  authorization_grant_revision: number | null;
  accepted_at: string | null;
};
/**
 * 不可变成果版本。内容改变需新建ArtifactVersion；不能原地替换hash。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ArtifactVersion".
 */
export type ArtifactVersion = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  logical_artifact_id: string;
  title: string;
  media_type: string;
  version_label: string;
  storage_ref: AssetRef;
  sha256: string | null;
  byte_size: number | null;
  availability: 'available' | 'missing' | 'external_unchecked';
  previous_version_id: string | null;
  produced_by_unit_id: string | null;
  /**
   * 外部引用尚未取得字节时不能伪造hash；此时只能metadata_only或unknown，不宣称内容版本已固定。
   */
  version_pinning: 'content_verified' | 'metadata_only' | 'unknown';
};
/**
 * 单次实际运行。succeeded 表示进程成功结束，不自动通过科学审查；远端断连使用unknown，取消请求等待终态。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ExperimentRun".
 */
export type ExperimentRun = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  unit_id: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  branch_id: string;
  run_state: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancel_requested' | 'cancelled' | 'unknown';
  command_display: string;
  code_commit: string | null;
  config_artifact_version_id: string | null;
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  dataset_artifact_version_ids: string[];
  environment_artifact_version_id: string | null;
  /**
   * @minItems 0
   */
  random_seeds: number[];
  comparison_group_id: string | null;
  external_job_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  last_observed_at: string;
  exit_code: number | null;
  /**
   * @minItems 0
   */
  metrics: Metric[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  output_artifact_version_ids: string[];
  source_locator: SourceLocator;
  capture_completeness: 'complete' | 'partial' | 'unknown';
  /**
   * @minItems 0
   */
  missing_fields: string[];
};
/**
 * v1允许的业务变更命令；不存在任意SQL、任意JSONPatch或伪造actor的接口。新增命令必须新版本且保持权限与状态不变量。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "DomainCommand".
 */
export type DomainCommand =
  | {
      kind: 'update_goal';
      goal: string;
      problem_statement: string;
      reason: string;
    }
  | {
      kind: 'create_research_unit';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      branch_id: string;
      title: string;
      question: string;
      purpose: string;
      /**
       * @minItems 0
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      parent_unit_ids: string[];
      /**
       * @minItems 0
       */
      acceptance_criteria: AcceptanceCriterion[];
    }
  | {
      kind: 'update_work_state';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      unit_id: string;
      new_state: 'planned' | 'active' | 'blocked' | 'paused' | 'finished' | 'archived';
      reason: string;
      completion: UnitCompletion | null;
    }
  | {
      kind: 'assess_claim';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      claim_id: string;
      assessment: 'unassessed' | 'supported' | 'contradicted' | 'mixed' | 'inconclusive' | 'withdrawn';
      conditions: string;
      /**
       * @minItems 0
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      evidence_ids: string[];
      /**
       * @minItems 0
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      review_ids: string[];
      reason: string;
    }
  | {
      kind: 'change_assumption';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      claim_id: string;
      new_text: string;
      conditions: string;
      /**
       * @minItems 0
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      evidence_ids: string[];
      reason: string;
    }
  | {
      kind: 'propose_decision';
      question: string;
      /**
       * @minItems 1
       */
      options: [DecisionOption, ...DecisionOption[]];
      /**
       * @minItems 1
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      branch_ids: [string, ...string[]];
      /**
       * @minItems 0
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      evidence_ids: string[];
      rationale: string;
    }
  | {
      kind: 'decide_decision';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      decision_id: string;
      status: 'accepted' | 'rejected';
      accepted_option_id: string | null;
      reason: string;
    }
  | {
      kind: 'supersede_decision';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      decision_id: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      replacement_decision_id: string;
      reason: string;
    }
  | {
      kind: 'change_main_branch';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      new_branch_id: string;
      reason: string;
    }
  | {
      kind: 'attach_evidence';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      unit_id: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      evidence_id: string;
      claim_id: string | null;
      relation: 'reference' | 'supports' | 'contradicts';
      reason: string;
    }
  | {
      kind: 'link_units';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      source_unit_id: string;
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      target_unit_id: string;
      relation: 'continues_to' | 'depends_on';
      reason: string;
    }
  | {
      kind: 'archive_branch';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      branch_id: string;
      reason: string;
    }
  | {
      kind: 'revise_research_unit';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      unit_id: string;
      title: string;
      question: string;
      purpose: string;
      /**
       * @minItems 0
       */
      acceptance_criteria: AcceptanceCriterion[];
      next_action: string;
      reason: string;
    }
  | {
      kind: 'create_claim';
      text: string;
      claim_kind: 'hypothesis' | 'finding' | 'assumption' | 'paper_claim';
      conditions: string;
      /**
       * @minItems 1
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      branch_ids: [string, ...string[]];
      /**
       * @minItems 1
       */
      source_refs: [SourceLocator, ...SourceLocator[]];
    }
  | {
      kind: 'revise_claim';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      claim_id: string;
      text: string;
      conditions: string;
      reason: string;
    }
  | {
      kind: 'create_evidence';
      title: string;
      evidence_kind:
        'paper' | 'experiment_result' | 'code_inspection' | 'derivation' | 'dataset' | 'test_result' | 'user_statement';
      statement: string;
      source_locator: SourceLocator;
      /**
       * @minItems 0
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      artifact_version_ids: string[];
      experiment_run_id: string | null;
      scope: string;
      limitations: string;
    }
  | {
      kind: 'revise_evidence';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      evidence_id: string;
      title: string;
      evidence_kind:
        'paper' | 'experiment_result' | 'code_inspection' | 'derivation' | 'dataset' | 'test_result' | 'user_statement';
      statement: string;
      source_locator: SourceLocator;
      /**
       * @minItems 0
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      artifact_version_ids: string[];
      experiment_run_id: string | null;
      scope: string;
      limitations: string;
      reason: string;
    }
  | {
      kind: 'split_research_unit';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      unit_id: string;
      /**
       * @minItems 2
       * @maxItems 20
       */
      parts:
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ]
        | [
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            },
            {
              title: string;
              question: string;
              purpose: string;
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              claim_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              decision_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              evidence_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              artifact_version_ids: string[];
              /**
               * @minItems 0
               *
               * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
               */
              source_event_ids: string[];
              /**
               * @minItems 0
               */
              acceptance_criteria: AcceptanceCriterion[];
            }
          ];
      reason: string;
    }
  | {
      kind: 'merge_research_units';
      /**
       * @minItems 2
       * @maxItems 20
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      unit_ids:
        | [string, string]
        | [string, string, string]
        | [string, string, string, string]
        | [string, string, string, string, string]
        | [string, string, string, string, string, string]
        | [string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string, string, string, string]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ];
      merged_unit: {
        title: string;
        question: string;
        purpose: string;
        /**
         * @minItems 0
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        claim_ids: string[];
        /**
         * @minItems 0
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        decision_ids: string[];
        /**
         * @minItems 0
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        evidence_ids: string[];
        /**
         * @minItems 0
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        artifact_version_ids: string[];
        /**
         * @minItems 0
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        source_event_ids: string[];
        /**
         * @minItems 0
         */
        acceptance_criteria: AcceptanceCriterion[];
      };
      reason: string;
    }
  | {
      kind: 'merge_branches_selectively';
      /**
       * @minItems 2
       * @maxItems 20
       *
       * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      source_branch_ids:
        | [string, string]
        | [string, string, string]
        | [string, string, string, string]
        | [string, string, string, string, string]
        | [string, string, string, string, string, string]
        | [string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string, string, string]
        | [string, string, string, string, string, string, string, string, string, string, string, string, string]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ]
        | [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
          ];
      new_branch_name: string;
      purpose: string;
      /**
       * @minItems 1
       */
      selected_entity_refs: [RevisionRef, ...RevisionRef[]];
      /**
       * @minItems 0
       */
      decision_resolutions: {
        /**
         * @minItems 2
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        conflicting_decision_ids: [string, string, ...string[]];
        selected_decision_id: string | null;
        rationale: string;
      }[];
      reason: string;
    }
  | {
      kind: 'correct_graph_edge';
      /**
       * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
       */
      edge_id: string;
      source_ref: RevisionRef;
      target_ref: RevisionRef;
      relation:
        | 'continues_to'
        | 'depends_on'
        | 'supports'
        | 'contradicts'
        | 'supersedes'
        | 'uses'
        | 'produces'
        | 'reorganizes_to';
      branch_id: string | null;
      reason: string;
    };
/**
 * 活跃执行绑定不可因UI选中另一节点而改变。旧turn迟到事件仍归旧绑定；redirect通过新绑定实现。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "SessionBinding".
 */
export type SessionBinding = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  connection_mode: 'archive' | 'sidecar' | 'managed';
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  harness_instance_id: string;
  provider_session_id: string;
  provider_turn_id: string | null;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  unit_id: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  branch_id: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  context_bundle_id: string;
  worktree_ref: string | null;
  base_project_revision: number;
  binding_revision: number;
  state: 'pending' | 'running' | 'interrupt_requested' | 'interrupted' | 'completed' | 'failed' | 'unknown';
  last_observed_at: string;
  coverage: 'complete_for_declared_scope' | 'partial' | 'unknown';
  coverage_note: string;
  interrupt_request_id: string | null;
  interrupt_confirmed_at: string | null;
};
/**
 * 一次已构建的不可变上下文包。历史重建与当前有效知识分开，后来反证不能因回退默认删除。记录实际送入版本而非声称模型已理解。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ContextBundle".
 */
export type ContextBundle = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  branch_id: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  unit_id: string;
  branch_context_revision: number;
  built_for: 'session_start' | 'user_prompt' | 'after_compaction' | 'manual_handoff';
  base_project_revision: number;
  /**
   * @minItems 1
   */
  items: [ContextItem, ...ContextItem[]];
  /**
   * @minItems 0
   */
  excluded_items: {
    /**
     * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
     */
    entity_id: string;
    reason: string;
  }[];
  token_budget: number;
  estimated_tokens: number;
  token_measurement: 'provider_counted' | 'estimated';
  snapshot_mode: 'current_valid' | 'historical_reconstruction';
  counterevidence_included: boolean;
  /**
   * SHA-256 十六进制摘要。
   */
  sha256: string;
  history_basis: 'not_applicable' | 'recorded_at' | 'source_occurred_at';
  as_of_time: string | null;
  history_label: 'current_valid' | 'recorded_history' | 'reconstructed_history';
  reconstruction_note: string;
  generation: GenerationInfo;
};
/**
 * 服务端验证的用户授权。首次授权之后在范围内复用，避免重复询问；不能由代理自行创建或扩大。权限范围不覆盖操作系统或上游平台禁令。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Grant".
 */
export type Grant = {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  status: 'active' | 'revoked' | 'expired';
  /**
   * @minItems 1
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  subject_principal_ids: [string, ...string[]];
  /**
   * @minItems 1
   */
  actions: [
    (
      | 'goal.change'
      | 'assumption.change'
      | 'decision.accept'
      | 'decision.reject'
      | 'decision.supersede'
      | 'branch.promote'
      | 'branch.create'
      | 'branch.archive'
      | 'branch.merge'
      | 'unit.create'
      | 'unit.update'
      | 'unit.revise'
      | 'unit.reorganize'
      | 'claim.create'
      | 'claim.revise'
      | 'claim.assess'
      | 'evidence.create'
      | 'evidence.revise'
      | 'evidence.attach'
      | 'artifact.register'
      | 'graph.link'
      | 'graph.correct'
      | 'checkpoint.create'
      | 'session.start'
      | 'session.interrupt'
      | 'review.record'
    ),
    ...(
      | 'goal.change'
      | 'assumption.change'
      | 'decision.accept'
      | 'decision.reject'
      | 'decision.supersede'
      | 'branch.promote'
      | 'branch.create'
      | 'branch.archive'
      | 'branch.merge'
      | 'unit.create'
      | 'unit.update'
      | 'unit.revise'
      | 'unit.reorganize'
      | 'claim.create'
      | 'claim.revise'
      | 'claim.assess'
      | 'evidence.create'
      | 'evidence.revise'
      | 'evidence.attach'
      | 'artifact.register'
      | 'graph.link'
      | 'graph.correct'
      | 'checkpoint.create'
      | 'session.start'
      | 'session.interrupt'
      | 'review.record'
    )[]
  ];
  scope:
    | {
        kind: 'project';
        /**
         * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        project_id: string;
      }
    | {
        kind: 'branches';
        /**
         * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        project_id: string;
        /**
         * @minItems 1
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        branch_ids: [string, ...string[]];
      }
    | {
        kind: 'units';
        /**
         * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        project_id: string;
        /**
         * @minItems 1
         *
         * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        unit_ids: [string, ...string[]];
      }
    | {
        kind: 'proposal';
        /**
         * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        project_id: string;
        /**
         * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
         */
        proposal_id: string;
        proposal_revision: number;
      };
  issued_by: ActorRef;
  authorization_source: SourceLocator;
  expires_at: string | null;
  max_cost_usd: number | null;
  revoked_at: string | null;
  reason: string;
  /**
   * human_only由人发起应用；policy_within_scope由确定性内部服务应用授权范围内常规变化；policy_exact_proposal只应用用户明确绑定版本的提案。任何模式均不开放模型apply权限。
   */
  application_policy: 'human_only' | 'policy_within_scope' | 'policy_exact_proposal';
};
/**
 * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Identifier".
 */
export type Identifier = string;

/**
 * v1项目只读交换快照；示例文件仅含虚构资料。数据库事件表为运行真源，导出JSON/Markdown不直接回写。只有event_history_scope=complete的导出才声称提供完整可重放事件。
 */
export interface ProjectSnapshot {
  schema_version: '1.0.0';
  export_kind: 'project_snapshot';
  exported_at: string;
  example_notice: string | null;
  event_history_scope: 'complete' | 'excerpt' | 'none';
  last_event_seq: number;
  project: Project;
  /**
   * @minItems 0
   */
  branches: Branch[];
  /**
   * @minItems 0
   */
  research_units: ResearchUnit[];
  /**
   * @minItems 0
   */
  graph_edges: GraphEdge[];
  /**
   * @minItems 0
   */
  claims: Claim[];
  /**
   * @minItems 0
   */
  evidence: Evidence[];
  /**
   * @minItems 0
   */
  decisions: Decision[];
  /**
   * @minItems 0
   */
  artifact_versions: ArtifactVersion[];
  /**
   * @minItems 0
   */
  experiment_runs: ExperimentRun[];
  /**
   * @minItems 0
   */
  checkpoints: Checkpoint[];
  /**
   * @minItems 0
   */
  proposals: Proposal[];
  /**
   * @minItems 0
   */
  reviews: ReviewRecord[];
  /**
   * @minItems 0
   */
  session_bindings: SessionBinding[];
  /**
   * @minItems 0
   */
  capability_manifests: CapabilityManifest[];
  /**
   * @minItems 0
   */
  context_bundles: ContextBundle[];
  /**
   * @minItems 0
   */
  reading_briefs: ReadingBrief[];
  /**
   * @minItems 0
   */
  grants: Grant[];
  /**
   * @minItems 0
   */
  events: Event[];
}
/**
 * 项目研究边界。project_id 必须等于 id。revision 同时作为所有项目命令的乐观并发版本。Goal 是字段，不另建图节点实体。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Project".
 */
export interface Project {
  id: string;
  /**
   * 有效研究状态或授权变化时递增的项目语义版本；原始日志、运行心跳、候选提案和派生解释不会推进该版本。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  name: string;
  /**
   * 项目最终研究目标；重大变更须具有有效授权。
   */
  goal: string;
  problem_statement: string;
  /**
   * @minItems 0
   */
  in_scope: string[];
  /**
   * @minItems 0
   */
  out_of_scope: string[];
  /**
   * @minItems 0
   */
  constraints: {
    /**
     * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
     */
    id: string;
    text: string;
    source_ref: SourceLocator;
  }[];
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  main_branch_id: string;
  focus_unit_id: string | null;
  status: 'active' | 'paused' | 'archived';
  language: string;
  timezone: string;
}
/**
 * 知识适用时间的半开区间 [from,to)；null 表示未知或无界，不等于没有限制。to 非空时必须晚于 from。记录时间另存 created_at/recorded_at。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ValidTime".
 */
export interface ValidTime {
  from: string | null;
  to: string | null;
}
/**
 * observed 是直接采集事件或原始文件，reported 是他人陈述，inferred 是模型或规则推断；这些分类均不自动证明科学结论正确。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Provenance".
 */
export interface Provenance {
  observation_kind: 'observed' | 'reported' | 'inferred';
  /**
   * @minItems 1
   */
  source_refs: [SourceLocator, ...SourceLocator[]];
  created_by: ActorRef;
  derivation_note: string;
}
/**
 * end 必须大于 start。必须同时绑定精确内容 hash，避免改版后定位漂移。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "TextSpan".
 */
export interface TextSpan {
  /**
   * UTF-8 解码后的 Unicode code point 偏移，包含。
   */
  start: number;
  /**
   * 同一文本中的 code point 偏移，不包含。
   */
  end: number;
}
/**
 * 仅服务端根据已认证会话、适配器身份与授权生成。请求体不得提交或修改本对象。导入记录不能据此冒充当前人的批准。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ActorRef".
 */
export interface ActorRef {
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  principal_id: string;
  kind: 'human' | 'agent' | 'service' | 'importer';
  authentication_ref: string;
  grant_id: string | null;
}
/**
 * 研究路线及其有效上下文。创建代码工作区为可选操作，研究分支不与Git分支强制一一对应。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Branch".
 */
export interface Branch {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  name: string;
  purpose: string;
  state: 'proposed' | 'active' | 'paused' | 'closed';
  derived_from_branch_id: string | null;
  base_unit_id: string | null;
  base_checkpoint_id: string | null;
  context_revision: number;
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  effective_decision_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  open_claim_ids: string[];
  closure_reason: string | null;
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "AcceptanceCriterion".
 */
export interface AcceptanceCriterion {
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  id: string;
  description: string;
  required_evidence_kind: 'source' | 'experiment' | 'artifact' | 'human_review' | 'automated_check';
  mandatory: boolean;
}
/**
 * criteria_satisfied需核对该单元所有强制完成条件；closed_with_limitations必须明确停止理由与未完成部分，不宣称已验证。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "UnitCompletion".
 */
export interface UnitCompletion {
  kind: 'criteria_satisfied' | 'closed_with_limitations';
  basis: string;
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  review_ids: string[];
  completed_at: string;
}
/**
 * 带可追溯来源的证据。source_checked 仅表示来源核对，不等于支持任意主张。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Evidence".
 */
export interface Evidence {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  title: string;
  evidence_kind:
    'paper' | 'experiment_result' | 'code_inspection' | 'derivation' | 'dataset' | 'test_result' | 'user_statement';
  statement: string;
  source_locator: SourceLocator;
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  artifact_version_ids: string[];
  experiment_run_id: string | null;
  scope: string;
  limitations: string;
  availability: 'available' | 'partial' | 'missing' | 'external_unchecked';
  verification_status: 'not_checked' | 'source_checked' | 'reproduced' | 'disputed';
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "DecisionOption".
 */
export interface DecisionOption {
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  id: string;
  label: string;
  description: string;
  expected_benefit: string;
  cost_and_risk: string;
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_ids: string[];
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "AssetRef".
 */
export interface AssetRef {
  kind: 'local' | 'external' | 'content_addressed';
  /**
   * 不可含认证令牌或签名下载凭证；本地采用受管理目录内相对路径或别名。
   */
  location: string;
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Metric".
 */
export interface Metric {
  name: string;
  value: number;
  unit: string;
  split: string;
  aggregation: string;
  sample_count: number | null;
  direction: 'higher_better' | 'lower_better' | 'descriptive';
}
/**
 * 不可变认知和文件清单快照。恢复默认建立新分支，保留后续反证；缺文件必须显示partial或knowledge_only。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Checkpoint".
 */
export interface Checkpoint {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  title: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  branch_id: string;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  unit_id: string;
  project_revision: number;
  branch_context_revision: number;
  /**
   * @minItems 1
   */
  entity_revision_refs: [RevisionRef, ...RevisionRef[]];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  effective_decision_ids: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  known_claim_ids: string[];
  /**
   * @minItems 0
   */
  file_manifest: CheckpointFile[];
  git_snapshot: {
    repository_alias: string | null;
    commit_sha: string | null;
    dirty_patch_artifact_version_id: string | null;
    /**
     * @minItems 0
     *
     * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
     */
    untracked_artifact_version_ids: string[];
  };
  restore_readiness: 'ready' | 'partial' | 'knowledge_only';
  /**
   * @minItems 0
   */
  limitations: string[];
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "RevisionRef".
 */
export interface RevisionRef {
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  entity_id: string;
  revision: number;
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "CheckpointFile".
 */
export interface CheckpointFile {
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  artifact_version_id: string;
  relative_path: string;
  sha256: string | null;
  restore_role: 'source' | 'document' | 'config' | 'environment' | 'data' | 'output' | 'untracked';
  availability: 'available' | 'missing' | 'external_unchecked';
}
/**
 * 模型、规则和人均可提出。提交不执行。HTTP apply仅允许鉴权的人类请求；内部确定性策略服务可在既有有效Grant内应用，模型不能取得该入口。授权与版本校验在服务器执行。target_revision_refs集中保存本批命令涉及的目标与依赖读集，不由每条命令重复提供；服务端检查读集完整性。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Proposal".
 */
export interface Proposal {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  title: string;
  summary: string;
  status: 'candidate' | 'ready' | 'applied' | 'rejected' | 'stale';
  base_project_revision: number;
  /**
   * @minItems 0
   */
  target_revision_refs: RevisionRef[];
  /**
   * @minItems 1
   */
  commands: [DomainCommand, ...DomainCommand[]];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_ids: string[];
  expected_impact: string;
  risk_and_uncertainty: string;
  /**
   * @minItems 0
   */
  requested_grant_actions: string[];
  created_by: ActorRef;
  applied_by_event_id: string | null;
}
/**
 * 审阅针对精确版本；is_current由当前实体版本计算。打开页面、采纳建议或运行结束都不自动产生accepted/understood。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ReviewRecord".
 */
export interface ReviewRecord {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  target_id: string;
  reviewed_revision: number;
  review_kind: 'user_review' | 'scientific_review' | 'implementation_review' | 'automated_check';
  status: 'unreviewed' | 'needs_changes' | 'accepted';
  reviewer: ActorRef;
  understanding_status: 'not_reported' | 'needs_explanation' | 'self_reported_understood';
  /**
   * @minItems 0
   */
  findings: string[];
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_ids: string[];
  is_current: boolean;
  /**
   * @minItems 0
   */
  source_revision_refs: RevisionRef[];
}
/**
 * 功能声明基于实际版本、连接与可复现探测；不可由品牌推定能力。未探测的功能必须unverified。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "CapabilityManifest".
 */
export interface CapabilityManifest {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  harness_instance_id: string;
  provider: 'codex' | 'claude_code' | 'generic_import';
  surface: 'cli' | 'desktop' | 'ide' | 'app_server' | 'agent_sdk' | 'import';
  provider_version: string;
  adapter_version: string;
  protocol_version: string;
  connection_mode: 'archive' | 'sidecar' | 'managed';
  status: 'connected' | 'disconnected' | 'degraded' | 'unverified';
  capabilities: {
    readHistory: CapabilityValue;
    observeMessages: CapabilityValue;
    observeTools: CapabilityValue;
    injectAtSessionStart: CapabilityValue;
    injectAtUserPrompt: CapabilityValue;
    injectAfterCompaction: CapabilityValue;
    createSession: CapabilityValue;
    resumeSession: CapabilityValue;
    forkSession: CapabilityValue;
    steerTurn: CapabilityValue;
    interruptTurn: CapabilityValue;
    mediateToolApproval: CapabilityValue;
    checkpointFiles: CapabilityValue;
  };
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "CapabilityValue".
 */
export interface CapabilityValue {
  support: 'supported' | 'partial' | 'unsupported' | 'unverified';
  scope: string;
  /**
   * @minItems 0
   */
  limitations: string[];
  /**
   * @minItems 0
   */
  evidence_urls: string[];
  probed_at: string | null;
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ContextItem".
 */
export interface ContextItem {
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  entity_id: string;
  revision: number;
  role: 'goal' | 'constraint' | 'decision' | 'evidence' | 'question' | 'recent_state' | 'counterevidence';
  text: string;
  /**
   * @minItems 1
   */
  source_refs: [SourceLocator, ...SourceLocator[]];
  validity_note: string;
}
/**
 * 派生内容的生成环境。模型字段由执行服务写入，不由模型自由文本填造；人工或模板模式允许为null。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "GenerationInfo".
 */
export interface GenerationInfo {
  mode: 'template' | 'model' | 'human';
  model_provider: string | null;
  model_id: string | null;
  prompt_template_id: string | null;
  template_version: string;
  /**
   * SHA-256 十六进制摘要。
   */
  input_sha256: string;
  generated_at: string;
  processing_command_id: string | null;
}
/**
 * 可独立阅读的解释层，补足背景和术语。不得用短摘要替代原始证据；结构检查通过不等于人类已经理解。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "ReadingBrief".
 */
export interface ReadingBrief {
  id: string;
  /**
   * 实体版本，从1开始；对业务内容修改递增。
   */
  revision: number;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  created_at: string;
  updated_at: string;
  valid_time: ValidTime;
  provenance: Provenance;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  unit_id: string;
  audience: 'general_researcher' | 'domain_familiar' | 'implementation_familiar';
  /**
   * @minItems 1
   */
  source_revision_refs: [RevisionRef, ...RevisionRef[]];
  title: string;
  project_background: string;
  why_this_work: string;
  current_question: string;
  /**
   * @minItems 0
   */
  prerequisites: {
    term: string;
    plain_explanation: string;
    why_needed: string;
  }[];
  method_explanation: string;
  /**
   * @minItems 0
   * @maxItems 3
   */
  key_findings: [] | [string] | [string, string] | [string, string, string];
  /**
   * @minItems 0
   */
  not_yet_established: string[];
  /**
   * @minItems 0
   */
  implementation_changes: {
    what_changed: string;
    why: string;
    /**
     * @minItems 0
     *
     * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
     */
    artifact_version_ids: string[];
  }[];
  project_impact: string;
  recommended_next_step: string;
  decision_request: {
    question: string;
    /**
     * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
     */
    proposal_id: string;
    /**
     * @minItems 2
     */
    options: [string, string, ...string[]];
  } | null;
  /**
   * @minItems 0
   */
  evidence_links: BriefEvidenceLink[];
  /**
   * @minItems 0
   */
  limitations: string[];
  readability_checks: {
    /**
     * @minItems 0
     */
    unexplained_terms: string[];
    /**
     * @minItems 0
     */
    unresolved_references: string[];
    /**
     * @minItems 0
     */
    source_gaps: string[];
    status: 'pass' | 'needs_revision' | 'not_checked';
  };
  generation: GenerationInfo;
}
/**
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "BriefEvidenceLink".
 */
export interface BriefEvidenceLink {
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  evidence_id: string;
  label: string;
  relationship: 'supports' | 'contradicts' | 'background' | 'limitation';
  source_locator: SourceLocator;
}
/**
 * SQLite events表中的追加事件。actor、序号、记录时间由服务端生成。revision恒为1；纠正通过新事件。不允许任意客户端写入权威事件。跨来源event_seq仅表示本系统提交顺序。 payload.after_entities保存本事务改变的完整实体修订，支持确定性重建投影；不得只记录摘要。project_revision_after在原始采集和派生记录事件上可保持相同。
 *
 * This interface was referenced by `ProjectSnapshot`'s JSON-Schema
 * via the `definition` "Event".
 */
export interface Event {
  id: string;
  revision: 1;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  project_id: string;
  schema_version: '1.0.0';
  event_seq: number;
  /**
   * 事件提交后的项目语义版本；多个非语义事件可以保持相同值。event_seq仍对每次成功追加单调递增。
   */
  project_revision_after: number;
  event_type:
    | 'project.created'
    | 'project.changed'
    | 'unit.created'
    | 'unit.changed'
    | 'branch.created'
    | 'branch.changed'
    | 'claim.changed'
    | 'evidence.registered'
    | 'decision.proposed'
    | 'decision.accepted'
    | 'decision.rejected'
    | 'decision.superseded'
    | 'artifact.registered'
    | 'experiment.observed'
    | 'checkpoint.created'
    | 'proposal.submitted'
    | 'proposal.applied'
    | 'proposal.rejected'
    | 'review.recorded'
    | 'session.bound'
    | 'session.started'
    | 'session.interrupt_requested'
    | 'session.ended'
    | 'session.observed'
    | 'capability.probed'
    | 'context.built'
    | 'brief.created'
    | 'grant.issued'
    | 'grant.revoked'
    | 'source.ingested'
    | 'relationship.changed'
    | 'record.corrected';
  actor: ActorRef;
  occurred_at: string;
  recorded_at: string;
  valid_time: ValidTime;
  observation_kind: 'observed' | 'reported' | 'inferred';
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  source_instance_id: string;
  source_event_id: string;
  source_sequence: number | null;
  /**
   * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  correlation_id: string;
  correlation_quality: 'exact' | 'correlated' | 'unknown';
  /**
   * @minItems 0
   *
   * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
   */
  causation_event_ids: string[];
  idempotency_key: string;
  source_locator: SourceLocator;
  /**
   * SHA-256 十六进制摘要。
   */
  payload_sha256: string;
  payload: {
    /**
     * 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
     */
    subject_id: string;
    subject_kind: string;
    subject_revision: number;
    summary: string;
    command: DomainCommand | null;
    /**
     * @minItems 0
     *
     * Items: 稳定且项目内唯一的可读前缀标识；重命名不改变标识。
     */
    related_entity_ids: string[];
    /**
     * @minItems 0
     */
    before_revision_refs: RevisionRef[];
    /**
     * @minItems 0
     */
    after_entities: (
      | Project
      | Branch
      | ResearchUnit
      | GraphEdge
      | Claim
      | Evidence
      | Decision
      | ArtifactVersion
      | ExperimentRun
      | Checkpoint
      | Proposal
      | ReviewRecord
      | SessionBinding
      | CapabilityManifest
      | ContextBundle
      | ReadingBrief
      | Grant
    )[];
    raw_source_artifact_version_id: string | null;
  };
}
