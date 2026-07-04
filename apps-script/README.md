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

## About the "From" address (important)
Until Pvolve corporate enables sending from `memorial@` / `postoak@pvolvestudios.com`,
these emails send **from the Google account that owns this script**, with:
- the **display name** set to "Pvolve Memorial" / "Pvolve Post Oak", and
- **Reply-To** set to the studio address (so member replies still route correctly).

Once corporate grants sending (Microsoft Graph or the existing Mandrill setup — see
`docs/corporate-it-request.md`), we switch the send step to the branded address.
If you'd rather members not receive email from the Google account in the meantime,
set `sendMemberEmail: false` (manager alerts still work).

## Quotas
Gmail/consumer accounts can send ~100 emails/day; Google Workspace ~1,500/day.
Freeze/cancel volume is far below that.

## Updating the script later
Change `Code.gs`, then **Deploy → Manage deployments → Edit → Version: New version →
Deploy**. The URL stays the same.
