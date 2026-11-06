// ALTER EGO — VIEW-ONLY WEBSITE. Update the private Google Sheet. No keys needed.
function setupAlterEgo() {
  var props=PropertiesService.getScriptProperties(),id=props.getProperty('AE_SHEET_ID');
  if(id){console.log('Your schedule sheet: https://docs.google.com/spreadsheets/d/'+id+'/edit');return;}
  var seed=initialAlterEgoData(),book=SpreadsheetApp.create('Alter Ego 2027 — Schedule & Attendance');
  var sheet=book.getSheets()[0];sheet.setName('Schedule');
  sheet.getRange(1,1,1,9).setValues([['Date','Position','Assigned staff','Shift time','Attendance','Cover staff','Cover attendance','Notes','Shift ID']]);
  var labels={dj:'DJ',spammer2:'2-hour spammer',spammer1:'1-hour spammer'};
  var rows=seed.shifts.map(function(s){return [s.date,labels[s.role],s.person,s.time,s.status,s.cover,s.coverStatus,s.notes,s.id];});
  sheet.getRange(2,1,rows.length,9).setNumberFormat('@').setValues(rows);
  sheet.setFrozenRows(1);sheet.getRange(1,1,1,9).setBackground('#29203E').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.setColumnWidth(1,110);sheet.setColumnWidth(2,140);sheet.setColumnWidths(3,5,170);sheet.setColumnWidth(8,350);sheet.hideColumns(9);
  sheet.getRange(1,1,rows.length+1,9).createFilter();
  var rule=SpreadsheetApp.newDataValidation().requireValueInList(['Present','Late','Called out','No-show','Cancelled'],true).setAllowInvalid(false).build();
  sheet.getRange(2,5,rows.length,1).setDataValidation(rule);sheet.getRange(2,7,rows.length,1).setDataValidation(rule);
  var staff=book.insertSheet('Staff');staff.getRange(1,1,1,6).setValues([['Name','Color','DJ','Regular spammer','Backup spammer','Active']]).setBackground('#29203E').setFontColor('#FFFFFF').setFontWeight('bold');
  staff.getRange(2,1,seed.staff.length,6).setValues(seed.staff.map(function(p){return [p.name,p.color,p.dj,p.spammer,p.backup,p.active];}));
  staff.setFrozenRows(1);staff.setColumnWidth(1,240);staff.setColumnWidths(2,5,150);
  var names=SpreadsheetApp.newDataValidation().requireValueInRange(staff.getRange('A2:A101'),true).setAllowInvalid(true).build();
  sheet.getRange(2,3,rows.length,1).setDataValidation(names);sheet.getRange(2,6,rows.length,1).setDataValidation(names);
  var rules=[];seed.staff.filter(function(p){return p.dj;}).forEach(function(p){rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(p.name).setFontColor(p.color).setBold(true).setRanges([sheet.getRange('C2:C1096'),sheet.getRange('F2:F1096')]).build());});sheet.setConditionalFormatRules(rules);
  props.setProperty('AE_SHEET_ID',book.getId());console.log('Setup complete. Your schedule sheet: '+book.getUrl());
}
function doGet() {
  try {
    var id=PropertiesService.getScriptProperties().getProperty('AE_SHEET_ID');if(!id)throw Error('Run setupAlterEgo first.');
    var book=SpreadsheetApp.openById(id),roleMap={'DJ':'dj','2-hour spammer':'spammer2','1-hour spammer':'spammer1'};
    var shifts=book.getSheetByName('Schedule').getDataRange().getDisplayValues().slice(1).filter(function(r){return r[8];}).map(function(r){return {id:r[8],date:r[0],role:roleMap[r[1]],person:r[2],time:r[3],status:r[4],cover:r[5],coverStatus:r[6],notes:r[7]};});
    var staff=book.getSheetByName('Staff').getDataRange().getValues().slice(1).filter(function(r){return r[0];}).map(function(r){return {name:String(r[0]),color:String(r[1]),dj:truth_(r[2]),spammer:truth_(r[3]),backup:truth_(r[4]),active:truth_(r[5])};});
    return json_({ok:true,data:{version:1,year:2027,shifts:shifts,staff:staff,history:[],spreadsheetUrl:book.getUrl(),updatedAt:null,updatedBy:null}});
  }catch(e){return json_({ok:false,error:e.message});}
}
function doPost(){return json_({ok:false,error:'This website is view-only. Update the schedule in your Google Sheet.'});}
function truth_(v){return v===true||String(v).toLowerCase()==='true';}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
