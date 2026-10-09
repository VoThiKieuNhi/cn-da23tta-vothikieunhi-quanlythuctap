const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
let calls=[], mode, server, base, released;
const db = {
  async query(sql,params=[]) {
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

    calls.push({sql,params});
    if(['BEGIN','COMMIT','ROLLBACK'].includes(sql)) return {rows:[]};
    if(sql.startsWith('SELECT id FROM doanh_nghiep')) return {rows:mode==='missing'?[]:[{id:'1'}]};
    if(sql.startsWith('SELECT id FROM can_bo_huong_dan')) return {rows:mode==='wrong-parent'?[]:[{id:'2'}]};
    if(sql.includes('FROM dang_ky_thuc_tap')) return {rows:mode==='used'?[{id:'3'}]:[]};
    if(sql.startsWith('UPDATE can_bo_huong_dan')) {
      assert.match(sql,/WHERE id=\$5 AND doanh_nghiep_id=\$6/);
      assert.deepEqual(params.slice(-2),['2','1']);
      return {rows:mode==='wrong-parent'?[]:[{id:'2'}]};
    }
    if(sql.startsWith('INSERT') || sql.startsWith('UPDATE doanh_nghiep')) return {rows:[{id:'1'}]};
    if(sql.startsWith('DELETE')) {
      if(mode==='delete-failure' && sql.startsWith('DELETE FROM doanh_nghiep')) throw Object.assign(new Error('private'),{code:'23503'});
      return {rows:[],rowCount:1};
    }
    throw new Error('Unexpected test query');
  },
  async connect(){return {...db,release(){released=true;}};},
};
const file=require.resolve('../src/config/database');
require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use(express.json());app.use('/api/admin',require('../src/routes/adminRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api/admin/companies`;});
after(()=>{server.close();server.closeAllConnections();});
function reset(value='ok'){mode=value;calls=[];released=false;}
async function request(method,path='',data,role='ADMIN') {
  const headers={'Content-Type':'application/json'};
  if(role) headers.Authorization=`Bearer ${jwt.sign({id:1,email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'})}`;
  const r=await fetch(base+path,{method,headers,...(data?{body:JSON.stringify(data)}:{})});
  return {status:r.status,body:await r.json()};
}
test('company authorization and data integrity',async t=>{
  await t.test('all nine endpoints require ADMIN',async()=>{
    for(const [method,path] of [['GET',''],['POST',''],['GET','/1'],['PUT','/1'],['DELETE','/1'],['GET','/1/supervisors'],['POST','/1/supervisors'],['PUT','/1/supervisors/2'],['DELETE','/1/supervisors/2']])
      for(const [role,status] of [[null,401],['SINH_VIEN',403],['GIANG_VIEN',403]]) {reset();assert.equal((await request(method,path,undefined,role)).status,status);assert.equal(calls.length,0);}
  });
  await t.test('validation runs before SQL',async()=>{
    for(const body of [{},{tenDoanhNghiep:'X',diaChi:'Y',email:'invalid'},{tenDoanhNghiep:'X',diaChi:'Y',soDienThoai:'abc'}]) {reset();assert.equal((await request('POST','',body)).status,400);assert.equal(calls.length,0);}
    reset();assert.equal((await request('GET','?page=0')).status,400);assert.equal(calls.length,0);
  });
  await t.test('company creation binds untrusted text',async()=>{
    reset();const name="O'Reilly $1";assert.equal((await request('POST','',{tenDoanhNghiep:name,diaChi:'Address'})).status,201);assert.equal(calls[0].params[0],name);assert.ok(!calls[0].sql.includes(name));
  });
  await t.test('missing company prevents supervisor creation',async()=>{reset('missing');assert.equal((await request('POST','/1/supervisors',{hoTen:'Test'})).status,404);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.ok(!calls.some(c=>c.sql.startsWith('INSERT')));});
  for(const method of ['PUT','DELETE']) await t.test(method+' cannot access another company supervisor',async()=>{reset('wrong-parent');assert.equal((await request(method,'/1/supervisors/2',{hoTen:'Test'})).status,404);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.ok(!calls.some(c=>c.sql.startsWith('DELETE')));});
  await t.test('supervisor creation commits and releases connection',async()=>{reset();assert.equal((await request('POST','/1/supervisors',{hoTen:'Test'})).status,201);assert.equal(calls.at(-1).sql,'COMMIT');assert.equal(released,true);assert.equal(calls.find(c=>c.sql.startsWith('INSERT')).params.at(-1),'1');});
  await t.test('company deletion checks direct and indirect registration references',async()=>{reset('used');assert.equal((await request('DELETE','/1')).status,409);const check=calls.find(c=>c.sql.includes('FROM dang_ky_thuc_tap'));assert.match(check.sql,/dk.doanh_nghiep_id=\$1/);assert.match(check.sql,/OR dk.can_bo_huong_dan_id IN/);assert.ok(!calls.some(c=>c.sql.startsWith('DELETE')));assert.equal(calls.at(-1).sql,'ROLLBACK');});
  await t.test('used supervisor cannot be deleted',async()=>{reset('used');assert.equal((await request('DELETE','/1/supervisors/2')).status,409);assert.ok(!calls.some(c=>c.sql.startsWith('DELETE')));});
  await t.test('unused company deletes children before parent',async()=>{reset();assert.equal((await request('DELETE','/1')).status,200);const deletes=calls.filter(c=>c.sql.startsWith('DELETE'));assert.match(deletes[0].sql,/can_bo_huong_dan/);assert.match(deletes[1].sql,/doanh_nghiep WHERE/);assert.equal(calls.at(-1).sql,'COMMIT');assert.equal(released,true);});
  await t.test('parent failure rolls back child deletion',async()=>{reset('delete-failure');assert.equal((await request('DELETE','/1')).status,409);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(released,true);});
  await t.test('unused supervisor deletes only within its company',async()=>{reset();assert.equal((await request('DELETE','/1/supervisors/2')).status,200);const deletion=calls.find(c=>c.sql.startsWith('DELETE'));assert.deepEqual(deletion.params,['2','1']);assert.match(deletion.sql,/AND doanh_nghiep_id=\$2/);});
});
