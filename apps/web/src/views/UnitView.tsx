// 研究单元：默认只看“为什么做、已经知道、还不知道、下一步”；方法、实现、证据、历史按需打开（方案 §5.3、§6.3）。
// 审阅与理解只由用户主动标记，并绑定具体修订（§4.5）。
import { useEffect, useState } from 'react';
import type { Claim, ContextBundle, Decision, Evidence, ReadingBrief, ResearchUnit } from '@rw/contracts';
import { DECISION, OBSERVATION, PRECISION, REVIEW, SESSION_STATE, UNDERSTANDING, WORK_STATE } from '@rw/domain';
import { useStore } from '../data/store.tsx';
import { get, reviewsFor, runningSessionFor, staleRefs, unitBrief, type Model } from '../data/model.ts';
import { fmtTime, versionText } from '../data/format.ts';
import { setQuery, type Route } from '../router.ts';
import { briefFeedback, interruptSession, markUnderstanding, recordReview, reviseNextAction, startWorkHere } from '../data/service.ts';
import { Badge, Drawer, Empty, Ref, ReliabilityChart, RichText, Tabs, TermScope, useTerms } from '../components/ui.tsx';
import { ClaimRow, EvidenceRow, RunRow } from '../components/evidence.tsx';
import { branchShort } from './MapView.tsx';

type Tab = 'brief' | 'method' | 'evidence' | 'history';
const TABS: { id: Tab; label: string }[] = [
  { id: 'brief', label: '说明' },
  { id: 'method', label: '方法与实现' },
  { id: 'evidence', label: '证据' },
  { id: 'history', label: '历史' },
];

export function UnitView({ id, route }: { id: string; route: Route }) {
  const { model: m, setViewingUnitId } = useStore();
  const unit = get<ResearchUnit>(m, id);
  useEffect(() => {
    if (unit) setViewingUnitId(unit.id);
  }, [unit?.id, setViewingUnitId]);
  if (!unit) return <p>找不到这个研究单元。<a href="#/map">返回研究路线</a></p>;
  const raw = route.query.get('tab');
  const tab: Tab = raw === 'implementation' ? 'method' : ((raw as Tab) || 'brief');
  const setTab = (t: Tab) => setQuery(route, { tab: t === 'brief' ? null : t });
  const brief = unitBrief(m, unit.id);
  const session = runningSessionFor(m, unit.id);

  return (
    <div>
      <a className="back" href="#/map">← 研究路线 · {branchShort(m, unit.branch_id)}</a>
      <div className="unit-head">
        <div className="row">
          <Badge table={WORK_STATE} value={unit.work_state} />
          {session ? <span className="marker executing">正在执行</span> : null}
          <span className="small muted">{versionText(unit.revision)} · 更新于 {fmtTime(unit.updated_at)}</span>
        </div>
        <h1>{unit.title}</h1>
        <p className="unit-q">{unit.question}</p>
      </div>

      <div className="layout">
        <div>
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="阅读深度" />
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            <TermScope>
              {tab === 'brief' ? <BriefTab m={m} unit={unit} brief={brief} /> : null}
              {tab === 'method' ? <MethodTab m={m} unit={unit} /> : null}
              {tab === 'evidence' ? <EvidenceTab m={m} unit={unit} brief={brief} /> : null}
              {tab === 'history' ? <HistoryTab m={m} unit={unit} brief={brief} /> : null}
            </TermScope>
          </div>
        </div>
        <aside className="side">
          <ExecutionCard m={m} unit={unit} />
          <ReviewCard m={m} unit={unit} brief={brief} />
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 说明
function BriefTab({ m, unit, brief }: { m: Model; unit: ResearchUnit; brief?: ReadingBrief }) {
  const { run } = useStore();
  const { open } = useTerms();
  const [example, setExample] = useState(false);
  if (!brief) return <Empty>这个单元还没有说明。原始材料可以在“证据”里查看。</Empty>;
  const detail = m.ext.unit_details[unit.id];
  const stale = staleRefs(m, brief.source_revision_refs).filter((r) => r.entity_id !== m.project.id);
  const openPrereq = (p: ReadingBrief['prerequisites'][number], el: HTMLElement) => {
    const g = m.ext.glossary.find((x) => x.term === p.term || x.aliases.includes(p.term) || x.match.includes(p.term));
    open(g ?? { id: `pre-${p.term}`, term: p.term, aliases: [], match: [], plain: p.plain_explanation, formal: null, scope_branch_ids: null, scope_note: p.why_needed, valid_from_project_revision: m.project.revision, source: { entity_id: brief.id, note: '阅读说明中的概念' }, example: null }, el);
  };
  return (
    <article className="reading">
      {stale.length ? <div className="warn-box small">这份说明写好之后，相关内容又更新过（{stale.length} 处）。新说明完成前先保留这一版，请留意。</div> : null}

      <h2>为什么做这项工作</h2>
      <RichText as="p" text={brief.why_this_work} compact />
      {brief.prerequisites.length ? (
        <div className="row" style={{ gap: 8 }}>
          <span className="small muted">涉及的概念：</span>
          <div className="concepts">
            {brief.prerequisites.map((p) => (
              <button key={p.term} type="button" className="concept" onClick={(e) => openPrereq(p, e.currentTarget)}>{p.term}</button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="kn">
        <div className="k">
          <span className="label">已经知道</span>
          <ul>{brief.key_findings.map((f, i) => <RichText key={i} as="li" text={f} compact />)}</ul>
        </div>
        <div className="n">
          <span className="label">还不知道</span>
          <ul>{brief.not_yet_established.map((f, i) => <RichText key={i} as="li" text={f} compact />)}</ul>
        </div>
      </div>

      <h2>下一步</h2>
      <RichText as="p" text={brief.recommended_next_step} compact />
      {brief.decision_request ? (
        <div className="info-box row spread">
          <span><strong>需要你决定：</strong>{brief.decision_request.question}</span>
          <a className="btn sm primary" href={`#/decisions?focus=${unit.decision_ids.find((d) => d.startsWith('dec_')) ?? ''}`}>去决定</a>
        </div>
      ) : null}

      <div className="row" style={{ marginTop: 18 }}>
        {detail?.example ? <button type="button" className="ghost" aria-expanded={example} onClick={() => setExample(!example)}>{example ? '收起例子' : '举个例子'}</button> : null}
      </div>
      {example && detail?.example ? <div className="note-box"><RichText text={detail.example} /></div> : null}

      <details className="more">
        <summary>更多：项目背景、方法要点、对项目的影响、局限</summary>
        <h2>项目背景</h2>
        <RichText as="p" text={brief.project_background} compact />
        <h2>方法要点</h2>
        <RichText as="p" text={brief.method_explanation} compact />
        <h2>对项目的影响</h2>
        <RichText as="p" text={brief.project_impact} compact />
        {brief.limitations.length ? (
          <>
            <h2>局限</h2>
            <ul>{brief.limitations.map((f, i) => <RichText key={i} as="li" text={f} compact />)}</ul>
          </>
        ) : null}
        <p className="small muted" style={{ marginTop: 16 }}>
          说明{versionText(brief.revision)} · {brief.generation.mode === 'human' ? '人工撰写' : '自动生成'} · {fmtTime(brief.generation.generated_at)} · 依据 {brief.source_revision_refs.length} 个对象的指定版本
        </p>
      </details>

      <div className="row" style={{ marginTop: 24, gap: 6 }}>
        <span className="small muted">这份说明有问题？</span>
        {['背景不足', '难懂', '来源不对', '说过头了'].map((k) => (
          <button key={k} type="button" className="ghost sm" onClick={() => run((mm) => briefFeedback(mm, { briefId: brief.id, revision: brief.revision, kind: k }))}>{k}</button>
        ))}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- 方法与实现
function MethodTab({ m, unit }: { m: Model; unit: ResearchUnit }) {
  const d = m.ext.unit_details[unit.id];
  if (!d) return <Empty>没有方法与实现的内容。</Empty>;
  const L = d.method_layer;
  const I = d.implementation_layer;
  const conflicts = I.file_changes.filter((f) => f.conflict);
  return (
    <div style={{ maxWidth: 760 }}>
      {conflicts.map((f, i) => (
        <div key={i} className="bad-box">
          <div className="label">模型的说法与实际文件不一致</div>
          <p className="small" style={{ margin: '4px 0' }}>{f.model_claim}</p>
          <p className="small">{f.conflict}</p>
        </div>
      ))}

      <h2 style={{ fontSize: '1.0625rem', marginBottom: 8 }}>怎么做</h2>
      <ol>{L.steps.map((x, i) => <RichText key={i} as="li" text={x} compact />)}</ol>
      <p className="small muted">输入：{L.inputs.join('；')}<br />输出：{L.outputs.join('；')}</p>

      {L.comparison ? (
        <div className="card" style={{ padding: 0, marginTop: 16 }}>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">{L.comparison.title}</caption>
              <thead><tr><th>{L.comparison.title}</th>{L.comparison.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{L.comparison.rows.map((r) => <tr key={r.label}><th scope="row" style={{ color: 'var(--text)' }}>{r.label}</th>{r.cells.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      ) : null}

      {unit.decision_ids.length ? (
        <>
          <h2 style={{ fontSize: '1.0625rem', margin: '28px 0 8px' }}>相关决定</h2>
          <div className="rows">
            {unit.decision_ids.map((id) => {
              const dec = get<Decision>(m, id);
              if (!dec) return null;
              const opt = dec.options.find((o) => o.id === dec.accepted_option_id);
              return (
                <a key={id} className="rowi" href={`#/decisions?focus=${id}`}>
                  <div className="grow">
                    <div className="title">{dec.question}</div>
                    {opt ? <div className="sub">选择：{opt.label}</div> : null}
                  </div>
                  <Badge table={DECISION} value={dec.status} />
                </a>
              );
            })}
          </div>
        </>
      ) : null}

      {I.file_changes.length || I.formulas.length || I.mappings.length ? (
        <>
          <h2 style={{ fontSize: '1.0625rem', margin: '28px 0 8px' }}>实现</h2>
          {I.mappings.length ? (
            <div className="rows" style={{ marginBottom: 12 }}>
              {I.mappings.map((x, i) => (
                <div key={i} className="rowi">
                  <div className="grow"><RichText text={x.statement} /></div>
                  {x.artifact_version_id ? (
                    <span className="small"><Ref id={x.artifact_version_id} /> <span className="mono muted">{x.locator}</span></span>
                  ) : <span className="chip">尚未建立对应关系</span>}
                </div>
              ))}
            </div>
          ) : null}
          {I.formulas.map((f) => (
            <div key={f.label} style={{ margin: '12px 0' }}>
              <div className="small muted">{f.label}</div>
              <code className="formula">{f.expression}</code>
              {f.variables.length ? <p className="small" style={{ marginTop: 6 }}>{f.variables.map((v) => `${v.symbol}：${v.meaning}`).join('；')}</p> : null}
            </div>
          ))}
          {I.file_changes.filter((f) => f.diff_excerpt).map((f, i) => (
            <details key={i} style={{ marginTop: 8 }}>
              <summary className="small">文件改动：<span className="mono">{f.path}</span></summary>
              <pre>{f.diff_excerpt!.split('\n').map((line, j) => <div key={j} className={line.startsWith('+') ? 'diff-add' : line.startsWith('-') ? 'diff-del' : undefined}>{line}</div>)}</pre>
            </details>
          ))}
          {I.pseudocode ? (
            <details style={{ marginTop: 8 }}>
              <summary className="small">算法伪代码</summary>
              <pre>{I.pseudocode}</pre>
            </details>
          ) : null}
          {I.parameters.length ? <p className="small muted" style={{ marginTop: 12 }}>参数：{I.parameters.map((p) => `${p.name} = ${p.value}`).join('；')}</p> : null}
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- 证据
function EvidenceTab({ m, unit, brief }: { m: Model; unit: ResearchUnit; brief?: ReadingBrief }) {
  const claims = unit.claim_ids.map((c) => get<Claim>(m, c)).filter(Boolean) as Claim[];
  const ids = new Set([...unit.evidence_ids, ...(brief?.evidence_links.map((l) => l.evidence_id) ?? [])]);
  const evidence = [...ids].map((e) => get<Evidence>(m, e)).filter(Boolean) as Evidence[];
  const runs = m.runs.filter((r) => r.unit_id === unit.id);
  const curves = m.ext.reliability_curves.filter((c) => ids.has(c.evidence_id));
  return (
    <div style={{ maxWidth: 760 }}>
      {claims.length ? (
        <section style={{ marginBottom: 28 }}>
          <div className="section-head"><h2>主张</h2><span className="hint">点开看支持和反证</span></div>
          <div className="rows">{claims.map((c) => <ClaimRow key={c.id} m={m} claim={c} />)}</div>
        </section>
      ) : null}
      {curves.length ? (
        <section style={{ marginBottom: 28 }}>
          <div className="section-head"><h2>原始结果</h2><span className="hint">越接近对角线，概率越可靠</span></div>
          <div className="row" style={{ alignItems: 'start', gap: 28 }}>{curves.map((c) => <ReliabilityChart key={c.id} curveId={c.id} />)}</div>
        </section>
      ) : null}
      {evidence.length ? (
        <section style={{ marginBottom: 28 }}>
          <div className="section-head"><h2>证据</h2></div>
          <div className="rows">{evidence.map((e) => <EvidenceRow key={e.id} m={m} e={e} />)}</div>
        </section>
      ) : null}
      {runs.length ? (
        <section>
          <div className="section-head"><h2>实验运行</h2></div>
          <div className="rows">{runs.map((r) => <RunRow key={r.id} m={m} run={r} />)}</div>
        </section>
      ) : null}
      {!claims.length && !evidence.length && !runs.length ? <Empty>这个单元还没有证据或运行。</Empty> : null}
    </div>
  );
}

// ---------------------------------------------------------------- 历史
function HistoryTab({ m, unit, brief }: { m: Model; unit: ResearchUnit; brief?: ReadingBrief }) {
  const revisions = (m.history.get(unit.id) ?? []) as unknown as ResearchUnit[];
  const reviews = [...reviewsFor(m, unit.id), ...(brief ? reviewsFor(m, brief.id) : [])];
  const events = m.timeline.filter((t) => t.entityIds.includes(unit.id) || t.related.includes(unit.id) || (brief && t.entityIds.includes(brief.id)));
  const checkpoints = m.checkpoints.filter((c) => c.unit_id === unit.id);
  const contexts = m.contexts.filter((c) => c.unit_id === unit.id);
  const activities = m.ext.unit_details[unit.id]?.activities ?? [];
  return (
    <div style={{ maxWidth: 760 }} className="stack">
      <section>
        <div className="section-head"><h2>版本</h2></div>
        <div className="card" style={{ padding: '6px 22px' }}>
          <ol className="timeline">
            {[...revisions].reverse().map((r) => (
              <li key={r.revision}>
                <time>{fmtTime(r.updated_at)}</time>
                <span>{versionText(r.revision)}{r.revision === unit.revision ? '（当前）' : ''} · <Badge table={WORK_STATE} value={r.work_state} /></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="section-head"><h2>审阅</h2><span className="hint">审阅只针对一个版本；新版本不继承旧审阅</span></div>
        {reviews.length ? (
          <div className="rows">
            {reviews.map((r) => (
              <div key={r.id} className="rowi">
                <div className="grow">
                  <div className="title">{r.target_id.startsWith('brf_') ? '说明' : '本单元'}{versionText(r.reviewed_revision)}</div>
                  <div className="sub">{fmtTime(r.created_at)}{r.findings[0] ? ` · “${r.findings[0]}”` : ''}</div>
                </div>
                {r.status !== 'unreviewed' ? <Badge table={REVIEW} value={r.status} /> : null}
                {r.understanding_status !== 'not_reported' ? <Badge table={UNDERSTANDING} value={r.understanding_status} /> : null}
                {r.is_current ? null : <span className="tag">旧版本</span>}
              </div>
            ))}
          </div>
        ) : <Empty>还没有审阅。</Empty>}
      </section>

      {checkpoints.length ? (
        <section style={{ marginTop: 28 }}>
          <div className="section-head"><h2>快照</h2></div>
          <div className="rows">
            {checkpoints.map((c) => (
              <a key={c.id} className="rowi" href={`#/checkpoint/${c.id}`}>
                <div className="grow"><div className="title">{c.title}</div><div className="sub">{fmtTime(c.created_at)} · 可以回看或从这里开新路线</div></div>
                <span className="btn sm">打开</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <details className="more" style={{ marginTop: 28 }}>
        <summary>活动记录（{activities.length}）</summary>
        {activities.length ? (
          <ol className="timeline">
            {activities.map((a, i) => (
              <li key={i}>
                <time>{fmtTime(a.at)}</time>
                <span>
                  <RichText text={a.text} compact />{' '}
                  {a.observation_kind !== 'observed' ? <Badge table={OBSERVATION} value={a.observation_kind} /> : null}{' '}
                  {a.precision !== 'exact' ? <Badge table={PRECISION} value={a.precision} /> : null}
                </span>
              </li>
            ))}
          </ol>
        ) : <Empty>没有活动记录。</Empty>}
      </details>

      {contexts.length ? (
        <details className="more">
          <summary>交给模型的上下文（{contexts.length}）</summary>
          {contexts.map((c) => <ContextBlock key={c.id} m={m} c={c} />)}
        </details>
      ) : null}

      <details className="more">
        <summary>全部事件（{events.length}）</summary>
        <ol className="timeline">
          {events.map((t) => (
            <li key={t.seq}>
              <time>{fmtTime(t.at)}</time>
              <span><RichText text={t.summary} compact /> <span className="muted small">· {({ human: '你', agent: '模型', service: '服务', importer: '导入' } as Record<string, string>)[t.actor.kind]}{t.local ? ' · 样机操作' : ''}</span></span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function ContextBlock({ m, c }: { m: Model; c: ContextBundle }) {
  return (
    <div className="note-box small">
      <p><strong>{m.ext.display_names[c.id] ?? c.id}</strong> · {fmtTime(c.created_at)} · 约 {c.estimated_tokens} token（估计）。这是给模型的内容，和给你看的说明分开写；只能证明已发送，不能证明模型已理解。</p>
      <ul>{c.items.map((it, i) => <li key={i}>{it.text}</li>)}</ul>
      {c.excluded_items.length ? <p className="muted">没有放进去：{c.excluded_items.map((x) => x.reason).join('；')}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------- 侧栏
function ExecutionCard({ m, unit }: { m: Model; unit: ResearchUnit }) {
  const { run } = useStore();
  const [handoff, setHandoff] = useState(false);
  const session = runningSessionFor(m, unit.id);
  return (
    <div className="card">
      <h3>执行</h3>
      {session ? (
        <div className="stack">
          <div className="row"><Badge table={SESSION_STATE} value={session.state} /></div>
          <div className="small muted">Codex CLI · 伴随模式 · 最近活动 {fmtTime(session.last_observed_at)}</div>
          <button type="button" className="sm" style={{ alignSelf: 'flex-start' }} onClick={() => run((mm) => interruptSession(mm, { sessionId: session.id }))}>停止</button>
        </div>
      ) : (
        <div className="stack">
          <div className="small muted">没有正在执行的会话。</div>
          <button type="button" className="sm" style={{ alignSelf: 'flex-start' }} onClick={() => { const r = run((mm) => startWorkHere(mm, { unitId: unit.id })); if (!r.ok && r.error.status === 501) setHandoff(true); }}>在此开展工作</button>
        </div>
      )}
      {handoff ? <HandoffDrawer unitId={unit.id} onClose={() => setHandoff(false)} /> : null}
    </div>
  );
}

function ReviewCard({ m, unit, brief }: { m: Model; unit: ResearchUnit; brief?: ReadingBrief }) {
  const { run } = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(unit.next_action);
  const unitReview = reviewsFor(m, unit.id).find((r) => r.is_current && r.status !== 'unreviewed');
  const briefReview = brief ? reviewsFor(m, brief.id).find((r) => r.is_current) : undefined;
  return (
    <div className="card">
      <h3>你的审阅 · {versionText(unit.revision)}</h3>
      <div className="row"><Badge table={REVIEW} value={unitReview?.status ?? 'unreviewed'} /></div>
      <div className="row" style={{ marginTop: 10, gap: 6 }}>
        <button type="button" className="sm" onClick={() => run((mm) => recordReview(mm, { targetId: unit.id, status: 'accepted', findings: '' }))}>审阅通过</button>
        <button type="button" className="sm" onClick={() => run((mm) => recordReview(mm, { targetId: unit.id, status: 'needs_changes', findings: '' }))}>需要修改</button>
      </div>
      <span className="btn-note">只针对这个版本；不等于采用方案，也不代表结论成立。</span>
      {brief ? (
        <>
          <hr style={{ margin: '14px 0' }} />
          <div className="small" style={{ marginBottom: 6 }}>说明读懂了吗？{briefReview && briefReview.understanding_status !== 'not_reported' ? <Badge table={UNDERSTANDING} value={briefReview.understanding_status} /> : null}</div>
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="ghost sm" onClick={() => run((mm) => markUnderstanding(mm, { targetId: brief.id, understanding: 'self_reported_understood' }))}>读懂了</button>
            <button type="button" className="ghost sm" onClick={() => run((mm) => markUnderstanding(mm, { targetId: brief.id, understanding: 'needs_explanation' }))}>需要补背景</button>
          </div>
        </>
      ) : null}
      <hr style={{ margin: '14px 0' }} />
      {editing ? (
        <div className="stack">
          <label htmlFor="next-edit" className="small">修改下一步（保存后成为{versionText(unit.revision + 1)}）</label>
          <textarea id="next-edit" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="sm primary" onClick={() => { const r = run((mm) => reviseNextAction(mm, { unitId: unit.id, nextAction: text, expectedRevision: mm.project.revision })); if (r.ok) setEditing(false); }}>保存</button>
            <button type="button" className="sm ghost" onClick={() => setEditing(false)}>取消</button>
          </div>
        </div>
      ) : (
        <button type="button" className="link small" onClick={() => setEditing(true)}>修改下一步</button>
      )}
    </div>
  );
}

function HandoffDrawer({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const { model: m } = useStore();
  const unit = get<ResearchUnit>(m, unitId)!;
  const ctx = m.contexts.filter((c) => c.unit_id === unitId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  const brief = unitBrief(m, unitId);
  const lines = [
    `# 交接材料：${unit.title}（${versionText(unit.revision)}）`,
    `项目目标：${m.project.goal}`,
    ...((m.project.constraints as { text: string }[]).map((c) => `约束：${c.text}`)),
    `本单元问题：${unit.question}`,
    ...(ctx ? ctx.items.filter((i) => i.role !== 'goal' && i.role !== 'constraint').map((it) => `- ${it.text}`) : []),
    ...(!ctx && brief ? [...brief.key_findings.map((f) => `已知：${f}`), ...brief.not_yet_established.map((f) => `尚未证明：${f}`)] : []),
    `下一步：${unit.next_action}`,
  ];
  const text = lines.join('\n');
  return (
    <Drawer title="交接材料" onClose={onClose}>
      <p className="small">当前连接不能从这里启动会话。请复制下面的内容，粘贴到原来的客户端里继续。没有收到会话回执之前，这里不会显示“已同步”。</p>
      <label htmlFor="handoff-text" className="sr-only">交接材料</label>
      <textarea id="handoff-text" readOnly value={text} style={{ minHeight: 280, fontSize: '0.85rem' }} />
      <button type="button" className="primary" style={{ marginTop: 10 }} onClick={() => navigator.clipboard?.writeText(text)}>复制</button>
    </Drawer>
  );
}
