import { useStore } from './data/store.tsx';
import { activeSessions, todo } from './data/model.ts';
import { displayName } from './data/format.ts';
import { useRoute } from './router.ts';
import { TermProvider, Toasts } from './components/ui.tsx';
import { HomeView } from './views/HomeView.tsx';
import { MapView } from './views/MapView.tsx';
import { UnitView } from './views/UnitView.tsx';
import { CompareView } from './views/CompareView.tsx';
import { DecisionsView } from './views/DecisionsView.tsx';
import { EvidenceView } from './views/EvidenceView.tsx';
import { ConnectionsView } from './views/ConnectionsView.tsx';
import { CheckpointView } from './views/CheckpointView.tsx';
import { VersionView } from './views/VersionView.tsx';
import { TestIndexView, TestMaterialView } from './views/TestViews.tsx';

function Settings() {
  const { prefs, setPrefs, reset, project, projects } = useStore();
  return (
    <details className="no-print" style={{ position: 'relative' }}>
      <summary aria-label="显示设置">设置</summary>
      <div className="card" style={{ position: 'absolute', right: 0, top: 32, zIndex: 30, width: 260 }}>
        <div className="stack">
          <label className="row spread">
            主题
            <select value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as typeof prefs.theme })}>
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="contrast">高对比度</option>
            </select>
          </label>
          <label className="row spread">
            文字大小
            <select value={prefs.textScale} onChange={(e) => setPrefs({ ...prefs, textScale: Number(e.target.value) as typeof prefs.textScale })}>
              <option value={1}>标准</option>
              <option value={1.125}>大</option>
              <option value={1.25}>特大</option>
            </select>
          </label>
          {projects.length > 1 ? (
            <label className="row spread">
              项目
              <select value={project} onChange={(e) => { window.location.search = e.target.value === 'stage-a' ? '' : `?project=${e.target.value}`; }}>
                {projects.map((p) => <option key={p.name} value={p.name}>{p.label}{p.source === 'local' ? '（本机）' : ''}</option>)}
              </select>
            </label>
          ) : null}
          <a href="#/connections">连接与能力</a>
          <a href="#/test">理解测试材料</a>
          <button type="button" className="sm" onClick={() => window.confirm('清除本机浏览器中的全部模拟操作，回到初始状态？') && reset()}>重置样机</button>
        </div>
      </div>
    </details>
  );
}

export function App() {
  const route = useRoute();
  const { model: m, project, projects } = useStore();
  const [first, second, third] = route.path;
  const local = projects.find((p) => p.name === project)?.source === 'local';

  if (first === 'test' && second && third) return <TermProvider><TestMaterialView unitId={second} condition={third} /><Toasts /></TermProvider>;

  let view;
  let section = '';
  switch (first) {
    case undefined: view = <HomeView />; section = 'home'; break;
    case 'map': view = <MapView route={route} />; section = 'map'; break;
    case 'outline': view = <MapView route={route} listMode />; section = 'map'; break;
    case 'compare': view = <CompareView route={route} />; section = 'map'; break;
    case 'unit': view = <UnitView id={second} route={route} />; section = 'map'; break;
    case 'checkpoint': view = <CheckpointView id={second} />; section = 'map'; break;
    case 'at': view = <VersionView id={second} revision={Number(third)} />; break;
    case 'decisions': view = <DecisionsView route={route} />; section = 'todo'; break;
    case 'evidence': view = <EvidenceView route={route} />; section = 'library'; break;
    case 'glossary': view = <EvidenceView route={route} forceTab="terms" />; section = 'library'; break;
    case 'connections': view = <ConnectionsView />; break;
    case 'test': view = <TestIndexView />; break;
    default: view = <p>页面不存在。<a href="#/">回到概览</a></p>;
  }
  const running = activeSessions(m).filter((s) => s.state === 'running');
  const count = todo(m).count;
  const nav = [
    { href: '#/', label: '概览', id: 'home' },
    { href: '#/map', label: '研究路线', id: 'map' },
    { href: '#/decisions', label: '待处理', id: 'todo', count },
    { href: '#/evidence', label: '资料', id: 'library' },
  ];

  return (
    <TermProvider>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>跳到正文</a>
      <div className="proto-note" role="note">{local ? '样机 · 本机项目数据（不在仓库里）· 操作只保存在本机浏览器' : '样机 · 全部为虚构数据 · 操作只保存在本机浏览器'}</div>
      <header className="header">
        <div className="header-inner">
          <div className="brand" title={m.project.name}>{m.ext.short_names[m.project.id] ?? m.project.name}</div>
          <nav className="nav" aria-label="主导航">
            {nav.map((n) => (
              <a key={n.id} href={n.href} aria-current={section === n.id ? 'page' : undefined}>
                {n.label}
                {n.count ? <span className="count" aria-label={`${n.count} 项`}>{n.count}</span> : null}
              </a>
            ))}
          </nav>
          <div className="header-right">
            {running.map((s) => (
              <a key={s.id} className="pill-live" href={`#/unit/${s.unit_id}`} title={`会话 ${s.provider_session_id} 正在执行：${displayName(m, s.unit_id)}`}>
                <span className="dot" aria-hidden="true" />正在执行
              </a>
            ))}
            <Settings />
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="page">{view}</div>
      </main>
      <Toasts />
    </TermProvider>
  );
}
