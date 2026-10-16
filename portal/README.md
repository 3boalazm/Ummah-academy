# بوابة التشغيل — Operations portal

This is the student, family and teacher system. It is **not** the Astro marketing site, and it is **not** deployed by `npm run build`.

```bash
npm run portal        # http://localhost:8787
npm run test:portal   # 31 domain tests, no browser
```

Arabic is the default. English is the language button. Light and dark follow `ua:theme`, the same key as the marketing site.

## Demo accounts

Synthetic data only. The passwords are on the login screen because this process boots in demo mode. Change that before any real student exists.

| Role | Email | Password | What to look at |
|---|---|---|---|
| Admin | `admin@ummahacademy.net` | `Sakinah-Admin-2026` | Every record, audit, reset |
| Ops | `ops@ummahacademy.net` | `Sakinah-Ops-2026` | Follow-ups. Cannot reset the demo |
| Teacher | `omneya@ummahacademy.net` | `Sakinah-Teach-2026` | Yusuf’s missing report. No invoices |
| Teacher | `sara@ummahacademy.net` | `Sakinah-Teach-2026` | Layla’s trial, and Yusuf’s past assignment |
| Teacher | `nour@ummahacademy.net` | `Sakinah-Teach-2026` | Adam and Omar |
| Father | `khalid.rahman@example.com` | `Sakinah-Family-2026` | Three children, billing, recordings |
| Mother | `fatima.rahman@example.com` | `Sakinah-Family-2026` | Yusuf and Layla only. No Adam. No invoices |
| Student | `omar.mansouri@example.com` | `Sakinah-Student-2026` | His own file. A guessed recording id is refused |
| Adult | `amina.bergstrom@example.com` | `Sakinah-Family-2026` | Two subscription cycles, a failed payment that was later settled |
| Adult | `omar.alfarsi@example.com` | `Sakinah-Family-2026` | 07:00 Sydney, including across the October DST change |
| Adult | `yasmin.dubois@example.com` | `Sakinah-Family-2026` | Frozen plan. Remaining credits stay. New sessions are blocked |

## What a number means

Remaining sessions are not a stored counter. For each cycle:

`remaining = allocated + adjustments − delivered − student no-shows − late family cancellations`

A scheduled lesson is not subtracted. A rescheduled lesson keeps its original time and does not consume twice. A freeze does not zero the balance. Renewal adds a cycle; it does not delete the previous one.

## Security boundary

Every read and write checks the actor on the server. A family member is not a grant to every child. A teacher does not receive invoices. Recording links are short-lived, bound to the user who asked, and checked again when opened. The audit log is append-only and must not contain passwords.

Data is written to `portal/data/store.json` (gitignored). Delete that file to return to the seed. An admin can also reset from **السلامة والقبول**.

## Staff operations

Enrolment (`/app/onboard`) opens a two-lesson trial and does not enable the child's login. A weekly series keeps the local clock across DST; a conflict rolls the whole series back. WhatsApp (`/app/outbox`) is a draft queue: `wa.me` opens on the staff device only when a family phone is already on file. The academy number `+971 50 276 0242` is the sender, not a family recipient. Marking a draft sent does not confirm delivery. Invoices are derived from payments. CSV export is staff-only and contains no passwords. Uploads accept PDF, PNG, JPEG or plain text up to 1 MB, and reject video bytes.

`PORTAL_ENV=production` refuses to start without `PORTAL_SECRET`, and refuses the published demo passwords.

## Not production

No card charging, no WhatsApp delivery, no real video calls, no multi-server database. Do not point `PUBLIC_PORTAL_URL` here until those exist and the demo passwords are gone. See `docs/19-operations-audit.md`.
