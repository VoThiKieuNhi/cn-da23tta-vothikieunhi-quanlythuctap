const {test,before,after}=require('node:test');const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');let mode,calls,server,base,released,capacity=0;
const db={async query(sql,params=[]){
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }
calls.push({sql,params});if(sql.startsWith('SELECT COUNT(*)'))return {rows:[{total:capacity}]};if(['BEGIN','COMMIT','ROLLBACK'].includes(sql))return {rows:[]};if(sql.startsWith('SELECT trang_thai'))return {rows:mode==='missing'?[]:[{dot_thuc_tap_id:'7',trang_thai:mode==='pending'?'CHO_DUYET':mode==='completed'?'HOAN_THANH':'DA_DUYET'}]};if(sql.startsWith('SELECT id FROM phan_cong'))return {rows:mode==='duplicate'?[{id:1}]:[]};if(sql.startsWith('SELECT gv.id'))return {rows:mode==='inactive'?[]:[{id:2}]};if(sql.startsWith('UPDATE phan_cong'))return {rows:[{id:1}]};if(sql.startsWith('INSERT')){if(mode==='failure')throw new Error('private');return {rows:[{id:1}]};}throw new Error('Unexpected query');},async connect(){return {...db,release(){released=true;}};}};
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use(express.json());app.use('/api/admin',require('../src/routes/adminRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api/admin/assignments`;});after(()=>{server.close();server.closeAllConnections();});
async function request(method,path='',role='ADMIN',body){const headers={'Content-Type':'application/json'};if(role)headers.Authorization='Bearer '+jwt.sign({id:1,email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});const r=await fetch(base+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
function reset(value='ok'){mode=value;calls=[];released=false;}
test('assignment access and approved-only workflow',async t=>{
 await t.test('reassignment updates existing record only; missing assignment rejected',async()=>{reset('duplicate');assert.equal((await request('PUT','/1','ADMIN',{giangVienId:2})).status,200);assert.equal(calls.filter(x=>x.sql.startsWith('UPDATE phan_cong')).length,1);assert.ok(!calls.some(x=>x.sql.startsWith('INSERT')));reset();assert.equal((await request('PUT','/1','ADMIN',{giangVienId:2})).status,404);reset('completed');assert.equal((await request('PUT','/1','ADMIN',{giangVienId:2})).status,409);});
 await t.test('both routes require ADMIN',async()=>{for(const [method,path]of [['GET',''],['POST','/1'],['PUT','/1']])for(const [role,status]of [[null,401],['SINH_VIEN',403],['GIANG_VIEN',403]]){reset();assert.equal((await request(method,path,role)).status,status);assert.equal(calls.length,0);}});
 for(const [state,status]of [['missing',404],['pending',409],['completed',409],['duplicate',409],['inactive',400]])await t.test('reject '+state,async()=>{reset(state);assert.equal((await request('POST','/1','ADMIN',{giangVienId:2})).status,status);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(released,true);assert.ok(!calls.some(x=>x.sql.startsWith('INSERT')));});
 await t.test('approved registration assigned without changing registration status',async()=>{reset();assert.equal((await request('POST','/1','ADMIN',{giangVienId:2,ghiChu:"  Note '  ",trangThai:'DANG_THUC_TAP'})).status,201);assert.deepEqual(calls.find(x=>x.sql.startsWith('INSERT')).params,['1','2',"Note '"]);assert.match(calls[1].sql,/FOR UPDATE/);assert.ok(!calls.some(x=>x.sql.startsWith('UPDATE')));assert.equal(calls.at(-1).sql,'COMMIT');});
 await t.test('invalid input rejected',async()=>{reset();assert.equal((await request('POST','/1','ADMIN',{giangVienId:'bad'})).status,400);assert.equal(calls.length,0);});
 await t.test('failure rolls back safely',async()=>{reset('failure');const r=await request('POST','/1','ADMIN',{giangVienId:2});assert.equal(r.status,500);assert.ok(!JSON.stringify(r).includes('private'));assert.equal(calls.at(-1).sql,'ROLLBACK');});
});

test('capacity is scoped to period, excludes current registration and locks before counting',async()=>{
 for(const [count,method,expected] of [[9,'POST',201],[10,'POST',409],[0,'POST',201],[9,'PUT',200],[10,'PUT',409]]){
 reset(method==='PUT'?'duplicate':'ok');capacity=count;
 const result=await request(method,'/1','ADMIN',{giangVienId:2});assert.equal(result.status,expected);
 const index=calls.findIndex(x=>x.sql.startsWith('SELECT COUNT(*)'));
 assert.deepEqual(calls[index].params,['2','7','1']);assert.match(calls[index].sql,/dk.dot_thuc_tap_id=\$2 AND dk.id<>\$3/);
 assert.ok(calls.slice(0,index).some(x=>x.sql.includes('FOR UPDATE OF gv')));
 if(count===10){assert.equal(result.data.message,'Giảng viên đã đạt giới hạn tối đa 10 sinh viên trong đợt thực tập này.');assert.equal(calls.at(-1).sql,'ROLLBACK');}
 }
 capacity=0;
});
