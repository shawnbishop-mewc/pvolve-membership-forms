# Pvolve Design System & Build Playbook

A portable reference for building **new** Pvolve tools with the same look, feel, and
architecture. Copy this file into a new project (or point a new session at this repo) to
carry the design and lessons forward.

---

## 1. Brand tokens

**Colors (CSS variables):**
```
--sand:#F3EEE7    /* page background            */
--sand-deep:#EAE3D8/* secondary background       */
--ink:#1C1B19     /* primary text / dark surfaces*/
--ink-soft:#5C574F/* secondary text             */
--clay:#B15C3E    /* primary accent             */
--clay-soft:#C97E62/* hover / soft accent        */
--line:#DAD2C4    /* borders / dividers         */
--white:#FBF9F5   /* cards / light surfaces     */
--good:#6E7F5B    /* positive (ratings, checks) */
```

**Type:**
- Headlines: **Cormorant Garamond** (serif), weight 500.
- Body / UI / logo: **Jost** (geometric sans), 300–600.
- Load: `Cormorant+Garamond:wght@400;500;600` and `Jost:wght@300;400;500;600;700`.

**Logo:** wordmark PVOLVE (uppercase, letter-spaced ~.26em, weight 600).
- Dark logo on light bg: `pvolve-logo.png`
- White logo on dark bg: `pvolve-logo-white.png` (email headers — email clients strip CSS filters)
- Hosted: `https://forms.pvolvehouston.com/pvolve-logo.png` (and `-white.png`)

**Voice:** warm, premium, calm, human. Gracious even on exit. Never corporate or pushy.

---

## 2. Component patterns (see freeze-form.html / cancel-form.html)
- **Card:** white bg, 1px `--line` border, 4px radius, soft shadow (`0 24px 60px -40px rgba(28,27,25,.35)`).
- **Section header:** Cormorant 26px + small `--ink-soft` subtitle; `<hr>` dividers between sections.
- **Uppercase labels:** 12px, letter-spacing .14em, with a `--clay` required asterisk.
- **Chips (multi-select):** square check, `--sand` bg, selected = `--clay` border + white card.
- **Segmented options:** used for duration and location — big serif value, small uppercase caption.
- **Ratings scale:** 5 pills Great→Unsatisfactory; green (`--good`) positive, clay negative, grey neutral.
- **Slider:** thin track, clay thumb; big serif value readout.
- **E-signature:** typed full name (Cormorant) + acknowledgment checkbox.
- **Confirmation screen:** circle seal w/ check, Cormorant headline, calm reassurance.
- **Modal nudge:** dim + blur backdrop, centered card (used for the cancel→freeze offer).
- **Vanilla JS only** (ES5-ish, `var`). No framework, no build step. Keep it dependency-free.

---

## 3. Email conventions (see email-*.html and apps-script/Code.gs)
- **Table layout + inline styles only.** No external CSS, no `<style>` blocks relied upon, no CSS filters.
- Dark header (`--ink`) with the **white** logo; body on `--sand`/`--white`.
- Color-code data (ratings green/clay), pull quotes in Georgia italic.
- Absolute image URLs (email can't read local files).
- Keep member emails short and warm; internal alerts dense and scannable.

---

## 4. Architecture / stack playbook
```
Static HTML (GitHub repo) --auto-deploy--> Netlify --> live forms
        │  fetch (no-cors, JSON)
        ▼
Google Apps Script Web App (URL in config.js)
        ├──▶ Google Sheet  (log + interactive dashboard)
        └──▶ Resend  (branded email from a domain you own)
```
- **Hosting:** Netlify, connected to a **private GitHub repo**, auto-deploys on push.
- **Branded URL:** CNAME a subdomain (e.g. `forms.yourdomain.com`) → `<site>.netlify.app`;
  Netlify auto-issues Let's Encrypt HTTPS. Don't repoint an apex that's already in use.
- **Backend:** Google Apps Script (container-bound to the Sheet). Holds secrets in
  **Script Properties**, never in the repo. `doPost` logs a row + sends email.
- **Email:** **Resend**, sending from a domain **you control** (verify via DNS: DKIM/SPF).
  Free at low volume. Reply-to can point at any monitored inbox (no DNS needed).
- **Data:** Google Sheet with a Submissions log + a formula-driven dashboard (dropdown filters).
- **Privacy:** `noindex` meta + `X-Robots-Tag` header to stay out of search (links shared directly).

---

## 5. Setup checklist (reusable)
1. Build static pages; keep secrets out (`.gitignore`).
2. Push to a **private GitHub repo**.
3. Connect **Netlify** → auto-deploy; add branded subdomain (CNAME) + HTTPS.
4. Google Sheet → **Extensions → Apps Script** → paste backend → deploy Web App
   (Execute as Me, Access Anyone) → put URL in `config.js`.
5. **Resend:** verify your domain, create API key, store as `RESEND_API_KEY` Script Property.
6. `noindex` if the tool shouldn't be searchable.

---

## 6. Gotchas learned (save yourself the pain)
- **Apps Script POST returns a 302** to a `googleusercontent` URL — that's success. Browser
  `fetch` handles it; `curl` needs care. Use `mode:'no-cors'` from the browser (optimistic; can't read response).
- **Email clients strip CSS filters** → keep a white logo asset for dark headers.
- **`noindex` beats `robots.txt` Disallow** for staying out of results — don't block crawling,
  or they can't read the noindex.
- **GitHub Pages can't privately host** from a free private repo → Netlify handles private repos fine.
- **Apex domains** often need A records / can't CNAME; subdomains CNAME cleanly.
- **Franchise/corporate** may control the primary domain + booking API (Mariana Tek). Using a
  domain *you* own (for hosting + email) sidesteps that bottleneck.

---

_Source project: `shawnbishop-mewc/pvolve-membership-forms`. See `CLAUDE.md`, `memory.md`,
and `docs/` for the full context._
