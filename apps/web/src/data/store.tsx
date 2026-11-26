import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProjectSnapshot } from '@rw/contracts';
import snapshotUrl from '@fixtures/stage-a.snapshot.json?url';
import extensionsUrl from '@fixtures/stage-a.extensions.json?url';
import { buildModel, emptyFlags, type Flags, type LocalEvent, type Model, type StageAExtensions } from './model.ts';
import type { Result } from './service.ts';

// 当前打开的项目：地址里的 ?project=<名字>，默认是内置的虚构示例。项目数据由开发服务器按名字提供（apps/web/projects-plugin.ts），
// 不编译进前端；换一个项目不需要改前端代码。
const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
export const PROJECT = (() => {
  const p = new URLSearchParams(window.location.search).get('project');
  return p && NAME.test(p) ? p : 'stage-a';
})();

/** 本机保存的模拟操作、浏览位置、图布局按项目分开，互不影响。内置示例沿用原来的键名。 */
export const storageKey = (name: string) => (PROJECT === 'stage-a' ? `rw.stageA.${name}.v1` : `rw.project.${PROJECT}.${name}.v1`);
const STORAGE_KEY = storageKey('local');
const PREFS_KEY = 'rw.stageA.prefs.v1';
const VIEWING_KEY = storageKey('viewing');

export interface ProjectInfo {
  name: string;
  label: string;
  source: 'builtin' | 'local';
}

export interface Prefs {
  theme: 'system' | 'light' | 'dark' | 'contrast';
  textScale: 1 | 1.125 | 1.25;
}
export interface Toast {
  id: number;
  kind: 'info' | 'error';
  text: string;
  code?: string;
  recovery?: string;
}

interface StoreValue {
  model: Model;
  project: string;
  projects: ProjectInfo[];
  run: (fn: (m: Model) => Result) => Result;
  reset: () => void;
  viewingUnitId: string | null;
  setViewingUnitId: (id: string | null) => void;
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  announce: (text: string) => void;
  liveText: string;
}

const StoreContext = createContext<StoreValue | null>(null);

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

let toastSeq = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<{ snapshot: ProjectSnapshot; ext: StageAExtensions } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [local, setLocal] = useState<{ events: LocalEvent[]; flags: Flags }>(() => readJson(STORAGE_KEY, { events: [], flags: emptyFlags() }));
  const [viewingUnitId, setViewingState] = useState<string | null>(() => readJson<string | null>(VIEWING_KEY, null));
  const [prefs, setPrefsState] = useState<Prefs>(() => readJson(PREFS_KEY, { theme: 'system', textScale: 1 } as Prefs));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [liveText, setLiveText] = useState('');
  const [projects, setProjects] = useState<ProjectInfo[]>([]);

  useEffect(() => {
    const json = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url}：${r.status}`))));
    const fromServer = Promise.all([json(`/rw-projects/${PROJECT}/snapshot.json`), json(`/rw-projects/${PROJECT}/extensions.json`)]);
    // 静态构建没有项目接口：只能打开随包附带的虚构示例
    const fallback = () => (PROJECT === 'stage-a' ? Promise.all([json(snapshotUrl), json(extensionsUrl)]) : Promise.reject(new Error(`找不到项目“${PROJECT}”`)));
    fromServer
      .catch(fallback)
      .then(([snapshot, ext]) => setData({ snapshot, ext }))
      .catch((e) => setLoadError(String(e)));
    json('/rw-projects/index.json').then(setProjects).catch(() => setProjects([{ name: 'stage-a', label: '虚构示例', source: 'builtin' }]));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  }, [local]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    const root = document.documentElement;
    if (prefs.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', prefs.theme);
    root.style.setProperty('--text-scale', String(prefs.textScale));
  }, [prefs]);

  const model = useMemo(() => (data ? buildModel(data.snapshot, data.ext, local.events, { ...emptyFlags(), ...local.flags }) : null), [data, local]);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastSeq;
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), t.kind === 'error' ? 14000 : 9000);
  }, []);

  const run = useCallback(
    (fn: (m: Model) => Result): Result => {
      if (!model) throw new Error('model not loaded');
      const res = fn(model);
      if (res.ok) {
        setLocal((cur) => ({ events: [...cur.events, ...(res.events ?? [])], flags: { ...cur.flags, ...(res.flags ?? {}) } }));
        pushToast({ kind: 'info', text: res.message });
        setLiveText(res.message);
      } else {
        if (res.flags) setLocal((cur) => ({ ...cur, flags: { ...cur.flags, ...res.flags } }));
        pushToast({ kind: 'error', text: res.error.message, code: `${res.error.status} ${res.error.code}`, recovery: res.error.recovery });
        setLiveText(`未执行：${res.error.message}`);
      }
      return res;
    },
    [model, pushToast],
  );

  const reset = useCallback(() => {
    setLocal({ events: [], flags: emptyFlags() });
    pushToast({ kind: 'info', text: '样机已重置为夹具初始状态。' });
  }, [pushToast]);

  const setViewingUnitId = useCallback((id: string | null) => {
    setViewingState(id);
    localStorage.setItem(VIEWING_KEY, JSON.stringify(id));
  }, []);

  if (loadError) return <div className="page" role="alert" style={{ padding: 40 }}>无法载入项目数据：{loadError}。<a href="?">打开内置示例</a></div>;
  if (!model) return <div className="page" style={{ padding: 40 }} aria-busy="true">正在载入项目……</div>;

  const value: StoreValue = {
    model,
    project: PROJECT,
    projects,
    run,
    reset,
    viewingUnitId,
    setViewingUnitId,
    prefs,
    setPrefs: setPrefsState,
    toasts,
    dismissToast: (id) => setToasts((ts) => ts.filter((x) => x.id !== id)),
    announce: setLiveText,
    liveText,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}
export const useModel = () => useStore().model;
