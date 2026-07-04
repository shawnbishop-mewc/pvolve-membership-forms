# Pvolve — Membership Freeze & Cancellation Forms

Member-facing web forms for the **Memorial** and **Post Oak** Pvolve studios that capture
freeze and cancellation requests — with a focus on understanding *why* members leave.

**▶ New here? Read [`docs/SETUP-STATUS.md`](docs/SETUP-STATUS.md) first** — it has the live
links, what's done, and your remaining steps.

## Live site
- Landing: https://pvolve-forms.netlify.app/
- Freeze: https://pvolve-forms.netlify.app/freeze
- Cancel: https://pvolve-forms.netlify.app/cancel

Hosted on Netlify, auto-deployed from this repo's `main` branch.

## What's here

| File | Purpose |
|------|---------|
| `index.html` | Landing page linking to both forms (internal menu) |
| `freeze-form.html` | Membership **freeze** request form |
| `cancel-form.html` | Membership **cancellation** form (nudges toward a freeze) |
| `config.js` | Holds the Apps Script Web App URL (blank = local-only) |
| `pvolve-logo.png` / `pvolve-logo-white.png` | PVOLVE wordmark (dark / light backgrounds) |
| `apps-script/Code.gs` | Backend: logs to the Sheet + sends studio & member emails |
| `apps-script/README.md` | How to deploy the backend |
| `email-studio-notification.html` | Preview — studio manager alert |
| `email-member-freeze.html` / `email-member-cancel.html` | Previews — member confirmations |
| `Pvolve-Submissions-Sheet.xlsx` | The Google Sheet template (Submissions / Dashboard / Legend) |
| `build_sheet.py` | Regenerates the spreadsheet template |
| `docs/SETUP-STATUS.md` | Status + next steps (start here) |
| `docs/corporate-it-request.md` | Ready-to-send email to Pvolve corporate IT |
| `404.html`, `netlify.toml` | Branded 404, clean URLs, security headers |

## How it works

```
Member submits a form (Netlify)
        │
        ▼
Google Apps Script  ──▶  Google Sheet (row added instantly)
        │
        ├──▶  Studio manager alert (routed Memorial / Post Oak)
        └──▶  Member confirmation (freeze or cancel)
```

- **Freeze form:** studio, contact info, start date (min 5 days out), duration (30/60/90),
  reasons, service ratings, signed acknowledgment.
- **Cancel form:** same feedback, then offers a freeze before finalizing. "Freeze instead"
  hands the member to the freeze form with their answers pre-filled and is tagged as a save.

## Status of the backend
The forms post to a Google Apps Script endpoint set in `config.js`. Until that URL is added,
forms run in local-only mode (nothing leaves the browser). See `docs/SETUP-STATUS.md`.

## Do NOT commit secrets
API keys and email credentials live in Apps Script settings or host env vars — never in this
repo. See `.gitignore`.
