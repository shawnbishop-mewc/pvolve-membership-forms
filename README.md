# Pvolve — Membership Freeze & Cancellation Forms

Member-facing web forms for the **Memorial** and **Post Oak** Pvolve studios that capture
freeze and cancellation requests — with a focus on understanding *why* members leave.

## What's here

| File | Purpose |
|------|---------|
| `index.html` | Landing page linking to both forms (internal preview / menu) |
| `freeze-form.html` | Membership **freeze** request form |
| `cancel-form.html` | Membership **cancellation** form (nudges toward a freeze instead) |
| `pvolve-logo.png` | PVOLVE wordmark used across the pages |
| `email-studio-notification.html` | Email design — internal alert to the studio manager |
| `email-member-freeze.html` | Email design — freeze confirmation to the member |
| `email-member-cancel.html` | Email design — cancellation confirmation to the member |
| `Pvolve-Submissions-Sheet.xlsx` | The Google Sheet template data is logged to |
| `build_sheet.py` | Script that generates the spreadsheet template |

## How it works

```
Member submits a form
        │
        ▼
Google Apps Script endpoint  ──▶  Google Sheet (row added instantly)
        │
        └────────────────────▶  Studio + member confirmation emails
```

- **Freeze form:** collects studio, contact info, freeze start date (min 5 days out),
  duration (30/60/90 days), reasons, service ratings, and a signed acknowledgment.
- **Cancel form:** collects the same feedback, then offers a freeze before finalizing.
  Choosing "freeze instead" hands the member to the freeze form with their answers pre-filled.

## Key details

- **Location routing:** every submission records Memorial vs. Post Oak so it reaches the right team.
- **Policies reflected:** freeze = up to 90 days at $25 / 30-day period, 5-day notice;
  cancel = 30-day notice. Based on the franchise-approved forms.
- **Hosting:** static pages, intended for GitHub Pages (or Netlify).
- **Backend:** Google Apps Script (keeps any credentials private — never in this repo).

## Do NOT commit secrets

API keys, email credentials, and service-account files must live in Apps Script settings
or host environment variables — never in this repository. See `.gitignore`.
