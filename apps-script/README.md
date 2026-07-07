# Google Apps Script — form → Sheet + email backend

This turns your Google Sheet into the backend that (1) logs every submission and
(2) emails the studio manager plus a confirmation to the member.

## One-time setup

1. **Get the Sheet into Google Sheets**
   - Upload `Pvolve-Submissions-Sheet.xlsx` to Google Drive.
   - Open it → **File → Save as Google Sheets**.
   - Confirm the first tab is named exactly **`Submissions`**.

2. **Add the script**
   - In that Sheet: **Extensions → Apps Script**.
   - Delete the sample code, paste in the contents of [`Code.gs`](./Code.gs), **Save**.

3. **Review the CONFIG block at the top of `Code.gs`** (look for the `>>>` marks):
   - `studios.Memorial.managerEmail` / `studios['Post Oak'].managerEmail` — the inbox
     that should receive each studio's alerts. **Defaults to the owner's address so it
     works immediately; change to the real managers when ready.**
   - `phone` for each studio — **placeholders right now; set the real numbers.**
   - `sendManagerEmail` / `sendMemberEmail` — leave `true`, or flip either to `false`.

4. **Deploy as a Web App**
   - **Deploy → New deployment → Web app**.
   - **Execute as:** Me · **Who has access:** **Anyone** *(lets the public form post in;
     nobody can read the Sheet — the endpoint only accepts data).*
   - **Deploy** → authorize (you'll grant permission to send email + edit the Sheet) →
     **copy the Web app URL**.

5. **Send the Web app URL back** — it goes into `config.js`, and both forms start
   logging + emailing automatically.

## Test before going live
In the Apps Script editor, select **`runTest`** from the function dropdown and click **Run**.
It adds a sample row and sends you both the manager and member emails so you can see them.
Check the `Submissions` tab and your inbox.

## Email sending via Resend (from pvolvehouston.com)
Emails send from your own domain through Resend. Setup:

1. **Create a Resend account** at https://resend.com (free tier covers this volume).
2. **Add your domain:** Domains → Add Domain → `pvolvehouston.com`.
3. **Add the DNS records** Resend shows (DKIM CNAMEs, a send/SPF record, DMARC) at your
   domain registrar. Wait for the domain to show **Verified** (usually minutes).
4. **Create an API key:** API Keys → Create API Key → copy it.
5. **Store the key in Apps Script** (never in code): in the editor, **Project Settings**
   (gear) → **Script Properties** → **Add script property** →
   name `RESEND_API_KEY`, value = the key → Save.
6. Run **`runTest`** — the emails now send from `@pvolvehouston.com`.

**Send vs. reply:** emails **send from** `@pvolvehouston.com` (Resend-verified) but the
**reply-to** points at the monitored studio inboxes — `memorial@` / `postoak@pvolvestudios.com`
(your Microsoft 365 mailboxes). So member replies land where you already check; no forwarding
needed. Reply-to on a different domain requires no DNS setup.

**Fallback:** if `RESEND_API_KEY` isn't set, the script still works — it sends from the
Google account that owns the script (display name = studio, reply-to = studio address).
Set `sendMemberEmail: false` if you don't want member emails during that interim.

## Quotas
Gmail/consumer accounts can send ~100 emails/day; Google Workspace ~1,500/day.
Freeze/cancel volume is far below that.

## Updating the script later
Change `Code.gs`, then **Deploy → Manage deployments → Edit → Version: New version →
Deploy**. The URL stays the same.
