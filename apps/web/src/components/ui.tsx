import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { label, PRECISION, type StateLabel } from '@rw/domain';
import type { SourceLocator } from '@rw/contracts';
import { useModel, useStore } from '../data/store.tsx';
import { displayName, fmtTime, hrefFor, kindName, versionText } from '../data/format.ts';
import type { GlossaryEntry } from '@fixtures/src/extension-types.ts';

// ---------------------------------------------------------------- 状态标签（文字 + 图标；颜色只作辅助）
const DOT: Record<string, string> = { neutral: 'gray', info: 'blue', positive: 'green', caution: 'amber', negative: 'red', muted: 'gray' };
export const toneDot = (tone: string) => DOT[tone] ?? 'gray';

/** 状态：圆点 + 文字。圆点颜色只是辅助，含义由文字表达。 */
export function Badge({ table, value, prefix, title }: { table: Record<string, StateLabel>; value: string | null | undefined; prefix?: string; title?: string }) {
  const l = label(table, value);
  return (
    <span className="chip" title={title ?? l.hint}>
      <span className={`dot ${toneDot(l.tone)}`} aria-hidden="true" />
      {prefix ? `${prefix}：` : ''}
      {l.text}
    </span>
  );
}

// ---------------------------------------------------------------- 对象链接：显示名称，ID放在提示中
/** 给出 version 时链接到那个精确版本；它已不是当前版本时，打开的是历史版本页，而不是改过的新版本。 */
export function Ref({ id, version, children }: { id: string; version?: number; children?: ReactNode }) {
  const m = useModel();
  const href = hrefFor(m, id, version);
  const exists = m.byId.has(id) || id.startsWith('cst_') || id.startsWith('src_');
  const text = children ?? displayName(m, id);
  const title = `${kindName(id)} · ${id}${version ? ` · ${versionText(version)}` : ''}${exists ? '' : ' · 未找到该对象'}`;
  const content = (
    <>
      {text}
      {version && children === undefined && m.byId.get(id)?.revision !== version ? <span className="muted">（{versionText(version)}）</span> : null}
    </>
  );
  if (!exists) return <span className="ref missing" title={title}>{content}</span>;
  return href ? <a className="ref" href={href} title={title}>{content}</a> : <span title={title}>{content}</span>;
}

/** 紧凑的来源标记：正文中只显示对象类别，完整名称在提示里，点击直达来源。 */
export function SourceTag({ id }: { id: string }) {
  const m = useModel();
  const href = hrefFor(m, id);
  const text = ({ evd: '证据', run: '运行', art: '文件', dec: '决定', clm: '主张', pro: '候选', grt: '授权', ckp: '快照', brf: '说明', rev: '审阅', cst: '约束', ses: '会话', ctx: '上下文' } as Record<string, string>)[id.slice(0, 3)] ?? '来源';
  return (
    <a className="src" href={href ?? undefined} title={`${displayName(m, id)}（${id}）`}>
      {text}
    </a>
  );
}

// ---------------------------------------------------------------- 术语卡
interface TermCtx {
  open: (entry: GlossaryEntry, trigger: HTMLElement | null) => void;
}
const TermContext = createContext<TermCtx>({ open: () => {} });
export const useTerms = () => useContext(TermContext);
const ScopeContext = createContext<Set<string> | null>(null);

export function TermProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ entry: GlossaryEntry; trigger: HTMLElement | null } | null>(null);
  return (
    <TermContext.Provider value={{ open: (entry, trigger) => setState({ entry, trigger }) }}>
      {children}
      {state ? (
        <Drawer
          title={state.entry.term}
          onClose={() => {
            state.trigger?.focus();
            setState(null);
          }}
        >
          <TermCard entry={state.entry} />
        </Drawer>
      ) : null}
    </TermContext.Provider>
  );
}

function TermCard({ entry }: { entry: GlossaryEntry }) {
  const m = useModel();
  return (
    <div>
      <p>{entry.plain}</p>
      {entry.formal ? (
        <>
          <h4>正式定义</h4>
          <code className="formula">{entry.formal}</code>
        </>
      ) : null}
      {entry.example ? (
        <>
          <h4 style={{ marginTop: 12 }}>例子</h4>
          <p>{entry.example}</p>
        </>
      ) : null}
      <dl className="kv" style={{ marginTop: 12 }}>
        <dt>适用范围</dt>
        <dd>
          {entry.scope_branch_ids ? entry.scope_branch_ids.map((b, i) => <span key={b}>{i ? '、' : ''}<Ref id={b} /></span>) : '全项目'}
          <div className="small muted">{entry.scope_note}</div>
        </dd>
        <dt>自何时有效</dt>
        <dd>项目第{entry.valid_from_project_revision}版起</dd>
        <dt>来源</dt>
        <dd>
          <Ref id={entry.source.entity_id} /> <span className="muted small">{entry.source.note}</span>
        </dd>
        {entry.aliases.length ? (
          <>
            <dt>别名</dt>
            <dd>{entry.aliases.join('、')}</dd>
          </>
        ) : null}
      </dl>
      {(() => {
        const base = (t: string) => t.split('（')[0];
        const same = m.ext.glossary.filter((g) => g.id !== entry.id && base(g.term) === base(entry.term));
        return same.length ? (
          <div className="note-box small">
            同一符号在本项目中还有其他含义：{same.map((g) => g.term).join('、')}。它们是不同的量，不能合并。
          </div>
        ) : null;
      })()}
      <p className="small muted">术语解释属于背景说明，不改变项目的科学状态。</p>
    </div>
  );
}

/** 一个阅读区块：区块内每个术语只在第一次出现时标出。 */
export function TermScope({ children }: { children: ReactNode }) {
  const set = new Set<string>();
  return <ScopeContext.Provider value={set}>{children}</ScopeContext.Provider>;
}

const ID_PATTERN = '(?:prj|brn|unt|edg|clm|evd|dec|art|run|ckp|pro|rev|ses|cap|ctx|brf|grt|cst)_[A-Za-z0-9][A-Za-z0-9_]*';

/** 正文：把对象ID显示为可点击的名称（来源直达，C09），把术语首次出现标为可展开的先修卡。 */
export function RichText({ text, as: Tag = 'span', compact = false }: { text: string; as?: 'span' | 'p' | 'li' | 'div'; compact?: boolean }) {
  const m = useModel();
  const { open } = useContext(TermContext);
  const scope = useContext(ScopeContext);
  const local = useRef(new Set<string>()).current;
  const seen = scope ?? local;
  const glossary = m.ext.glossary.filter((g) => g.match.length);
  const terms = glossary.flatMap((g) => g.match.map((t) => ({ t, g }))).sort((a, b) => b.t.length - a.t.length);
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${ID_PATTERN})|(${terms.map((x) => escape(x.t)).join('|') || '\\u0000'})`, 'g');
  const parts: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const match of text.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const [whole, id, termText] = match;
    if (id) {
      if (compact && !/^(unt|brn|run|cst)_/.test(id) && (m.byId.has(id) || id.startsWith('cst_'))) parts.push(<SourceTag key={k++} id={id} />);
      else if (m.byId.has(id) || id.startsWith('cst_')) parts.push(<Ref key={k++} id={id} />);
      else parts.push(<code key={k++}>{id}</code>);
    } else if (termText) {
      const entry = terms.find((x) => x.t === termText)!.g;
      if (seen.has(entry.id)) parts.push(whole);
      else {
        seen.add(entry.id);
        parts.push(
          <button key={k++} type="button" className="term" onClick={(e) => open(entry, e.currentTarget)} aria-label={`${whole}（查看术语解释）`}>
            {whole}
          </button>,
        );
      }
    }
    last = idx + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Tag>{parts}</Tag>;
}

// ---------------------------------------------------------------- 抽屉
export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <aside className="drawer" role="dialog" aria-modal="false" aria-label={title}>
      <div className="drawer-head">
        <h2 tabIndex={-1} ref={ref}>{title}</h2>
        <button type="button" className="ghost" onClick={onClose} aria-label="关闭（Esc）">✕</button>
      </div>
      {children}
    </aside>
  );
}

// ---------------------------------------------------------------- 理由
/**
 * 写理由的小表单。重要的选择留下一句话理由，几个月后才知道当时为什么这样选。
 * required 为假时可以不写，记录里会如实写“没有填写理由”，不替用户编造。
 */
export function ReasonForm({ label: text, placeholder, required = false, confirmLabel, onConfirm, onCancel }: {
  label: string; placeholder?: string; required?: boolean; confirmLabel: string; onConfirm: (reason: string) => void; onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  const id = useRef(`reason-${Math.random().toString(36).slice(2, 8)}`).current;
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const blocked = required && !value.trim();
  return (
    <div className="reason-form">
      <label htmlFor={id} className="small">{text}{required ? '' : '（可以不写，但建议写一句）'}</label>
      <textarea id={id} ref={ref} value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} rows={3} />
      <div className="row" style={{ gap: 6 }}>
        <button type="button" className="sm primary" disabled={blocked} onClick={() => onConfirm(value)}>{confirmLabel}</button>
        <button type="button" className="sm ghost" onClick={onCancel}>取消</button>
        {blocked ? <span className="small muted">写一句再提交</span> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 来源定位
export function Locator({ loc }: { loc: SourceLocator }) {
  const l = loc as unknown as Record<string, unknown>;
  const p = label(PRECISION, l.precision as string);
  let where = '';
  switch (l.kind) {
    case 'message':
      where = `会话 ${l.session_id} · 消息 ${l.message_id}（${({ user: '用户', assistant: '模型', tool: '工具', system: '系统' } as Record<string, string>)[l.message_role as string]}）`;
      break;
    case 'file':
      where = `${l.relative_path}${l.page_number ? ` · 第${l.page_number}页` : ''}${l.section ? ` · §${l.section}` : ''}`;
      break;
    case 'experiment':
      where = `运行 ${l.experiment_run_id} · ${l.record_path}${l.metric_name ? ` · 指标 ${l.metric_name}` : ''}`;
      break;
    case 'provider_event':
      where = `会话 ${l.session_id} · 宿主事件 ${l.source_event_id}${l.tool_call_id ? ` · 工具调用 ${l.tool_call_id}` : ''}`;
      break;
    case 'user_action':
      where = `界面操作 ${l.action_id}（${l.ui_surface}）`;
      break;
    case 'web':
      where = `${l.title} · ${l.url}`;
      break;
  }
  return (
    <div className="locator">
      <div className="row">
        <Badge table={PRECISION} value={l.precision as string} />
        <span>{l.description as string}</span>
      </div>
      <div className="mono" style={{ marginTop: 2 }}>{where}</div>
      <div className="small muted">
        记录于 {fmtTime(l.captured_at as string)}
        {l.content_sha256 ? ` · 内容摘要 ${(l.content_sha256 as string).slice(0, 12)}…` : ''}
        {p.tone === 'caution' ? ' · 这是推断关联，不能当作确定的来源' : ''}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 标签页
export function Tabs<T extends string>({ tabs, value, onChange, label: aria }: { tabs: { id: T; label: string }[]; value: T; onChange: (id: T) => void; label: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="tabs" role="tablist" aria-label={aria}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={value === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (!dir) return;
            const next = (i + dir + tabs.length) % tabs.length;
            refs.current[next]?.focus();
            onChange(tabs[next].id);
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- 通知与读屏播报（不抢走焦点）
export function Toasts() {
  const { toasts, dismissToast, liveText } = useStore();
  return (
    <>
      <div className="sr-only" aria-live="polite" role="status">{liveText}</div>
      <div className="toast-region">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind === 'error' ? 'error' : ''}`}>
            <div className="row spread" style={{ alignItems: 'start', flexWrap: 'nowrap' }}>
              <div>
                <strong>{t.kind === 'error' ? '没有执行' : '已记录'}</strong>
                <div>{t.text}</div>
                {t.recovery ? <div className="small muted" style={{ marginTop: 4 }}>{t.recovery}</div> : null}
              </div>
              <button type="button" className="ghost sm" onClick={() => dismissToast(t.id)} aria-label="关闭提示">✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- 可靠性曲线（附等价表格）
const SHAPES = ['circle', 'square', 'triangle'] as const;
export function ReliabilityChart({ curveId }: { curveId: string }) {
  const m = useModel();
  const c = m.ext.reliability_curves.find((x) => x.id === curveId);
  if (!c) return null;
  const W = 300, H = 300, pad = 36;
  const x = (v: number) => pad + v * (W - pad - 10);
  const y = (v: number) => H - pad - v * (H - pad - 10);
  const colors = c.series.length === 1 && c.id === 'rc_peak' ? ['var(--chart-3)'] : ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];
  const shape = (s: number, cx: number, cy: number, color: string, key: string) => {
    const kind = c.id === 'rc_peak' ? 'triangle' : SHAPES[s % 3];
    if (kind === 'square') return <rect key={key} x={cx - 4} y={cy - 4} width={8} height={8} fill={color} />;
    if (kind === 'triangle') return <path key={key} d={`M${cx},${cy - 5} L${cx + 5},${cy + 4} L${cx - 5},${cy + 4} Z`} fill={color} />;
    return <circle key={key} cx={cx} cy={cy} r={4} fill="var(--surface)" stroke={color} strokeWidth={2} />;
  };
  return (
    <figure className="chart" style={{ margin: '8px 0 12px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${c.title}：横轴为预测概率，纵轴为实际按时到达比例；越接近对角线越可靠。详细数值见下方表格。`}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line className="grid" x1={x(t)} y1={y(0)} x2={x(t)} y2={y(1)} />
            <line className="grid" x1={x(0)} y1={y(t)} x2={x(1)} y2={y(t)} />
            <text x={x(t)} y={H - pad + 14} textAnchor="middle">{t}</text>
            <text x={pad - 6} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        <line className="axis" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} strokeDasharray="4 4" />
        <text x={x(0.62)} y={y(0.7)} transform={`rotate(-45 ${x(0.62)} ${y(0.7)})`}>完全可靠</text>
        {c.series.map((s, si) => (
          <g key={s.label}>
            <polyline fill="none" stroke={colors[si]} strokeWidth={2} strokeDasharray={si === 0 && c.series.length > 1 ? '5 3' : undefined} points={s.points.map((p) => `${x(p.predicted)},${y(p.observed)}`).join(' ')} />
            {s.points.map((p, pi) => shape(si, x(p.predicted), y(p.observed), colors[si], `${si}-${pi}`))}
          </g>
        ))}
        <text x={W / 2} y={H - 4} textAnchor="middle">预测概率</text>
        <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90 10 ${H / 2})`}>实际到达比例</text>
      </svg>
      <figcaption className="small">
        {c.title}。
        {c.series.map((s, si) => (
          <span key={s.label} style={{ marginLeft: 8 }}>
            <span aria-hidden="true" style={{ color: colors[si] }}>{c.id === 'rc_peak' ? '▲' : ['○', '■', '▲'][si]}</span> {s.label}
          </span>
        ))}
      </figcaption>
      <details className="small">
        <summary>以表格查看数值</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>系列</th>
                <th>预测平均</th>
                <th>实际比例</th>
                <th>配对数</th>
              </tr>
            </thead>
            <tbody>
              {c.series.flatMap((s) =>
                s.points.map((p, i) => (
                  <tr key={`${s.label}-${i}`}>
                    <td>{s.label}</td>
                    <td>{p.predicted.toFixed(2)}</td>
                    <td>{p.observed.toFixed(2)}</td>
                    <td>{p.n.toLocaleString('zh-CN')}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="muted" style={{ fontStyle: 'italic' }}>{children}</p>;
}
