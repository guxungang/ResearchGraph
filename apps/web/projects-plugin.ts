// 开发与预览服务器上的项目数据接口（D-007）。前端不再把项目数据编译进去，而是按名字读取：
//   GET /rw-projects/index.json                 可用项目列表
//   GET /rw-projects/<名字>/snapshot.json        合同快照
//   GET /rw-projects/<名字>/extensions.json      扩展数据（没有时返回 {}）
// 项目有两个来源：仓库里的虚构夹具（builtin），以及环境变量 RW_DATA_DIR 指向的本机目录（local）。
// 本机目录用来放真实项目数据，必须在仓库和同步盘之外（仓库是公开的），这里不会把它复制进仓库。
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Connect, Plugin } from 'vite';

const FIXTURES = fileURLToPath(new URL('../../fixtures', import.meta.url));
const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

interface ProjectEntry {
  name: string;
  label: string;
  source: 'builtin' | 'local';
  snapshot: string;
  extensions: string | null;
}

const BUILTIN: ProjectEntry[] = [
  { name: 'stage-a', label: '虚构示例：移动群智感知任务分配', source: 'builtin', snapshot: join(FIXTURES, 'stage-a/stage-a.snapshot.json'), extensions: join(FIXTURES, 'stage-a/stage-a.extensions.json') },
  { name: 'mini', label: '虚构示例：综述写作（最小项目）', source: 'builtin', snapshot: join(FIXTURES, 'mini/mini.snapshot.json'), extensions: null },
];

function localProjects(): ProjectEntry[] {
  const dir = process.env.RW_DATA_DIR ? resolve(process.env.RW_DATA_DIR) : null;
  if (!dir || !existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => NAME.test(name) && !BUILTIN.some((b) => b.name === name))
    .map((name) => join(dir, name))
    .filter((p) => statSync(p).isDirectory() && existsSync(join(p, 'snapshot.json')))
    .map((p) => {
      const name = p.split(/[\\/]/).pop()!;
      let label = name;
      try {
        label = (JSON.parse(readFileSync(join(p, 'snapshot.json'), 'utf8')) as { project?: { name?: string } }).project?.name ?? name;
      } catch {
        /* 读不出名字时用目录名 */
      }
      return { name, label, source: 'local' as const, snapshot: join(p, 'snapshot.json'), extensions: existsSync(join(p, 'extensions.json')) ? join(p, 'extensions.json') : null };
    });
}

const allProjects = () => [...BUILTIN.filter((b) => existsSync(b.snapshot)), ...localProjects()];

const handler: Connect.NextHandleFunction = (req, res, next) => {
  if (!req.url?.startsWith('/rw-projects/')) return next();
  const parts = new URL(req.url, 'http://localhost').pathname.split('/').filter(Boolean);
  const send = (status: number, body: string) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(body);
  };
  if (parts.length === 2 && parts[1] === 'index.json')
    return send(200, JSON.stringify(allProjects().map(({ name, label, source }) => ({ name, label, source }))));
  if (parts.length !== 3 || !NAME.test(parts[1]) || !['snapshot.json', 'extensions.json'].includes(parts[2])) return send(404, '{"error":"not_found"}');
  const project = allProjects().find((p) => p.name === parts[1]);
  if (!project) return send(404, '{"error":"project_not_found"}');
  const file = parts[2] === 'snapshot.json' ? project.snapshot : project.extensions;
  if (!file) return send(200, '{}');
  return send(200, readFileSync(file, 'utf8'));
};

export function projectsPlugin(): Plugin {
  return {
    name: 'rw-projects',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
