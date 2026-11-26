// 阶段A理解测试材料（方案 §16.4、AC-034）。三种条件：
//   A 原Harness总结；B 结构化但未补背景；C 本系统阅读说明。
// 材料页不显示导航和条件名称，避免读者知道自己处于哪种条件。
import type { ReadingBrief, ResearchUnit } from '@rw/contracts';
import { useStore } from '../data/store.tsx';
import { get, unitBrief } from '../data/model.ts';
import { RichText, TermScope } from '../components/ui.tsx';

export const CONDITIONS = [
  { id: 'harness', code: 'A', label: '原Harness总结' },
  { id: 'structured', code: 'B', label: '结构化但未补背景' },
  { id: 'brief', code: 'C', label: '本系统阅读说明' },
] as const;

export const QUESTIONS = [
  '这个节点研究的对象是什么？',
  '为什么要开展这项工作？',
  '方法改变了什么？',
  '目前的证据支持到哪一步？',
  '还有什么没有被证明？',
  '下一步需要选择或决定什么？',
];

export function TestIndexView() {
  const { model: m } = useStore();
  const units = Object.keys(m.ext.test_materials);
  if (!units.length) return <div className="narrow"><div className="page-title"><h1>理解测试材料</h1><p>这个项目没有准备理解测试材料。测试材料目前只为内置的虚构示例准备。</p></div></div>;
  return (
    <div className="narrow">
      <div className="page-title">
        <h1>理解测试材料（主持人用）</h1>
        <p>阶段A的通过条件是陌生读者理解任务。每个节点准备了三种条件的材料。完整测试计划、分配方案与评分标准见仓库中的 <code>docs/stage-a/comprehension-test-plan.md</code>。</p>
        <div className="warn-box small">读者只打开“材料页”链接；材料页不显示条件名称和导航。同一读者跨条件时使用不同的节点，不要让读者先看到某节点的一个版本再看另一个版本。</div>
      </div>
      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>编号</th><th>节点</th>{CONDITIONS.map((c) => <th key={c.id}>{c.code}：{c.label}</th>)}</tr></thead>
          <tbody>
            {units.map((u, i) => {
              const unit = get<ResearchUnit>(m, u)!;
              return (
                <tr key={u}>
                  <td>N{i + 1}</td>
                  <td>{unit.title}</td>
                  {CONDITIONS.map((c) => <td key={c.id}><a href={`#/test/${u}/${c.id}`} target="_blank" rel="noreferrer">材料 N{i + 1}-{c.code}</a></td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h2 style={{ marginTop: 24 }}>读者需要用自己的话回答</h2>
      <ol>{QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ol>
      <p>另外两项定位任务：找到该节点对应的实现版本；找到一条原始证据（例如一次实验运行或一个结果文件）。</p>
      <p className="small">关键错误：把未验证的主张理解为已经成立（例如认为“校准已经提高了任务完成率”）。关键错误单独记录，不能被其他答对的问题抵消。</p>
    </div>
  );
}

export function TestMaterialView({ unitId, condition }: { unitId: string; condition: string }) {
  const { model: m } = useStore();
  const unit = get<ResearchUnit>(m, unitId);
  const brief = unitBrief(m, unitId);
  const material = m.ext.test_materials[unitId];
  const index = Object.keys(m.ext.test_materials).indexOf(unitId) + 1;
  const cond = CONDITIONS.find((c) => c.id === condition);
  if (!unit || !brief || !material || !cond) return <div className="test-page">找不到这份材料。</div>;
  return (
    <main className="test-page" id="main">
      <p className="small muted">阅读材料 N{index}-{cond.code}（虚构研究项目，仅用于理解测试）</p>
      <h1>研究节点：{unit.title}</h1>
      {condition === 'harness' ? (
        <div className="card">
          <p className="small muted">以下是智能体在一轮工作结束时给出的总结：</p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{material.harness_summary}</p>
        </div>
      ) : null}
      {condition === 'structured' ? <StructuredNoBackground brief={brief} /> : null}
      {condition === 'brief' ? <FullBrief brief={brief} /> : null}
      <hr />
      <p className="small muted">读完后请回到问卷作答。作答时可以随时回看本页。</p>
    </main>
  );
}

function StructuredNoBackground({ brief }: { brief: ReadingBrief }) {
  return (
    <div className="card">
      <h2>问题</h2>
      <p>{brief.current_question}</p>
      <h2>方法</h2>
      <p>{brief.method_explanation}</p>
      <h2>结果</h2>
      <ul>{brief.key_findings.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <h2>未完成</h2>
      <ul>{brief.not_yet_established.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <h2>实现</h2>
      <ul>{brief.implementation_changes.map((c, i) => <li key={i}>{c.what_changed}（{c.artifact_version_ids.join('，')}）</li>)}</ul>
      <h2>下一步</h2>
      <p>{brief.recommended_next_step}</p>
    </div>
  );
}

function FullBrief({ brief }: { brief: ReadingBrief }) {
  return (
    <TermScope>
      <article className="card">
        <h2>{brief.title}</h2>
        <h3>当前问题</h3>
        <RichText as="p" text={brief.current_question} />
        <h3>为什么做这项工作</h3>
        <RichText as="p" text={brief.why_this_work} />
        <div className="note-box">
          <div className="label" style={{ marginBottom: 6 }}>先了解这些概念</div>
          <dl style={{ margin: 0 }}>
            {brief.prerequisites.map((p) => (
              <div key={p.term} style={{ marginBottom: 8 }}>
                <dt><strong>{p.term}</strong></dt>
                <dd style={{ margin: 0 }}>{p.plain_explanation}</dd>
              </div>
            ))}
          </dl>
        </div>
        <h3>项目背景</h3>
        <RichText as="p" text={brief.project_background} />
        <h3>方法要点</h3>
        <RichText as="p" text={brief.method_explanation} />
        <h3>已经知道的内容</h3>
        <ul>{brief.key_findings.map((f, i) => <RichText key={i} as="li" text={f} />)}</ul>
        <div className="warn-box">
          <div className="label" style={{ marginBottom: 6 }}>仍然不知道的内容</div>
          <ul style={{ marginBottom: 0 }}>{brief.not_yet_established.map((f, i) => <RichText key={i} as="li" text={f} />)}</ul>
        </div>
        <h3>对项目的影响</h3>
        <RichText as="p" text={brief.project_impact} />
        <h3>需要的下一步</h3>
        <RichText as="p" text={brief.recommended_next_step} />
        {brief.decision_request ? <p><strong>待决定：</strong>{brief.decision_request.question}（选项：{brief.decision_request.options.join('；')}）</p> : null}
        <p className="small muted">文中带下划线的名称可以点开，查看对应的证据、实现或决定。</p>
      </article>
    </TermScope>
  );
}
