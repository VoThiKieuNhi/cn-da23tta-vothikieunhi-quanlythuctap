const {test,before,after,mock}=require('node:test');
const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
mock.timers.enable({apis:['Date'],now:new Date('2026-10-05T12:00:00+07:00')});
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
let mode,calls,released,server,base;
const dot={ngayBatDauDangKy:'2026-10-01T08:00:00+07:00',ngayKetThucDangKy:'2026-10-10T17:00:00+07:00',ngayBatDauThucTap:'2026-10-12',ngayKetThucThucTap:'2026-12-06'};
const body={dotThucTapId:'3',doanhNghiepId:'4',canBoHuongDanId:'5',viTriThucTap:'  Web developer  '};
const db={async query(sql,params=[]){
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }
calls.push({sql,params});
 if(['BEGIN','COMMIT','ROLLBACK'].includes(sql))return {rows:[]};
 if(sql.startsWith('SELECT id,ma_sinh_vien')){assert.equal(params[0],'22');return {rows:mode==='no-profile'?[]:[{id:'7',hoTen:'Test',maSinhVien:'SV',lop:'A',nganh:'IT'}]};}
 if(sql.startsWith('SELECT ngay_bat_dau_dang_ky'))return {rows:mode==='missing-period'?[]:[{...dot,...(mode==='not-open'?{ngayBatDauDangKy:'2026-10-06T08:00:00+07:00'}:{}),...(mode==='closed'?{ngayKetThucDangKy:'2026-10-04T17:00:00+07:00'}:{})}]};
 if(sql.startsWith('SELECT id,dot_thuc_tap_id')){assert.deepEqual(params,['10','7']);return {rows:mode==='other-owner'?[]:[{id:'10',dotThucTapId:'3',trangThai:mode==='approved'?'DA_DUYET':'CHO_DUYET'}]};}
 if(sql.startsWith('SELECT id FROM dang_ky_thuc_tap')){assert.deepEqual(params,['7','3']);return {rows:mode==='duplicate'?[{id:'10'}]:[]};}
 if(sql.startsWith('SELECT id FROM doanh_nghiep'))return {rows:mode==='missing-company'?[]:[{id:'4'}]};
 if(sql.startsWith('SELECT id FROM can_bo_huong_dan')){assert.deepEqual(params,['5','4']);return {rows:mode==='wrong-supervisor'?[]:[{id:'5'}]};}
 if(sql.startsWith('INSERT')){if(mode==='unique-race')throw Object.assign(new Error('private'),{code:'23505'});return {rows:[{id:'10'}]};}
 if(sql.startsWith('UPDATE')||sql.startsWith('DELETE'))return {rows:[{id:'10'}]};
 if(sql.startsWith('SELECT dk.id')){assert.equal(params[1],'7');return {rows:[]};}
 if(sql.startsWith('SELECT dt.id')){assert.ok(sql.includes('trang_thai_tu_dong=$2'));assert.equal(params[1],'DANG_MO_DANG_KY');return {rows:[]};}
 if(sql.startsWith('SELECT id,ten_doanh_nghiep')||sql.startsWith('SELECT id,ho_ten'))return {rows:[]};
 throw new Error('Unexpected query');
},async connect(){return {...db,release(){released=true;}};}};
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use(express.json());app.use('/api/student',require('../src/routes/studentRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api/student`;});
after(()=>{server.close();server.closeAllConnections();});
function reset(value='ok'){mode=value;calls=[];released=false;}
async function request(method,path,data,role='SINH_VIEN'){
 const headers={'Content-Type':'application/json'};if(role)headers.Authorization='Bearer '+jwt.sign({id:'22',email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});
 const r=await fetch(base+path,{method,headers,...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,data:await r.json()};
}
const path='/internship-registration';
test('student registration security and business rules',async t=>{
 await t.test('all seven endpoints enforce student JWT role',async()=>{for(const [method,url]of [['GET','/internship-periods/open'],['GET','/companies'],['GET','/companies/4/supervisors'],['GET',path],['POST',path],['PUT',path+'/10'],['DELETE',path+'/10']])for(const [role,status]of [[null,401],['ADMIN',403],['GIANG_VIEN',403]]){reset();assert.equal((await request(method,url,undefined,role)).status,status);assert.equal(calls.length,0);}});
 await t.test('profile is required',async()=>{reset('no-profile');assert.equal((await request('POST',path,body)).status,403);assert.equal(calls.at(-1).sql,'ROLLBACK');});
 for(const state of ['not-open','closed'])for(const method of ['POST','PUT','DELETE'])await t.test(method+' refuses '+state+' gate',async()=>{reset(state);const result=await request(method,path+(method==='POST'?'':'/10'),method==='DELETE'?undefined:body);assert.equal(result.status,409);assert.equal(result.data.message,'Cổng đăng ký thực tập hiện không mở.');assert.ok(!calls.some(c=>/^(INSERT|UPDATE|DELETE)/.test(c.sql)));});
 await t.test('open gate ignores forged identity, dates and approved status',async()=>{reset();assert.equal((await request('POST',path,{...body,sinhVienId:99,sinh_vien_id:99,ngayBatDau:'2000-01-01',ngayKetThuc:'2000-01-02',trangThai:'DA_DUYET'})).status,201);const insert=calls.find(c=>c.sql.startsWith('INSERT'));assert.deepEqual(insert.params,['7','3','4','5','Web developer','2026-10-12','2026-12-06']);assert.match(insert.sql,/'CHO_DUYET',NULL/);assert.equal(calls.at(-1).sql,'COMMIT');assert.equal(released,true);});
 for(const state of ['duplicate','unique-race'])await t.test(state+' returns 409',async()=>{reset(state);const result=await request('POST',path,body);assert.equal(result.status,409);assert.equal(result.data.message,'Bạn đã đăng ký thực tập trong đợt này.');assert.equal(calls.at(-1).sql,'ROLLBACK');});
 for(const method of ['POST','PUT'])await t.test(method+' rejects supervisor from another company',async()=>{reset('wrong-supervisor');assert.equal((await request(method,path+(method==='PUT'?'/10':''),body)).status,400);assert.ok(!calls.some(c=>/^(INSERT|UPDATE)/.test(c.sql)));});
 for(const method of ['PUT','DELETE'])for(const state of ['other-owner','approved'])await t.test(method+' rejects '+state,async()=>{reset(state);assert.equal((await request(method,path+'/10',method==='PUT'?body:undefined)).status,state==='other-owner'?404:409);assert.ok(!calls.some(c=>/^(UPDATE|DELETE)/.test(c.sql)));});
 await t.test('pending update preserves period, student, dates and status',async()=>{reset();assert.equal((await request('PUT',path+'/10',{...body,dotThucTapId:999,trangThai:'DA_DUYET',ngayBatDau:'2000-01-01'})).status,200);const update=calls.find(c=>c.sql.startsWith('UPDATE'));assert.deepEqual(update.params,['4','5','Web developer','10','7']);assert.doesNotMatch(update.sql,/SET.*(?:dot_thuc_tap_id|ngay_bat_dau|trang_thai)=/);});
 await t.test('pending cancellation succeeds with ownership predicate',async()=>{reset();assert.equal((await request('DELETE',path+'/10')).status,200);assert.deepEqual(calls.find(c=>c.sql.startsWith('DELETE')).params,['10','7']);assert.equal(calls.at(-1).sql,'COMMIT');});
 await t.test('invalid position rejected before SQL',async()=>{for(const viTriThucTap of ['  ','x'.repeat(201),123]){reset();assert.equal((await request('POST',path,{...body,viTriThucTap})).status,400);assert.equal(calls.length,0);}});
 for(const state of ['missing-period','missing-company'])await t.test(state+' returns 404',async()=>{reset(state);assert.equal((await request('POST',path,body)).status,404);});
 await t.test('read APIs scope profile and use current automatic period state',async()=>{reset();const mine=await request('GET',path);assert.equal(mine.status,200);assert.equal(mine.data.student.id,'7');assert.deepEqual(mine.data.data,[]);assert.equal((await request('GET','/internship-periods/open')).status,200);assert.equal((await request('GET','/companies?search=test')).status,200);assert.equal((await request('GET','/companies/4/supervisors')).status,200);});
});
