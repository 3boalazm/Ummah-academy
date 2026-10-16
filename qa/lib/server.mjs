/**
 * Minimal static server for dist/ — directory indexes, the 404 page, correct MIME
 * types. No dependencies, random free port, bound to 127.0.0.1.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

export function serve(root) {
  if (!fs.existsSync(root)) throw new Error(`serve(): ${root} does not exist — run \`npm run build\` first`);
  if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error(`serve(): ${root} has no index.html — is that really a built site?`);
  const resolveFile = (urlPath) => {
    const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
    const abs = path.join(root, clean);
    if (!abs.startsWith(root)) return null;
    for (const candidate of [abs, path.join(abs, 'index.html'), `${abs}.html`]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
  };
  const server = http.createServer((req, res) => {
    const file = resolveFile(req.url || '/');
    if (!file) {
      const notFound = path.join(root, '404.html');
      res.writeHead(404, { 'content-type': MIME['.html'] });
      res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ base: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) });
    });
  });
}
