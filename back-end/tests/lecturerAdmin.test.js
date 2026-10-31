const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
let mode, calls, released, server, base;
const profile = { id:'12', maGiangVien:'TEST', hoTen:'Test Lecturer', email:'lecturer@tvu.edu.vn', dangHoatDong:true };
const body = { ...profile, password:'Test-password-123!', soDienThoai:'0123456789', boMon:'Testing', hocVi:'Custom degree',danhMucGiangVienId:'9' };
const db = {
  async query(sql, params = []) {
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

    calls.push({sql, params});
    if (['BEGIN','COMMIT','ROLLBACK'].includes(sql)) return {rows:[]};
    if(sql.includes('FROM danh_muc_giang_vien_tvu')) return {rows:[{id:'9',hoTen:body.hoTen,hocVi:body.hocVi,khoaDonVi:body.boMon}]};
    if (sql.includes('FOR UPDATE')) return { rows:mode === 'missing' ? [] : [{nguoi_dung_id:'24'}] };
    if (sql.startsWith('SELECT id FROM nguoi_dung')) return {rows:mode === 'duplicate-email' ? [{id:99}] : []};
    if (sql.startsWith('SELECT id FROM giang_vien')) return {rows:mode === 'duplicate-code' ? [{id:99}] : []};
    if (sql.startsWith('INSERT INTO nguoi_dung')) {
      assert.equal(params[0],body.email);
      assert.ok(await bcrypt.compare(body.password,params[1]));
      assert.equal(params[2],'GIANG_VIEN');assert.equal(params[3],true);
      return {rows:[{id:'24'}]};
    }
    if (sql.startsWith('INSERT INTO giang_vien')) {
      if (mode === 'insert-error') throw Object.assign(new Error('private'),{code:'23514'});
      if(mode === 'manual') { assert.equal(params[6],null);assert.equal(params[2],'Nguyễn Văn An');assert.equal(params[7],'Giảng viên');assert.equal(params[8],'Công nghệ thông tin');return {rows:[{id:'12'}]}; }
      assert.equal(params[0],'24');assert.deepEqual(params.slice(1,7),[body.maGiangVien,body.hoTen,body.soDienThoai,body.boMon,body.hocVi,body.danhMucGiangVienId]);return {rows:[{id:'12'}]};
    }
    if (sql.startsWith('SELECT gv.id')) return {rows:mode === 'missing' ? [] : [profile]};
    if (sql.startsWith('SELECT id FROM phan_cong_giang_vien')) { assert.ok(sql.includes('UNION ALL SELECT id FROM danh_gia_thuc_tap WHERE giang_vien_id=$1')); return {rows:['assigned','evaluated'].includes(mode) ? [{id:1}] : []}; }
    if (sql.startsWith('UPDATE nguoi_dung')) { assert.ok(!sql.includes('mat_khau_hash'));assert.ok(!sql.includes('vai_tro'));return {rows:[]}; }
    if (sql.startsWith('UPDATE giang_vien') || sql.startsWith('DELETE')) return {rows:[],rowCount:1};
    throw new Error('Unexpected test query');
  },
  async connect() { return {...db,release(){released=true;}}; },
};
const file = require.resolve('../src/config/database');
require.cache[file] = {id:file,filename:file,loaded:true,exports:db};
before(async()=>{
  const app=express();app.use(express.json());app.use('/api/admin',require('../src/routes/adminRoutes'));
  await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});
  base=`http://127.0.0.1:${server.address().port}/api/admin/lecturers`;
});
after(()=>{server.close();server.closeAllConnections();});
async function request(method,path='',data,role='ADMIN') {
  const headers={'Content-Type':'application/json'};
  if(role) headers.Authorization=`Bearer ${jwt.sign({id:1,email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'})}`;
  const r=await fetch(base+path,{method,headers,...(data ? {body:JSON.stringify(data)} : {})});
  const result=await r.json();assert.ok(!JSON.stringify(result).includes('mat_khau_hash'));
  return {status:r.status,data:result};
}
function reset(value='ok'){mode=value;calls=[];released=false;}
test('lecturer admin contracts, authorization and transactional safety',async t=>{
  await t.test('deactivate preserves lecturer and internship history, requires ADMIN',async()=>{
    for(const role of ['SINH_VIEN','GIANG_VIEN']){reset();assert.equal((await request('PATCH','/12/deactivate',{},role)).status,403);assert.equal(calls.length,0);}
    reset('assigned');assert.equal((await request('PATCH','/12/deactivate',{})).status,200);
    const update=calls.find(c=>c.sql.startsWith('UPDATE nguoi_dung'));
    assert.match(update.sql,/dang_hoat_dong=false/);assert.deepEqual(update.params,['24']);
    assert.ok(!calls.some(c=>c.sql.startsWith('DELETE')));assert.equal(calls.at(-1).sql,'COMMIT');
    reset('missing');assert.equal((await request('PATCH','/12/deactivate',{})).status,404);
  });
  await t.test('manual create persists optional fields without inserting reference catalog',async()=>{
    reset('manual');assert.equal((await request('POST','',{...body,referenceLecturerId:null,hoTen:'Nguyễn Văn An',khoaDonVi:'Khoa khác',chucVu:'Giảng viên',linhVuc:'Công nghệ thông tin'})).status,201);
    assert.ok(!calls.some(c=>c.sql.includes('danh_muc_giang_vien_tvu')&&!c.sql.startsWith('SELECT gv.id')));
  });
  await t.test('reference create requires no client profile and ignores forged fields',async()=>{
    reset();assert.equal((await request('POST','',{maGiangVien:body.maGiangVien,email:body.email,password:body.password,soDienThoai:body.soDienThoai,referenceLecturerId:9,hoTen:123,chucVu:'Forged'})).status,201);
  });
  await t.test('manual rejects invalid names, missing faculty and requested credential cases',async()=>{
    for(const change of [{hoTen:'dhshs'},{hoTen:'123'},{hoTen:'.....'},{hoTen:'abc123'},{hoTen:'abc 123'},{hoTen:'Nguyễn × An'},{khoaDonVi:''},{email:'a@gmail.com'},{email:'a@st.tvu.edu.vn'},{soDienThoai:'012345678'},{password:'1234567'}]){
      reset();assert.equal((await request('POST','',{...body,referenceLecturerId:null,hoTen:'Dương Ngọc Vân Khanh',khoaDonVi:'Khoa khác',...change})).status,400);assert.equal(calls.length,0);
    }
  });
  await t.test('manual duplicate code returns exact 409 message',async()=>{
    reset('duplicate-code');const r=await request('POST','',{...body,referenceLecturerId:null,hoTen:'Nguyễn Văn An',khoaDonVi:'Khoa khác'});assert.equal(r.status,409);assert.equal(r.data.message,'Mã giảng viên đã tồn tại.');
  });
  await t.test('all five endpoints require ADMIN',async()=>{
    for(const [method,path] of [['GET',''],['GET','/12'],['POST',''],['PUT','/12'],['DELETE','/12']]) {
      for(const [role,status] of [[null,401],['SINH_VIEN',403],['GIANG_VIEN',403]]) {
        reset();assert.equal((await request(method,path,undefined,role)).status,status);assert.equal(calls.length,0);
      }
    }
  });
  await t.test('role email and phone rules apply on create and update',async()=>{
    for(const method of ['POST','PUT']) for(const change of [{email:'wrong@gmail.com'},{email:'wrong@st.tvu.edu.vn'},{soDienThoai:'09012345678'},{soDienThoai:'+84901234567'},{soDienThoai:'090-123-4567'}]) {
      reset();const r=await request(method,method==='PUT'?'/12':'',{...body,...change});assert.equal(r.status,400);assert.equal(calls.length,0);
    }
  });
  await t.test('invalid input rejected before SQL',async()=>{
    for(const data of [{...body,email:'bad'}, {...body,maGiangVien:''}, {...body,password:'short'}, {...body,password:'\u00e1'.repeat(37)}, {...body,referenceLecturerId:null,hocVi:'x'.repeat(101)}, {...body,referenceLecturerId:null,boMon:123}]){
      reset();assert.equal((await request('POST','',data)).status,400);assert.equal(calls.length,0);
    }
    reset();assert.equal((await request('GET','/not-an-id')).status,400);
    assert.equal((await request('GET','?page=0')).status,400);
  });
  await t.test('missing detail returns 404',async()=>{reset('missing');assert.equal((await request('GET','/12')).status,404);});
  await t.test('create hashes password and commits both records',async()=>{reset();assert.equal((await request('POST','',body)).status,201);assert.equal(calls[0].sql,'BEGIN');assert.equal(calls.at(-1).sql,'COMMIT');assert.equal(released,true);});
  for(const duplicate of ['duplicate-email','duplicate-code']) await t.test(duplicate,async()=>{reset(duplicate);assert.equal((await request('POST','',body)).status,409);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.ok(!calls.some(x=>x.sql.startsWith('INSERT')));});
  await t.test('profile failure rolls back account insert',async()=>{reset('insert-error');assert.equal((await request('POST','',body)).status,500);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(released,true);});
  await t.test('edit updates both tables without changing password or role',async()=>{reset();const data={...body,dangHoatDong:false};delete data.password;assert.equal((await request('PUT','/12',data)).status,200);assert.equal(calls.filter(x=>x.sql.startsWith('UPDATE')).length,2);assert.equal(calls.at(-1).sql,'COMMIT');});
  for(const related of ['assigned','evaluated']) await t.test(related+' lecturer cannot be deleted',async()=>{reset(related);assert.equal((await request('DELETE','/12')).status,409);assert.ok(!calls.some(x=>x.sql.startsWith('DELETE')));assert.equal(calls.at(-1).sql,'ROLLBACK');});
  await t.test('delete removes profile before account',async()=>{reset();assert.equal((await request('DELETE','/12')).status,200);const deletes=calls.filter(x=>x.sql.startsWith('DELETE'));assert.match(deletes[0].sql,/DELETE FROM giang_vien/);assert.match(deletes[1].sql,/DELETE FROM nguoi_dung/);assert.equal(calls.at(-1).sql,'COMMIT');});
});
