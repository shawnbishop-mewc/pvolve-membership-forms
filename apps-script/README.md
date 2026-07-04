# Google Apps Script — form → Sheet endpoint

This turns your Google Sheet into the backend that receives form submissions.

## One-time setup

1. **Get the Sheet into Google Sheets**
   - Upload `Pvolve-Submissions-Sheet.xlsx` to Google Drive.
   - Open it → **File → Save as Google Sheets** (converts it to a real Google Sheet).
   - Confirm the first tab is named exactly **`Submissions`**.

2. **Add the script**
   - In that Sheet: **Extensions → Apps Script**.
   - Delete the sample code, paste in the contents of [`Code.gs`](./Code.gs), and **Save**.

3. **Deploy as a Web App**
   - Click **Deploy → New deployment**.
   - Type: **Web app**.
   - **Execute as:** Me.
   - **Who has access:** **Anyone**.  *(Required so the public form can post to it. No one can read your Sheet — this endpoint only accepts data.)*
   - **Deploy** → authorize when prompted → **copy the Web app URL**.

4. **Wire it up**
   - Send the copied Web app URL back, and it goes into `config.js` — both forms then log
     to the Sheet automatically.

## Updating the script later
If you change `Code.gs`, do **Deploy → Manage deployments → Edit → Version: New version → Deploy**
so the live URL picks up your changes (the URL itself stays the same).

## Testing
Submit a test entry from the live form, then check the `Submissions` tab — a new row
should appear within a second or two. The `Dashboard` tab updates automatically.
