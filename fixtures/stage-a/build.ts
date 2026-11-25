// 生成阶段A夹具：stage-a.snapshot.json（遵循合同 v1.0.0）与 stage-a.extensions.json（样机扩展，非合同）。
// 运行：npm run fixtures
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  artifactVersions, branches, capabilityManifests, checkpoints, claims, decisions, evidenceList, experimentRuns, grants, graphEdges,
  project, proposals, researchUnits, reviews, sessionBindings,
} from './src/entities.ts';
import { contextBundles, readingBriefs } from './src/briefs.ts';
import { events, LAST_EVENT_SEQ } from './src/events.ts';
import { extensions } from './src/extensions.ts';

const dir = new URL('.', import.meta.url).pathname;

const snapshot = {
  schema_version: '1.0.0',
  export_kind: 'project_snapshot',
  exported_at: '2026-11-25T04:00:00Z',
  example_notice:
    '阶段A样机夹具：本文件中的项目、人物身份、来源、指标、哈希和事件全部为虚构，只用于验证数据结构、阅读体验与审阅语义；不代表真实证据、可复现实验或有效授权。事件数组为节选，不能重放完整项目历史。',
  event_history_scope: 'excerpt',
  last_event_seq: LAST_EVENT_SEQ,
  project,
  branches,
  research_units: researchUnits,
  graph_edges: graphEdges,
  claims,
  evidence: evidenceList,
  decisions,
  artifact_versions: artifactVersions,
  experiment_runs: experimentRuns,
  checkpoints,
  proposals,
  reviews,
  session_bindings: sessionBindings,
  capability_manifests: capabilityManifests,
  context_bundles: contextBundles,
  reading_briefs: readingBriefs,
  grants,
  events,
};

writeFileSync(join(dir, 'stage-a.snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
writeFileSync(join(dir, 'stage-a.extensions.json'), JSON.stringify(extensions, null, 2) + '\n');
console.log(`已生成 stage-a.snapshot.json（${events.length} 个事件节选）与 stage-a.extensions.json`);
