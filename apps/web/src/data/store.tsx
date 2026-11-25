import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProjectSnapshot } from '@rw/contracts';
import snapshotUrl from '@fixtures/stage-a.snapshot.json?url';
import extensionsUrl from '@fixtures/stage-a.extensions.json?url';
import { buildModel, emptyFlags, type Flags, type LocalEvent, type Model, type StageAExtensions } from './model.ts';
import type { Result } from './service.ts';

const STORAGE_KEY = 'rw.stageA.local.v1';
const PREFS_KEY = 'rw.stageA.prefs.v1';
const VIEWING_KEY = 'rw.stageA.viewing.v1';

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

  useEffect(() => {
    Promise.all([fetch(snapshotUrl).then((r) => r.json()), fetch(extensionsUrl).then((r) => r.json())])
      .then(([snapshot, ext]) => setData({ snapshot, ext }))
      .catch((e) => setLoadError(String(e)));
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

  if (loadError) return <div className="page" role="alert" style={{ padding: 40 }}>无法载入夹具：{loadError}</div>;
  if (!model) return <div className="page" style={{ padding: 40 }} aria-busy="true">正在载入项目……</div>;

  const value: StoreValue = {
    model,
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
