/**
 * Pvolve — Membership form endpoint
 * -----------------------------------------------------------------------------
 * Receives freeze / cancellation submissions from the web forms and appends
 * one row to the "Submissions" sheet. Deploy this as a Web App (see README).
 *
 * This script is CONTAINER-BOUND: create it from inside the Google Sheet via
 * Extensions -> Apps Script, so getActiveSpreadsheet() targets the right file.
 */

var SHEET_NAME = 'Submissions';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    var reasons = Array.isArray(data.reason) ? data.reason.join('; ') : (data.reason || '');
    var requestType = (data.type === 'FREEZE') ? 'Freeze' : 'Cancellation';
    var converted = data.converted_from_cancel ? 'Yes' : 'No';
    var acknowledged = data.acknowledged ? 'Yes' : 'No';

    // Order MUST match the Submissions header row.
    var row = [
      new Date(),                    // Submitted
      requestType,                   // Request Type
      converted,                     // Converted From Cancel?
      data.location || '',           // Location
      data.name || '',               // Member Name
      data.email || '',              // Email
      data.phone || '',              // Phone
      data.freeze_start || '',       // Freeze Start
      data.duration || '',           // Freeze Duration
      reasons,                       // Reasons (all checked)
      data.rate_0 || '',             // Rating: Quality of Workout
      data.rate_1 || '',             // Rating: Front Desk Service
      data.rate_2 || '',             // Rating: Class Times
      data.rate_3 || '',             // Rating: Cleanliness
      data.rate_4 || '',             // Rating: Overall Experience
      data.return_likelihood || '',  // Return Likelihood (1-10)
      data.notes || '',              // Comments
      data.signature || '',          // Signature
      acknowledged                   // Acknowledged
    ];
    sheet.appendRow(row);

    // ---- Phase 2 (later): send studio + member confirmation emails here ----
    // sendNotifications(data);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Pvolve form endpoint is running.');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
