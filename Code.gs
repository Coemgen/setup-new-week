'use strict';

function getDataFromAms() {
  var oncallJsonId = {},
      oncallJsonData = '',
      oncallJsonBlob = '',
      oncallJsonStr = {},
      oncallJsonObj = {};
  oncallJsonId = PropertiesService.getScriptProperties().getProperty('oncallJsonId');
  oncallJsonData = DriveApp.getFileById(oncallJsonId);
  oncallJsonBlob = oncallJsonData.getBlob();
  oncallJsonStr = oncallJsonBlob.getDataAsString();
  oncallJsonObj = JSON.parse(oncallJsonStr);
  return oncallJsonObj.oncalls;
}

function updateSpreadsheet() {
  var ss = SpreadsheetApp.getActive(),
      currentSheet = ss.getSheetByName('Current'),
      archiveSheet = ss.getSheetByName('Archive'),
      currentDataRange = currentSheet.getDataRange(),
      lastRow = currentDataRange.getLastRow(),
      lastColumn = currentSheet.getLastColumn(),
      row = 0,
      dow = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
      ],
      tempValues = [],
      oncallJson = getDataFromAms(),
      dateObj,
      y, m, d, i = 0;
  // archive last week's oncall list
  for (row = 2; row <= lastRow; row += 1) {
    archiveSheet.insertRows(row);
    archiveSheet.getRange(row, 1, 1, lastColumn).setValues(
        currentSheet.getRange(row, 1, 1, lastColumn).getValues());
  }
  // create this week's oncall list
  currentSheet.clearContents();
  currentSheet.getRange(1, 1, 1, lastColumn)
  .setValues([
    [
      'Date', 
      'Day', 
      'Clinicals', 
      'Phone', 
      'Administratives', 
      'Phone',
      '#WEB/WPL',
      'Phone']
  ])
  for (i = 0; i < oncallJson.length; i += 1) {
    row = i + 2;
    tempValues[i] = [];
    y = Number(oncallJson[i].date.slice(0, 2)) + 2000;
    m = Number(oncallJson[i].date.slice(3, 5));
    d = Number(oncallJson[i].date.slice(6, 8));
    dateObj = new Date(y, (m - 1), d);
    tempValues[i][0] = m + '/' + d + '/' + y;
    tempValues[i][1] = dow[dateObj.getDay()];
    tempValues[i][2] = oncallJson[i].coverage[0].name;
    tempValues[i][3] = oncallJson[i].coverage[0].telephone;
    tempValues[i][4] = oncallJson[i].coverage[1].name;
    tempValues[i][5] = oncallJson[i].coverage[1].telephone;
    tempValues[i][6] = oncallJson[i].coverage[2].name;
    tempValues[i][7] = oncallJson[i].coverage[2].telephone;
  }
  currentSheet.getRange(2, 1, tempValues.length, lastColumn)
  .setValues(tempValues);
}
