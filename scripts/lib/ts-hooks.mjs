/**
 * Lets plain Node run the site's TypeScript modules for unit tests (Node ≥ 22.18 strips
 * types natively): resolves the `@/…` alias and extensionless imports to src/, and loads
 * JSON imports as modules (Vite allows `import data from './x.json'` without attributes).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = path.resolve('src');
const candidates = (base) => [base, `${base}.ts`, path.join(base, 'index.ts')];

export async function resolve(specifier, context, next) {
  let base = null;
  if (specifier.startsWith('@/')) base = path.join(SRC, specifier.slice(2));
  else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:') && fileURLToPath(context.parentURL).startsWith(SRC)) {
    base = fileURLToPath(new URL(specifier, context.parentURL));
  }
  if (base) {
    const hit = candidates(base).find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.startsWith('file:') && url.endsWith('.json')) {
    return { format: 'module', source: `export default ${fs.readFileSync(fileURLToPath(url), 'utf8')};`, shortCircuit: true };
  }
  return next(url, context);
}
