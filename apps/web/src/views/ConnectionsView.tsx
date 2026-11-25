// 连接与能力（方案 §12.3）：每个连接说清楚“能做什么、不能做什么”。按实际探测结果，不按品牌推定。
import type { CapabilityValue } from '@rw/contracts';
import { SUPPORT } from '@rw/domain';
import { useStore } from '../data/store.tsx';
import { fmtTime } from '../data/format.ts';
import { Badge } from '../components/ui.tsx';

const CAP: Record<string, string> = {
  readHistory: '读取历史会话', observeMessages: '看到对话消息', observeTools: '看到工具调用', injectAtSessionStart: '开始时提供背景', injectAtUserPrompt: '发消息前补充背景',
  injectAfterCompaction: '压缩后重新提供背景', createSession: '从这里开新会话', resumeSession: '恢复会话', forkSession: '分叉会话', steerTurn: '中途改方向', interruptTurn: '从这里停止任务',
  mediateToolApproval: '代为批准工具', checkpointFiles: '使用宿主的文件检查点',
};
const MODE: Record<string, string> = { archive: '只导入历史', sidecar: '在原客户端旁边观察', managed: '由工作台管理' };

export function ConnectionsView() {
  const { model: m } = useStore();
  return (
    <div className="narrow">
      <div className="page-title">
        <h1>连接</h1>
        <p>工作台和 Codex、Claude Code 之间实际能做什么。样机没有连接真实工具，下面是虚构的探测结果。</p>
      </div>
      {m.caps.map((c) => {
        const conn = m.ext.connections.find((x) => x.harness_instance_id === c.harness_instance_id);
        const entries = Object.entries(c.capabilities as Record<string, CapabilityValue>);
        const can = entries.filter(([, v]) => v.support === 'supported' || v.support === 'partial');
        const cannot = entries.filter(([, v]) => v.support === 'unsupported' || v.support === 'unverified');
        return (
          <section key={c.id} className="card">
            <div className="row spread">
              <h2>{conn?.label ?? c.provider}</h2>
              <span className="small muted">{MODE[c.connection_mode]}{conn ? ` · 最近同步 ${fmtTime(conn.last_sync_at)}` : ''}</span>
            </div>
            {conn ? <p className="small" style={{ color: 'var(--text-2)', marginTop: 8 }}>记录范围：{conn.capture_scope}。没有记录：{conn.not_captured.join('、')}。</p> : null}
            <div className="kn" style={{ margin: '14px 0 0' }}>
              <div className="k">
                <span className="label">可以</span>
                <ul>{can.map(([k, v]) => <li key={k}>{CAP[k] ?? k}{v.support === 'partial' ? <span className="muted">（部分：{v.limitations[0] ?? v.scope}）</span> : null}</li>)}</ul>
              </div>
              <div className="n">
                <span className="label">不可以</span>
                <ul>{cannot.map(([k, v]) => <li key={k}>{CAP[k] ?? k}{v.support === 'unverified' ? <span className="muted">（未核验）</span> : null}</li>)}</ul>
              </div>
            </div>
            <details className="more">
              <summary className="small">技术细节</summary>
              <table>
                <thead><tr><th>能力</th><th>状态</th><th>说明</th></tr></thead>
                <tbody>{entries.map(([k, v]) => <tr key={k}><td className="mono">{k}</td><td><Badge table={SUPPORT} value={v.support} /></td><td className="small">{[v.scope, ...v.limitations].join('；')}</td></tr>)}</tbody>
              </table>
              <p className="small muted">宿主版本：{c.provider_version} · 适配器：{c.adapter_version}</p>
            </details>
          </section>
        );
      })}
    </div>
  );
}
