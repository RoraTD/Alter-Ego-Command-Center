/* Alter Ego shared data service. Deploy as an Apps Script web app, executing as owner.
   Set RORA_KEY and PLIX_KEY in Script Properties before running setupAlterEgo(). */
function setupAlterEgo(){
 var p=PropertiesService.getScriptProperties();
 ['RORA_KEY','PLIX_KEY'].forEach(function(k){if((p.getProperty(k)||'').length<20)throw Error('Set '+k+' to a unique random editor key of at least 20 characters in Script Properties.');});
 if(!p.getProperty('DATA_FILE_ID')){
  var seed=initialAlterEgoData();seed.revision=0;
  var file=DriveApp.createFile('Alter Ego Command Center data.json',JSON.stringify(seed),MimeType.PLAIN_TEXT);
  p.setProperty('DATA_FILE_ID',file.getId());
 }
 return 'Setup complete. Deploy as a web app and use its /exec URL in the Command Center.';
}
function doGet(){try{return response_({ok:true,data:load_()});}catch(e){return response_({ok:false,error:e.message});}}
function doPost(e){try{
 var req=JSON.parse(e.postData.contents||'{}');
 if(req.action==='login'){
  if(['Rora','Plix'].indexOf(req.editor)<0)throw Error('Choose Rora or Plix.');
  var cache=CacheService.getScriptCache(),bucket='fail:'+req.editor;
  if(Number(cache.get(bucket)||0)>=10)throw Error('Too many unsuccessful attempts. Try again in 15 minutes.');
  var expected=PropertiesService.getScriptProperties().getProperty(req.editor.toUpperCase()+'_KEY');
  if(!expected||digest_(expected)!==digest_(String(req.key||''))){cache.put(bucket,String(Number(cache.get(bucket)||0)+1),900);throw Error('Editor name or access key is incorrect.');}
  cache.remove(bucket);var session=Utilities.getUuid()+Utilities.getUuid();cache.put('session:'+digest_(session),req.editor,21600);
  return response_({ok:true,editor:req.editor,session:session,data:load_()});
 }
 var editor=CacheService.getScriptCache().get('session:'+digest_(String(req.session||'')));
 if(!editor)throw Error('Your editor session expired. Connect again.');
 if(req.action!=='save')throw Error('Unknown action.');
 var lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Another save is in progress. Try again shortly.');
 try{
  var data=load_(),changes=req.changes;
  if(!Array.isArray(changes)||changes.length>1200)throw Error('Invalid changes.');
  changes.forEach(function(ch){
   if(ch.type==='staff'){
    if(JSON.stringify(data.staff)!==JSON.stringify(ch.before))throw Error('The staff roster changed. Refresh before saving.');
    if(!Array.isArray(ch.value)||ch.value.length>100)throw Error('Invalid staff list.');
    var seen={};ch.value.forEach(function(p){if(typeof p.name!=='string'||!p.name.trim()||p.name.length>80||seen[p.name]||!/^#[0-9a-f]{6}$/i.test(p.color))throw Error('Invalid staff member.');seen[p.name]=true;});
    data.staff=ch.value;return;
   }
   var shift=data.shifts.filter(function(s){return s.id===ch.id;})[0];if(!shift)throw Error('Shift not found.');
   Object.keys(ch.fields||{}).forEach(function(k){
    if(['person','time','status','cover','coverStatus','notes'].indexOf(k)<0||typeof ch.fields[k]!=='string'||ch.fields[k].length>2000)throw Error('Invalid shift change.');
    if((k==='status'||k==='coverStatus')&&['','Present','Late','Called out','No-show','Cancelled'].indexOf(ch.fields[k])<0)throw Error('Invalid attendance.');
    if(!ch.before||shift[k]!==ch.before[k]&&shift[k]!==ch.fields[k])throw Error('Someone else changed this shift. Refresh, review their change and try again.');
    shift[k]=ch.fields[k];
   });
   if(!shift.cover&&shift.coverStatus)throw Error('Choose cover staff before recording cover attendance.');
  });
  var at=new Date().toISOString();data.updatedAt=at;data.updatedBy=editor;data.revision=(data.revision||0)+1;
  data.history=(data.history||[]).concat([{at:at,by:editor,summary:String(req.summary||'Updated schedule').slice(0,200)}]).slice(-500);
  DriveApp.getFileById(PropertiesService.getScriptProperties().getProperty('DATA_FILE_ID')).setContent(JSON.stringify(data));
  return response_({ok:true,data:data});
 }finally{lock.releaseLock();}
}catch(err){return response_({ok:false,error:err.message});}}
function load_(){var id=PropertiesService.getScriptProperties().getProperty('DATA_FILE_ID');if(!id)throw Error('Run setupAlterEgo in Apps Script first.');return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString());}
function digest_(text){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text,Utilities.Charset.UTF_8).map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join('');}
function response_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
