// 校验 packages/contracts/schema 中的合同文件与交接包 MANIFEST.sha256 一致，防止合同被静默修改。
// 合同变更必须提升版本并同步修订正文（交接包 README 第七节）。
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const handoff = join(root, 'docs/handoff/research_workspace_implementation');
const manifest = readFileSync(join(handoff, 'MANIFEST.sha256'), 'utf8')
  .trim()
  .split('\n')
  .map((line) => line.split(/\s+/))
  .map(([hash, path]) => ({ hash, path }));

let failed = 0;
for (const name of ['README.txt', 'acceptance-cases.json', 'core-api.yaml', 'domain.schema.json', 'example-project.json']) {
  const entry = manifest.find((m) => m.path === `contracts/${name}`);
  const actual = createHash('sha256').update(readFileSync(join(root, 'packages/contracts/schema', name))).digest('hex');
  const ok = entry?.hash === actual;
  if (!ok) failed++;
  console.log(`${ok ? 'OK  ' : 'DIFF'} contracts/${name}`);
}
if (failed) {
  console.error(`\n${failed} 个合同文件与交接包 v1.0.0 不一致。合同变更必须提升版本、同步正文并补迁移说明。`);
  process.exit(1);
}
console.log('\n合同文件与交接包 v1.0.0 一致。');
