/**
 * Pvolve — Interactive Dashboard builder
 * -----------------------------------------------------------------------------
 * Run rebuildDashboard() ONCE from the Apps Script editor. It rebuilds the
 * "Dashboard" tab with two dropdowns — Studio (Combined / Memorial / Post Oak)
 * and Time frame (This week / Last week / This month / Last month / This year /
 * All time / Custom) plus custom start/end date cells. Every metric is a live
 * formula, so changing a dropdown (or adding submissions) updates it instantly.
 *
 * Only the Dashboard tab is touched; Submissions is never modified.
 * Week convention: Sunday–Saturday (US). Change WEEKDAY(...,1) to (...,2) for Mon–Sun.
 */

var INK = '#1C1B19', CLAY = '#B15C3E', SAND = '#F3EEE7', WHITE = '#FBF9F5', SOFT = '#5C574F';
var NROW = 5000; // rows of Submissions to scan

function rebuildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard');
  sh.clear();
  sh.clearFormats();
  try { sh.getDataRange().clearDataValidations(); } catch (e) {}

  sh.setColumnWidth(1, 250);
  sh.setColumnWidth(2, 130);
  sh.setColumnWidth(3, 30);
  sh.setColumnWidth(4, 130);

  // date+location criteria shared by the COUNTIFS/AVERAGEIFS metrics
  var dl = 'Submissions!$A$2:$A$' + NROW + ',">="&$B$7,' +
           'Submissions!$A$2:$A$' + NROW + ',"<"&($D$7+1),' +
           'Submissions!$D$2:$D$' + NROW + ',IF($B$3="Combined","*",$B$3)';
  // array location factor for SUMPRODUCT (reasons)
  var locFactor = '((Submissions!$D$2:$D$' + NROW + '=$B$3)+($B$3="Combined")*(Submissions!$D$2:$D$' + NROW + '<>""))';
  var dateFactor = '(Submissions!$A$2:$A$' + NROW + '>=$B$7)*(Submissions!$A$2:$A$' + NROW + '<$D$7+1)';

  // ---- Title ----
  cell(sh, 'A1', 'Pvolve · Retention Dashboard', { bold: true, size: 18 });
  cell(sh, 'A2', 'Pick a studio and time frame below — every number updates automatically.',
       { italic: true, size: 10, color: SOFT });

  // ---- Controls ----
  cell(sh, 'A3', 'Studio', { bold: true });
  cell(sh, 'A4', 'Time frame', { bold: true });
  cell(sh, 'A5', 'Custom start', { color: SOFT });
  cell(sh, 'A6', 'Custom end', { color: SOFT });
  cell(sh, 'A7', 'Showing', { bold: true });
  cell(sh, 'C7', '→', { color: SOFT });

  var studioRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Combined', 'Memorial', 'Post Oak'], true).setAllowInvalid(false).build();
  sh.getRange('B3').setDataValidation(studioRule).setValue('Combined');

  var timeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['This week', 'Last week', 'This month', 'Last month', 'This year', 'All time', 'Custom'], true)
    .setAllowInvalid(false).build();
  sh.getRange('B4').setDataValidation(timeRule).setValue('This month');

  // sensible defaults for the custom cells so switching to Custom never errors
  var today = new Date();
  var monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
  sh.getRange('B5').setValue(monthAgo).setNumberFormat('yyyy-mm-dd');
  sh.getRange('B6').setValue(today).setNumberFormat('yyyy-mm-dd');

  // computed period start (B7) / end (D7)
  sh.getRange('B7').setFormula(
    '=IFS($B$4="This week",TODAY()-WEEKDAY(TODAY(),1)+1,' +
    '$B$4="Last week",TODAY()-WEEKDAY(TODAY(),1)+1-7,' +
    '$B$4="This month",EOMONTH(TODAY(),-1)+1,' +
    '$B$4="Last month",EOMONTH(TODAY(),-2)+1,' +
    '$B$4="This year",DATE(YEAR(TODAY()),1,1),' +
    '$B$4="All time",DATE(2000,1,1),' +
    '$B$4="Custom",$B$5)').setNumberFormat('yyyy-mm-dd');
  sh.getRange('D7').setFormula(
    '=IFS($B$4="This week",TODAY()-WEEKDAY(TODAY(),1)+7,' +
    '$B$4="Last week",TODAY()-WEEKDAY(TODAY(),1)+1-1,' +
    '$B$4="This month",EOMONTH(TODAY(),0),' +
    '$B$4="Last month",EOMONTH(TODAY(),-1),' +
    '$B$4="This year",DATE(YEAR(TODAY()),12,31),' +
    '$B$4="All time",TODAY(),' +
    '$B$4="Custom",$B$6)').setNumberFormat('yyyy-mm-dd');

  var r = 9;
  r = section(sh, r, 'VOLUME  (selected studio + period)');
  metric(sh, r++, 'Total requests', '=COUNTIFS(' + dl + ')');
  metric(sh, r++, 'Freeze requests', '=COUNTIFS(' + dl + ',Submissions!$B$2:$B$' + NROW + ',"Freeze")');
  metric(sh, r++, 'Cancellation requests', '=COUNTIFS(' + dl + ',Submissions!$B$2:$B$' + NROW + ',"Cancellation")');
  metric(sh, r++, 'Saves (cancel → froze instead)', '=COUNTIFS(' + dl + ',Submissions!$C$2:$C$' + NROW + ',"Yes")');
  metric(sh, r, 'Save rate on cancel attempts', '=IFERROR($B$' + (r - 1) + '/($B$' + (r - 2) + '+$B$' + (r - 1) + '),0)');
  sh.getRange('B' + r).setNumberFormat('0%'); r++;

  r++;
  r = section(sh, r, 'BY STUDIO  (in selected period — both shown for comparison)');
  var byDate = 'Submissions!$A$2:$A$' + NROW + ',">="&$B$7,Submissions!$A$2:$A$' + NROW + ',"<"&($D$7+1)';
  metric(sh, r++, 'Memorial — total', '=COUNTIFS(' + byDate + ',Submissions!$D$2:$D$' + NROW + ',"Memorial")');
  metric(sh, r++, 'Memorial — cancellations', '=COUNTIFS(' + byDate + ',Submissions!$D$2:$D$' + NROW + ',"Memorial",Submissions!$B$2:$B$' + NROW + ',"Cancellation")');
  metric(sh, r++, 'Post Oak — total', '=COUNTIFS(' + byDate + ',Submissions!$D$2:$D$' + NROW + ',"Post Oak")');
  metric(sh, r++, 'Post Oak — cancellations', '=COUNTIFS(' + byDate + ',Submissions!$D$2:$D$' + NROW + ',"Post Oak",Submissions!$B$2:$B$' + NROW + ',"Cancellation")');

  r++;
  r = section(sh, r, 'SERVICE RATINGS  (# rated Poor or Unsatisfactory = trouble spots)');
  var rateCols = [['Quality of Workout', 'K'], ['Front Desk Service', 'L'], ['Class Times', 'M'],
                  ['Cleanliness', 'N'], ['Overall Experience', 'O']];
  for (var i = 0; i < rateCols.length; i++) {
    var col = rateCols[i][1];
    metric(sh, r++, rateCols[i][0],
      '=COUNTIFS(' + dl + ',Submissions!$' + col + '$2:$' + col + '$' + NROW + ',"Poor")+' +
      'COUNTIFS(' + dl + ',Submissions!$' + col + '$2:$' + col + '$' + NROW + ',"Unsatisfactory")');
  }

  r++;
  r = section(sh, r, 'TOP REASONS  (times checked, selected studio + period)');
  var reasons = ['Moving or Relocating', 'No Time to Attend', 'Financial', 'Medical', 'Seasonal Resident',
                 'Fitness Routine Change', 'Convenient Classes Unavailable', 'Unsatisfied with Facility',
                 'Unsatisfied with Studio Team', 'Travel', 'Upgrade/Downgrade', 'Other'];
  for (var j = 0; j < reasons.length; j++) {
    metric(sh, r++, reasons[j],
      '=SUMPRODUCT(ISNUMBER(SEARCH("' + reasons[j] + '",Submissions!$J$2:$J$' + NROW + '))*' +
      dateFactor + '*' + locFactor + ')');
  }

  r++;
  r = section(sh, r, 'RETURN LIKELIHOOD  (selected studio + period)');
  metric(sh, r++, 'Average — all requests',
    '=IFERROR(ROUND(AVERAGEIFS(Submissions!$P$2:$P$' + NROW + ',' + dl + '),1),"—")');
  metric(sh, r++, 'Average — cancellations only',
    '=IFERROR(ROUND(AVERAGEIFS(Submissions!$P$2:$P$' + NROW + ',' + dl + ',Submissions!$B$2:$B$' + NROW + ',"Cancellation"),1),"—")');

  ss.setActiveSheet(sh);
  SpreadsheetApp.getActive().toast('Dashboard rebuilt. Use the Studio and Time frame dropdowns.', 'Done', 5);
}

// ---- little formatting helpers ----
function cell(sh, a1, val, opt) {
  opt = opt || {};
  var c = sh.getRange(a1).setValue(val);
  if (opt.bold) c.setFontWeight('bold');
  if (opt.italic) c.setFontStyle('italic');
  if (opt.size) c.setFontSize(opt.size);
  if (opt.color) c.setFontColor(opt.color);
  return c;
}
function section(sh, row, title) {
  var rng = sh.getRange('A' + row + ':D' + row).merge();
  rng.setValue('  ' + title).setFontWeight('bold').setFontColor(WHITE)
     .setBackground(CLAY).setFontSize(10).setVerticalAlignment('middle');
  sh.setRowHeight(row, 24);
  return row + 1;
}
function metric(sh, row, label, formula) {
  sh.getRange('A' + row).setValue(label).setFontColor(INK);
  sh.getRange('B' + row).setFormula(formula).setFontWeight('bold').setHorizontalAlignment('right');
}
