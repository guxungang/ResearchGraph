// 快照：可以看“当时记录了什么”和“现在知道了什么”；从快照开新路线时默认新建分支，带上后来发现的反证和限制（方案 §4.4、§4.6）。
import { useState } from 'react';
import type { Checkpoint, Claim, Decision } from '@rw/contracts';
import { ASSESSMENT, DECISION, RESTORE, AVAILABILITY } from '@rw/domain';
import { useStore } from '../data/store.tsx';
import { get, revisionAt } from '../data/model.ts';
import { displayName, fmtTime, versionText } from '../data/format.ts';
import { forkFromCheckpoint, forkPreview } from '../data/service.ts';
import { ROLE_TEXT } from '../data/derive.ts';
import { Badge, Ref, RichText } from '../components/ui.tsx';

export function CheckpointView({ id }: { id: string }) {
  const { model: m, run } = useStore();
  const [mode, setMode] = useState<'then' | 'now'>('then');
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [worktree, setWorktree] = useState(true);
  const ckp = get<Checkpoint>(m, id);
  if (!ckp) return <p>找不到这个快照。</p>;
  const preview = forkPreview(m, id)!;
  const derived = m.branches.filter((b) => b.base_checkpoint_id === id);
  const refs = ckp.entity_revision_refs.filter((r) => /^(clm|dec)_/.test(r.entity_id));

  const state = (e?: Claim & Decision) =>
    !e ? <span className="muted small">无记录</span> : e.id.startsWith('clm_') ? <Badge table={ASSESSMENT} value={e.assessment} /> : <Badge table={DECISION} value={e.status} />;

  return (
    <div className="narrow">
      <a className="back" href={`#/unit/${ckp.unit_id}?tab=history`}>← {displayName(m, ckp.unit_id)}</a>
      <div className="page-title">
        <h1>快照：{ckp.title}</h1>
        <p className="row" style={{ gap: 8 }}>
          <Badge table={RESTORE} value={ckp.restore_readiness} />
          <span className="small muted">{fmtTime(ckp.created_at)} 建立</span>
        </p>
      </div>
      {ckp.limitations.map((l, i) => <div key={i} className="warn-box small"><RichText text={l} compact /></div>)}

      <section className="section">
        <div className="row spread section-head">
          <h2>{mode === 'then' ? '当时记录的判断' : '和现在对比'}</h2>
          <div className="seg" role="group" aria-label="回看方式">
            <button type="button" aria-pressed={mode === 'then'} onClick={() => setMode('then')}>当时</button>
            <button type="button" aria-pressed={mode === 'now'} onClick={() => setMode('now')}>和现在对比</button>
          </div>
        </div>
        <div className="rows">
          {refs.map((r) => {
            const then = revisionAt(m, r.entity_id, r.revision) as unknown as (Claim & Decision) | undefined;
            const now = m.byId.get(r.entity_id) as unknown as (Claim & Decision) | undefined;
            const changed = now && now.revision !== r.revision;
            return (
              <div key={r.entity_id} className="rowi">
                <div className="grow">{mode === 'then' ? <Ref id={r.entity_id} version={r.revision} /> : <Ref id={r.entity_id} />}</div>
                {state(then)}
                {mode === 'now' ? <><span className="muted">→</span>{state(now)}{changed ? <span className="tag">有变化</span> : null}</> : null}
              </div>
            );
          })}
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>“当时”只说明系统当时记录了什么，不代表能完整还原当时人的想法。</p>
        {mode === 'now' && preview.later.length ? (
          <div className="bad-box small">
            <div className="label">快照之后发现的反证和限制</div>
            {preview.later.map((x) => (
              <div key={x.evidence.id}>
                <Ref id={x.evidence.id} />（{fmtTime(x.evidence.created_at)}）：{x.relations.map((r, i) => <span key={r.claim_id}>{i ? '；' : ''}{ROLE_TEXT[r.role]} <Ref id={r.claim_id} /></span>)}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="section">
        <div className="section-head"><h2>从这里开一条新路线</h2></div>
        <div className="card">
          <p className="small" style={{ color: 'var(--text-2)' }}>
            会新建一个分支，当前的文件和原路线都不变。仍然有效的 {preview.inherit.length} 项决定会继承；
            {preview.revalidate.length ? ` ${preview.revalidate.length} 条主张之后有变化，需要重新验证；` : ''}
            {preview.later.length ? ` 快照之后发现的 ${preview.later.length} 条反证或限制会一起带上。` : ''}
          </p>
          <div className="stack">
            <label htmlFor="fk-name" className="small">新路线名称</label>
            <input id="fk-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：路线D 分时段校准" />
            <label htmlFor="fk-q" className="small">要回答的问题</label>
            <textarea id="fk-q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="例如：按时段分别校准，能否降低晚高峰的概率误差？" />
            <label className="row small"><input type="checkbox" checked={worktree} onChange={(e) => setWorktree(e.target.checked)} /> 需要单独的代码目录（样机只记录这个请求，不会真的创建）</label>
            <button type="button" className="primary" style={{ alignSelf: 'flex-start' }} onClick={() => { const r = run((mm) => forkFromCheckpoint(mm, { checkpointId: id, name, question, createWorktree: worktree, expectedRevision: mm.project.revision })); if (r.ok) { setName(''); setQuestion(''); } }}>新建路线</button>
          </div>
          {derived.length ? <p className="small muted" style={{ marginTop: 12 }}>已从这个快照开出的路线：{derived.map((b, i) => <span key={b.id}>{i ? '、' : ''}<Ref id={b.id} /></span>)}</p> : null}
        </div>
      </section>

      <details className="more section">
        <summary>快照里的文件（{ckp.file_manifest.length}）</summary>
        <div className="rows">
          {ckp.file_manifest.map((f) => (
            <div key={f.artifact_version_id} className="rowi">
              <div className="grow mono small">{f.relative_path}</div>
              <Badge table={AVAILABILITY} value={f.availability} />
            </div>
          ))}
        </div>
        <p className="small muted">代码提交 <span className="mono">{ckp.git_snapshot.commit_sha?.slice(0, 10) ?? '未记录'}</span> · 未提交改动：{ckp.git_snapshot.dirty_patch_artifact_version_id ? '已保存' : '无'} · 项目{versionText(ckp.project_revision)}</p>
      </details>
    </div>
  );
}
