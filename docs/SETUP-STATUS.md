# Pvolve Membership Forms — Status & Next Steps

_Last updated: overnight build. Read this first._

## Where it stands right now

**The site is live** and both forms work end-to-end in the browser:
- Landing: https://pvolve-forms.netlify.app/
- Freeze: https://pvolve-forms.netlify.app/freeze  (also `/freeze-form.html`)
- Cancel: https://pvolve-forms.netlify.app/cancel  (also `/cancel-form.html`)

Everything is in GitHub (**shawnbishop-mewc/pvolve-membership-forms**, private) and
auto-deploys to Netlify on every push.

**One step remains to make it fully functional:** deploying the Google Apps Script so
submissions flow into your Sheet and emails send. That step needs your Google login, so it
was left for you — it's ~5 minutes and spelled out below.

---

## ✅ Done (overnight)

- Both forms polished and on-brand (real PVOLVE logo, location selector, 5-day freeze-date
  guard, ratings grid, e-signature, freeze-instead redirect with pre-fill).
- **Backend written** (`apps-script/Code.gs`): logs each submission to the `Submissions`
  tab **and** sends two emails —
  - **Studio manager alert** — routed to the right studio, color-coded ratings, reasons,
    the member's comment, likelihood to return, and a green "Save!" banner when a cancel
    converted to a freeze.
  - **Member confirmation** — freeze or cancellation version, matching the brand.
- Forms pre-wired to post to the backend the moment the URL is added to `config.js`.
- Email designs updated to use a white logo on the dark header (email clients strip the
  CSS trick I used before, so I generated `pvolve-logo-white.png`).
- Production touches: clean `/freeze` + `/cancel` URLs, branded 404 page, favicons,
  security headers (`netlify.toml`).
- Draft email to corporate IT ready at `docs/corporate-it-request.md`.

---

## 👉 What you need to do (in order)

### 1. Deploy the Apps Script  (~5 min) — makes data + email live
Follow `apps-script/README.md`. Short version:
1. Upload `Pvolve-Submissions-Sheet.xlsx` to Google Drive → open → **File → Save as Google Sheets**.
2. In the Sheet: **Extensions → Apps Script**, paste in `apps-script/Code.gs`, Save.
3. In the editor, run **`runTest`** once — it adds a sample row and sends you both emails so
   you can see them before going live.
4. **Deploy → New deployment → Web app** (Execute as: Me · Access: Anyone) → copy the URL.
5. **Send me that URL.** I'll drop it into `config.js`, push, and it goes live.

### 2. Fill in the real details in `Code.gs` CONFIG (look for `>>>`)
- Studio **manager email** addresses (currently defaulted to yours so it works immediately).
- Studio **phone numbers** (currently placeholders `(713) 555-0100`).

### 3. Decide: member emails now, or wait for branded sending?
Until corporate wires up `memorial@`/`postoak@pvolvestudios.com`, confirmation emails send
**from your Google account** (with the studio name as the display name and reply-to set to
the studio address). If you'd rather members not see that interim address, set
`sendMemberEmail: false` in CONFIG for now — manager alerts still work. Your call.

### 4. Send the corporate IT email
Open `docs/corporate-it-request.md`, add your name/phone, and send to `corpit@pvolve.com`.
This unlocks: (a) sending from the real studio addresses, (b) Mariana Tek API access, and
(c) an optional branded URL.

---

## ❓ Open questions waiting on you / others

- **Studio manager inboxes & phone numbers** — need the real values (see CONFIG).
- **Corporate IT** — branded email sending + Mariana Tek API (email drafted).
- **Branded URL** — e.g. `account.pvolvestudios.com` (needs a corporate DNS record), or we
  register a domain you control. Optional; the `.netlify.app` URL works fine to launch.
- **Mariana Tek** — whether to auto-update member records later (Phase 2/3), pending API access.

---

## How it all fits together

```
Member opens the form (Netlify)
        │  submits
        ▼
Google Apps Script  ──▶  Google Sheet  (row added instantly; Dashboard tab updates)
        │
        ├──▶  Studio manager alert email  (routed Memorial / Post Oak)
        └──▶  Member confirmation email   (freeze or cancel)
```

## File map
| Path | What it is |
|------|-----------|
| `index.html` | Internal landing/menu |
| `freeze-form.html` / `cancel-form.html` | The two member forms |
| `config.js` | Holds the Apps Script URL (blank until you deploy) |
| `pvolve-logo.png` / `pvolve-logo-white.png` | Brand marks (dark / light backgrounds) |
| `apps-script/Code.gs` | The backend (logging + email) |
| `apps-script/README.md` | Deployment steps |
| `email-*.html` | Static previews of the three emails |
| `Pvolve-Submissions-Sheet.xlsx` | The Google Sheet template (3 tabs) |
| `docs/corporate-it-request.md` | Ready-to-send email to corporate IT |
| `404.html`, `netlify.toml` | Production polish |
