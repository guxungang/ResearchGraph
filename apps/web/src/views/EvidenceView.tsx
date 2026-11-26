// 资料：主张、实验、文件、术语。默认每项一行，点开看来源和细节（方案 §6.6、§5.4）。
import type { ArtifactVersion } from '@rw/contracts';
import { AVAILABILITY } from '@rw/domain';
import { useStore } from '../data/store.tsx';
import { fmtTime } from '../data/format.ts';
import { setQuery, type Route } from '../router.ts';
import { Badge, Ref, Tabs, TermScope } from '../components/ui.tsx';
import { ClaimRow, EvidenceRow, RunRow } from '../components/evidence.tsx';

type Tab = 'claims' | 'runs' | 'files' | 'terms';
const ORDER = ['contradicted', 'mixed', 'unassessed', 'inconclusive', 'supported', 'withdrawn'];

export function EvidenceView({ route, forceTab }: { route: Route; forceTab?: Tab }) {
  const { model: m } = useStore();
  const raw = route.query.get('tab');
  const tab: Tab = forceTab ?? (raw === 'artifacts' ? 'files' : (raw as Tab) || 'claims');
  const focus = route.query.get('focus');
  const claims = [...m.claims].sort((a, b) => {
    const gap = (c: typeof a) => (c.claim_kind === 'paper_claim' && !c.evidence_ids.length ? -1 : ORDER.indexOf(c.assessment));
    return gap(a) - gap(b);
  });
  const logical = new Map<string, ArtifactVersion[]>();
  for (const a of m.artifacts) logical.set(a.logical_artifact_id, [...(logical.get(a.logical_artifact_id) ?? []), a]);
  const runs = [...m.runs].sort((a, b) => ((a.started_at ?? '') < (b.started_at ?? '') ? 1 : -1));

  return (
    <div className="narrow">
      <div className="page-title">
        <h1>资料</h1>
        <p>项目里的主张、实验、文件和术语。每一项都能点开看到原始来源。</p>
      </div>
      <Tabs
        tabs={[{ id: 'claims', label: `主张（${m.claims.length}）` }, { id: 'runs', label: `实验（${m.runs.length}）` }, { id: 'files', label: `文件（${logical.size}）` }, { id: 'terms', label: `术语（${m.ext.glossary.length}）` }]}
        value={tab}
        onChange={(t) => setQuery(route, { tab: t === 'claims' ? null : t, focus: null })}
        label="资料类别"
      />
      <TermScope>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'claims' ? (
            <>
              <p className="small muted">“有条件支持”只在列出的条件下成立。主张改版后，旧的证据关系要重新核验。</p>
              <div className="rows">{claims.map((c) => <ClaimRow key={c.id} m={m} claim={c} open={focus === c.id} />)}</div>
              <div className="section-head" style={{ marginTop: 32 }}><h2>证据</h2></div>
              <div className="rows">{m.evidence.map((e) => <EvidenceRow key={e.id} m={m} e={e} open={focus === e.id} />)}</div>
            </>
          ) : null}

          {tab === 'runs' ? (
            <>
              <p className="small muted">运行成功只说明程序跑完了；运行失败如果是环境问题，也不算反证。</p>
              <div className="rows">{runs.map((r) => <RunRow key={r.id} m={m} run={r} open={focus === r.id} />)}</div>
            </>
          ) : null}

          {tab === 'files' ? (
            <div className="rows">
              {[...logical.entries()].map(([lid, versions]) => {
                const latest = versions[versions.length - 1];
                const open = versions.some((v) => v.id === focus);
                return (
                  <details key={lid} className="rowd" open={open}>
                    <summary>
                      <span className="grow"><span style={{ fontWeight: 550 }}>{latest.title}</span><span className="small muted" style={{ display: 'block' }}>{latest.storage_ref.location} · {versions.length > 1 ? `${versions.length} 个版本` : latest.version_label}</span></span>
                      <Badge table={AVAILABILITY} value={latest.availability} />
                    </summary>
                    <div className="rowd-body">
                      <table>
                        <thead><tr><th>版本</th><th>登记时间</th><th>内容摘要</th><th>产生于</th></tr></thead>
                        <tbody>
                          {versions.map((a) => (
                            <tr key={a.id} id={`focus-${a.id}`}>
                              <td>{a.version_label}</td>
                              <td>{fmtTime(a.created_at)}</td>
                              <td className="mono">{a.sha256 ? `${a.sha256.slice(0, 10)}…` : <span className="muted">未读取内容</span>}</td>
                              <td>{a.produced_by_unit_id ? <Ref id={a.produced_by_unit_id} /> : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {latest.availability !== 'available' ? <p className="small muted" style={{ marginTop: 8 }}>只登记了位置，内容没有在本地核验，不能声称版本已经固定。</p> : null}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : null}

          {tab === 'terms' ? (
            <>
              <p className="small muted">同一个词或符号在不同地方可能含义不同，术语表会分别列出，不合并。</p>
              <div className="rows">
                {m.ext.glossary.map((g) => (
                  <details key={g.id} className="rowd" id={`focus-${g.id}`}>
                    <summary>
                      <span className="grow"><span style={{ fontWeight: 550 }}>{g.term}</span><span className="small" style={{ display: 'block', color: 'var(--text-2)' }}>{g.plain}</span></span>
                    </summary>
                    <div className="rowd-body small stack">
                      {g.formal ? <code className="formula">{g.formal}</code> : null}
                      {g.example ? <p style={{ margin: 0 }}>例：{g.example}</p> : null}
                      <p className="muted" style={{ margin: 0 }}>适用：{g.scope_branch_ids ? g.scope_branch_ids.map((b, i) => <span key={b}>{i ? '、' : ''}<Ref id={b} /></span>) : '全项目'}（{g.scope_note}） · 来源：<Ref id={g.source.entity_id} /></p>
                    </div>
                  </details>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </TermScope>
    </div>
  );
}
