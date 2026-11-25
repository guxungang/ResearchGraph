// 由 domain.schema.json 生成 TypeScript 类型，前后端共用同一合同（方案 §14.1）。
import { compile } from 'json-schema-to-typescript';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const schema = JSON.parse(readFileSync(join(root, 'packages/contracts/schema/domain.schema.json'), 'utf8'));
const ts = await compile(schema, 'ProjectSnapshot', {
  bannerComment:
    '/* 自动生成，请勿手改。来源：packages/contracts/schema/domain.schema.json（合同 v1.0.0）。\n   重新生成：npm run contracts:types */',
  additionalProperties: false,
  strictIndexSignatures: true,
  unreachableDefinitions: true,
  style: { singleQuote: true },
});
writeFileSync(join(root, 'packages/contracts/src/generated/domain.ts'), ts.replaceAll('NoName', 'ProjectSnapshot'));
console.log('已生成 packages/contracts/src/generated/domain.ts');
