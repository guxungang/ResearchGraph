// 路线比较：每条路线一张卡片，只放几个关键问题；完整维度对比按需展开。未知写“未知”，不给总分（方案 §6.4）。
// 项目里的每一条路线都在这里，包括刚新建、还没有比较内容的路线（D-007）。
import { useState } from 'react';
import type { DimKey } from '@fixtures/src/extension-types.ts';
import { useStore } from '../data/store.tsx';
import type { Route } from '../router.ts';
import { compareRoutes } from '../data/derive.ts';
import { RichText, TermScope } from '../components/ui.tsx';

const DIMS: DimKey[] = ['problem', 'assumptions', 'support', 'counter', 'open', 'cost', 'interpretability', 'decision'];

export function CompareView({ route }: { route: Route }) {
  const { model: m } = useStore();
  const cmp = m.ext.comparison;
  const dimLabels: Record<DimKey, string> = cmp?.dimension_labels ?? {
    problem: '解决的具体问题', assumptions: '关键假设', support: '已有支持', counter: '反证', open: '未解决事项', cost: '实现与实验成本', interpretability: '可解释性', decision: '当前决策状态',
  };
  const focus = route.query.get('focus');
  const [showClosed, setShowClosed] = useState(false);
  const all = compareRoutes(m);
  const routes = all.filter((r) => showClosed || r.branch.state !== 'closed');
  const closedCount = all.length - all.filter((r) => r.branch.state !== 'closed').length;
  const metricLabel = cmp?.card_metric_label ?? null;

  return (
    <div>
      <a className="back" href="#/map">← 研究路线</a>
      <div className="row spread page-title">
        <div>
          <h1>比较路线</h1>
          <p>{cmp?.question ?? m.project.goal}</p>
        </div>
        {closedCount ? (
          <label className="row small"><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> 显示已关闭的路线（{closedCount}）</label>
        ) : null}
      </div>

      <div className="route-cards">
        {routes.map((r) => (
          <div
            key={r.branch.id}
            id={`focus-${r.branch.id}`}
            className={`card route-card ${r.branch.state === 'closed' ? 'closed' : ''} ${focus === r.branch.id ? 'hl' : ''}`}
            style={{ borderTopColor: r.color }}
          >
            <div>
              <h2 style={{ fontSize: '1.0625rem' }}>{r.label}</h2>
              <div className="small muted" style={{ marginTop: 2 }}>{r.card.status}</div>
              {!r.curated ? <p className="small muted" style={{ margin: '6px 0 0' }}>这条路线还没有写好的比较内容，下面由路线和主张的记录整理。</p> : null}
              {r.stale.length ? <p className="stale-note">这张卡片写好之后，它依据的内容又更新过（{r.stale.length} 处），可能已经过时。</p> : null}
              {r.worktreeRequested ? <p className="stale-note">要求独立代码工作区：尚未创建。</p> : null}
            </div>
            <div className="field"><span className="label">做法</span><p>{r.card.aim}</p></div>
            {metricLabel ? (
              <div className="field">
                <span className="label">{metricLabel}</span>
                {r.card.completion ? <div className="metric">{r.card.completion}</div> : <div className="metric unknown">未知</div>}
              </div>
            ) : null}
            <div className="field"><span className="label">支持它的证据</span><p>{r.card.evidence_for ?? <span className="muted">未知</span>}</p></div>
            <div className="field"><span className="label">不利的证据</span><p>{r.card.evidence_against ?? <span className="muted">未知</span>}</p></div>
            <div className="field"><span className="label">成本</span><p>{r.card.cost ?? <span className="muted">未知</span>}</p></div>
          </div>
        ))}
      </div>

      <p className="small muted" style={{ marginTop: 16 }}>
        这里不给总分或胜率。只有条件相同的结果才放在一起比较。
        {(cmp?.notes ?? []).join('')}
      </p>

      <details className="more" style={{ marginTop: 24 }}>
        <summary>按全部维度对比</summary>
        <TermScope>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th style={{ width: 120 }}>维度</th>{routes.map((r) => <th key={r.branch.id}>{r.label}</th>)}</tr>
                </thead>
                <tbody>
                  {DIMS.map((d) => (
                    <tr key={d}>
                      <th scope="row">{dimLabels[d]}</th>
                      {routes.map((r) => {
                        const v = r.dims[d];
                        return v ? <td key={r.branch.id}><RichText text={v.text} compact /></td> : <td key={r.branch.id} className="unknown">未知</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TermScope>
      </details>
    </div>
  );
}
