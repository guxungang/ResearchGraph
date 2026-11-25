// 阶段A夹具的构造工具。所有内容均为虚构，只用于验证数据结构、阅读体验与审阅语义。
import { createHash } from 'node:crypto';

export const PROJECT_ID = 'prj_mcs';
export const DERIVATION_NOTE = '阶段A虚构夹具：不代表任何真实项目、实验结果或有效授权。';

export const sha = (text: string): string => createHash('sha256').update(text).digest('hex');
export const fakeCommit = (seed: string): string => sha(`commit:${seed}`).slice(0, 40);

export type Actor = {
  principal_id: string;
  kind: 'human' | 'agent' | 'service' | 'importer';
  authentication_ref: string;
  grant_id: string | null;
};

export const actor = {
  owner: (grant: string | null = null): Actor => ({
    principal_id: 'usr_owner',
    kind: 'human',
    authentication_ref: 'auth_local_session',
    grant_id: grant,
  }),
  codex: (): Actor => ({
    principal_id: 'agt_codex_sidecar',
    kind: 'agent',
    authentication_ref: 'auth_adapter_codex_cli',
    grant_id: null,
  }),
  policy: (grant: string): Actor => ({
    principal_id: 'svc_policy',
    kind: 'service',
    authentication_ref: 'auth_internal_policy',
    grant_id: grant,
  }),
  adapter: (): Actor => ({
    principal_id: 'svc_adapter_codex',
    kind: 'service',
    authentication_ref: 'auth_adapter_codex_cli',
    grant_id: null,
  }),
  importer: (): Actor => ({
    principal_id: 'imp_claude_export',
    kind: 'importer',
    authentication_ref: 'auth_import_claude_export',
    grant_id: null,
  }),
  briefWriter: (): Actor => ({
    principal_id: 'svc_fixture_author',
    kind: 'service',
    authentication_ref: 'auth_fixture_build',
    grant_id: null,
  }),
};

// ---------- 来源定位 ----------
export const loc = {
  userAction: (actionId: string, at: string, description: string, surface = 'decision-card') => ({
    kind: 'user_action' as const,
    precision: 'exact' as const,
    correlation_method: 'direct_id' as const,
    content_sha256: null,
    captured_at: at,
    description,
    action_id: actionId,
    ui_surface: surface,
    request_id: `req-${actionId}`,
  }),
  message: (
    sessionId: string,
    messageId: string,
    role: 'user' | 'assistant' | 'tool' | 'system',
    at: string,
    description: string,
    text: string,
    sourceInstance = 'src_codex_cli',
  ) => ({
    kind: 'message' as const,
    precision: 'exact' as const,
    correlation_method: 'content_hash' as const,
    content_sha256: sha(text),
    captured_at: at,
    description,
    source_instance_id: sourceInstance,
    session_id: sessionId,
    message_id: messageId,
    message_role: role,
    span: null,
  }),
  file: (
    artifactVersionId: string,
    relativePath: string,
    at: string,
    description: string,
    opts: { page?: number | null; section?: string | null; content?: string; precision?: 'exact' | 'correlated' } = {},
  ) => {
    const precision = opts.precision ?? 'exact';
    return {
      kind: 'file' as const,
      precision,
      correlation_method: precision === 'exact' ? ('content_hash' as const) : ('time_window' as const),
      content_sha256: precision === 'exact' ? sha(opts.content ?? `${artifactVersionId}:${relativePath}`) : null,
      captured_at: at,
      description,
      artifact_version_id: artifactVersionId,
      relative_path: relativePath,
      page_number: opts.page ?? null,
      section: opts.section ?? null,
      span: null,
    };
  },
  experiment: (runId: string, at: string, description: string, recordPath: string, artifactVersionId: string | null, metric: string | null) => ({
    kind: 'experiment' as const,
    precision: 'exact' as const,
    correlation_method: 'direct_id' as const,
    content_sha256: sha(`${runId}:${recordPath}:${metric ?? ''}`),
    captured_at: at,
    description,
    experiment_run_id: runId,
    artifact_version_id: artifactVersionId,
    metric_name: metric,
    record_path: recordPath,
  }),
  providerEvent: (sessionId: string, eventId: string, at: string, description: string, toolCallId: string | null = null) => ({
    kind: 'provider_event' as const,
    precision: 'exact' as const,
    correlation_method: 'direct_id' as const,
    content_sha256: sha(`${sessionId}:${eventId}`),
    captured_at: at,
    description,
    source_instance_id: 'src_codex_cli',
    session_id: sessionId,
    source_event_id: eventId,
    tool_call_id: toolCallId,
  }),
};

export type Locator = ReturnType<(typeof loc)[keyof typeof loc]>;

export const provenance = (
  observation_kind: 'observed' | 'reported' | 'inferred',
  source_refs: Locator[],
  created_by: Actor,
  derivation_note = DERIVATION_NOTE,
) => ({ observation_kind, source_refs, created_by, derivation_note });

// 每个实体共有的字段。
export const base = (
  id: string,
  revision: number,
  created_at: string,
  updated_at: string,
  prov: ReturnType<typeof provenance>,
  valid_from: string = created_at,
  valid_to: string | null = null,
) => ({
  id,
  revision,
  project_id: PROJECT_ID,
  created_at,
  updated_at,
  valid_time: { from: valid_from, to: valid_to },
  provenance: prov,
});
