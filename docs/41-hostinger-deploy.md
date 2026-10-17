# 41 · Hosting on Hostinger (site + portal)

Date: 2026-10-17. Both run on the same Hostinger Business plan.

| What | Where | How it runs |
|---|---|---|
| Marketing site (Astro, static) | `https://ummahacademy.net` → `public_html` | Plain files + `.htaccess` (LiteSpeed) |
| Operations portal (Node) | `https://portal.ummahacademy.net` | hPanel **Web App**, Node 20, entry `src/server.mjs` |
| Portal data | `domains/portal.ummahacademy.net/portal-data/` | `store.json`, `secret`, `rum.json`; **outside** the app folder, so redeploying code never touches it |
| Old WordPress files | `wp-old-backup/` (home, outside `public_html`) | Untouched backup |

## Site

```bash
PUBLIC_PORTAL_URL=https://portal.ummahacademy.net \
PUBLIC_RUM_ENDPOINT=https://portal.ummahacademy.net/api/rum \
npm run build:hostinger      # build + dist/.htaccess generated from vercel.json
npm run verify
```

Deploy: zip `dist/` (or only changed files), upload through hPanel → File Manager. The upload tool of the File Browser has no size limit; Claude's browser tool has 10 MB per call, so `node scripts/split-deploy.mjs` makes ≤8.5 MB parts.
Extract with **destination = home folder, folder name = `public_html`, "Overwrite existing files" ticked**: it merges over the live site. Then **hPanel → Dashboard → Cache → Clear cache**, otherwise the CDN keeps serving the old home page.
Without "Overwrite", the extractor answers `500`.

## Portal

First run only (operator, on your machine):

```bash
node portal/scripts/provision.mjs --out portal/.provision/store.json --credentials portal/.provision/credentials.txt
```

It writes one admin and the real course/plan catalogue, no demo data. The admin password and `PORTAL_SECRET` go to `credentials.txt` (never printed). Upload `store.json` and a file `secret` holding only the secret into `portal-data/`.

Archive: `tar -czf portal-app.tar.gz -C portal package.json package-lock.json src public`.
**Use `.tar.gz`.** Hostinger's detector rejected a Windows-made `.zip` of the same files with "Unsupported framework or invalid project structure".
Settings: Framework `Other`, Node 20.x, build `npm run build`, entry `src/server.mjs`.

Environment variables (no secrets in the panel):

| Variable | Value |
|---|---|
| `PORTAL_ENV` | `production` |
| `PORTAL_DATA` | `/home/u560780295/domains/portal.ummahacademy.net/portal-data/store.json` |
| `PORTAL_SECRET_FILE` | `/home/u560780295/domains/portal.ummahacademy.net/portal-data/secret` |
| `PORTAL_TRUST_PROXY` | `1` (rate limits count the visitor, not the host's proxy) |
| `PORTAL_RUM_ORIGINS` | optional; defaults to `https://ummahacademy.net,https://www.ummahacademy.net` |

The Node runtime sees only its own domain folder, not the rest of the home directory. Redeploy code: Websites → **Reupload** → *Upload new files* → *Save and redeploy*. If the app will not start, **Runtime logs** says why; a missing secret prints a diagnostic with the paths it could see (never the secret).

## After the first deploy

1. Sign in as the admin and change the password from **My profile**. Delete `portal/.provision/credentials.txt`.
2. The performance screen fills as visitors browse; the first numbers appear after the first real visit.
3. Add one sentence about anonymous speed measurement to the privacy policy (legal review).
