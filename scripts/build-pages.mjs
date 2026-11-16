#!/usr/bin/env node
/**
 * 本地构建 GitHub Pages 产物（带 basePath）。
 *
 * 等价于 `NEXT_PUBLIC_BASE_PATH=/my-blog next build`，但不再依赖 bash 的
 * 变量前缀语法 —— 那种写法在 Windows 的 cmd.exe 里会直接报
 * "'NEXT_PUBLIC_BASE_PATH' is not recognized"，因此改用 Node 直接起子进程传环境变量。
 *
 * 产物输出到 out/，资源路径为 /my-blog/_next/...，与 CI 的构建保持一致。
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

const result = spawnSync(process.execPath, [nextBin, 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/my-blog' },
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
