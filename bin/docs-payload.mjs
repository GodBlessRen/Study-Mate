import fs from 'node:fs';
import path from 'node:path';

// docs/ 按用途分子目录（使用／设计／规范／agents）。装进插件与安装副本时必须保持同一相对路径，
// 否则技能提示词里的 <root>/docs/<子目录>/<名>.md 指针会断。
//
// 不随包分发的两项：
//   images/      —— 只有 logo.png 有用，各处单独复制到 assets/
//   superpowers/ —— 本地工作草稿，与 .superpowers/ 同性质
const SKIP_DIRECTORIES = new Set(['images', 'superpowers', '__pycache__']);

/** 列出 docs/ 下所有要随包分发的 markdown，返回相对 docs/ 的 posix 路径。 */
export function listDocMarkdown(source) {
  const found = [];
  walk(path.join(source, 'docs'), '');
  return found;

  function walk(absolute, prefix) {
    for (const name of fs.readdirSync(absolute).sort()) {
      const entry = path.join(absolute, name);
      if (fs.lstatSync(entry).isSymbolicLink()) throw new Error(`文档资源不能是符号链接：${entry}`);
      const relative = prefix ? `${prefix}/${name}` : name;
      if (fs.statSync(entry).isDirectory()) {
        if (!SKIP_DIRECTORIES.has(name)) walk(entry, relative);
      } else if (name.endsWith('.md')) {
        found.push(relative);
      }
    }
  }
}
