// Read-only integration checks against the configured database. Never creates business data.
require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken'),ExcelJS=require('exceljs');
const pool=require('../src/config/database'),service=require('../src/services/adminReportService');
async function run(){
 const app=express();app.use('/api/admin/reports',require('../src/routes/adminReportRoutes'));
 const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 const base=`http://127.0.0.1:${server.address().port}/api/admin/reports`;
 const accounts=(await pool.query('SELECT DISTINCT ON (vai_tro) id,email,vai_tro FROM nguoi_dung WHERE dang_hoat_dong ORDER BY vai_tro,id')).rows;
 const headers=role=>role?{Authorization:'Bearer '+jwt.sign({id:accounts.find(a=>a.vai_tro===role)?.id||'9223372036854775807',email:'check@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'5m'})}:{};
 async function request(path,q={},role='ADMIN'){return fetch(base+path+'?'+new URLSearchParams(q),{headers:headers(role)});}
 async function json(path,q){const r=await request(path,q);assert.equal(r.status,200,path);return r.json();}
 try{
  for(const path of ['/options','/summary','/overview','/by-major','/by-company','/by-lecturer','/registration-status','/report-status','/evaluation','/students','/export'])for(const [role,status] of [[null,401],['SINH_VIEN',403],['GIANG_VIEN',403]])assert.equal((await request(path,{},role)).status,role&&!accounts.some(a=>a.vai_tro===role)?401:status);
  const options=(await json('/options')).data;
  const filters=[{}, {dotThucTapId:'9223372036854775807'}];
  if(options.periods[0])filters.push({dotThucTapId:String(options.periods[0].id),hocKy:options.periods[0].hocKy,namHoc:options.periods[0].namHoc});
  const major=options.majors.find(n=>n.tenNganh==='Công nghệ thông tin');if(major)filters.push({nganhId:String(major.id)});
  for(const q of filters){
   const summary=(await json('/summary',q)).data,rows=await service.query(pool,'students',q,true),students=await json('/students',q);
   assert.equal(summary.overview.tongSinhVien,new Set(rows.map(r=>r.studentId)).size);
   assert.equal(students.pagination.total,rows.length);
   if(q.dotThucTapId)assert.ok(rows.every(r=>String(r.dotThucTapId)===q.dotThucTapId));
   if(q.nganhId)assert.ok(rows.every(r=>String(r.nganhId)===q.nganhId));
   for(const type of ['overview','by-major','by-company','by-lecturer','registration-status','report-status','evaluation'])assert.deepEqual((await json('/'+type,q)).data,summary[type]);
   if(!rows.some(r=>r.evaluationId)){assert.equal(summary.evaluation.diemTrungBinh,null);assert.equal(summary.overview.diemTrungBinh,null);}
   const response=await request('/export',q);assert.equal(response.status,200);const book=new ExcelJS.Workbook();await book.xlsx.load(Buffer.from(await response.arrayBuffer()));assert.equal(book.worksheets.length,5);
   const sheet=book.worksheets[1];assert.equal(sheet.rowCount,rows.length+1);rows.forEach((r,i)=>{assert.equal(sheet.getCell(i+2,2).value,r.maSinhVien);assert.equal(sheet.getCell(i+2,10).value,r.giangVienHuongDan||'Chưa phân công');assert.equal(sheet.getCell(i+2,18).value,r.diemTong);});
   assert.equal(book.worksheets[0].getCell(2,2).value,summary.overview.tongSinhVien);
  }
  const raw=(await pool.query('SELECT COUNT(DISTINCT sinh_vien_id)::int AS total FROM dang_ky_thuc_tap')).rows[0].total;
  assert.equal((await json('/overview')).data.tongSinhVien,raw);
  const sample=(await service.query(pool,'students',{},true))[0];if(sample){const q={search:sample.maSinhVien};const filtered=(await json('/students',q)).data;assert.ok(filtered.some(r=>r.maSinhVien===sample.maSinhVien));}
  for(const q of [{page:'0'},{limit:'101'},{nganhId:'1 OR 1=1'},{trangThai:'UNKNOWN'}])assert.equal((await request('/students',q)).status,400);
  console.log('PASS: ADMIN-only endpoints, shared filters, distinct counts, null scores, search, pagination, five Excel sheets and filtered export. No database writes.');
 }finally{server.close();server.closeAllConnections();await pool.end();}
}
run().catch(e=>{console.error('REPORT CHECK FAILED:',e.code||e.message);process.exitCode=1;});
