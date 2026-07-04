/**
 * Pvolve — Membership form endpoint (logging + email)
 * -----------------------------------------------------------------------------
 * Receives freeze / cancellation submissions from the web forms, appends a row
 * to the "Submissions" sheet, then emails the studio manager and a confirmation
 * to the member. Deploy as a Web App (see README.md).
 *
 * CONTAINER-BOUND: create from inside the Google Sheet (Extensions > Apps Script).
 */

// ===========================================================================
// CONFIG  —  review the >>> marked lines before going live
// ===========================================================================
var CONFIG = {
  timezone: 'America/Chicago',
  logoWhite: 'https://pvolve-forms.netlify.app/pvolve-logo-white.png',

  sendManagerEmail: true,   // internal alert to the studio
  sendMemberEmail:  true,   // confirmation to the member

  // Per-studio settings. Manager emails default to the owner so notifications
  // work immediately; >>> replace with the real per-studio manager inboxes.
  // Phone numbers are placeholders >>> set the real studio numbers.
  studios: {
    'Memorial': {
      managerEmail: 'shawn.bishop@mewc.biz',     // >>> real Memorial manager inbox
      replyTo:      'memorial@pvolvestudios.com', // where member replies should land
      phone:        '(713) 555-0100',             // >>> real Memorial phone
      senderName:   'Pvolve Memorial'
    },
    'Post Oak': {
      managerEmail: 'shawn.bishop@mewc.biz',      // >>> real Post Oak manager inbox
      replyTo:      'postoak@pvolvestudios.com',
      phone:        '(713) 555-0100',             // >>> real Post Oak phone
      senderName:   'Pvolve Post Oak'
    }
  },
  fallback: {   // used if a submission somehow has no/unknown location
    managerEmail: 'shawn.bishop@mewc.biz',
    replyTo:      'memorial@pvolvestudios.com',
    phone:        '(713) 555-0100',
    senderName:   'Pvolve Studios'
  }
};

var SHEET_NAME = 'Submissions';

// ===========================================================================
// Web entry points
// ===========================================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    logRow_(data);
    try { notify_(data); } catch (mailErr) { console.error('Email failed: ' + mailErr); }
    return json_({ result: 'success' });
  } catch (err) {
    return json_({ result: 'error', message: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Pvolve form endpoint is running.');
}

// ===========================================================================
// Logging
// ===========================================================================
function logRow_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  var reasons = Array.isArray(data.reason) ? data.reason.join('; ') : (data.reason || '');
  var requestType = (data.type === 'FREEZE') ? 'Freeze' : 'Cancellation';
  var converted = isConverted_(data) ? 'Yes' : 'No';
  var acknowledged = data.acknowledged ? 'Yes' : 'No';

  sheet.appendRow([
    new Date(), requestType, converted, data.location || '', data.name || '',
    data.email || '', data.phone || '', data.freeze_start || '', data.duration || '',
    reasons, data.rate_0 || '', data.rate_1 || '', data.rate_2 || '', data.rate_3 || '',
    data.rate_4 || '', data.return_likelihood || '', data.notes || '',
    data.signature || '', acknowledged
  ]);
}

// ===========================================================================
// Email
// ===========================================================================
function notify_(data) {
  var studio = CONFIG.studios[data.location] || CONFIG.fallback;
  var isFreeze = (data.type === 'FREEZE');

  if (CONFIG.sendManagerEmail && studio.managerEmail) {
    MailApp.sendEmail({
      to: studio.managerEmail,
      replyTo: data.email || studio.replyTo,   // reply goes straight to the member
      name: studio.senderName,
      subject: managerSubject_(data, isFreeze),
      htmlBody: managerHtml_(data, isFreeze, studio)
    });
  }

  if (CONFIG.sendMemberEmail && data.email) {
    MailApp.sendEmail({
      to: data.email,
      replyTo: studio.replyTo,
      name: studio.senderName,
      subject: memberSubject_(isFreeze),
      htmlBody: isFreeze ? memberFreezeHtml_(data, studio) : memberCancelHtml_(data, studio)
    });
  }
}

function managerSubject_(data, isFreeze) {
  var who = data.name || 'Member', loc = data.location || '';
  if (isFreeze) {
    return (isConverted_(data) ? '✅ Freeze (saved from cancel) — ' : 'Freeze Request — ') + who + ' · ' + loc;
  }
  return 'Cancellation Request — ' + who + ' · ' + loc;
}

function memberSubject_(isFreeze) {
  return isFreeze ? 'Your Pvolve freeze is confirmed — see you soon'
                  : 'We’ve received your Pvolve cancellation request';
}

// ---- studio manager notification ----
function managerHtml_(data, isFreeze, studio) {
  var band = isFreeze ? '#4E6A54' : '#B15C3E';
  var bandLabel = isFreeze ? 'Membership Freeze Request' : 'Membership Cancellation Request';
  var saveBanner = (isFreeze && isConverted_(data))
    ? '<tr><td style="background:#6E7F5B;padding:12px 32px;color:#fff;font-size:13px;">&#127881; <strong>Save!</strong> This member started a cancellation and chose to <strong>freeze instead</strong>.</td></tr>'
    : '';
  var action = isFreeze
    ? 'Confirm the start date and the $25 / 30-day fee, then process the freeze in Mariana Tek.'
    : '30-day notice. Confirm the effective date, process the cancellation in Mariana Tek, and follow up with the member.';
  var freezeDetails = isFreeze
    ? '<tr><td style="padding:22px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE7;border-radius:5px;">' +
        '<tr><td style="padding:14px 18px;border-bottom:1px solid #E4DCCE;font-size:13.5px;color:#5C574F;">Requested start</td><td align="right" style="padding:14px 18px;border-bottom:1px solid #E4DCCE;font-size:13.5px;color:#1C1B19;font-weight:bold;">' + esc_(data.freeze_start || '—') + '</td></tr>' +
        '<tr><td style="padding:14px 18px;font-size:13.5px;color:#5C574F;">Duration</td><td align="right" style="padding:14px 18px;font-size:13.5px;color:#1C1B19;font-weight:bold;">' + esc_(data.duration || '—') + '</td></tr>' +
      '</table></td></tr>'
    : '';
  var comment = data.notes
    ? '<tr><td style="padding:26px 32px 0;"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5C574F;font-weight:bold;padding-bottom:10px;">In their words</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE7;border-radius:4px;"><tr><td style="padding:16px 18px;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#1C1B19;line-height:1.5;">&ldquo;' + esc_(data.notes) + '&rdquo;</td></tr></table></td></tr>'
    : '';
  var likelihood = data.return_likelihood
    ? '<tr><td style="padding:26px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5C574F;font-weight:bold;">Likelihood to return</td><td align="right" style="font-family:Georgia,serif;font-size:24px;color:#B15C3E;">' + esc_(data.return_likelihood) + '<span style="font-size:15px;color:#5C574F;"> / 10</span></td></tr></table></td></tr>'
    : '';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#EAE3D8;font-family:Helvetica,Arial,sans-serif;color:#1C1B19;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D8;"><tr><td align="center" style="padding:20px 12px 40px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBF9F5;border:1px solid #DAD2C4;border-radius:6px;overflow:hidden;">' +
      '<tr><td align="center" style="background:#1C1B19;padding:22px;"><img src="' + CONFIG.logoWhite + '" alt="PVOLVE" width="150" style="display:block;height:auto;" /></td></tr>' +
      '<tr><td style="background:' + band + ';padding:14px 32px;color:#FBF9F5;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:bold;">' + bandLabel + '</td></tr>' +
      saveBanner +
      '<tr><td style="padding:30px 32px 6px;"><div style="font-family:Georgia,serif;font-size:30px;color:#1C1B19;line-height:1.1;">' + esc_(data.name || 'Member') + '</div>' +
        '<div style="margin-top:8px;font-size:14px;color:#5C574F;"><strong style="color:#1C1B19;">' + esc_(data.location || '—') + '</strong> studio &middot; submitted ' + fmtDate_() + '</div></td></tr>' +
      '<tr><td style="padding:16px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE7;border-left:3px solid ' + band + ';border-radius:4px;"><tr><td style="padding:14px 16px;font-size:13.5px;color:#1C1B19;"><strong>Action needed:</strong> ' + action + '</td></tr></table></td></tr>' +
      '<tr><td style="padding:26px 32px 0;"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5C574F;font-weight:bold;padding-bottom:8px;">Contact</div>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">' +
        '<tr><td style="padding:4px 0;color:#5C574F;width:70px;">Email</td><td style="padding:4px 0;"><a href="mailto:' + esc_(data.email || '') + '" style="color:#B15C3E;text-decoration:none;">' + esc_(data.email || '—') + '</a></td></tr>' +
        '<tr><td style="padding:4px 0;color:#5C574F;">Phone</td><td style="padding:4px 0;"><a href="tel:' + esc_((data.phone || '').replace(/[^0-9+]/g, '')) + '" style="color:#B15C3E;text-decoration:none;">' + esc_(data.phone || '—') + '</a></td></tr>' +
        '</table></td></tr>' +
      freezeDetails +
      '<tr><td style="padding:26px 32px 0;"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5C574F;font-weight:bold;padding-bottom:10px;">Reason(s) given</div>' + reasonPills_(data) + '</td></tr>' +
      '<tr><td style="padding:26px 32px 0;"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5C574F;font-weight:bold;padding-bottom:10px;">How we performed</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13.5px;border-collapse:collapse;">' + ratingRows_(data) + '</table></td></tr>' +
      comment + likelihood +
      '<tr><td style="padding:26px 32px 30px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DAD2C4;"><tr><td style="padding-top:18px;font-size:13px;color:#5C574F;">Signed &mdash; <span style="font-family:Georgia,serif;font-style:italic;font-size:17px;color:#1C1B19;">' + esc_(data.signature || data.name || '') + '</span><br>' + (data.acknowledged ? '<span style="color:#6E7F5B;">&#10003; Acknowledged the policy &amp; terms</span>' : '') + '</td></tr></table></td></tr>' +
      '<tr><td style="background:#1C1B19;padding:18px 32px;color:#DAD2C4;font-size:11px;letter-spacing:.05em;text-align:center;">Routed to the <strong style="color:#FBF9F5;">' + esc_(data.location || '') + '</strong> team &middot; Pvolve member request system<br><span style="color:#8A857B;">The method that moves with you, for life.</span></td></tr>' +
    '</table></td></tr></table></body></html>';
}

// ---- member freeze confirmation ----
function memberFreezeHtml_(data, studio) {
  var first = firstName_(data.name);
  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#EAE3D8;font-family:Helvetica,Arial,sans-serif;color:#1C1B19;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D8;"><tr><td align="center" style="padding:20px 12px 40px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBF9F5;border:1px solid #DAD2C4;border-radius:6px;overflow:hidden;">' +
      '<tr><td align="center" style="background:#1C1B19;padding:22px;"><img src="' + CONFIG.logoWhite + '" alt="PVOLVE" width="150" style="display:block;height:auto;" /></td></tr>' +
      '<tr><td style="padding:44px 40px 0;text-align:center;"><div style="font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#B15C3E;">Freeze Confirmed</div>' +
        '<div style="font-family:Georgia,serif;font-size:34px;color:#1C1B19;line-height:1.12;margin-top:14px;">Your spot is held.</div>' +
        '<p style="font-size:16px;color:#5C574F;line-height:1.6;margin:18px auto 0;max-width:420px;">Hi ' + esc_(first) + ' &mdash; we&rsquo;ve received your freeze request. Take the time you need; your rate is locked and we&rsquo;ll be right here when you&rsquo;re ready to come back.</p></td></tr>' +
      '<tr><td style="padding:34px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE7;border-radius:5px;">' +
        '<tr><td style="padding:18px 20px;border-bottom:1px solid #E4DCCE;font-size:14px;color:#5C574F;">Studio</td><td align="right" style="padding:18px 20px;border-bottom:1px solid #E4DCCE;font-size:14px;color:#1C1B19;font-weight:bold;">' + esc_(data.location || '—') + '</td></tr>' +
        '<tr><td style="padding:18px 20px;border-bottom:1px solid #E4DCCE;font-size:14px;color:#5C574F;">Freeze begins</td><td align="right" style="padding:18px 20px;border-bottom:1px solid #E4DCCE;font-size:14px;color:#1C1B19;font-weight:bold;">' + esc_(data.freeze_start || 'To be confirmed') + '</td></tr>' +
        '<tr><td style="padding:18px 20px;font-size:14px;color:#5C574F;">Length</td><td align="right" style="padding:18px 20px;font-size:14px;color:#1C1B19;font-weight:bold;">' + esc_(data.duration || '—') + '</td></tr>' +
      '</table></td></tr>' +
      '<tr><td style="padding:30px 40px 0;"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5C574F;font-weight:bold;padding-bottom:10px;">What happens next</div>' +
        '<p style="font-size:14.5px;color:#1C1B19;line-height:1.65;margin:0;">A member of the studio team will confirm your start date and the $25-per-30-day freeze fee within 1&ndash;2 business days. Your membership reactivates automatically at your current rate when the freeze ends &mdash; nothing for you to do.</p></td></tr>' +
      '<tr><td style="padding:28px 40px 40px;text-align:center;"><p style="font-size:14px;color:#5C574F;line-height:1.6;margin:0;">Questions, or need to change something?<br>Reply to this email or call your studio at <a href="tel:' + esc_((studio.phone || '').replace(/[^0-9+]/g, '')) + '" style="color:#B15C3E;text-decoration:none;">' + esc_(studio.phone || '') + '</a>.</p></td></tr>' +
      '<tr><td style="background:#1C1B19;padding:22px;color:#DAD2C4;font-size:11px;letter-spacing:.05em;text-align:center;">Pvolve &middot; ' + esc_(data.location || '') + '<br><span style="color:#8A857B;">The method that moves with you, for life.</span></td></tr>' +
    '</table></td></tr></table></body></html>';
}

// ---- member cancellation confirmation ----
function memberCancelHtml_(data, studio) {
  var first = firstName_(data.name);
  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#EAE3D8;font-family:Helvetica,Arial,sans-serif;color:#1C1B19;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D8;"><tr><td align="center" style="padding:20px 12px 40px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBF9F5;border:1px solid #DAD2C4;border-radius:6px;overflow:hidden;">' +
      '<tr><td align="center" style="background:#1C1B19;padding:22px;"><img src="' + CONFIG.logoWhite + '" alt="PVOLVE" width="150" style="display:block;height:auto;" /></td></tr>' +
      '<tr><td style="padding:44px 40px 0;text-align:center;"><div style="font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#B15C3E;">Request Received</div>' +
        '<div style="font-family:Georgia,serif;font-size:34px;color:#1C1B19;line-height:1.12;margin-top:14px;">Thank you, ' + esc_(first) + '.</div>' +
        '<p style="font-size:16px;color:#5C574F;line-height:1.6;margin:18px auto 0;max-width:430px;">We&rsquo;ve received your cancellation request, and we&rsquo;re grateful for the time you spent with us. Your honest feedback genuinely helps us get better.</p></td></tr>' +
      '<tr><td style="padding:34px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE7;border-left:3px solid #B15C3E;border-radius:4px;"><tr><td style="padding:18px 20px;font-size:14.5px;color:#1C1B19;line-height:1.6;"><strong>What happens next:</strong> Cancellation takes effect on your next recurring payment date (30-day notice). A team member will confirm your exact effective date shortly. You have 30 days from your last payment to use any remaining class sessions.</td></tr></table></td></tr>' +
      '<tr><td style="padding:30px 40px 0;text-align:center;"><p style="font-size:14.5px;color:#5C574F;line-height:1.65;margin:0;">Changed your mind, or just need a break instead? You can always <strong style="color:#1C1B19;">freeze</strong> rather than cancel and keep your current rate. Just reply and we&rsquo;ll help.</p></td></tr>' +
      '<tr><td style="padding:28px 40px 40px;text-align:center;"><p style="font-size:14px;color:#5C574F;line-height:1.6;margin:0;">Questions about your request?<br>Reply to this email or call us at <a href="tel:' + esc_((studio.phone || '').replace(/[^0-9+]/g, '')) + '" style="color:#B15C3E;text-decoration:none;">' + esc_(studio.phone || '') + '</a>.</p></td></tr>' +
      '<tr><td style="background:#1C1B19;padding:22px;color:#DAD2C4;font-size:11px;letter-spacing:.05em;text-align:center;">The door is always open &mdash; we&rsquo;d love to see you again.<br><span style="color:#8A857B;">Pvolve &middot; The method that moves with you, for life.</span></td></tr>' +
    '</table></td></tr></table></body></html>';
}

// ===========================================================================
// Helpers
// ===========================================================================
function isConverted_(data) {
  return data.converted_from_cancel === true || String(data.converted_from_cancel) === 'true';
}
function firstName_(name) { return (name || 'there').split(' ')[0]; }
function fmtDate_() { return Utilities.formatDate(new Date(), CONFIG.timezone, "MMM d, yyyy 'at' h:mm a"); }
function esc_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ratingColor_(v) {
  if (v === 'Great' || v === 'Good') return '#6E7F5B';
  if (v === 'Poor' || v === 'Unsatisfactory') return '#B15C3E';
  return '#8A857B';
}
function ratingRows_(data) {
  var cats = [['Quality of Workout', data.rate_0], ['Front Desk Service', data.rate_1],
              ['Class Times', data.rate_2], ['Cleanliness', data.rate_3], ['Overall Experience', data.rate_4]];
  return cats.map(function (c, i) {
    var last = (i === cats.length - 1);
    var border = last ? '' : 'border-bottom:1px solid #EAE3D8;';
    var v = c[1];
    var chip = v
      ? '<span style="background:' + ratingColor_(v) + ';color:#fff;padding:4px 11px;border-radius:3px;font-size:12px;">' + esc_(v) + '</span>'
      : '<span style="color:#8A857B;font-size:12px;">Not answered</span>';
    return '<tr><td style="padding:9px 0;' + border + 'color:#1C1B19;">' + c[0] + '</td><td align="right" style="padding:9px 0;' + border + '">' + chip + '</td></tr>';
  }).join('');
}
function reasonPills_(data) {
  var r = Array.isArray(data.reason) ? data.reason : (data.reason ? [data.reason] : []);
  if (!r.length) return '<span style="color:#8A857B;font-size:13px;">None selected</span>';
  return r.map(function (x) {
    return '<span style="display:inline-block;background:#1C1B19;color:#FBF9F5;font-size:13px;padding:6px 13px;border-radius:20px;margin:0 6px 6px 0;">' + esc_(x) + '</span>';
  }).join('');
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ===========================================================================
// Manual test — run this from the editor to verify logging + emails
// (uses the CONFIG manager email; sends the member copy to that same address)
// ===========================================================================
function runTest() {
  var sample = {
    type: 'CANCEL', location: 'Post Oak', name: 'Test Member',
    email: CONFIG.fallback.managerEmail, phone: '(713) 555-0123',
    reason: ['No Time to Attend', 'Financial'],
    rate_0: 'Great', rate_1: 'Good', rate_2: 'Poor', rate_3: 'Fair', rate_4: 'Fair',
    return_likelihood: '7', notes: 'This is a test submission.', signature: 'Test Member',
    acknowledged: 'Yes'
  };
  logRow_(sample);
  notify_(sample);
}
