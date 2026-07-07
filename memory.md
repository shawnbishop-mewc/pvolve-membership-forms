# memory.md — Decision Log

A running record of *what we decided and why*, so the reasoning isn't lost. Pairs with
`CLAUDE.md` (how the project works) and `docs/SETUP-STATUS.md` (what's left to do).

## Goal
Give Memorial & Post Oak members an attractive, on-brand way to request a **freeze** or
**cancellation**, while capturing **why** they're leaving — to reduce churn. Feel: premium,
calm, high-class; match the Pvolve brand.

## Product decisions
- **Two separate forms, not one.** A freeze link must never surface a cancel option (don't
  hand a freezer the idea to cancel). Same visual DNA, different content.
- **Structured + open "why".** Franchise-approved reason checklist (multi-select) + a
  **5-category service-ratings grid** (Great→Unsatisfactory) + a free-text box + a
  "likelihood to return" slider. The ratings grid is the churn-driver signal; it came from
  the official paper forms.
- **Cancel form nudges toward freeze.** Before finalizing a cancel, it offers a freeze. If
  taken, it **redirects to the freeze form with answers pre-filled** and tags the result as
  `converted_from_cancel` (a "save") — rather than just saying "we'll reach out."
- **Member-facing only.** The paper forms' "to be completed by studio" (Mariana Tek dates,
  manager signature) is intentionally left off the member view; staff handle that after.

## Sourced from the franchise forms
- Freeze: up to **90 days**, **$25 per 30-day period**, **5-day** advance notice.
- Cancel: **30-day** notice (immediate for medical w/ doctor cert).
- Corrected an early draft that wrongly said the freeze was free.

## Tech decisions
- **GitHub as source of truth** (private repo) + **Netlify** hosting with auto-deploy on
  push. Chose Netlify over Cloudflare Pages for drag-and-drop ease; its native Forms feature
  turned out not to matter once we chose Apps Script for data.
- **Google Apps Script backend** (not Make.com / Zapier / a Python service). Rationale: the
  user wanted data in Google Sheets *immediately*; Apps Script writes to the Sheet in real
  time, is free, holds secrets safely, sends the emails too, and needs no server to run.
  Considered Python/FastAPI — good if this grows into Mariana Tek integration, but it needs
  hosting + ops; Apps Script gives "code you own" without a server.
- **Browser → Apps Script uses `fetch` with `no-cors`** (text/plain, optimistic success).
  Apps Script doesn't return CORS headers; low-stakes form, acceptable trade-off.
- **Vanilla static HTML/JS**, no framework/build — keeps it portable and dependency-free.

## Email decisions
- **Sending from `pvolvehouston.com` via Resend** (chosen). The user owns this domain and
  controls its DNS, so this sidesteps corporate IT entirely for email. Resend picked for
  lowest cost (free at this volume) + easiest setup + clean HTTP API that plugs into the
  Apps Script backend. Send addresses: `memorial@`/`postoak@`/`hello@pvolvehouston.com`.
  API key stored in Apps Script **Script Properties** (`RESEND_API_KEY`), never in code.
  Considered Amazon SES (cheapest at scale but AWS complexity, not worth it here).
- **Fallback:** if no Resend key is set, `sendEmail_` falls back to MailApp (the Google
  account that owns the script). `sendMemberEmail` can be turned off during any interim.
- _Earlier path (superseded):_ sending from `@pvolvestudios.com` on Microsoft 365 —
  blocked by corporate IT control of that domain. DNS also revealed SPF authorizes Mandrill.
  Kept as context; `pvolvehouston.com` + Resend is the live plan.
- **Email HTML must be table+inline-style, no CSS filters.** The dark header needs a white
  logo, so `pvolve-logo-white.png` was generated (the CSS `invert` trick gets stripped by
  Gmail/Outlook — a black logo would've disappeared).

## Corrections / bugs fixed along the way
- **Cancel "Freeze instead" → blank screen:** the confirmation rewrite removed an element a
  later line tried to set; made it null-safe. (Later replaced entirely by the redirect flow.)
- Removed `$25/$50/$75` price tags from freeze duration buttons (per request).
- Rebranded **P.volve → Pvolve** (no dot), then swapped the text wordmark for the real logo
  asset the user provided.

## Open questions (as of last session)
- Real studio **manager inboxes** + **phone numbers** (CONFIG placeholders).
- **Corporate IT:** branded email sending + Mariana Tek API access.
- **Branded URL** (e.g. `account.pvolvestudios.com`) — needs corporate DNS, or a domain the
  user controls. `.netlify.app` works to launch.
- Whether to auto-update **Mariana Tek** member records later (Phase 2/3), pending API access.
  Note: freeze/cancel are billing actions — plan keeps a human approving the final change.

## Immediate next step
User deploys the Apps Script (needs their Google login) and sends back the Web App URL; it
goes into `config.js` and the whole pipeline is live.
