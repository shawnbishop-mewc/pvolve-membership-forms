# Draft email to Pvolve Corporate IT

**To:** corpit@pvolve.com
**Subject:** Studio request: automated emails from our @pvolvestudios.com addresses (+ Mariana Tek API)

---

Hi team,

I'm setting up a small internal tool for the **Memorial** and **Post Oak** studios: a
web form members use to request a membership **freeze** or **cancellation**. When a member
submits it, we'd like the system to automatically (a) log the request and (b) send a
branded confirmation email to the member and an alert to the studio manager.

I need your help with two things — the first is the priority.

## 1. Sending automated email from our studio addresses
I'd like the tool to send email **from `memorial@pvolvestudios.com` and
`postoak@pvolvestudios.com`**. I know our mail is on Microsoft 365. Whichever of these is
easiest on your end works for me:

- **Option A — Microsoft Graph (app registration):** register an app in Entra ID with
  application permission **`Mail.Send`**, ideally scoped with an **Application Access Policy**
  so it can *only* send from those two mailboxes. I'd need the **Tenant ID, Client ID, and a
  Client Secret** (I'll store them securely; they won't be in any public code).

- **Option B — Mandrill:** our domain's SPF already includes `spf.mandrillapp.com`, so it
  looks like transactional sending via Mandrill is already set up. If so, a **Mandrill API
  key** authorized to send from those two addresses would be the simplest path.

Either way, incoming mail is unaffected — this is outbound sending only, and replies would
be set to route back to the studio inboxes.

## 2. (Separate / lower priority) Mariana Tek API access
Longer term I'd like this tool to update the member's record in **Mariana Tek** so staff
don't re-key it. Their integrations team issues API credentials
(integrations@marianatek.com). Can franchisees request API access directly, or does this
need to go through corporate? If corporate, could you help initiate it for our locations?

## 3. (Optional) Branded URL
If easy, a DNS **CNAME** for a subdomain like `account.pvolvestudios.com` pointing to our
Netlify site would let members use a branded link instead of a `.netlify.app` address.
Happy to provide the exact target when you're ready.

Thanks so much — glad to hop on a quick call if that's easier.

Best,
[Your name]
Owner, Pvolve Memorial & Post Oak
[phone]
