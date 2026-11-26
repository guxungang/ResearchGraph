// 待处理（方案 §6.5）：只列需要你动手的事。每件事一句话说明 + 直接可点的选项；依据、风险和记录按需展开。
// 模型的建议只是候选：模型不能批准自己的建议（AC-001、AC-005）。科研上的“采用方案”与工具权限是两回事。
import { useState } from 'react';
import type { Decision, Grant, Proposal } from '@rw/contracts';
import { DECISION, PROPOSAL } from '@rw/domain';
import { useStore } from '../data/store.tsx';
import { changesRequested, todo, type Model } from '../data/model.ts';
import { displayName, fmtTime, versionText } from '../data/format.ts';
import type { Route } from '../router.ts';
import { ownerOf, agentApplyAttempt, applyCreateUnitProposal, decide, defer, policyApplyRoutine, rejectProposal, requestInfo, revokeGrant, undefer } from '../data/service.ts';
import { Badge, Empty, Locator, ReasonForm, Ref, RichText, TermScope } from '../components/ui.tsx';

export function DecisionsView({ route }: { route: Route }) {
  const { model: m, run } = useStore();
  const focus = route.query.get('focus');
  const t = todo(m);
  const waiting = changesRequested(m);
  const deferredIds = Object.keys(m.flags.deferred).filter((id) => m.byId.has(id));
  const decided = m.decisions.filter((d) => d.status !== 'proposed').sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  const handled = m.proposals.filter((p) => p.status !== 'candidate' && p.status !== 'ready');
  const recordsOpen = !!focus && (decided.some((d) => d.id === focus) || handled.some((p) => p.id === focus) || focus.startsWith('grt_') || route.query.get('tab') === 'grants');

  return (
    <div className="narrow">
      <div className="page-title">
        <h1>待处理</h1>
        <p>{t.count ? `有 ${t.count} 件事需要你处理。` : '目前没有需要你处理的事。'}</p>
      </div>

      <TermScope>
        {t.decisions.length ? (
          <section style={{ marginBottom: 36 }}>
            <div className="section-head"><h2>需要你决定</h2></div>
            {t.decisions.map((d) => <DecisionCard key={d.id} m={m} d={d} highlight={focus === d.id} />)}
          </section>
        ) : null}

        {t.proposals.length ? (
          <section style={{ marginBottom: 36 }}>
            <div className="section-head"><h2>模型的建议</h2><span className="hint">在你采用之前，它们不会改变任何东西</span></div>
            {t.proposals.map((p) => <ProposalCard key={p.id} m={m} p={p} highlight={focus === p.id} />)}
          </section>
        ) : null}

        {t.reviews.length ? (
          <section style={{ marginBottom: 36 }}>
            <div className="section-head"><h2>有新版本待审阅</h2><span className="hint">新版本不继承旧审阅</span></div>
            <div className="rows">
              {t.reviews.map((q) => {
                const unitId = q.id.startsWith('brf_') ? (m.byId.get(q.id)?.unit_id as string) : q.id;
                return (
                  <a key={q.id} className="rowi" href={`#/unit/${unitId}${q.id.startsWith('brf_') ? '' : '?tab=history'}`}>
                    <div className="grow">
                      <div className="title">{q.id.startsWith('brf_') ? `说明：${displayName(m, unitId)}` : displayName(m, q.id)}</div>
                      <div className="sub">你看过{versionText(q.previous)}，现在是{versionText(q.revision)}</div>
                    </div>
                    <span className="btn sm">去看</span>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {!t.count ? <Empty>都处理完了。</Empty> : null}

        {waiting.length ? (
          <section style={{ marginBottom: 36 }}>
            <div className="section-head"><h2>你要求修改的</h2><span className="hint">在等新版本；新版本出来后会回到“待审阅”</span></div>
            <div className="rows">
              {waiting.map((w) => {
                const unitId = w.id.startsWith('brf_') ? (m.byId.get(w.id)?.unit_id as string) : w.id;
                return (
                  <a key={w.id} className="rowi" href={`#/unit/${unitId}?tab=history`}>
                    <div className="grow">
                      <div className="title">{w.id.startsWith('brf_') ? `说明：${displayName(m, unitId)}` : displayName(m, w.id)}（{versionText(w.revision)}）</div>
                      <div className="sub">你的意见：{w.review.findings.length ? `“${w.review.findings.join(' ')}”` : '没有写明'} · {fmtTime(w.review.created_at)}</div>
                    </div>
                    <span className="btn sm">去看</span>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {deferredIds.length ? (
          <details className="more">
            <summary>已暂缓（{deferredIds.length}）</summary>
            <div className="rows">
              {deferredIds.map((id) => (
                <div key={id} className="rowi">
                  <div className="grow"><div className="title">{displayName(m, id)}</div><div className="sub">暂缓于 {fmtTime(m.flags.deferred[id].at)}</div></div>
                  <button type="button" className="sm" onClick={() => run((mm) => undefer(mm, { id }))}>恢复</button>
                </div>
              ))}
            </div>
          </details>
        ) : null}

        <hr style={{ margin: '40px 0 20px' }} />
        <details className="more" open={recordsOpen}>
          <summary>记录：已作出的决定、自动处理、授权</summary>
          <Records m={m} focus={focus} decided={decided} handled={handled} />
        </details>
      </TermScope>
    </div>
  );
}

function DecisionCard({ m, d, highlight }: { m: Model; d: Decision; highlight: boolean }) {
  const { run } = useStore();
  const [info, setInfo] = useState('');
  const [pending, setPending] = useState<{ optionId: string | null } | null>(null);
  const rec = m.proposals.find((p) => p.status === 'candidate' && p.commands.some((c) => c.kind === 'decide_decision' && (c as { decision_id: string }).decision_id === d.id));
  const recOption = rec ? (rec.commands[0] as { accepted_option_id: string }).accepted_option_id : null;
  const choose = (optionId: string | null, reason: string) => {
    const r = run((mm) => decide(mm, { decisionId: d.id, optionId, reason, expectedRevision: mm.project.revision, viaProposalId: optionId && optionId === recOption ? rec?.id : undefined }));
    if (r.ok) setPending(null);
  };
  const pendingLabel = pending ? (pending.optionId ? `“${d.options.find((o) => o.id === pending.optionId)?.label}”` : '都不选') : '';
  return (
    <div className={`card ${highlight ? 'hl' : ''}`} id={`focus-${d.id}`}>
      <h3 style={{ fontSize: '1.125rem' }}>{d.question}</h3>
      <p style={{ color: 'var(--text-2)', margin: '6px 0 16px' }}>{m.ext.one_liners[d.id] ?? d.rationale}</p>
      <div className="stack">
        {d.options.map((o) => (
          <div key={o.id} className="row spread" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', flexWrap: 'nowrap' }}>
            <div className="grow">
              <div style={{ fontWeight: 550 }}>
                {o.label} {o.id === recOption ? <span className="chip strong-blue" style={{ marginLeft: 6 }}>模型建议</span> : null}
              </div>
              <div className="small muted">好处：{o.expected_benefit}　代价：<RichText text={o.cost_and_risk.split('；')[0]} compact /></div>
            </div>
            <button type="button" className={`sm ${pending?.optionId === o.id ? 'primary' : ''}`} onClick={() => setPending({ optionId: o.id })}>选这个</button>
          </div>
        ))}
      </div>
      {pending ? (
        <ReasonForm
          label={`你选择了${pendingLabel}。为什么？`}
          placeholder="例如：先保证正在进行的实验，等它出结果再开始。"
          confirmLabel="确认选择"
          onCancel={() => setPending(null)}
          onConfirm={(reason) => choose(pending.optionId, reason)}
        />
      ) : (
        <div className="row" style={{ marginTop: 14, gap: 4 }}>
          <button type="button" className="ghost sm" onClick={() => run((mm) => defer(mm, { id: d.id, reason: '暂缓' }))}>暂缓</button>
          <button type="button" className="ghost sm" onClick={() => setPending({ optionId: null })}>都不选</button>
        </div>
      )}
      <details className="more">
        <summary className="small">依据、风险与模型建议的问题</summary>
        <div className="small stack">
          {d.options.map((o) => <p key={o.id} style={{ margin: 0 }}><strong>{o.label}：</strong><RichText text={o.cost_and_risk} compact /></p>)}
          {rec ? (m.ext.rule_checks[rec.id] ?? []).map((c, i) => <p key={i} style={{ margin: 0 }}>⚠ {c.rule}：<RichText text={c.detail} compact /></p>) : null}
          <p style={{ margin: 0 }}>依据：{d.evidence_ids.map((e, i) => <span key={e}>{i ? '、' : ''}<Ref id={e} /></span>)}</p>
          <p className="muted" style={{ margin: 0 }}>选择后只表示允许按此推进，不会自动启动任何会话，也不放宽文件或网络权限。</p>
          <div className="row">
            <input type="text" value={info} onChange={(e) => setInfo(e.target.value)} placeholder="需要补充什么信息？" aria-label="需要补充的信息" style={{ flex: 1 }} />
            <button type="button" className="sm" disabled={!info.trim()} onClick={() => { run((mm) => requestInfo(mm, { targetId: d.id, text: info })); setInfo(''); }}>请求补充</button>
          </div>
        </div>
      </details>
    </div>
  );
}

function ProposalCard({ m, p, highlight }: { m: Model; p: Proposal; highlight: boolean }) {
  const { run } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const checks = m.ext.rule_checks[p.id] ?? [];
  return (
    <div className={`card ${highlight ? 'hl' : ''}`} id={`focus-${p.id}`}>
      <h3 style={{ fontSize: '1.125rem' }}>{p.title.replace(/^建议：/, '')}</h3>
      <p style={{ color: 'var(--text-2)', margin: '6px 0 12px' }}>{m.ext.one_liners[p.id] ?? p.summary}</p>
      {checks.length ? (
        <div className="warn-box small">
          {checks.map((c, i) => <div key={i}>⚠ <strong>{c.rule}</strong></div>)}
        </div>
      ) : null}
      {rejecting ? (
        <ReasonForm
          label="为什么拒绝？"
          placeholder="例如：这条路线已经关闭过；没有新的证据之前不再考虑。"
          confirmLabel="确认拒绝"
          onCancel={() => setRejecting(false)}
          onConfirm={(reason) => { const r = run((mm) => rejectProposal(mm, { proposalId: p.id, reason })); if (r.ok) setRejecting(false); }}
        />
      ) : (
        <div className="row" style={{ gap: 6, marginTop: 12 }}>
          <button type="button" className="sm" onClick={() => setRejecting(true)}>拒绝…</button>
          <button type="button" className="sm" onClick={() => run((mm) => defer(mm, { id: p.id, reason: '暂缓' }))}>暂缓</button>
          <button type="button" className="ghost sm" onClick={() => setConfirm(true)}>仍然采用…</button>
        </div>
      )}
      {confirm ? (
        <div className="info-box small" role="alertdialog" aria-label="确认采用">
          <p>采用后会在主线上新建一个研究单元。上面的问题会保留在记录里。</p>
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="sm primary" onClick={() => { run((mm) => applyCreateUnitProposal(mm, { proposalId: p.id, expectedRevision: mm.project.revision, expectedTargetRevision: p.revision })); setConfirm(false); }}>确认采用</button>
            <button type="button" className="sm ghost" onClick={() => setConfirm(false)}>取消</button>
          </div>
        </div>
      ) : null}
      <details className="more">
        <summary className="small">详细说明与来源</summary>
        <div className="small stack">
          {checks.map((c, i) => <p key={i} style={{ margin: 0 }}><strong>{c.rule}：</strong><RichText text={c.detail} compact /></p>)}
          <p style={{ margin: 0 }}><strong>风险：</strong>{p.risk_and_uncertainty}</p>
          {p.provenance.source_refs.map((s, i) => <Locator key={i} loc={s} />)}
          <p className="muted" style={{ margin: 0 }}>模型只能提出建议，不能自己采用。
            <button type="button" className="link" onClick={() => run((mm) => agentApplyAttempt(mm, { proposalId: p.id }))}>试一下：让模型自己采用</button>
          </p>
        </div>
      </details>
    </div>
  );
}

const POLICY: Record<string, string> = { human_only: '只能你本人操作', policy_within_scope: '范围内的常规更新可自动应用', policy_exact_proposal: '只允许自动应用一项指定候选' };

function Records({ m, focus, decided, handled }: { m: Model; focus: string | null; decided: Decision[]; handled: Proposal[] }) {
  const { run } = useStore();
  const [revoking, setRevoking] = useState<string | null>(null);
  // 演示用：找一项按范围自动应用的有效授权，以及一个在它范围外的单元
  const routine = m.grants.find((g) => g.status === 'active' && g.application_policy === 'policy_within_scope' && g.scope.kind === 'units');
  const scopeUnits: string[] = routine && routine.scope.kind === 'units' ? routine.scope.unit_ids : [];
  const inScope = m.units.find((u) => scopeUnits.includes(u.id));
  const outScope = m.units.find((u) => !scopeUnits.includes(u.id) && u.work_state !== 'archived' && u.work_state !== 'finished');
  /** 你本人只能亲自使用的授权，不在这里撤销（撤销后你将无法再做任何人工操作）。 */
  const ownCore = (g: Grant) => g.id === ownerOf(m).grant?.id;
  return (
    <div className="stack" style={{ marginTop: 8 }}>
      <h3 style={{ marginTop: 8 }}>已作出的决定</h3>
      <div className="rows">
        {decided.map((d) => {
          const opt = d.options.find((o) => o.id === d.accepted_option_id);
          return (
            <div key={d.id} id={`focus-${d.id}`} className="rowi" style={focus === d.id ? { background: 'var(--accent-bg)' } : undefined}>
              <div className="grow">
                <div className="title">{d.question}</div>
                <div className="sub">{opt ? `选择：${opt.label}` : '未采用'} · {fmtTime(d.accepted_at ?? d.updated_at)}{d.superseded_by_decision_id ? ' · 已被新决定替代，只作历史' : ''}</div>
                <div className="small" style={{ marginTop: 2 }}>理由：<RichText text={d.rationale} compact /></div>
              </div>
              <Badge table={DECISION} value={d.status} />
            </div>
          );
        })}
      </div>

      <h3 style={{ marginTop: 20 }}>候选的处理记录</h3>
      <div className="rows">
        {handled.map((p) => {
          const ev = m.timeline.find((t) => t.entityIds.includes(p.id) && t.type === 'proposal.applied');
          return (
            <div key={p.id} id={`focus-${p.id}`} className="rowi" style={focus === p.id ? { background: 'var(--accent-bg)' } : undefined}>
              <div className="grow">
                <div className="title">{p.title.replace(/^建议：/, '')}</div>
                <div className="sub">{ev?.actor.kind === 'service' ? `按你的授权自动应用，没有再次询问 · ${fmtTime(ev.at)}` : ev ? `由你采用 · ${fmtTime(ev.at)}` : p.status === 'stale' ? '它依赖的决定已经变了' : ''}</div>
                {p.status === 'rejected' && p.summary.includes('拒绝理由：') ? <div className="small" style={{ marginTop: 2 }}>拒绝理由：{p.summary.split('拒绝理由：').pop()}</div> : null}
              </div>
              <Badge table={PROPOSAL} value={p.status} />
            </div>
          );
        })}
      </div>
      {routine && inScope ? (
        <details style={{ marginTop: 4 }}>
          <summary className="small">试一下：授权范围内外的自动更新</summary>
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="sm" onClick={() => run((mm) => policyApplyRoutine(mm, { grantId: routine.id, unitId: inScope.id, nextAction: `${(mm.byId.get(inScope.id)?.next_action as string) ?? ''}（演示：结果文件统一命名）` }))}>范围内：更新“{inScope.title}”</button>
            {outScope ? <button type="button" className="sm" onClick={() => run((mm) => policyApplyRoutine(mm, { grantId: routine.id, unitId: outScope.id, nextAction: '演示' }))}>范围外：更新“{outScope.title}”</button> : null}
          </div>
        </details>
      ) : null}

      <h3 style={{ marginTop: 20 }}>授权</h3>
      <div className="rows">
        {m.grants.map((g: Grant) => (
          <div key={g.id} id={`focus-${g.id}`} className="rowi" style={focus === g.id ? { background: 'var(--accent-bg)' } : undefined}>
            <div className="grow">
              <div className="title">{m.ext.display_names[g.id] ?? g.id}</div>
              <div className="sub">{POLICY[g.application_policy]}{g.expires_at ? ` · 到 ${fmtTime(g.expires_at)}` : ''}</div>
            </div>
            <span className="chip"><span className={`dot ${g.status === 'active' ? 'green' : 'gray'}`} aria-hidden="true" />{g.status === 'active' ? '有效' : g.status === 'expired' ? '已过期' : '已撤销'}</span>
            {g.status === 'active' && !ownCore(g) && revoking !== g.id ? <button type="button" className="ghost sm" onClick={() => setRevoking(g.id)}>撤销…</button> : null}
          </div>
        ))}
        {revoking ? (
          <ReasonForm
            label={`撤销“${m.ext.display_names[revoking] ?? revoking}”的理由`}
            confirmLabel="确认撤销"
            onCancel={() => setRevoking(null)}
            onConfirm={(reason) => { const r = run((mm) => revokeGrant(mm, { grantId: revoking, expectedRevision: mm.project.revision, reason })); if (r.ok) setRevoking(null); }}
          />
        ) : null}
      </div>
      {m.flags.ruleDemos.length ? (
        <p className="small muted">刚才的演示：{m.flags.ruleDemos.map((d) => `${d.action} → 被拒绝（${d.status}）`).join('；')}</p>
      ) : null}
    </div>
  );
}
