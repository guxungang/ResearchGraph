// 显示辅助：对象名称、链接目标与时间格式。界面优先显示可理解的名称，机器ID放在提示与元数据中（方案 §14.1）。
import type { Model, AnyEntity } from './model.ts';

const TZ = 'Asia/Shanghai';
const dtf = new Intl.DateTimeFormat('zh-CN', { timeZone: TZ, month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
const df = new Intl.DateTimeFormat('zh-CN', { timeZone: TZ, year: 'numeric', month: 'long', day: 'numeric' });

export const fmtTime = (iso: string | null | undefined) => (iso ? dtf.format(new Date(iso)) : '未知');
export const fmtDate = (iso: string | null | undefined) => (iso ? df.format(new Date(iso)) : '未知');

const KIND_NAMES: Record<string, string> = {
  prj: '项目', brn: '路线', unt: '研究单元', edg: '关系', clm: '主张', evd: '证据', dec: '决定', art: '成果版本', run: '实验运行', ckp: '快照',
  pro: '候选变更', rev: '审阅记录', ses: '会话绑定', cap: '能力清单', ctx: '上下文包', brf: '阅读说明', grt: '授权', cst: '约束', evt: '事件',
};
export const kindName = (id: string) => KIND_NAMES[id.slice(0, 3)] ?? '对象';

export const RUN_NAMES: Record<string, string> = {
  run_baseline_1s: '原方法基线（单一种子）', run_baseline: '原方法基线（5个种子）', run_a_diag: '原始概率的可靠性诊断', run_calib: '校准前后的概率误差',
  run_calib_peak: '按时段的概率误差', run_alloc_v1: '对照实验第一次运行', run_alloc_v2: '对照实验第二次运行',
};

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

export function displayName(m: Model, id: string): string {
  const override = m.ext.display_names[id];
  if (override) return override;
  const e = m.byId.get(id) as AnyEntity | undefined;
  if (!e) {
    if (id.startsWith('cst_')) {
      const c = (m.project.constraints as { id: string; text: string }[]).find((x) => x.id === id);
      if (c) return `约束：${clip(c.text, 18)}`;
    }
    return id;
  }
  const s = (k: string) => (typeof e[k] === 'string' ? (e[k] as string) : '');
  switch (id.slice(0, 3)) {
    case 'prj': return s('name');
    case 'brn': return s('name');
    case 'unt': return s('title');
    case 'clm': return `“${clip(s('text'), 24)}”`;
    case 'evd': return s('title');
    case 'dec': {
      const opts = (e.options as { id: string; label: string }[]) ?? [];
      const acc = opts.find((o) => o.id === e.accepted_option_id);
      return acc ? `“${clip(acc.label, 22)}”` : `“${clip(s('question'), 24)}”`;
    }
    case 'art': return `${s('title')}（${s('version_label')}）`;
    case 'run': return RUN_NAMES[id] ?? id;
    case 'ckp': return `“${s('title')}”`;
    case 'pro': return `“${clip(s('title').replace(/^建议：/, ''), 22)}”`;
    case 'rev': return '审阅记录';
    case 'brf': return `“${clip(s('title'), 22)}”`;
    default: return id;
  }
}

/** 对象的浏览入口。点击只改变浏览位置，不改变任何执行绑定。 */
export function hrefFor(m: Model, id: string): string | null {
  const e = m.byId.get(id) as AnyEntity | undefined;
  switch (id.slice(0, 3)) {
    case 'prj': return '#/';
    case 'cst': return '#/';
    case 'unt': return `#/unit/${id}`;
    case 'brn': return `#/compare?focus=${id}`;
    case 'clm':
    case 'evd': return `#/evidence?focus=${id}`;
    case 'dec':
    case 'pro': return `#/decisions?focus=${id}`;
    case 'grt': return `#/decisions?tab=grants&focus=${id}`;
    case 'art': return `#/evidence?tab=artifacts&focus=${id}`;
    case 'run': return `#/evidence?tab=runs&focus=${id}`;
    case 'ckp': return `#/checkpoint/${id}`;
    case 'brf': return e ? `#/unit/${e.unit_id as string}` : null;
    case 'rev': return e ? hrefFor(m, e.target_id as string) : null;
    case 'ses':
    case 'cap':
    case 'src': return '#/connections';
    case 'ctx': return e ? `#/unit/${e.unit_id as string}?tab=history` : null;
    default: return null;
  }
}

export const versionText = (rev: number) => `第${rev}版`;
