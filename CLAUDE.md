# CLAUDE.md — Pvolve Membership Forms

Orientation and conventions for working on this project. Read alongside
`docs/SETUP-STATUS.md` (current status/next steps) and `memory.md` (decision log).

## What this is
Two member-facing web forms for the **Memorial** and **Post Oak** Pvolve studios (Houston,
franchise locations owned by Shawn Bishop) that capture membership **freeze** and
**cancellation** requests. The primary goal is understanding **why members leave** — so the
data captured (reasons + service ratings + comments) matters as much as the request itself.

## Live + source
- **Live:** https://pvolve-forms.netlify.app/ · `/freeze` · `/cancel`
- **Repo:** `shawnbishop-mewc/pvolve-membership-forms` (private)
- **Host:** Netlify, auto-deploys from `main` on every push.

## Architecture
```
Member opens a form (static HTML on Netlify)
        │  submits (fetch, no-cors, JSON)
        ▼
Google Apps Script Web App  (URL lives in config.js)
        ├──▶ appends a row to the "Submissions" Google Sheet
        ├──▶ emails the studio manager (routed Memorial / Post Oak)
        └──▶ emails the member a confirmation (freeze or cancel)
```
- **Frontend:** hand-written static HTML/CSS/JS. No build step, no framework.
- **Backend:** Google Apps Script (`apps-script/Code.gs`), container-bound to the Sheet.
- **Secrets:** never in this repo. They belong in Apps Script settings / host env vars.

## File map
| Path | Role |
|------|------|
| `index.html` | Internal landing/menu linking both forms |
| `freeze-form.html` / `cancel-form.html` | The two member forms |
| `config.js` | `window.PVOLVE_ENDPOINT` — the Apps Script URL (blank = local-only) |
| `pvolve-logo.png` / `pvolve-logo-white.png` | Brand marks (dark bg / light bg) |
| `apps-script/Code.gs` | Backend: logging + both emails + `runTest()` |
| `apps-script/README.md` | Deployment steps |
| `email-*.html` | Static previews of the three emails (design reference) |
| `Pvolve-Submissions-Sheet.xlsx` | Sheet template (Submissions / Dashboard / Legend) |
| `build_sheet.py` | Regenerates the spreadsheet (needs `openpyxl`) |
| `404.html`, `netlify.toml` | Branded 404, clean URLs, headers |
| `docs/` | `SETUP-STATUS.md`, `corporate-it-request.md` |

## How to work on it
- **Preview locally:** open the HTML files directly in a browser, or use the launch preview.
  Forms run in local-only mode until `config.js` has a URL.
- **Deploy:** just `git push` — Netlify redeploys. (Commit/push only when the user asks.)
- **Change the backend:** edit `Code.gs`, then in Apps Script **Deploy → Manage deployments
  → Edit → New version**. The Web App URL stays the same.
- **Regenerate the sheet:** `python build_sheet.py`.

## Conventions
- **Brand palette (CSS vars):** `--sand #F3EEE7`, `--sand-deep #EAE3D8`, `--ink #1C1B19`,
  `--ink-soft #5C574F`, `--clay #B15C3E`, `--clay-soft #C97E62`, `--line #DAD2C4`,
  `--white #FBF9F5`, `--good #6E7F5B`.
- **Fonts:** Cormorant Garamond (serif headlines), Jost (sans body + logo). Logo wordmark is
  uppercase, letter-spaced, weight 600.
- **Emails must be email-client-safe:** table layout + inline styles only, no external CSS,
  no CSS filters (that's why there's a separate white logo). Logo is referenced by absolute
  Netlify URL in sent mail.
- **Vanilla JS only** (ES5-ish, `var`) to match the existing forms. No dependencies.
- **Two separate forms on purpose** — a freeze link must never show a cancel option.

## Data model
**Form payload (POSTed JSON):** `type` (`FREEZE`|`CANCEL`), `converted_from_cancel`,
`location`, `name`, `email`, `phone`, `freeze_start`, `duration`, `reason` (array),
`rate_0`..`rate_4`, `return_likelihood`, `notes`, `signature`, `acknowledged`, `submitted_at`.

**Sheet "Submissions" columns (order matters — `Code.gs` maps to these):**
Submitted · Request Type · Converted From Cancel? · Location · Member Name · Email · Phone ·
Freeze Start · Freeze Duration · Reasons (all checked) · Rating: Quality of Workout ·
Rating: Front Desk Service · Rating: Class Times · Rating: Cleanliness ·
Rating: Overall Experience · Return Likelihood (1-10) · Comments · Signature · Acknowledged.

## Key behaviors to preserve
- **Freeze start date** is hard-blocked to ≥ 5 days out (picker `min` + submit guard).
- **Cancel → "Freeze instead"** redirects to `freeze-form.html` with answers pre-filled via
  query params and tags the result `converted_from_cancel` (a rescued cancellation / "save").
- **Location routing:** `location` decides the studio manager recipient in `Code.gs` CONFIG.
- Reasons/ratings mirror the franchise-approved paper forms — keep the wording aligned.

## Email sending
- Emails send from **`pvolvehouston.com`** (a domain the user controls) via **Resend**.
  The API key lives in Apps Script **Script Properties** (`RESEND_API_KEY`), never in code.
  `sendEmail_` in `Code.gs` uses Resend when the key is set, else falls back to MailApp.
- Send addresses: `memorial@`/`postoak@`/`hello@pvolvehouston.com`. Reply-to needs
  forwarding or a monitored inbox.

## External dependencies / gatekeepers
- **Pvolve corporate IT (`corpit@pvolve.com`)** controls `pvolvestudios.com` DNS + Microsoft
  365. Now only relevant for **Mariana Tek** API access (booking platform;
  `integrations@marianatek.com`) — email no longer depends on corporate. See
  `docs/corporate-it-request.md`.
