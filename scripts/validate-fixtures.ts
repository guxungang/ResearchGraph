// 校验阶段A夹具：
// 1) 快照按合同 domain.schema.json（JSON Schema 2020-12）校验；
// 2) 跨对象引用与关键不变量（方案 §10.6、合同 README 第三、四节）；
// 3) 扩展数据中的引用都指向存在的对象。
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const schema = read('packages/contracts/schema/domain.schema.json');
const snap = read('fixtures/stage-a/stage-a.snapshot.json');
const ext = read('fixtures/stage-a/stage-a.extensions.json');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const problems: string[] = [];
if (!validate(snap)) {
  for (const e of validate.errors ?? []) problems.push(`schema ${e.instancePath} ${e.message} ${JSON.stringify(e.params)}`);
}

type E = { id: string; revision: number } & Record<string, any>;
const collections = ['branches', 'research_units', 'graph_edges', 'claims', 'evidence', 'decisions', 'artifact_versions', 'experiment_runs', 'checkpoints', 'proposals', 'reviews', 'session_bindings', 'capability_manifests', 'context_bundles', 'reading_briefs', 'grants'];
const byId = new Map<string, E>();
byId.set(snap.project.id, snap.project);
for (const c of collections) for (const e of snap[c] as E[]) {
  if (byId.has(e.id)) problems.push(`重复ID ${e.id}`);
  byId.set(e.id, e);
}
const has = (id: string) => byId.has(id);
const need = (id: string | null | undefined, where: string) => { if (id && !has(id)) problems.push(`${where} 引用不存在的 ${id}`); };

// 图关系：端点存在、精确修订语义、谱系无环、parent_unit_ids 为 continues_to 入边投影
const units = snap.research_units as E[];
for (const g of snap.graph_edges as E[]) {
  need(g.source_id, g.id); need(g.target_id, g.id);
  const s = byId.get(g.source_id), t = byId.get(g.target_id);
  if (!s || !t) continue;
  if (g.source_revision > s.revision || g.target_revision > t.revision) problems.push(`${g.id} 引用了未来修订`);
  if (g.binding_semantics === 'exact_revision') {
    const exact = g.source_revision === s.revision && g.target_revision === t.revision;
    if (exact && g.currency !== 'current') problems.push(`${g.id} 端点修订一致却标记为 ${g.currency}`);
    if (!exact && g.currency === 'current') problems.push(`${g.id} 端点修订已变化，应标记 needs_revalidation`);
  }
  const prefix = (id: string) => id.slice(0, 3);
  const typeRule: Record<string, [string, string]> = { supports: ['evd', 'clm'], contradicts: ['evd', 'clm'], continues_to: ['unt', 'unt'], depends_on: ['unt', 'unt'], supersedes: ['dec', 'dec'], produces: ['unt', 'art'] };
  const rule = typeRule[g.relation];
  if (rule && (prefix(g.source_id) !== rule[0] || prefix(g.target_id) !== rule[1])) problems.push(`${g.id} 关系 ${g.relation} 端点类型不符`);
}
const lineage = (snap.graph_edges as E[]).filter((g) => g.relation === 'continues_to' && g.state === 'active');
for (const u of units) {
  const parents = lineage.filter((g) => g.target_id === u.id).map((g) => g.source_id).sort();
  if (JSON.stringify(parents) !== JSON.stringify([...u.parent_unit_ids].sort())) problems.push(`${u.id}.parent_unit_ids 与 continues_to 入边不一致`);
  for (const k of ['claim_ids', 'decision_ids', 'evidence_ids', 'artifact_version_ids']) for (const id of u[k]) need(id, `${u.id}.${k}`);
  need(u.branch_id, u.id);
}
const acyclic = (rel: string) => {
  const adj = new Map<string, string[]>();
  for (const g of snap.graph_edges as E[]) if (g.relation === rel && g.state === 'active') adj.set(g.source_id, [...(adj.get(g.source_id) ?? []), g.target_id]);
  const state = new Map<string, number>();
  const visit = (n: string): boolean => {
    if (state.get(n) === 1) return false;
    if (state.get(n) === 2) return true;
    state.set(n, 1);
    for (const m of adj.get(n) ?? []) if (!visit(m)) return false;
    state.set(n, 2);
    return true;
  };
  for (const n of adj.keys()) if (!visit(n)) problems.push(`${rel} 存在环`);
};
acyclic('continues_to'); acyclic('depends_on'); acyclic('supersedes');

// 主张、决策、授权、审阅、会话
for (const c of snap.claims as E[]) for (const id of c.evidence_ids) need(id, c.id);
const grantsById = new Map((snap.grants as E[]).map((g) => [g.id, g]));
for (const d of snap.decisions as E[]) {
  for (const o of d.options) for (const id of o.evidence_ids) need(id, `${d.id}.${o.id}`);
  if (d.status === 'accepted' || d.status === 'superseded') {
    const g = grantsById.get(d.authorized_by_grant_id);
    if (!g) problems.push(`${d.id} 缺少授权`);
    else if (!g.actions.includes('decision.accept')) problems.push(`${d.id} 的授权不覆盖 decision.accept`);
    if (!d.options.some((o: E) => o.id === d.accepted_option_id)) problems.push(`${d.id}.accepted_option_id 不在选项中`);
  }
  need(d.superseded_by_decision_id, d.id);
}
for (const r of snap.reviews as E[]) {
  const t = byId.get(r.target_id);
  if (!t) { problems.push(`${r.id} 目标不存在`); continue; }
  const current = r.reviewed_revision === t.revision;
  if (current !== r.is_current) problems.push(`${r.id}.is_current 应为 ${current}`);
}
for (const s of snap.session_bindings as E[]) { need(s.unit_id, s.id); need(s.branch_id, s.id); need(s.context_bundle_id, s.id); }
for (const b of snap.reading_briefs as E[]) {
  need(b.unit_id, b.id);
  for (const ref of b.source_revision_refs) {
    const t = byId.get(ref.entity_id);
    if (!t) problems.push(`${b.id} 引用不存在的 ${ref.entity_id}`);
    else if (t.revision !== ref.revision) problems.push(`${b.id} 引用 ${ref.entity_id}@${ref.revision}，当前为 ${t.revision}（当前说明应引用当前修订）`);
  }
  for (const l of b.evidence_links) need(l.evidence_id, b.id);
}
for (const p of snap.proposals as E[]) {
  for (const ref of p.target_revision_refs) need(ref.entity_id, p.id);
  if (p.created_by.kind === 'agent' && p.status === 'applied') {
    const ev = (snap.events as E[]).find((e) => e.id === p.applied_by_event_id);
    if (!ev) problems.push(`${p.id} 缺少应用事件 ${p.applied_by_event_id}`);
    else if (ev.actor.kind === 'agent') problems.push(`${p.id} 被模型自己应用（违反不变量1）`);
  }
}
for (const run of snap.experiment_runs as E[]) { need(run.unit_id, run.id); need(run.config_artifact_version_id, run.id); }
for (const ev of snap.events as E[]) for (const id of ev.causation_event_ids) if (!(snap.events as E[]).some((x) => x.id === id)) problems.push(`${ev.id} 的因果事件 ${id} 不在节选中`);

// 扩展数据引用
const known = (id: string) => has(id) || /^(cst_|act_)/.test(id);
for (const id of Object.keys(ext.display_names)) if (!known(id) && !id.startsWith('src_')) problems.push(`扩展 display_names 引用不存在的 ${id}`);
const extRef = (id: string, where: string) => { if (!known(id)) problems.push(`扩展 ${where} 引用不存在的 ${id}`); };
for (const c of ext.home.changes_since_last_visit) c.refs.forEach((r: string) => extRef(r, 'home.changes'));
ext.home.biggest_uncertainty.refs.forEach((r: string) => extRef(r, 'home.uncertainty'));
ext.home.recent_output_ids.forEach((r: string) => extRef(r, 'home.recent'));
for (const a of ext.attention_items) [...a.refs, ...a.affected].forEach((r: string) => extRef(r, a.id));
for (const g of ext.glossary) { extRef(g.source.entity_id, g.id); (g.scope_branch_ids ?? []).forEach((r: string) => extRef(r, g.id)); }
for (const [uid, d] of Object.entries<any>(ext.unit_details)) {
  extRef(uid, 'unit_details');
  d.change_basis.forEach((c: any) => c.refs.forEach((r: string) => extRef(r, `${uid}.change_basis`)));
  d.implementation_layer.file_changes.forEach((f: any) => f.artifact_version_id && extRef(f.artifact_version_id, `${uid}.file_changes`));
  d.implementation_layer.mappings.forEach((m: any) => m.artifact_version_id && extRef(m.artifact_version_id, `${uid}.mappings`));
}
for (const uid of units.map((u) => u.id)) if (!ext.unit_details[uid]) problems.push(`扩展缺少 ${uid} 的 unit_details`);
for (const r of ext.comparison.routes) { extRef(r.branch_id, 'comparison'); for (const v of Object.values<any>(r.dims)) v?.refs.forEach((x: string) => extRef(x, `comparison.${r.branch_id}`)); }
for (const m of ext.comparison.metrics) { extRef(m.route_branch_id, 'metrics'); m.run_id && extRef(m.run_id, 'metrics'); }
for (const c of ext.reliability_curves) extRef(c.evidence_id, c.id);
for (const [pid, checks] of Object.entries<any>(ext.rule_checks)) { extRef(pid, 'rule_checks'); checks.forEach((c: any) => c.refs.forEach((r: string) => extRef(r, `rule_checks.${pid}`))); }
for (const uid of Object.keys(ext.test_materials)) extRef(uid, 'test_materials');
for (const b of Object.keys(ext.branch_notes)) extRef(b, 'branch_notes');

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  console.error(`\n共 ${problems.length} 个问题。`);
  process.exit(1);
}
const count = collections.reduce((n, c) => n + snap[c].length, 1);
console.log(`✓ 快照符合合同 domain.schema.json v1.0.0（${count} 个实体，${snap.events.length} 个事件节选）`);
console.log('✓ 跨对象引用、精确修订、谱系无环、审阅当前性等检查通过');
console.log('✓ 扩展数据引用全部可解析');
