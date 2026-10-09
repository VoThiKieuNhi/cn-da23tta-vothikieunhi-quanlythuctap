require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const bcrypt=require('bcryptjs'),pool=require('../src/config/database'),s=require('./demo-support');
const reference=require('../src/services/referenceService'),files=require('../src/services/reportFiles');
const {passwordError}=require('../src/utils/validators');
const {evaluationInput}=require('../src/utils/evaluationRules');
async function seed(){
 const password=process.env.DEMO_PASSWORD;
 if(typeof password!=='string'||Array.from(password).length<8)throw s.fail('Vui lòng cấu hình DEMO_PASSWORD tối thiểu 8 ký tự.');
 if(passwordError(password))throw s.fail(passwordError(password));
 const c=await pool.connect();let reportFile,manifestWritten=false,commitAttempted=false;
 try{
  await c.query('BEGIN');await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'");await c.query('SELECT pg_advisory_xact_lock(74120301)');
  if(await s.readManifest())throw s.fail('Demo data already exists. Use npm run clear-demo before reseeding.');
  const m=s.newManifest(await s.identity(c));
  const students=['110123101','110123102','110123103'],names=['Nguyễn Minh Anh','Trần Hoàng Nam','Lê Ngọc Mai'];
  const emails=['demo.admin@tvu.edu.vn','demo.gv01@tvu.edu.vn','demo.gv02@tvu.edu.vn',...students.map(x=>x+'@st.tvu.edu.vn')];
  // Never adopt an existing account or overwrite a real row, even if its name looks like demo.
  if((await c.query('SELECT id FROM nguoi_dung WHERE lower(email)=ANY($1::text[])', [emails])).rows.length)throw s.fail('Email demo đã tồn tại ngoài manifest. Không tạo hoặc thay đổi tài khoản hiện có.');
  if((await c.query('SELECT id FROM sinh_vien WHERE ma_sinh_vien=ANY($1::text[])',[students])).rows.length)throw s.fail('MSSV demo đã tồn tại. Không ghi đè hồ sơ.');
  if((await c.query('SELECT id FROM giang_vien WHERE ma_giang_vien=ANY($1::text[])',[['DEMO-GV01','DEMO-GV02']])).rows.length)throw s.fail('Mã giảng viên demo đã tồn tại.');
  if((await c.query("SELECT id FROM dot_thuc_tap WHERE hoc_ky=$1 AND replace(nam_hoc,' ','')=$2",['Học kỳ 1','2026-2027'])).rows.length)throw s.fail('Học kỳ 1 năm học 2026-2027 đã tồn tại. Không dùng lại hoặc sửa đợt hiện có; hãy dùng database demo riêng.');
  if((await c.query('SELECT id FROM doanh_nghiep WHERE lower(email)=ANY($1::text[]) OR ten_doanh_nghiep=ANY($2::text[])',[['contact.demoa@example.com','contact.demob@example.com'],['Công ty Công nghệ Demo A','Công ty Giải pháp Phần mềm Demo B']])).rows.length)throw s.fail('Doanh nghiệp demo đã tồn tại ngoài manifest.');
  const major=(await c.query("SELECT n.id,n.ten_nganh FROM nganh_hoc n JOIN ma_mssv_nganh m ON m.nganh_id=n.id WHERE n.ma_nganh=$1 AND n.dang_hoat_dong AND m.khoa_nhap_hoc=2023 AND m.prefix_mssv='1101' AND m.xac_minh FOR SHARE OF n,m",['7480201'])).rows[0];
  if(!major)throw s.fail('Thiếu ngành CNTT/prefix 1101 khóa 2023 đã xác minh. Chạy seed TVU reference trước.');
  const classes=(await c.query('SELECT ma_lop FROM lop_hoc WHERE nganh_id=$1 AND khoa_nhap_hoc=2023 AND dang_hoat_dong ORDER BY ma_lop FOR SHARE',[major.id])).rows;
  if(!classes.length)throw s.fail('Chưa có lớp CNTT khóa 2023 trong danh mục.');
  const hash=await bcrypt.hash(password,12),add=(table,data)=>s.insert(c,m,table,data);
  const account=(email,role)=>add('nguoi_dung',{email,mat_khau_hash:hash,vai_tro:role,dang_hoat_dong:true});
  await account(emails[0],'ADMIN');
  const teachers=[];
  for(let i=0;i<2;i++)teachers.push(await add('giang_vien',{nguoi_dung_id:await account(emails[i+1],'GIANG_VIEN'),ma_giang_vien:`DEMO-GV0${i+1}`,ho_ten:['Nguyễn Minh Khoa','Trần Thanh Hương'][i],bo_mon:'Đơn vị phục vụ demo',hoc_vi:'Thạc sĩ',danh_muc_giang_vien_id:null,chuc_vu:'Giảng viên demo',linh_vuc:'Công nghệ thông tin'}));
  const studentIds=[];
  for(let i=0;i<3;i++){const input={maSinhVien:students[i],email:emails[i+3],nganh:major.ten_nganh,lop:classes[i%classes.length].ma_lop,khoaHoc:'2023'};await reference.validateStudent(c,input);studentIds.push(await add('sinh_vien',{nguoi_dung_id:await account(input.email,'SINH_VIEN'),ma_sinh_vien:input.maSinhVien,ho_ten:names[i],lop:input.lop,nganh:input.nganh,khoa_hoc:input.khoaHoc}));}
  const companies=[],supervisors=[];
  for(let i=0;i<2;i++){companies.push(await add('doanh_nghiep',{ten_doanh_nghiep:['Công ty Công nghệ Demo A','Công ty Giải pháp Phần mềm Demo B'][i],dia_chi:'Dữ liệu phục vụ demo',email:['contact.demoA@example.com','contact.demoB@example.com'][i],so_dien_thoai:`090000000${i+1}`,linh_vuc_hoat_dong:'Phần mềm – dữ liệu demo'}));supervisors.push(await add('can_bo_huong_dan',{doanh_nghiep_id:companies[i],ho_ten:['Nguyễn Văn Hòa','Trần Minh Long'][i],email:`huongdan${i+1}@example.com`,so_dien_thoai:`090000000${i+3}`,chuc_vu:'Hướng dẫn thực tập demo'}));}
  const dates=(await c.query("SELECT NOW()-interval '20 days' AS opening,NOW()-interval '10 days' AS closing,(CURRENT_DATE-5)::text AS start,(CURRENT_DATE+30)::text AS finish,CURRENT_DATE::text AS today")).rows[0];
  const period=await add('dot_thuc_tap',{hoc_ky:'Học kỳ 1',nam_hoc:'2026-2027',ngay_bat_dau_dang_ky:dates.opening,ngay_ket_thuc_dang_ky:dates.closing,ngay_bat_dau_thuc_tap:dates.start,ngay_ket_thuc_thuc_tap:dates.finish,trang_thai:'DANG_THUC_TAP'});
  const registrations=[];
  for(let i=0;i<3;i++){const r=await add('dang_ky_thuc_tap',{sinh_vien_id:studentIds[i],dot_thuc_tap_id:period,doanh_nghiep_id:companies[i%2],can_bo_huong_dan_id:supervisors[i%2],vi_tri_thuc_tap:'Thực tập phần mềm – Demo',ngay_bat_dau:dates.start,ngay_ket_thuc:dates.finish,trang_thai:['DANG_THUC_TAP','HOAN_THANH','CHO_DUYET'][i]});registrations.push(r);if(i<2){await add('phan_cong_giang_vien',{dang_ky_thuc_tap_id:r,giang_vien_id:teachers[0],ghi_chu:'Phân công phục vụ demo'});for(let week=1;week<=i+1;week++)await add('tien_do_thuc_tap',{dang_ky_thuc_tap_id:r,so_tuan:week,tieu_de:week===1?'Làm quen môi trường thực tập':'Tổng hợp công việc demo',noi_dung:'Tìm hiểu quy trình làm việc, công cụ và nhiệm vụ được phân công.',ngay_bao_cao:dates.today,nhan_xet_giang_vien:'Sinh viên thực hiện đúng yêu cầu tuần đầu.'});}}
  reportFile=await files.save({originalname:'bao-cao-demo.pdf',mimetype:'application/pdf',buffer:s.pdf()},registrations[1]);m.files.push(reportFile.stored);
  await add('bao_cao_thuc_tap',{dang_ky_thuc_tap_id:registrations[1],ten_bao_cao:'BÁO CÁO THỰC TẬP - DỮ LIỆU DEMO',ten_file:reportFile.name,duong_dan_file:reportFile.stored,trang_thai:'DA_DUYET',nhan_xet_giang_vien:'Báo cáo phục vụ demo đã được duyệt.'});
  const score=evaluationInput({diemChuyenMon:8.5,diemThaiDo:9,diemBaoCao:8,nhanXet:'Kết quả minh họa phục vụ demo.'});
  await add('danh_gia_thuc_tap',{dang_ky_thuc_tap_id:registrations[1],giang_vien_id:teachers[0],diem_chuyen_mon:score.diemChuyenMon,diem_thai_do:score.diemThaiDo,diem_bao_cao:score.diemBaoCao,diem_tong:score.diemTong,nhan_xet:score.nhanXet});
  await s.writeManifest(m);manifestWritten=true;commitAttempted=true;await c.query('COMMIT');
  console.log('Đã tạo bộ demo: 1 Admin, 3 sinh viên, 2 giảng viên, 2 doanh nghiệp, 2 cán bộ, 1 đợt và 3 đăng ký. Giữ file .demo/manifest.json để clear an toàn.');
 }catch(e){await c.query('ROLLBACK').catch(()=>{});if(!commitAttempted){if(reportFile)await files.cleanup(reportFile.stored);if(manifestWritten)await s.fs.unlink(s.manifestPath);}throw e;}finally{c.release();}
}
if(require.main===module)seed().catch(s.safeError).finally(()=>pool.end());
module.exports=seed;
