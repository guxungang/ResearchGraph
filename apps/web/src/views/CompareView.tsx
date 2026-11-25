// 路线比较：每条路线一张卡片，只放几个关键问题；完整维度对比按需展开。未知写“未知”，不给总分（方案 §6.4）。
import { useState } from 'react';
import type { DimKey } from '@fixtures/src/extension-types.ts';
import { useStore } from '../data/store.tsx';
import type { Route } from '../router.ts';
import { RichText, TermScope } from '../components/ui.tsx';
import { routeColor } from './MapView.tsx';

const DIMS: DimKey[] = ['problem', 'assumptions', 'support', 'counter', 'open', 'cost', 'interpretability', 'decision'];

export function CompareView({ route }: { route: Route }) {
  const { model: m } = useStore();
  const cmp = m.ext.comparison;
  const focus = route.query.get('focus');
  const [showClosed, setShowClosed] = useState(false);
  const routes = cmp.routes.filter((r) => showClosed || m.branches.find((b) => b.id === r.branch_id)?.state !== 'closed');
  const closedCount = cmp.routes.length - cmp.routes.filter((r) => m.branches.find((b) => b.id === r.branch_id)?.state !== 'closed').length;
  const legacy = cmp.metrics.find((x) => x.group_id === 'G_legacy');

  return (
    <div>
      <a className="back" href="#/map">← 研究路线</a>
      <div className="row spread page-title">
        <div>
          <h1>比较路线</h1>
          <p>{cmp.question}</p>
        </div>
        {closedCount ? (
          <label className="row small"><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> 显示已关闭的路线（{closedCount}）</label>
        ) : null}
      </div>

      <div className="route-cards">
        {routes.map((r) => {
          const closed = m.branches.find((b) => b.id === r.branch_id)?.state === 'closed';
          return (
            <div key={r.branch_id} id={`focus-${r.branch_id}`} className={`card route-card ${closed ? 'closed' : ''} ${focus === r.branch_id ? 'hl' : ''}`} style={{ borderTopColor: routeColor(r.branch_id) }}>
              <div>
                <h2 style={{ fontSize: '1.0625rem' }}>{r.label}</h2>
                <div className="small muted" style={{ marginTop: 2 }}>{r.card.status}</div>
              </div>
              <div className="field"><span className="label">做法</span><p>{r.card.aim}</p></div>
              <div className="field">
                <span className="label">任务完成率（预算100，5个种子）</span>
                {r.card.completion ? <div className="metric">{r.card.completion}</div> : <div className="metric unknown">未知</div>}
              </div>
              <div className="field"><span className="label">支持它的证据</span><p>{r.card.evidence_for ?? <span className="muted">未知</span>}</p></div>
              <div className="field"><span className="label">不利的证据</span><p>{r.card.evidence_against ?? <span className="muted">未知</span>}</p></div>
              <div className="field"><span className="label">成本</span><p>{r.card.cost}</p></div>
            </div>
          );
        })}
      </div>

      <p className="small muted" style={{ marginTop: 16 }}>
        这里不给总分或胜率。只有数据、预算、种子都相同的结果才放在同一行比较。
        {legacy ? `路线A早先用单一种子得到的 ${legacy.value} 用的是旧规则，不能和上面的数字比较。` : ''}
      </p>

      <details className="more" style={{ marginTop: 24 }}>
        <summary>按全部维度对比</summary>
        <TermScope>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th style={{ width: 120 }}>维度</th>{routes.map((r) => <th key={r.branch_id}>{r.label}</th>)}</tr>
                </thead>
                <tbody>
                  {DIMS.map((d) => (
                    <tr key={d}>
                      <th scope="row">{cmp.dimension_labels[d]}</th>
                      {routes.map((r) => {
                        const v = r.dims[d];
                        return v ? <td key={r.branch_id}><RichText text={v.text} compact /></td> : <td key={r.branch_id} className="unknown">未知</td>;
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
