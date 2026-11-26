// 概览：先回答“在研究什么、知道了什么、还不知道什么、正在做什么、需要我做什么”（方案 §1.1、§6.1）。
// 每项只给一句话；细节在对应页面展开。“正在做”和“需要你处理”由项目状态算出；
// 手写的要点记着写作时依据的版本，依据更新后标出“可能已过时”（D-007）。
import type { ResearchUnit } from '@rw/contracts';
import type { RevisionRef } from '@fixtures/src/extension-types.ts';
import { useStore } from '../data/store.tsx';
import { changesRequested, get, runningSessionFor, type Model } from '../data/model.ts';
import { attentionItems, homeSummary, staleBasis } from '../data/derive.ts';
import { fmtTime, hrefFor } from '../data/format.ts';

const KIND: Record<string, string> = { decision: '待决定', drift: '提醒', evidence_gap: '证据缺口', review: '待审阅', source: '资料', capability: '连接', blocker: '阻塞' };

function StaleNote({ m, basis }: { m: Model; basis: RevisionRef[] }) {
  const stale = staleBasis(m, basis);
  if (!stale.length) return null;
  return <p className="stale-note">这句话写好之后，它依据的内容又更新过（{stale.length} 处），可能已经过时。</p>;
}

export function HomeView() {
  const { model: m } = useStore();
  const ext = m.ext;
  const s = homeSummary(m);
  const doing = get<ResearchUnit>(m, m.project.focus_unit_id);
  const session = doing ? runningSessionFor(m, doing.id) : undefined;

  const { open: items } = attentionItems(m);
  const top = items.slice(0, 3);
  const rest = items.slice(3);
  const waiting = changesRequested(m);

  const changes = [
    ...[...m.local].reverse().map((e) => ({ at: e.at, text: e.summary, local: true })),
    // 项目没有写好的“上次查看后的变化”时，直接列出记录里最近的事件
    ...(ext.home
      ? [...ext.home.changes_since_last_visit].reverse().map((c) => ({ at: c.at, text: c.short, local: false }))
      : m.timeline.filter((t) => !t.local).slice(-6).reverse().map((t) => ({ at: t.at, text: t.summary, local: false }))),
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <section aria-labelledby="q">
        <div className="label">研究问题</div>
        <h1 id="q" className="hero-q">{s.question}</h1>
        <p className="hero-sub">
          {s.mainline.text} <a href="#/map">查看全部路线</a>
        </p>
        <StaleNote m={m} basis={s.mainline.basis} />
        {!s.curated ? <p className="small muted" style={{ margin: '6px 0 0' }}>这个项目还没有写好的首页要点，下面的内容由项目当前的记录整理。</p> : null}

        <div className="tri">
          <div className="card">
            <div className="label">已经知道</div>
            {s.known ? (
              <>
                <div className="big">{s.known.text}</div>
                <p className="detail">{s.known.detail}</p>
                <StaleNote m={m} basis={s.known.basis} />
                <a href={hrefFor(m, s.known.ref) ?? '#/evidence'}>查看证据 →</a>
              </>
            ) : <p className="detail">主线上还没有有证据支持的主张。</p>}
          </div>
          <div className="card unknown">
            <div className="label">还不知道 · 最重要</div>
            {s.unknown ? (
              <>
                <div className="big">{s.unknown.text}</div>
                <p className="detail">{s.unknown.detail}</p>
                <StaleNote m={m} basis={s.unknown.basis} />
                <a href={hrefFor(m, s.unknown.ref) ?? '#/evidence'}>为什么还不知道 →</a>
              </>
            ) : <p className="detail">主线上没有记录待检验的主张。</p>}
          </div>
          <div className="card">
            <div className="label">正在做</div>
            {doing ? (
              <>
                <div className="big">{doing.title}</div>
                <p className="detail">
                  {session ? (
                    <>
                      <span className="pill-live"><span className="dot" aria-hidden="true" />运行中</span>{' '}
                      <span className="muted">最近活动 {fmtTime(session.last_observed_at)}</span>
                    </>
                  ) : '目前没有观测到正在执行的会话。'}
                </p>
                <a href={`#/unit/${doing.id}`}>打开这项工作 →</a>
              </>
            ) : <p className="detail">项目还没有指定当前工作。</p>}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="todo-h">
        <div className="section-head">
          <h2 id="todo-h">需要你处理</h2>
          <a className="small" href="#/decisions">全部待处理 →</a>
        </div>
        <div className="rows">
          {!items.length ? <div className="rowi"><div className="grow muted">现在没有需要你处理的事。</div></div> : null}
          {top.map((a) => (
            <div key={a.id} className="rowi">
              <span className="kind">{KIND[a.kind]}</span>
              <div className="grow">
                <div className="title">{a.title}</div>
                <div className="sub">{a.short}</div>
              </div>
              <a className={`btn sm ${a.kind === 'decision' ? 'primary' : ''}`} href={a.target}>{a.action_label}</a>
            </div>
          ))}
          {rest.length ? (
            <details className="rowd">
              <summary><span className="small">另外 {rest.length} 项不急的事</span></summary>
              <div className="rowd-body" style={{ padding: 0 }}>
                {rest.map((a) => (
                  <div key={a.id} className="rowi" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="kind">{KIND[a.kind]}</span>
                    <div className="grow">
                      <div className="title">{a.title}</div>
                      <div className="sub">{a.short}</div>
                    </div>
                    <a className="btn sm" href={a.target}>{a.action_label}</a>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </div>
        {waiting.length ? (
          <p className="small muted" style={{ marginTop: 8 }}>
            另有 {waiting.length} 项你要求修改、正在等新版本：{waiting.map((x, i) => <span key={x.id}>{i ? '、' : ''}<a href={hrefFor(m, x.id) ?? '#/decisions'}>{x.id.startsWith('brf_') ? '说明' : (get<ResearchUnit>(m, x.id)?.title ?? x.id)}</a></span>)}
          </p>
        ) : null}
      </section>

      <section className="section" aria-labelledby="chg-h">
        <div className="section-head">
          <h2 id="chg-h">{ext.viewer && ext.home ? `你上次查看（${fmtTime(ext.viewer.last_visit_at)}）之后` : '最近的变化'}</h2>
        </div>
        <div className="card" style={{ padding: '6px 22px' }}>
          <ol className="timeline">
            {changes.slice(0, 4).map((c, i) => (
              <li key={i}>
                <time dateTime={c.at}>{fmtTime(c.at)}</time>
                <span>{c.text}{c.local ? <span className="tag" style={{ marginLeft: 8 }}>样机操作</span> : null}</span>
              </li>
            ))}
          </ol>
          {changes.length > 4 ? (
            <details style={{ padding: '4px 0 10px' }}>
              <summary className="small">再显示 {changes.length - 4} 项</summary>
              <ol className="timeline">
                {changes.slice(4).map((c, i) => (
                  <li key={i}>
                    <time dateTime={c.at}>{fmtTime(c.at)}</time>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </div>
      </section>
    </div>
  );
}
