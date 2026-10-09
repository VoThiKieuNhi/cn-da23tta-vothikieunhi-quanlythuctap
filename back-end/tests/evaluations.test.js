const { test,before,after } = require('node:test');
const assert = require('node:assert/strict'),express = require('express'),jwt = require('jsonwebtoken');
const { evaluationInput,validScore } = require('../src/utils/evaluationRules');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
let server,base,calls=[],evaluation=null,report={id:'5',tenBaoCao:'Test',trangThai:'DA_NOP'},snapshot,failComplete=false;
const reg = { registrationId:'9',giangVienId:'3',trangThai:'DA_DUYET',maSinhVien:'TEST',hoTen:'Test',lop:'Test',nganh:'Test',tenDoanhNghiep:'Test',ngayBatDau:'2026-10-01',ngayKetThuc:'2026-12-06',giangVienHuongDan:'Test lecturer' };
const db = { async connect(){return {...db,release(){}};},async query(sql,p=[]){
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

  calls.push({sql,p});
  if(sql==='BEGIN'){snapshot=structuredClone({evaluation,status:reg.trangThai});return {rows:[]};}
  if(sql==='ROLLBACK'){evaluation=snapshot.evaluation;reg.trangThai=snapshot.status;return {rows:[]};}
  if(sql==='COMMIT'||sql.startsWith('SET LOCAL'))return {rows:[]};
  if(sql.includes('FROM sinh_vien WHERE nguoi_dung_id=$1'))return {rows:[{id:p[0]==='22'?'7':'8',maSinhVien:'TEST',hoTen:'Test',lop:'Test',nganh:'Test'}]};
  if(sql.includes('WHERE dk.sinh_vien_id=$1')){assert.equal(p.length,1);return {rows:p[0]==='7'?[{...reg}]:[]};}
  if(sql.includes('gv.nguoi_dung_id=$1') || sql.includes('WHERE dk.id=$1 FOR UPDATE')){
    if(sql.startsWith('SELECT COUNT'))return {rows:[{tongSinhVien:1,chuaDanhGia:evaluation?0:1,daDanhGia:evaluation?1:0,diemTrungBinh:evaluation?.diemTong??null}]};
    if(sql.includes('FOR UPDATE OF dk')){assert.match(sql,/FOR SHARE OF pc/);return {rows:p[0]==='33'&&p[1]==='9'||p.length===1&&p[0]==='9'?[{...reg}]:[]};}
    assert.match(sql,/LEFT JOIN bao_cao_thuc_tap/);assert.match(sql,/LEFT JOIN danh_gia_thuc_tap/);return {rows:p[0]==='33'||p[0]===null?[{...reg,baoCao:report,evaluation}]:[]};
  }
  if(sql.includes('FROM bao_cao_thuc_tap bc')){assert.equal(p[0],'9');assert.match(sql,/FOR UPDATE OF bc/);return {rows:report?[{...report}]:[]};}
  if(sql.includes('FROM danh_gia_thuc_tap dg')){assert.equal(p[0],'9');return {rows:evaluation?[{...evaluation}]:[]};}
  if(sql.includes('FROM tien_do_thuc_tap')){assert.equal(p[0],'9');return {rows:[{tongSoTuanDaCapNhat:2,soTuanDaNhanXet:1}]};}
  if(sql.startsWith('INSERT INTO danh_gia_thuc_tap')||sql.startsWith('UPDATE danh_gia_thuc_tap')){
    assert.equal(p[0],'9');assert.equal(p[1],'3');assert.match(sql,/CURRENT_TIMESTAMP/);
    if(sql.startsWith('UPDATE'))assert.match(sql,/WHERE dg.dang_ky_thuc_tap_id=\$1/);
    evaluation={id:'1',diemChuyenMon:p[2],diemThaiDo:p[3],diemBaoCao:p[4],diemTong:p[5],nhanXet:p[6],ngayDanhGia:'2026-10-02T03:00:00Z'};return {rows:[{...evaluation}]};
  }
  if(sql.startsWith('UPDATE dang_ky_thuc_tap')){assert.equal(p[0],'9');if(failComplete)throw Object.assign(new Error('private'),{code:'XX000'});reg.trangThai='HOAN_THANH';return {rows:[]};}
  throw Error('Unexpected SQL');
} };
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use(express.json());app.use('/api/student',require('../src/routes/studentRoutes'));app.use('/api/lecturer',require('../src/routes/lecturerRoutes'));app.use('/api/admin',require('../src/routes/adminRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api`;});
after(()=>{server.close();server.closeAllConnections();});
async function request(path,method='GET',body,role='GIANG_VIEN',user='33'){
 const headers={'Content-Type':'application/json'};if(role)headers.Authorization='Bearer '+jwt.sign({id:user,email:'test@tvu.edu.vn',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});
 const r=await fetch(base+path,{method,headers,body:method==='GET'||body===undefined?undefined:JSON.stringify(body)});return {status:r.status,body:await r.json()};
}
const input={diemChuyenMon:8.5,diemThaiDo:9,diemBaoCao:8,nhanXet:'  Hoàn thành tốt  ',diemTong:999,giangVienId:'999',registrationId:'999'};
test('evaluation role, ownership, grading and completion',async t=>{
 await t.test('all lecturer endpoints reject ADMIN/student and unauthenticated users',async()=>{calls=[];for(const [path,method]of [['/lecturer/evaluations','GET'],['/lecturer/evaluations/9','GET'],['/lecturer/evaluations/9','POST'],['/lecturer/evaluations/9','PUT']])for(const [role,status]of [['ADMIN',403],['SINH_VIEN',403],[null,401]])assert.equal((await request(path,method,input,role)).status,status);assert.equal(calls.length,0);});
 await t.test('case 1: missing or unapproved report blocks scoring',async()=>{for(const state of [null,'DA_NOP','CAN_CHINH_SUA']){report=state?{id:'5',trangThai:state}:null;const r=await request('/lecturer/evaluations/9','POST',input);assert.equal(r.status,409);assert.equal(r.body.message,'Chưa thể đánh giá vì báo cáo thực tập chưa được duyệt.');assert.equal(evaluation,null);}report={id:'5',trangThai:'DA_DUYET'};});
 await t.test('case 2: approved report exposes evaluation eligibility and summary',async()=>{const r=await request('/lecturer/evaluations');assert.equal(r.status,200);assert.equal(r.body.data[0].canEvaluate,true);assert.equal(r.body.data[0].trangThaiDanhGia,'CHUA_DANH_GIA');const d=await request('/lecturer/evaluations/9');assert.equal(d.body.canEvaluate,true);assert.deepEqual(d.body.progressSummary,{tongSoTuanDaCapNhat:2,soTuanDaNhanXet:1});});
 await t.test('cases 3/4: reject out-of-range, nonnumeric, missing and excessive precision',async()=>{for(const value of [11,-1,'abc',null,'8.5',8.001,true])for(const key of ['diemChuyenMon','diemThaiDo','diemBaoCao']){const r=await request('/lecturer/evaluations/9','POST',{...input,[key]:value});assert.equal(r.status,400);}assert.equal((await request('/lecturer/evaluations/9','POST',{...input,nhanXet:' '})).status,400);});
 await t.test('case 6: other lecturer cannot view/create/update',async()=>{for(const method of ['GET','POST','PUT'])assert.equal((await request('/lecturer/evaluations/9',method,method==='GET'?undefined:input,'GIANG_VIEN','44')).status,403);});
 await t.test('registration must be approved, and PUT needs existing evaluation',async()=>{reg.trangThai='CHO_DUYET';assert.equal((await request('/lecturer/evaluations/9','POST',input)).status,409);reg.trangThai='DA_DUYET';assert.equal((await request('/lecturer/evaluations/9','PUT',input)).status,404);});
 await t.test('completion failure rolls back evaluation creation',async()=>{failComplete=true;const r=await request('/lecturer/evaluations/9','POST',input);failComplete=false;assert.equal(r.status,500);assert.equal(evaluation,null);assert.equal(reg.trangThai,'DA_DUYET');assert.ok(!JSON.stringify(r.body).includes('private'));});
 await t.test('cases 5/10: server calculates 8.50 and completes in same transaction',async()=>{const r=await request('/lecturer/evaluations/9','POST',input);assert.equal(r.status,201);assert.equal(r.body.data.diemTong,8.5);assert.equal(r.body.data.nhanXet,'Hoàn thành tốt');assert.equal(reg.trangThai,'HOAN_THANH');assert.equal(calls.at(-1).sql,'COMMIT');});
 await t.test('case 7: duplicate POST returns 409',async()=>{const r=await request('/lecturer/evaluations/9','POST',input);assert.equal(r.status,409);assert.equal(r.body.message,'Sinh viên đã được đánh giá.');});
 await t.test('case 8: PUT updates same record and recalculates rounded average',async()=>{const r=await request('/lecturer/evaluations/9','PUT',{...input,diemChuyenMon:9.25,diemThaiDo:8.2,diemBaoCao:8.13});assert.equal(r.status,200);assert.equal(r.body.data.id,'1');assert.equal(r.body.data.diemTong,8.53);});
 await t.test('case 9: student ignores forged IDs and only reads own result',async()=>{const mine=await request('/student/evaluation?sinhVienId=999&registrationId=999','GET',undefined,'SINH_VIEN','22');assert.equal(mine.status,200);assert.equal(mine.body.evaluation.diemTong,8.53);const other=await request('/student/evaluation?sinhVienId=7&registrationId=9','GET',undefined,'SINH_VIEN','23');assert.equal(other.body.evaluation,null);assert.equal(other.body.internship,null);assert.equal((await request('/student/evaluation')).status,403);});
 await t.test('admin can read results but has no grading route',async()=>{
   const r=await request('/admin/evaluations','GET',undefined,'ADMIN','1');assert.equal(r.status,200);assert.equal(r.body.data[0].canEvaluate,false);assert.equal(r.body.data[0].evaluation.diemTong,8.53);
   const d=await request('/admin/evaluations/9','GET',undefined,'ADMIN','1');assert.equal(d.status,200);assert.equal(d.body.canEvaluate,false);
   assert.equal((await request('/admin/evaluations')).status,403);
   const token=jwt.sign({id:'1',email:'admin@tvu.edu.vn',vaiTro:'ADMIN'},process.env.JWT_SECRET,{expiresIn:'1m'});
   for(const method of ['POST','PUT'])assert.equal((await fetch(base+'/admin/evaluations/9',{method,headers:{Authorization:'Bearer '+token}})).status,404);
 });
 await t.test('invalid filters/IDs rejected and evaluated status derived',async()=>{assert.equal((await request('/lecturer/evaluations?trangThaiDanhGia=BAD')).status,400);assert.equal((await request('/lecturer/evaluations/abc')).status,400);const r=await request('/lecturer/evaluations?search=Test&trangThaiDanhGia=DA_DANH_GIA');assert.equal(r.status,200);assert.equal(r.body.data[0].trangThaiDanhGia,'DA_DANH_GIA');assert.equal(r.body.stats.daDanhGia,1);});
});
test('score precision and preview agree with server; zero remains a real score',async()=>{
 const ui=await import('../../front-end/src/utils/evaluationScores.js');
 for(const value of [NaN,Infinity,-Infinity,undefined,null,'',false])assert.equal(validScore(value),false);
 for(const scores of [[0,0,0],[10,10,10],[8.5,9,8],[9.25,8.2,8.13],[0.01,0.01,0]]){const body={diemChuyenMon:scores[0],diemThaiDo:scores[1],diemBaoCao:scores[2],nhanXet:'ok'};assert.equal(evaluationInput(body).diemTong,ui.totalScore(body));}
 assert.equal(ui.totalScore({diemChuyenMon:'',diemThaiDo:8,diemBaoCao:9}),null);assert.equal(ui.formatScore(null),'Chưa có kết quả');assert.equal(ui.formatScore(0),'0.00');
});
