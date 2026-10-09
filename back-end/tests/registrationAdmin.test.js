const {test,before,after,mock}=require('node:test');
const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
mock.timers.enable({apis:['Date'],now:new Date('2026-10-05T12:00:00+07:00')});
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
let rows,calls,server,base,mode,released;
const db={async query(sql,params=[]){
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

 calls.push({sql,params});
 if(['BEGIN','COMMIT','ROLLBACK'].includes(sql))return {rows:[]};
 if(sql.startsWith('SELECT trang_thai')){assert.match(sql,/FOR UPDATE/);const row=rows.find(x=>x.id===params[0]);return {rows:row?[{trang_thai:row.trangThai}]:[]};}
 if(sql.startsWith('UPDATE dang_ky_thuc_tap')){if(mode==='failure')throw new Error('private');const row=rows.find(x=>x.id===params[2]);row.trangThai=params[0];row.lyDoTuChoi=params[1];return {rows:[row]};}
 if(sql.startsWith('SELECT id,ma_sinh_vien'))return {rows:[{id:'7',hoTen:'Test',maSinhVien:'SV'}]};
 if(sql.startsWith('SELECT ngay_bat_dau_dang_ky'))return {rows:[{ngayBatDauDangKy:'2026-10-01T08:00:00+07:00',ngayKetThucDangKy:'2026-10-10T17:00:00+07:00',ngayBatDauThucTap:'2026-10-12',ngayKetThucThucTap:'2026-12-06'}]};
 if(sql.startsWith('SELECT id FROM dang_ky_thuc_tap'))return {rows:[]};
 if(sql.startsWith('SELECT id FROM doanh_nghiep')||sql.startsWith('SELECT id FROM can_bo_huong_dan'))return {rows:[{id:'1'}]};
 if(sql.startsWith('INSERT INTO dang_ky_thuc_tap')){assert.match(sql,/'CHO_DUYET',NULL/);const row={id:String(rows.length+1),trangThai:'CHO_DUYET',lyDoTuChoi:null};rows.push(row);return {rows:[row]};}
 if(sql.startsWith('SELECT COUNT'))return {rows:[{total:rows.length}]};
 if(sql.startsWith('SELECT id,hoc_ky'))return {rows:[]};
 if(sql.startsWith('SELECT dk.id'))return {rows:sql.includes('WHERE dk.id=$1')?rows.filter(x=>x.id===params[0]):rows};
 throw new Error('Unexpected query');
},async connect(){return {...db,release(){released=true;}};}};
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use(express.json());app.use('/api/admin',require('../src/routes/adminRoutes'));app.use('/api/student',require('../src/routes/studentRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api`;});
after(()=>{server.close();server.closeAllConnections();});
function reset(){rows=[{id:'1',trangThai:'CHO_DUYET',lyDoTuChoi:'old reason'}];calls=[];released=false;mode='ok';}
async function request(method,path,body,role='ADMIN'){
 const headers={'Content-Type':'application/json'};if(role)headers.Authorization='Bearer '+jwt.sign({id:'22',email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});
 const r=await fetch(base+path,{method,headers,...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,data:await r.json()};
}
const path='/admin/registrations';
test('admin review authorization and workflow',async t=>{
 await t.test('all four APIs enforce ADMIN',async()=>{for(const [method,url]of [['GET',path],['GET',path+'/1'],['PUT',path+'/1/approve'],['PUT',path+'/1/reject']])for(const [role,status]of [[null,401],['SINH_VIEN',403],['GIANG_VIEN',403]]){reset();assert.equal((await request(method,url,undefined,role)).status,status);assert.equal(calls.length,0);}});
 await t.test('list search/status/period values are bound parameters',async()=>{reset();const result=await request('GET',path+'?search=O%27Reilly&trangThai=CHO_DUYET&dotThucTapId=3&page=2&limit=10');assert.equal(result.status,200);const query=calls.find(c=>c.sql.startsWith('SELECT dk.id'));assert.deepEqual(query.params,["%O'Reilly%",'CHO_DUYET','3',10,10]);assert.ok(!query.sql.includes("O'Reilly"));assert.match(query.sql,/sv.ma_sinh_vien ILIKE/);assert.match(query.sql,/sv.ho_ten ILIKE/);assert.match(query.sql,/dn.ten_doanh_nghiep ILIKE/);});
 await t.test('invalid filters and IDs rejected before SQL',async()=>{for(const suffix of ['?page=0','?limit=101','?trangThai=INVALID','?dotThucTapId=bad','/bad']){reset();assert.equal((await request('GET',path+suffix)).status,400);assert.equal(calls.length,0);}});
 await t.test('missing detail and actions return 404',async()=>{for(const [method,suffix,body]of [['GET','/99'],['PUT','/99/approve'],['PUT','/99/reject',{lyDo:'Reason'}]]){reset();assert.equal((await request(method,path+suffix,body)).status,404);}});
 await t.test('approve fixes target status and clears reason',async()=>{reset();const result=await request('PUT',path+'/1/approve',{trangThai:'HOAN_THANH',lyDo:'forged'});assert.equal(result.status,200);assert.equal(result.data.data.trangThai,'DA_DUYET');assert.equal(result.data.data.lyDoTuChoi,null);assert.equal(calls.at(-1).sql,'COMMIT');assert.equal(released,true);});
 await t.test('reject requires nonempty string',async()=>{for(const body of [undefined,{}, {lyDo:'  '},{lyDo:123}]){reset();assert.equal((await request('PUT',path+'/1/reject',body)).status,400);assert.equal(calls.length,0);}});
 await t.test('reject trims reason and ignores forged status',async()=>{reset();const result=await request('PUT',path+'/1/reject',{lyDo:"  Reason ' $1  ",trangThai:'DA_DUYET'});assert.equal(result.status,200);assert.equal(result.data.data.trangThai,'TU_CHOI');assert.equal(result.data.data.lyDoTuChoi,"Reason ' $1");const update=calls.find(c=>c.sql.startsWith('UPDATE'));assert.deepEqual(update.params,['TU_CHOI',"Reason ' $1",'1']);});
 await t.test('every processed state rejects both decisions',async()=>{for(const status of ['DA_DUYET','TU_CHOI','DANG_THUC_TAP','HOAN_THANH'])for(const action of ['approve','reject']){reset();rows[0].trangThai=status;const result=await request('PUT',path+'/1/'+action,{lyDo:'Reason'});assert.equal(result.status,409);assert.equal(result.data.message,'Đăng ký này đã được xử lý.');assert.ok(!calls.some(c=>c.sql.startsWith('UPDATE')));assert.equal(calls.at(-1).sql,'ROLLBACK');}});
 await t.test('database failure rolls back and hides internal details',async()=>{reset();mode='failure';const result=await request('PUT',path+'/1/approve');assert.equal(result.status,500);assert.ok(!JSON.stringify(result).includes('private'));assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(released,true);});
 await t.test('student submits, admin approves/rejects, student sees stored outcomes',async()=>{
  reset();rows=[];const body={dotThucTapId:'3',doanhNghiepId:'4',canBoHuongDanId:'5',viTriThucTap:'Web'};
  for(let i=0;i<2;i++){const result=await request('POST','/student/internship-registration',{...body,dotThucTapId:String(i+3)},'SINH_VIEN');assert.equal(result.status,201);assert.equal(result.data.data.trangThai,'CHO_DUYET');}
  assert.equal((await request('PUT',path+'/1/approve')).status,200);
  assert.equal((await request('PUT',path+'/2/reject',{lyDo:'Needs correction'})).status,200);
  assert.equal((await request('PUT',path+'/1/approve')).status,409);
  const mine=await request('GET','/student/internship-registration',undefined,'SINH_VIEN');assert.equal(mine.status,200);assert.equal(mine.data.data[0].trangThai,'DA_DUYET');assert.equal(mine.data.data[1].trangThai,'TU_CHOI');assert.equal(mine.data.data[1].lyDoTuChoi,'Needs correction');
 });
});
