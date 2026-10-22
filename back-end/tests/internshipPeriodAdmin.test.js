const {test,before,after,mock}=require('node:test');
mock.timers.enable({apis:['Date'],now:new Date('2026-09-28T09:30:00+07:00')});
const assert=require('node:assert/strict');
const express=require('express'),jwt=require('jsonwebtoken');
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
let calls=[],mode,server,base,released,existing;
const body={hocKy:'Học kỳ 1',namHoc:'2026-2027',ngayBatDauDangKy:'2026-10-01T08:00:00+07:00',ngayKetThucDangKy:'2026-10-10T17:00:00+07:00',ngayBatDauThucTap:'2026-10-12',ngayKetThucThucTap:'2026-12-06',trangThai:'SAP_MO'};
const db={async query(sql,params=[]){
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

  calls.push({sql,params});
  if(['BEGIN','COMMIT','ROLLBACK'].includes(sql))return {rows:[]};
  if(sql.startsWith('SELECT ngay_bat_dau_dang_ky'))return {rows:mode==='missing'?[]:[existing || body]};
  if(sql.startsWith('SELECT COUNT'))return {rows:[{total:1}]};
  if(sql.startsWith('SELECT dt.id'))return {rows:mode==='missing'?[]:[{id:'1',...body,soSinhVienDangKy:0}]};
  if(sql.startsWith('SELECT id FROM dot_thuc_tap'))return {rows:mode==='missing'?[]:[{id:'1'}]};
  if(sql.includes('FROM dang_ky_thuc_tap'))return {rows:mode==='used'?[{id:'2'}]:[]};
  if(sql.startsWith('INSERT')||sql.startsWith('UPDATE')){if(mode==='duplicate')throw Object.assign(new Error('private'),{code:'23505'});return {rows:mode==='missing'?[]:[{id:'1'}]};}
  if(sql.startsWith('DELETE')){if(mode==='fk')throw Object.assign(new Error('private'),{code:'23503'});return {rows:[]};}
  throw new Error('Unexpected query');
},async connect(){return {...db,release(){released=true;}};}};
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use(express.json());app.use('/api/admin',require('../src/routes/adminRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api/admin/internship-periods`;});
after(()=>{server.close();server.closeAllConnections();});
function reset(value='ok'){mode=value;calls=[];released=false;existing=null;}
async function request(method,path='',data,role='ADMIN'){
 const headers={'Content-Type':'application/json'};if(role)headers.Authorization='Bearer '+jwt.sign({id:1,email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});
 const response=await fetch(base+path,{method,headers,...(data?{body:JSON.stringify(data)}:{})});return {status:response.status,data:await response.json()};
}
test('internship period contracts and integrity',async t=>{
 await t.test('registered period cannot change internship dates; transaction rolls back',async()=>{reset('used');const r=await request('PUT','/1',{...body,ngayKetThucThucTap:'2026-12-07'});assert.equal(r.status,409);assert.ok(!calls.some(x=>x.sql.startsWith('UPDATE')));assert.equal(calls.at(-1).sql,'ROLLBACK');});
 await t.test('only the two allowed semesters accepted; request status is ignored',async()=>{
   for(const hocKy of ['Học kỳ 1','Học kỳ 2']) for(const trangThai of ['DA_KET_THUC','UNKNOWN',null]) for(const method of ['POST','PUT']) {
     reset();const response=await request(method,method==='PUT'?'/1':'',{...body,hocKy,trangThai});
     assert.equal(response.status,method==='POST'?201:200);assert.equal(response.data.data.trangThai,'SAP_MO');
     assert.equal(calls.find(x=>/^(INSERT|UPDATE)/.test(x.sql)).params[6],'SAP_MO');
   }
   for(const hocKy of ['Học kỳ hè','Học kỳ 3','Custom',' Học kỳ 1']){reset();assert.equal((await request('POST','',{...body,hocKy})).status,400);assert.equal(calls.length,0);}
 });
 await t.test('PUT ignores stale stored state and saves current automatic state',async()=>{
   reset();existing={...body,ngayBatDauDangKy:'2026-09-01T08:00:00+07:00',trangThai:'SAP_MO'};
   const response=await request('PUT','/1',{...existing,trangThai:'DA_KET_THUC'});
   assert.equal(response.status,200);assert.equal(response.data.data.trangThai,'DANG_MO_DANG_KY');
 });
 await t.test('POST rejects past opening using server time and exact message',async()=>{reset();const result=await request('POST','',{...body,ngayBatDauDangKy:'2026-09-28T08:00:00+07:00',now:'2000-01-01'});assert.equal(result.status,400);assert.equal(result.data.message,'Thời gian mở cổng đăng ký không được sớm hơn thời điểm hiện tại.');assert.equal(calls.length,0);});
 await t.test('POST accepts opening equal to server time or later',async()=>{for(const time of ['2026-09-28T09:30:00+07:00','2026-09-28T10:00:00+07:00']){reset();assert.equal((await request('POST','',{...body,ngayBatDauDangKy:time})).status,201);}});
 await t.test('closing must be strictly after opening',async()=>{for(const time of [body.ngayBatDauDangKy,'2026-10-01T07:59:00+07:00']){reset();const result=await request('POST','',{...body,ngayKetThucDangKy:time});assert.equal(result.status,400);assert.equal(result.data.errors.ngayKetThucDangKy,'Thời gian kết thúc đăng ký phải sau thời gian mở đăng ký.');}});
 await t.test('changed SAP_MO opening cannot be in past even when submitted status changes',async()=>{reset();const result=await request('PUT','/1',{...body,ngayBatDauDangKy:'2026-09-28T08:00:00+07:00',trangThai:'DANG_MO_DANG_KY'});assert.equal(result.status,400);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.ok(!calls.some(x=>x.sql.startsWith('UPDATE')));});
 await t.test('unchanged historical opening is preserved for every existing state',async()=>{for(const status of ['SAP_MO','DANG_MO_DANG_KY','DANG_THUC_TAP','DA_KET_THUC']){reset();existing={...body,trangThai:status,ngayBatDauDangKy:'2026-09-01T08:00:00+07:00'};assert.equal((await request('PUT','/1',existing)).status,200);}});
 await t.test('historical started period may be edited without applying future-opening rule',async()=>{reset();existing={...body,trangThai:'DANG_THUC_TAP',ngayBatDauDangKy:'2026-09-01T08:00:00+07:00'};assert.equal((await request('PUT','/1',{...existing,ngayBatDauDangKy:'2026-09-02T08:00:00+07:00'})).status,200);});
 await t.test('all endpoints require ADMIN',async()=>{for(const [method,path]of [['GET',''],['POST',''],['GET','/1'],['PUT','/1'],['DELETE','/1']])for(const [role,status]of [[null,401],['SINH_VIEN',403],['GIANG_VIEN',403]]){reset();assert.equal((await request(method,path,undefined,role)).status,status);assert.equal(calls.length,0);}});
 await t.test('reject missing, impossible, reversed dates and invalid status before SQL',async()=>{for(const change of [{hocKy:''},{namHoc:'x'.repeat(31)},{ngayBatDauDangKy:'2026-02-30'},{ngayBatDauDangKy:'0000-01-01'},{ngayKetThucDangKy:'2026-09-01'},{ngayKetThucThucTap:'2026-10-11'},{ngayBatDauThucTap:'2026-10-09'},{hocKy:'H?c k? h?'}])for(const method of ['POST','PUT']){reset();const result=await request(method,method==='PUT'?'/1':'',{...body,...change});assert.equal(result.status,400);assert.ok(result.data.errors);assert.equal(calls.length,0);}});
 await t.test('same-day opening/closing and next-day internship allowed, fields parameterized',async()=>{reset();const data={...body,namHoc:"2026'2027",ngayBatDauDangKy:'2026-10-10T08:00:00+07:00',ngayBatDauThucTap:'2026-10-11'};assert.equal((await request('POST','',data)).status,201);const insert=calls.find(c=>c.sql.startsWith('INSERT'));assert.equal(insert.params[1],data.namHoc);assert.ok(!insert.sql.includes(data.namHoc));});
 await t.test('strict internship boundaries enforced on create and update',async()=>{
   for(const method of ['POST','PUT']) for(const [change,key,message] of [
     [{ngayBatDauThucTap:'2026-10-09'},'ngayBatDauThucTap','Ngày bắt đầu thực tập phải sau thời hạn kết thúc đăng ký.'],
     [{ngayBatDauThucTap:'2026-10-10'},'ngayBatDauThucTap','Ngày bắt đầu thực tập phải sau thời hạn kết thúc đăng ký.'],
     [{ngayKetThucThucTap:body.ngayBatDauThucTap},'ngayKetThucThucTap','Ngày kết thúc thực tập phải sau ngày bắt đầu thực tập.'],
   ]){reset();const result=await request(method,method==='PUT'?'/1':'',{...body,...change});assert.equal(result.status,400);assert.equal(result.data.errors[key],message);assert.equal(calls.length,0);}
 });
 await t.test('list filters parameterized and count returned',async()=>{reset();const result=await request('GET','?search=2026&trangThai=SAP_MO&page=2&limit=10');assert.equal(result.status,200);assert.equal(result.data.pagination.total,1);assert.deepEqual(calls[1].params.slice(1),['%2026%','SAP_MO',10,10]);assert.match(calls[1].sql,/to_char/);});
 await t.test('invalid filters rejected',async()=>{for(const path of ['?page=0','?limit=101','?trangThai=BAD','/invalid']){reset();assert.equal((await request('GET',path)).status,400);assert.equal(calls.length,0);}});
 for(const method of ['POST','PUT'])await t.test(method+' duplicate returns 409',async()=>{reset('duplicate');const result=await request(method,method==='PUT'?'/1':'',body);assert.equal(result.status,409);assert.equal(result.data.message,'Đợt thực tập này đã tồn tại.');});
 for(const method of ['GET','PUT','DELETE'])await t.test(method+' missing record returns 404',async()=>{reset('missing');assert.equal((await request(method,'/1',method==='PUT'?body:undefined)).status,404);});
 await t.test('edit retains ID and updates timestamp',async()=>{reset();assert.equal((await request('PUT','/1',body)).status,200);const update=calls.find(x=>x.sql.startsWith('UPDATE'));assert.match(update.sql,/ngay_cap_nhat=NOW\(\) WHERE id=\$8/);assert.equal(update.params.at(-1),'1');});
 await t.test('registered period cannot be deleted',async()=>{reset('used');assert.equal((await request('DELETE','/1')).status,409);assert.ok(!calls.some(x=>x.sql.startsWith('DELETE')));assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(released,true);});
 await t.test('unused period deletes in locked transaction',async()=>{reset();assert.equal((await request('DELETE','/1')).status,200);assert.match(calls[1].sql,/FOR UPDATE/);assert.equal(calls.at(-1).sql,'COMMIT');assert.equal(released,true);});
 await t.test('foreign key failure rolls back safely',async()=>{reset('fk');const result=await request('DELETE','/1');assert.equal(result.status,409);assert.ok(!JSON.stringify(result).includes('private'));assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(released,true);});
});
