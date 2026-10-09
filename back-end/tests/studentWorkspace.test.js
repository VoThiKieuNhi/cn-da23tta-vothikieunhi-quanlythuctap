const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
let mode,calls,server,base;
const db={async query(sql,params){
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }
calls.push({sql,params});
 if(sql.includes('FROM sinh_vien WHERE')){assert.deepEqual(params,['22']);return {rows:mode==='no-profile'?[]:[{id:'7',hoTen:'Test',maSinhVien:'SV'}]};}
 if(sql.includes('FROM dang_ky_thuc_tap dk')){assert.deepEqual(params,['7']);assert.match(sql,/WHERE dk.sinh_vien_id=\$1/);return {rows:mode==='empty'?[]:[{id:'9',trangThai:'DA_DUYET'}]};}
 assert.deepEqual(params,['9']);assert.match(sql,/WHERE (?:pc\.|dg\.)?dang_ky_thuc_tap_id=\$1/);
 if(mode==='failure')throw new Error('private');
 return {rows:[]};
}};
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use('/api/student',require('../src/routes/studentRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api/student/workspace`;});
after(()=>{server.close();server.closeAllConnections();});
async function request(role='SINH_VIEN'){const headers={};if(role)headers.Authorization='Bearer '+jwt.sign({id:'22',email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});const response=await fetch(base+'?sinhVienId=999&registrationId=999',{headers});return {status:response.status,body:await response.json()};}
test('workspace scopes all data to authenticated student',async t=>{
 await t.test('JWT and role required',async()=>{for(const [role,status]of [[null,401],['ADMIN',403],['GIANG_VIEN',403]]){calls=[];assert.equal((await request(role)).status,status);assert.equal(calls.length,0);}});
 await t.test('missing profile returns 403',async()=>{mode='no-profile';calls=[];assert.equal((await request()).status,403);assert.equal(calls.length,1);});
 await t.test('no registration returns empty data without querying other students',async()=>{mode='empty';calls=[];const result=await request();assert.equal(result.status,200);assert.equal(result.body.data.registration,null);for(const key of ['lecturers','progress','reports','evaluations'])assert.deepEqual(result.body.data[key],[]);assert.equal(calls.length,2);});
 await t.test('client IDs ignored and all related queries scoped',async()=>{mode='ok';calls=[];const result=await request();assert.equal(result.status,200);assert.equal(result.body.data.student.id,'7');assert.equal(result.body.data.registration.id,'9');assert.equal(calls.length,6);assert.ok(calls.every(x=>!x.sql.includes('SELECT *')));assert.ok(!calls.some(x=>x.sql.includes('duong_dan_file')));});
 await t.test('failure returns no private details',async()=>{mode='failure';calls=[];const result=await request();assert.equal(result.status,500);assert.ok(!JSON.stringify(result.body).includes('private'));});
});
