// 主张、证据、实验运行的紧凑行：默认一行，点开看细节（来源、范围、局限、配置）。
import type { Claim, Evidence, ExperimentRun } from '@rw/contracts';
import { ASSESSMENT, AVAILABILITY, CAPTURE, CURRENCY, RUN_STATE, VERIFICATION } from '@rw/domain';
import type { Model } from '../data/model.ts';
import { fmtTime, RUN_NAMES } from '../data/format.ts';
import { Badge, Locator, Ref, RichText } from './ui.tsx';

const CLAIM_KIND: Record<string, string> = { hypothesis: '假设', finding: '发现', assumption: '前提', paper_claim: '论文陈述' };

export function ClaimRow({ m, claim, open = false }: { m: Model; claim: Claim; open?: boolean }) {
  const edges = m.edges.filter((e) => e.target_id === claim.id && (e.relation === 'supports' || e.relation === 'contradicts'));
  const sup = edges.filter((e) => e.relation === 'supports');
  const con = edges.filter((e) => e.relation === 'contradicts');
  const noEvidencePaper = claim.claim_kind === 'paper_claim' && !claim.evidence_ids.length;
  return (
    <details className="rowd" open={open} id={`focus-${claim.id}`}>
      <summary>
        <span className="grow">
          <span className="title" style={{ fontWeight: 550 }}>{claim.text}</span>
          <span className="sub" style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-3)' }}>
            {CLAIM_KIND[claim.claim_kind]} · 支持 {sup.length} · 反证 {con.length}
          </span>
        </span>
        {noEvidencePaper ? <span className="chip strong-red">缺少证据</span> : <Badge table={ASSESSMENT} value={claim.assessment} />}
      </summary>
      <div className="rowd-body">
        <p className="small"><span className="label">适用条件　</span><RichText text={claim.conditions} compact /></p>
        {edges.length ? (
          <ul className="small" style={{ paddingLeft: '1.1em' }}>
            {edges.map((e) => (
              <li key={e.id}>
                <span className={`chip ${e.relation === 'contradicts' ? 'strong-amber' : ''}`} style={{ marginRight: 6 }}>{e.relation === 'supports' ? '支持' : '反证'}</span>
                <Ref id={e.source_id} />
                {e.currency !== 'current' ? <> · <Badge table={CURRENCY} value={e.currency} /></> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="small muted">还没有任何证据。</p>
        )}
      </div>
    </details>
  );
}

export function EvidenceRow({ m, e, open = false }: { m: Model; e: Evidence; open?: boolean }) {
  return (
    <details className="rowd" open={open} id={`focus-${e.id}`}>
      <summary>
        <span className="grow">
          <span className="title" style={{ fontWeight: 550 }}>{e.title}</span>
        </span>
        <Badge table={VERIFICATION} value={e.verification_status} />
      </summary>
      <div className="rowd-body">
        <RichText as="p" text={e.statement} compact />
        <dl className="kv small">
          <dt>范围</dt><dd>{e.scope}</dd>
          <dt>局限</dt><dd>{e.limitations}</dd>
          <dt>可获取性</dt><dd><Badge table={AVAILABILITY} value={e.availability} /></dd>
          {e.experiment_run_id ? <><dt>来自运行</dt><dd><Ref id={e.experiment_run_id}>{(() => { const r = m.runs.find((x) => x.id === e.experiment_run_id); return r ? runName(m, r) : e.experiment_run_id; })()}</Ref></dd></> : null}
        </dl>
        <Locator loc={e.source_locator} />
      </div>
    </details>
  );
}

export const runName = (_m: Model, run: ExperimentRun) => RUN_NAMES[run.id] ?? run.id;

export function RunRow({ m, run, open = false }: { m: Model; run: ExperimentRun; open?: boolean }) {
  const evs = m.evidence.filter((e) => e.experiment_run_id === run.id);
  const rels = m.edges.filter((g) => evs.some((e) => e.id === g.source_id) && (g.relation === 'supports' || g.relation === 'contradicts'));
  return (
    <details className="rowd" open={open} id={`focus-${run.id}`}>
      <summary>
        <span className="grow">
          <span className="title" style={{ fontWeight: 550 }}>{runName(m, run)}</span>
          <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-3)' }}>{m.ext.run_results[run.id] ?? ''} · {fmtTime(run.started_at)}</span>
        </span>
        <Badge table={RUN_STATE} value={run.run_state} />
      </summary>
      <div className="rowd-body">
        {run.run_state === 'failed' ? <div className="warn-box small">这是执行问题，不是科学上的反证，不改变任何主张。</div> : null}
        {run.run_state === 'succeeded' ? <p className="small muted">进程成功结束只说明执行完成，不代表任何主张成立。</p> : null}
        <dl className="kv small">
          <dt>命令</dt><dd className="mono">{run.command_display}</dd>
          <dt>配置</dt><dd>{run.config_artifact_version_id ? <Ref id={run.config_artifact_version_id} /> : <span className="muted">缺失</span>}</dd>
          <dt>环境</dt><dd>{run.environment_artifact_version_id ? <Ref id={run.environment_artifact_version_id} /> : <span className="muted">缺失</span>}</dd>
          <dt>随机种子</dt><dd>{run.random_seeds.length ? run.random_seeds.join('、') : '无'}</dd>
          <dt>记录完整性</dt><dd><Badge table={CAPTURE} value={run.capture_completeness} />{run.missing_fields.length ? <span className="muted">　缺：{run.missing_fields.join('、')}</span> : null}</dd>
          <dt>关联主张</dt><dd>{rels.length ? rels.map((g, i) => <span key={g.id}>{i ? '；' : ''}{g.relation === 'supports' ? '支持' : '挑战'} <Ref id={g.target_id} /></span>) : '无'}</dd>
        </dl>
        {run.metrics.length ? (
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead><tr><th>指标</th><th>值</th><th>划分</th><th>汇总</th></tr></thead>
              <tbody>{run.metrics.map((x) => <tr key={x.name}><td className="mono">{x.name}</td><td>{x.value}</td><td>{x.split}</td><td>{x.aggregation}</td></tr>)}</tbody>
            </table>
          </div>
        ) : null}
      </div>
    </details>
  );
}

