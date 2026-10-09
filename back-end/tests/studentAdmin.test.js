const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
let mode, calls, released, server, base;
const profile = { id:'12', maSinhVien:'110123033', hoTen:'Test Student', email:'110123033@st.tvu.edu.vn', dangHoatDong:true };
const body = { ...profile, password:'Test-password-123!', ngaySinh:'2002-01-01', gioiTinh:'NAM',nganh:'Công nghệ thông tin',lop:'DA23TTA',khoaHoc:'2023' };
const db = {
  async query(sql, params = []) {
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

    calls.push({sql, params});
    if (['BEGIN','COMMIT','ROLLBACK'].includes(sql)) return {rows:[]};
    if(sql.includes('FROM nganh_hoc n JOIN lop_hoc l')) return {rows:[{id:'1',tenNganh:body.nganh,maLop:body.lop,khoaHoc:2023}]};
    if(sql.includes('FROM ma_mssv_nganh')) return {rows:[{prefix_mssv:'1101'}]};
    if (sql.includes('FOR UPDATE')) return { rows:mode === 'missing' ? [] : [{nguoi_dung_id:'24'}] };
    if (sql.startsWith('SELECT id FROM nguoi_dung')) return {rows:mode === 'duplicate-email' ? [{id:99}] : []};
    if (sql.startsWith('SELECT id FROM sinh_vien')) return {rows:mode === 'duplicate-code' ? [{id:99}] : []};
    if (sql.startsWith('INSERT INTO nguoi_dung')) {
      assert.equal(params[0],body.email);
      assert.ok(await bcrypt.compare(body.password,params[1]));
      assert.equal(params[2],'SINH_VIEN');assert.equal(params[3],true);
      return {rows:[{id:'24'}]};
    }
    if (sql.startsWith('INSERT INTO sinh_vien')) {
      if (mode === 'insert-error') throw Object.assign(new Error('private'),{code:'23514'});
      assert.equal(params[0],'24');return {rows:[{id:'12'}]};
    }
    if (sql.startsWith('SELECT sv.id')) return {rows:mode === 'missing' ? [] : [profile]};
    if (sql.startsWith('SELECT id FROM dang_ky_thuc_tap')) return {rows:mode === 'related' ? [{id:1}] : []};
    if (sql.startsWith('UPDATE nguoi_dung')) { assert.ok(!sql.includes('mat_khau_hash'));assert.ok(!sql.includes('vai_tro'));return {rows:[]}; }
    if (sql.startsWith('UPDATE sinh_vien') || sql.startsWith('DELETE')) return {rows:[],rowCount:1};
    throw new Error('Unexpected test query');
  },
  async connect() { return {...db,release(){released=true;}}; },
};
const file = require.resolve('../src/config/database');
require.cache[file] = {id:file,filename:file,loaded:true,exports:db};
before(async()=>{
  const app=express();app.use(express.json());app.use('/api/admin',require('../src/routes/adminRoutes'));
  await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});
  base=`http://127.0.0.1:${server.address().port}/api/admin/students`;
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
test('student admin contracts, authorization and transactional safety',async t=>{
  await t.test('all five endpoints require ADMIN',async()=>{
    for(const [method,path] of [['GET',''],['GET','/12'],['POST',''],['PUT','/12'],['DELETE','/12']]) {
      for(const [role,status] of [[null,401],['SINH_VIEN',403],['GIANG_VIEN',403]]) {
        reset();assert.equal((await request(method,path,undefined,role)).status,status);assert.equal(calls.length,0);
      }
    }
  });
  await t.test('role email and phone rules apply on create and update',async()=>{
    for(const method of ['POST','PUT']) for(const change of [{email:'wrong@gmail.com'},{email:'wrong@tvu.edu.vn'},{soDienThoai:'09012345678'},{soDienThoai:'+84901234567'},{soDienThoai:'090-123-4567'}]) {
      reset();const r=await request(method,method==='PUT'?'/12':'',{...body,...change});assert.equal(r.status,400);assert.equal(calls.length,0);
    }
  });
  await t.test('invalid input rejected before SQL',async()=>{
    for(const hoTen of ['dhshs','123','abc123','Nguyễn 123','.....']) { reset();assert.equal((await request('POST','',{...body,hoTen})).status,400);assert.equal(calls.length,0); }
    for(const data of [{...body,email:'bad'}, {...body,maSinhVien:''}, {...body,password:'short'}, {...body,password:'\u00e1'.repeat(37)}, {...body,ngaySinh:'2002-02-30'}, {...body,gioiTinh:'INVALID'}]){
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
  await t.test('registered student cannot be deleted',async()=>{reset('related');assert.equal((await request('DELETE','/12')).status,409);assert.ok(!calls.some(x=>x.sql.startsWith('DELETE')));assert.equal(calls.at(-1).sql,'ROLLBACK');});
  await t.test('delete removes profile before account',async()=>{reset();assert.equal((await request('DELETE','/12')).status,200);const deletes=calls.filter(x=>x.sql.startsWith('DELETE'));assert.match(deletes[0].sql,/DELETE FROM sinh_vien/);assert.match(deletes[1].sql,/DELETE FROM nguoi_dung/);assert.equal(calls.at(-1).sql,'COMMIT');});
});
