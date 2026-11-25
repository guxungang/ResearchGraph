// 极简 hash 路由。每个路由记住自己的滚动位置，从深层返回时回到原来的阅读位置（方案 §5.3、§6.7）。
import { useEffect, useState } from 'react';

export interface Route {
  path: string[];
  query: URLSearchParams;
  raw: string;
}

const parse = (): Route => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [p, q = ''] = raw.split('?');
  return { path: p.split('/').filter(Boolean), query: new URLSearchParams(q), raw };
};

const SCROLL_KEY = 'rw.stageA.scroll.v1';
const scrolls: Record<string, number> = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? '{}');
  } catch {
    return {};
  }
})();

export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    let current = parse().raw;
    const onChange = () => {
      scrolls[current] = window.scrollY;
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify(scrolls));
      const next = parse();
      current = next.raw;
      setRoute(next);
      requestAnimationFrame(() => {
        const focus = next.query.get('focus');
        const target = focus ? document.getElementById(`focus-${focus}`) : null;
        if (target) target.scrollIntoView({ block: 'center' });
        else window.scrollTo(0, scrolls[next.raw] ?? 0);
      });
    };
    // 切换标签页等只替换查询参数：更新路由但不改变滚动位置
    const onReplace = () => {
      const next = parse();
      current = next.raw;
      setRoute(next);
    };
    window.addEventListener('hashchange', onChange);
    window.addEventListener('rw-route-replace', onReplace);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('rw-route-replace', onReplace);
    };
  }, []);
  return route;
}

export const navigate = (hash: string) => {
  window.location.hash = hash.replace(/^#/, '');
};

/** 替换当前查询参数（例如切换标签页），不新增历史记录。 */
export const setQuery = (route: Route, patch: Record<string, string | null>) => {
  const q = new URLSearchParams(route.query);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) q.delete(k);
    else q.set(k, v);
  }
  const qs = q.toString();
  const hash = `#/${route.path.join('/')}${qs ? `?${qs}` : ''}`;
  history.replaceState(null, '', hash);
  window.dispatchEvent(new Event('rw-route-replace'));
};
