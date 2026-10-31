// Explicit opt-in integration audit. Every database mutation is rolled back.
require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
const pool=require('../src/config/database'),support=require('./demo-support'),files=require('../src/services/reportFiles');
async function verify(){
 const c=await pool.connect();let server;const uploads=[];let checks=0;
 try{
  await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(74120301)');
  const m=await support.readManifest();assert.equal(m?.workflowVersion,1);await support.verifyRoots(c,m);
  const ids=table=>m.records.filter(r=>r.table===table).map(r=>r.id);
  const registrations=(await c.query('SELECT * FROM dang_ky_thuc_tap WHERE id=ANY($1::bigint[]) ORDER BY id',[ids('dang_ky_thuc_tap')])).rows;
  const r=registrations.find(x=>x.trang_thai==='CHO_DUYET');assert.ok(r);
  const student=(await c.query('SELECT sv.*,nd.email FROM sinh_vien sv JOIN nguoi_dung nd ON nd.id=sv.nguoi_dung_id WHERE sv.id=$1',[r.sinh_vien_id])).rows[0];
  const teacher=(await c.query('SELECT gv.*,nd.email FROM giang_vien gv JOIN nguoi_dung nd ON nd.id=gv.nguoi_dung_id WHERE gv.id=$1',[ids('giang_vien')[19]])).rows[0];
  const admin=(await c.query("SELECT id,email FROM nguoi_dung WHERE vai_tro='ADMIN' AND dang_hoat_dong LIMIT 1")).rows[0];assert.ok(admin);
  const adapter={async query(sql,params){if(sql==='BEGIN')return c.query('SAVEPOINT api_request');if(sql==='COMMIT')return c.query('RELEASE SAVEPOINT api_request');if(sql==='ROLLBACK'){await c.query('ROLLBACK TO SAVEPOINT api_request');return c.query('RELEASE SAVEPOINT api_request');}return c.query(sql,params);},async connect(){return {...adapter,release(){}};}};
  require.cache[require.resolve('../src/config/database')].exports=adapter;
  const app=express();app.use(express.json());app.use('/api/auth',require('../src/routes/authRoutes'));app.use('/api/student',require('../src/routes/studentRoutes'));app.use('/api/admin',require('../src/routes/adminRoutes'));app.use('/api/lecturer',require('../src/routes/lecturerRoutes'));
  await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});const base=`http://127.0.0.1:${server.address().port}/api`;
  async function request(method,url,token,body,status=200){const headers={};if(token)headers.Authorization='Bearer '+token;const multipart=body instanceof FormData;if(body&&!multipart)headers['Content-Type']='application/json';const response=await fetch(base+url,{method,headers,...(body?{body:multipart?body:JSON.stringify(body)}:{})});const data=await response.json();assert.equal(response.status,status,`${method} ${url}: ${data.message||''}`);checks++;return data;}
  const studentToken=(await request('POST','/auth/login',null,{email:student.email,password:student.ma_sinh_vien})).token;
  const teacherToken=(await request('POST','/auth/login',null,{email:teacher.email,password:'12345678'})).token;
  // Admin identity comes from DB; signed only in this local audit, never bypasses middleware.
  const adminToken=jwt.sign({...admin,vaiTro:'ADMIN'},process.env.JWT_SECRET,{expiresIn:'5m'});
  const input={dotThucTapId:r.dot_thuc_tap_id,doanhNghiepId:r.doanh_nghiep_id,canBoHuongDanId:r.can_bo_huong_dan_id,viTriThucTap:r.vi_tri_thuc_tap};
  await request('POST','/student/internship-registration',studentToken,input,409);
  await c.query('DELETE FROM dang_ky_thuc_tap WHERE id=$1',[r.id]);
  const reg=(await request('POST','/student/internship-registration',studentToken,input,201)).data.id;
  await request('POST','/student/internship-registration',studentToken,input,409);
  await request('PUT',`/admin/registrations/${reg}/approve`,adminToken,{});
  await request('POST',`/admin/assignments/${reg}`,adminToken,{giangVienId:teacher.id},201);
  await request('POST',`/admin/assignments/${reg}`,adminToken,{giangVienId:teacher.id},409);
  const options=await request('GET',`/admin/assignments?periodId=${r.dot_thuc_tap_id}`,adminToken);assert.equal(options.lecturers.find(x=>x.id===teacher.id).assignedCount,1);
  await request('PUT','/student/profile',studentToken,{so_dien_thoai:'0901234567',ngay_sinh:'2004-02-29',gioi_tinh:'NU'});
  const ws=await request('GET','/student/workspace',studentToken);assert.equal(ws.data.student.gioiTinh,'NU');
  await request('PUT','/student/profile',studentToken,{so_dien_thoai:'0901234567',ngay_sinh:'2004-02-29',gioi_tinh:'NU',email:'forbidden@st.tvu.edu.vn'},400);
  // Simulate time advancing only in this rolled-back fixture, not in production schedules.
  await c.query("UPDATE dang_ky_thuc_tap SET ngay_bat_dau=CURRENT_DATE-14,ngay_ket_thuc=CURRENT_DATE+14 WHERE id=$1",[reg]);
  const progress=(await request('POST','/student/progress',studentToken,{soTuan:1,tieuDe:'Kiểm thử luồng',noiDung:'Kiểm thử tích hợp PostgreSQL có rollback.'},201)).data;
  await request('PUT',`/lecturer/students/${reg}/progress/${progress.id}/comment`,teacherToken,{nhanXet:'Đã kiểm tra tiến độ.'});
  const students=await request('GET','/lecturer/students',teacherToken);assert.ok(students.data.some(x=>x.registrationId===reg));assert.equal(students.data.length,1);
  const form=new FormData();form.set('tenBaoCao','Báo cáo kiểm thử');form.set('file',new Blob([support.pdf()],{type:'application/pdf'}),'audit.pdf');
  const report=(await request('POST','/student/reports',studentToken,form,201)).data;
  uploads.push((await c.query('SELECT duong_dan_file FROM bao_cao_thuc_tap WHERE id=$1',[report.id])).rows[0].duong_dan_file);
  await request('PUT',`/lecturer/reports/${report.id}/approve`,teacherToken,{});
  await request('POST',`/lecturer/evaluations/${reg}`,teacherToken,{diemChuyenMon:8,diemThaiDo:9,diemBaoCao:7,nhanXet:'Hoàn thành kiểm thử.'},201);
  const evaluation=await request('GET','/student/evaluation',studentToken);assert.ok(JSON.stringify(evaluation).includes('diemTong'));
  // Real SQL capacity tests; restore fixture afterwards through the outer rollback.
  const regIds=registrations.filter(x=>x.id!==r.id).map(x=>x.id);regIds.push(reg);
  await c.query('DELETE FROM phan_cong_giang_vien WHERE dang_ky_thuc_tap_id=ANY($1::bigint[])',[regIds]);
  await c.query("UPDATE dang_ky_thuc_tap SET trang_thai='DA_DUYET',dot_thuc_tap_id=$2 WHERE id=ANY($1::bigint[])",[regIds,r.dot_thuc_tap_id]);
  for(const id of regIds.slice(0,9))await c.query('INSERT INTO phan_cong_giang_vien(dang_ky_thuc_tap_id,giang_vien_id) VALUES($1,$2)',[id,teacher.id]);
  await request('POST',`/admin/assignments/${regIds[9]}`,adminToken,{giangVienId:teacher.id},201);
  await request('POST',`/admin/assignments/${regIds[10]}`,adminToken,{giangVienId:teacher.id},409);
  await request('PUT',`/admin/assignments/${regIds[9]}`,adminToken,{giangVienId:teacher.id});
  await c.query('UPDATE dang_ky_thuc_tap SET dot_thuc_tap_id=$2 WHERE id=$1',[regIds[10],registrations.find(x=>x.dot_thuc_tap_id!==r.dot_thuc_tap_id).dot_thuc_tap_id]);
  await request('POST',`/admin/assignments/${regIds[10]}`,adminToken,{giangVienId:teacher.id},201);
  console.log(`PostgreSQL HTTP workflow: ${checks} checks passed; all mutations rolled back.`);
 }finally{await c.query('ROLLBACK');c.release();for(const file of uploads)await files.cleanup(file);if(server){server.close();server.closeAllConnections();}await pool.end();}
}
verify().catch(e=>{console.error('AUDIT FAILED:',e.code||e.message);process.exitCode=1;});
