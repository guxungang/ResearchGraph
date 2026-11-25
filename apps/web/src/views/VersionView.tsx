// 对象的一个历史版本（D-007）。历史说明、审阅、快照、上下文引用的是“当时的那一版”，
// 点进来就要看到那一版，并且一眼看出它和现在有什么不同；不能把人带到已经改过的新版本。
import type { ReactNode } from 'react';
import { ASSESSMENT, BRANCH_STATE, DECISION, PROPOSAL, WORK_STATE, label } from '@rw/domain';
import { useStore } from '../data/store.tsx';
import type { AnyEntity, Model } from '../data/model.ts';
import { displayName, fmtTime, hrefFor, kindName, versionText } from '../data/format.ts';
import { RichText } from '../components/ui.tsx';

type Field = { key: string; label: string; show: (e: AnyEntity, m: Model) => string };

const str = (k: string) => (e: AnyEntity) => (typeof e[k] === 'string' ? (e[k] as string) : e[k] == null ? '无' : JSON.stringify(e[k]));
const list = (k: string) => (e: AnyEntity) => ((e[k] as string[] | undefined) ?? []).join('；') || '无';

/** 每类对象读者关心的字段。其他字段的变化只在“其他改动”里列出名称。 */
const FIELDS: Record<string, Field[]> = {
  unt: [
    { key: 'title', label: '标题', show: str('title') },
    { key: 'question', label: '研究问题', show: str('question') },
    { key: 'work_state', label: '工作状态', show: (e) => label(WORK_STATE, e.work_state as string).text },
    { key: 'next_action', label: '下一步', show: str('next_action') },
    { key: 'completion', label: '结束依据', show: (e) => ((e.completion as { basis?: string } | null)?.basis ?? '无') },
  ],
  clm: [
    { key: 'text', label: '主张', show: str('text') },
    { key: 'assessment', label: '评估', show: (e) => label(ASSESSMENT, e.assessment as string).text },
    { key: 'conditions', label: '适用条件', show: str('conditions') },
    { key: 'evidence_ids', label: '证据', show: (e, m) => ((e.evidence_ids as string[]) ?? []).map((id) => displayName(m, id)).join('；') || '无' },
  ],
  dec: [
    { key: 'question', label: '问题', show: str('question') },
    { key: 'status', label: '状态', show: (e) => label(DECISION, e.status as string).text },
    { key: 'accepted_option_id', label: '选择', show: (e) => (e.options as { id: string; label: string }[]).find((o) => o.id === e.accepted_option_id)?.label ?? '未选择' },
    { key: 'rationale', label: '理由', show: str('rationale') },
  ],
  evd: [
    { key: 'title', label: '标题', show: str('title') },
    { key: 'statement', label: '内容', show: str('statement') },
    { key: 'scope', label: '范围', show: str('scope') },
    { key: 'limitations', label: '局限', show: str('limitations') },
  ],
  brn: [
    { key: 'name', label: '名称', show: str('name') },
    { key: 'purpose', label: '目的', show: str('purpose') },
    { key: 'state', label: '状态', show: (e) => label(BRANCH_STATE, e.state as string).text },
  ],
  brf: [
    { key: 'title', label: '标题', show: str('title') },
    { key: 'key_findings', label: '已经知道', show: list('key_findings') },
    { key: 'not_yet_established', label: '还不知道', show: list('not_yet_established') },
    { key: 'recommended_next_step', label: '下一步', show: str('recommended_next_step') },
  ],
  pro: [
    { key: 'title', label: '标题', show: str('title') },
    { key: 'summary', label: '说明', show: str('summary') },
    { key: 'status', label: '状态', show: (e) => label(PROPOSAL, e.status as string).text },
  ],
};

const IGNORED = new Set(['revision', 'updated_at', 'provenance', 'valid_time', 'created_at']);

export function VersionView({ id, revision }: { id: string; revision: number }) {
  const { model: m } = useStore();
  const current = m.byId.get(id);
  const versions = m.history.get(id) ?? [];
  const then = versions.find((v) => v.revision === revision);
  const back = hrefFor(m, id);
  const name = displayName(m, id);

  if (!current) return <p>找不到这个对象。<a href="#/">回到概览</a></p>;
  if (!then) {
    return (
      <div className="narrow">
        <div className="page-title"><h1>{kindName(id)}：{name}</h1></div>
        <div className="warn-box">
          这里没有保存{versionText(revision)}的内容。样机只带了事件节选，保存下来的版本有：{versions.map((v) => versionText(v.revision)).join('、') || '无'}。
          不能用当前版本代替，所以这里不显示内容。
        </div>
        {back ? <p><a href={back}>查看当前版本（{versionText(current.revision)}）→</a></p> : null}
      </div>
    );
  }

  const fields = FIELDS[id.slice(0, 3)] ?? [];
  const isCurrent = then.revision === current.revision;
  const changed = fields.filter((f) => f.show(then, m) !== f.show(current, m));
  const known = new Set(fields.map((f) => f.key));
  const otherChanges = Object.keys({ ...then, ...current }).filter(
    (k) => !IGNORED.has(k) && !known.has(k) && JSON.stringify(then[k]) !== JSON.stringify(current[k]),
  );

  return (
    <div className="narrow">
      {back ? <a className="back" href={back}>← 当前版本</a> : null}
      <div className="page-title">
        <h1>{kindName(id)}：{name}</h1>
        <p>{isCurrent ? `这是当前版本（${versionText(revision)}）。` : `你在看${versionText(revision)}（${fmtTime(then.updated_at as string)}），当前是${versionText(current.revision)}。`}</p>
      </div>

      {!isCurrent ? (
        <div className="info-box small">
          {changed.length ? `和当前版本相比，改了：${changed.map((f) => f.label).join('、')}。` : '读者关心的内容和当前版本相同。'}
          {otherChanges.length ? ` 另有 ${otherChanges.length} 处记录字段不同。` : ''}
        </div>
      ) : null}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th style={{ width: 110 }}>内容</th><th>{versionText(revision)}</th>{isCurrent ? null : <th>当前（{versionText(current.revision)}）</th>}</tr>
            </thead>
            <tbody>
              {fields.map((f) => {
                const a = f.show(then, m);
                const b = f.show(current, m);
                const diff = a !== b;
                const cell = (text: string): ReactNode => <RichText text={text} compact />;
                return (
                  <tr key={f.key} className={diff ? 'changed' : undefined}>
                    <th scope="row">{f.label}{diff ? <span className="chip" style={{ marginLeft: 6 }}>有改动</span> : null}</th>
                    <td>{cell(a)}</td>
                    {isCurrent ? null : <td>{diff ? cell(b) : <span className="muted">同左</span>}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {versions.length > 1 ? (
        <p className="small muted" style={{ marginTop: 12 }}>
          保存下来的版本：
          {versions.map((v, i) => (
            <span key={v.revision}>
              {i ? '、' : ''}
              {v.revision === revision ? <strong>{versionText(v.revision)}</strong> : <a href={v.revision === current.revision ? back ?? '#/' : `#/at/${id}/${v.revision}`}>{versionText(v.revision)}</a>}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
