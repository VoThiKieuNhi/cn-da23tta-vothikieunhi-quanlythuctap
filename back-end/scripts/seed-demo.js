require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const bcrypt=require('bcryptjs'),pool=require('../src/config/database'),s=require('./demo-support');
const reference=require('../src/services/referenceService');
const eligibility=require('../src/services/registrationEligibility');
const {tinhTrangThaiDotThucTap}=require('../src/utils/periodStatus');
const names=['Nguyễn Minh Anh','Trần Hoàng Nam','Lê Ngọc Mai','Phạm Thanh Bình','Võ Minh Châu','Đặng Hải Đăng','Bùi Thu Hà','Đỗ Gia Huy','Hồ Ngọc Lan','Dương Tuấn Kiệt','Nguyễn Thảo Linh','Trần Đức Long','Lê Hoàng Minh','Phạm Bảo Ngọc','Võ Quỳnh Như','Đặng Minh Phúc','Bùi Anh Quân','Đỗ Thanh Tâm','Hồ Phương Thảo','Dương Quốc Việt'];
async function seed(){
 const c=await pool.connect();let manifestWritten=false,commitAttempted=false;
 try{
  await c.query('BEGIN');await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'");await c.query('SELECT pg_advisory_xact_lock(74120301)');
  const existing=await s.readManifest();
  if(existing){
   if(existing.profile!=='multi-major-20-v2'||JSON.stringify(existing.database)!==JSON.stringify(await s.identity(c)))throw s.fail('Manifest demo khác phiên bản/database. Không tự xóa hay ghi đè bộ demo hiện có.');
   await s.verifyRoots(c,existing);
   if(existing.records.filter(r=>r.table==='sinh_vien').length!==20||existing.records.filter(r=>r.table==='giang_vien').length!==20)throw s.fail('Manifest không đủ 20 sinh viên/20 giảng viên. Cần đối chiếu trước khi seed.');
   await c.query('COMMIT');console.log('Bộ demo 20 sinh viên và 20 giảng viên đã tồn tại; không tạo trùng hoặc đổi mật khẩu.');return;
  }
  const m=s.newManifest(await s.identity(c));m.profile='multi-major-20-v2';
  // Spread across reference majors before revisiting a major.
  const candidates=(await c.query(`SELECT n.id AS major_id,n.ten_nganh,l.ma_lop,l.khoa_nhap_hoc,m.prefix_mssv,
   row_number() OVER(PARTITION BY n.id ORDER BY l.khoa_nhap_hoc,l.ma_lop,m.prefix_mssv) AS choice
   FROM nganh_hoc n JOIN lop_hoc l ON l.nganh_id=n.id AND l.dang_hoat_dong
   JOIN ma_mssv_nganh m ON m.nganh_id=n.id AND m.khoa_nhap_hoc=l.khoa_nhap_hoc AND m.xac_minh
   WHERE n.dang_hoat_dong AND m.prefix_mssv ~ '^[0-9]{4}$'
   ORDER BY choice,md5(n.id::text),l.ma_lop`)).rows;
  if(!candidates.length)throw s.fail('Không có ngành/lớp/prefix đã xác minh để tạo sinh viên demo.');
  const refs=(await c.query(`SELECT id,ho_ten,khoa_don_vi,hoc_vi,chuc_vu,linh_vuc,
   row_number() OVER(PARTITION BY khoa_don_vi ORDER BY id) AS choice
   FROM danh_muc_giang_vien_tvu WHERE dang_hoat_dong ORDER BY choice,khoa_don_vi,id LIMIT 20`)).rows;
  if(refs.length!==20)throw s.fail('Cần ít nhất 20 giảng viên tham chiếu đang hoạt động.');
  const occupied=new Set((await c.query(`SELECT ma_sinh_vien AS code FROM sinh_vien UNION SELECT split_part(lower(email),'@',1) AS code FROM nguoi_dung WHERE lower(email) LIKE '%@st.tvu.edu.vn'`)).rows.map(r=>r.code));
  const students=[];
  for(let i=0;i<20;i++){
   const candidate=candidates[i%candidates.length],prefix=candidate.prefix_mssv+String(candidate.khoa_nhap_hoc).slice(-2);
   let code;for(let serial=101;serial<=999;serial++){const next=prefix+String(serial).padStart(3,'0');if(!occupied.has(next)){code=next;break;}}
   if(!code)throw s.fail('Không còn MSSV demo phù hợp trong prefix reference đã chọn.');occupied.add(code);
   const input={maSinhVien:code,email:code+'@st.tvu.edu.vn',nganh:candidate.ten_nganh,lop:candidate.ma_lop,khoaHoc:String(candidate.khoa_nhap_hoc)};
   await reference.validateStudent(c,input);students.push({...input,hoTen:names[i]});
  }
  const teacherCodes=refs.map((_,i)=>'DEMO-GV'+String(i+1).padStart(2,'0'));
  const teacherEmails=refs.map((_,i)=>'demo.gv'+String(i+1).padStart(2,'0')+'@tvu.edu.vn');
  const emails=[...students.map(x=>x.email),...teacherEmails];
  if((await c.query('SELECT id FROM nguoi_dung WHERE lower(email)=ANY($1::text[])',[emails])).rows.length)throw s.fail('Email demo đã tồn tại ngoài manifest. Không ghi đè tài khoản.');
  if((await c.query('SELECT id FROM giang_vien WHERE ma_giang_vien=ANY($1::text[])',[teacherCodes])).rows.length)throw s.fail('Mã giảng viên demo đã tồn tại ngoài manifest.');
  const companyEmails=['contact.demoa@example.com','contact.demob@example.com'];
  if((await c.query('SELECT id FROM doanh_nghiep WHERE lower(email)=ANY($1::text[])',[companyEmails])).rows.length)throw s.fail('Doanh nghiệp demo đã tồn tại ngoài manifest.');
  const calendar=(await c.query('SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int AS year,NOW() AS now')).rows[0];
  let year=calendar.year,term;
  for(let attempt=0;attempt<10;attempt++,year++){
   term=(await c.query("SELECT id FROM dot_thuc_tap WHERE lower(hoc_ky)=lower($1) AND replace(nam_hoc,' ','')=$2",['Học kỳ 1',year+'-'+(year+1)])).rows;
   if(!term.length&&new Date(year+'-10-01T00:00:00+07:00')>new Date(new Date(calendar.now).getTime()+10*86400000))break;
  }
  if(term.length||year>=calendar.year+10)throw s.fail('Không tìm được học kỳ trống để tạo đợt demo riêng.');
  const start=year+'-10-01',finish=year+'-11-30';
  const opening=new Date(new Date(calendar.now).getTime()-60000),closing=new Date(year+'-09-24T17:00:00+07:00');
  const add=(table,data)=>s.insert(c,m,table,data);
  const account=async(email,role,password)=>add('nguoi_dung',{email,mat_khau_hash:await bcrypt.hash(password,12),vai_tro:role,dang_hoat_dong:true});
  for(let i=0;i<20;i++){const r=refs[i];await add('giang_vien',{nguoi_dung_id:await account(teacherEmails[i],'GIANG_VIEN','12345678'),ma_giang_vien:teacherCodes[i],ho_ten:r.ho_ten,bo_mon:r.khoa_don_vi,hoc_vi:r.hoc_vi,danh_muc_giang_vien_id:r.id,chuc_vu:r.chuc_vu,linh_vuc:r.linh_vuc});}
  const studentIds=[];
  for(const r of students)studentIds.push(await add('sinh_vien',{nguoi_dung_id:await account(r.email,'SINH_VIEN',r.maSinhVien),ma_sinh_vien:r.maSinhVien,ho_ten:r.hoTen,lop:r.lop,nganh:r.nganh,khoa_hoc:r.khoaHoc}));
  const companies=[],supervisors=[];
  for(let i=0;i<2;i++){companies.push(await add('doanh_nghiep',{ten_doanh_nghiep:'Doanh nghiệp Demo '+(i+1),dia_chi:'Dữ liệu demo',email:companyEmails[i],linh_vuc_hoat_dong:'Đơn vị thực tập demo đa ngành'}));supervisors.push(await add('can_bo_huong_dan',{doanh_nghiep_id:companies[i],ho_ten:['Nguyễn Văn Hòa','Trần Minh Long'][i],email:'huongdan.demo'+(i+1)+'@example.com',chuc_vu:'Cán bộ hướng dẫn demo'}));}
  const dot={ngayBatDauDangKy:opening,ngayKetThucDangKy:closing,ngayBatDauThucTap:start,ngayKetThucThucTap:finish};
  const period=await add('dot_thuc_tap',{hoc_ky:'Học kỳ 1',nam_hoc:year+'-'+(year+1),ngay_bat_dau_dang_ky:opening,ngay_ket_thuc_dang_ky:closing,ngay_bat_dau_thuc_tap:start,ngay_ket_thuc_thuc_tap:finish,trang_thai:tinhTrangThaiDotThucTap(dot,new Date(calendar.now))});
  // No major links means all majors; still run the real eligibility check.
  for(let i=0;i<20;i++){
   if(tinhTrangThaiDotThucTap(dot,new Date())!=='DANG_MO_DANG_KY')throw s.fail('Cổng demo không mở. Dừng seed đăng ký.');
   await eligibility.check(c,studentIds[i],period,dot);
   await add('dang_ky_thuc_tap',{sinh_vien_id:studentIds[i],dot_thuc_tap_id:period,doanh_nghiep_id:companies[i%2],can_bo_huong_dan_id:supervisors[i%2],vi_tri_thuc_tap:'Thực tập ngành '+students[i].nganh,ngay_bat_dau:start,ngay_ket_thuc:finish,trang_thai:'CHO_DUYET'});
  }
  await s.writeManifest(m);manifestWritten=true;commitAttempted=true;await c.query('COMMIT');
  console.log('Đã tạo đúng 20 sinh viên, 20 giảng viên, 20 đăng ký chờ duyệt. Không tạo hoặc thay đổi Admin.');
 }catch(e){await c.query('ROLLBACK').catch(()=>{});if(manifestWritten&&!commitAttempted)await s.fs.unlink(s.manifestPath);throw e;}finally{c.release();}
}
if(require.main===module)seed().catch(s.safeError).finally(()=>pool.end());
module.exports=seed;
