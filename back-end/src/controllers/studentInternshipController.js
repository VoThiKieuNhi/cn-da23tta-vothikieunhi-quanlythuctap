const pool=require('../config/database');
const {periodSource,tinhTrangThaiDotThucTap}=require('../utils/periodStatus');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const closed='Cổng đăng ký thực tập hiện không mở.';
function id(value){const text=String(value??'');if(!/^[1-9]\d{0,18}$/.test(text)||BigInt(text)>9223372036854775807n)throw fail(400,'ID không hợp lệ.');return text;}
function report(res,error){
 if(error.status)return res.status(error.status).json({success:false,message:error.message});
 if(error.code==='23505')return res.status(409).json({success:false,message:'Bạn đã đăng ký thực tập trong đợt này.'});
 if(error.code==='23503')return res.status(409).json({success:false,message:'Dữ liệu liên quan đã thay đổi. Vui lòng tải lại.'});
 console.error('STUDENT REGISTRATION ERROR:',/^[0-9A-Z]{5}$/.test(error.code||'')?error.code:'DB_ERROR');
 return res.status(500).json({success:false,message:'Không thể xử lý đăng ký thực tập. Vui lòng thử lại.'});
}
async function profile(client,userId,lock=false){
 const result=await client.query(`SELECT id,ma_sinh_vien AS "maSinhVien",ho_ten AS "hoTen",lop,nganh FROM sinh_vien WHERE nguoi_dung_id=$1${lock?' FOR UPDATE':''}`,[userId]);
 if(!result.rows.length)throw fail(403,'Tài khoản chưa có hồ sơ sinh viên.');return result.rows[0];
}
const periodFields=`dt.id,dt.hoc_ky AS "hocKy",dt.nam_hoc AS "namHoc",
 dt.ngay_bat_dau_dang_ky AS "thoiGianMoDangKy",dt.ngay_ket_thuc_dang_ky AS "thoiGianDongDangKy",
 to_char(dt.ngay_bat_dau_thuc_tap,'YYYY-MM-DD') AS "ngayBatDauThucTap",
 to_char(dt.ngay_ket_thuc_thuc_tap,'YYYY-MM-DD') AS "ngayKetThucThucTap",dt.trang_thai_tu_dong AS "trangThai"`;
async function openPeriods(req,res){try{
 await profile(pool,req.user.id);
 const result=await pool.query(`SELECT ${periodFields} FROM ${periodSource()} dt WHERE dt.trang_thai_tu_dong=$2 ORDER BY dt.ngay_bat_dau_dang_ky,dt.id`,[new Date(),'DANG_MO_DANG_KY']);
 res.json({success:true,data:result.rows});
}catch(error){report(res,error);}}
async function companies(req,res){try{
 await profile(pool,req.user.id);
 if(req.query.search!==undefined&&(typeof req.query.search!=='string'||req.query.search.length>200))throw fail(400,'Từ khóa không hợp lệ.');
 const search=`%${(req.query.search||'').trim().replace(/[\\%_]/g,'\\$&')}%`;
 const result=await pool.query(`SELECT id,ten_doanh_nghiep AS "tenDoanhNghiep",dia_chi AS "diaChi",linh_vuc_hoat_dong AS "linhVucHoatDong",nguoi_dai_dien AS "nguoiDaiDien" FROM doanh_nghiep WHERE ten_doanh_nghiep ILIKE $1 OR dia_chi ILIKE $1 OR linh_vuc_hoat_dong ILIKE $1 ORDER BY ten_doanh_nghiep,id`,[search]);
 res.json({success:true,data:result.rows});
}catch(error){report(res,error);}}
async function supervisors(req,res){try{
 await profile(pool,req.user.id);const companyId=id(req.params.companyId);
 if(!(await pool.query('SELECT id FROM doanh_nghiep WHERE id=$1',[companyId])).rows.length)throw fail(404,'Không tìm thấy doanh nghiệp.');
 const result=await pool.query('SELECT id,ho_ten AS "hoTen",chuc_vu AS "chucVu",email,so_dien_thoai AS "soDienThoai" FROM can_bo_huong_dan WHERE doanh_nghiep_id=$1 ORDER BY ho_ten,id',[companyId]);
 res.json({success:true,data:result.rows});
}catch(error){report(res,error);}}
async function mine(req,res){try{
 const student=await profile(pool,req.user.id);
 const result=await pool.query(`SELECT dk.id,dk.dot_thuc_tap_id AS "dotThucTapId",dk.doanh_nghiep_id AS "doanhNghiepId",dk.can_bo_huong_dan_id AS "canBoHuongDanId",
 dt.hoc_ky AS "hocKy",dt.nam_hoc AS "namHoc",dn.ten_doanh_nghiep AS "tenDoanhNghiep",dn.dia_chi AS "diaChiDoanhNghiep",dn.linh_vuc_hoat_dong AS "linhVucHoatDong",
 cb.ho_ten AS "canBoHuongDan",cb.chuc_vu AS "chucVuCanBo",dk.vi_tri_thuc_tap AS "viTriThucTap",
 to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc",
 dk.trang_thai AS "trangThai",dk.ly_do_tu_choi AS "lyDoTuChoi",dk.ngay_tao AS "ngayDangKy",
 (dk.trang_thai='CHO_DUYET' AND dt.trang_thai_tu_dong='DANG_MO_DANG_KY') AS "coTheChinhSua"
 FROM dang_ky_thuc_tap dk JOIN ${periodSource()} dt ON dt.id=dk.dot_thuc_tap_id
 JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id JOIN can_bo_huong_dan cb ON cb.id=dk.can_bo_huong_dan_id
 WHERE dk.sinh_vien_id=$2 ORDER BY dk.ngay_tao DESC,dk.id DESC`,[new Date(),student.id]);
 res.json({success:true,data:result.rows,student});
}catch(error){report(res,error);}}
function payload(body,create){
 if(!body||typeof body!=='object'||Array.isArray(body))throw fail(400,'Dữ liệu không hợp lệ.');
 const data={doanhNghiepId:id(body.doanhNghiepId),canBoHuongDanId:id(body.canBoHuongDanId)};
 if(create)data.dotThucTapId=id(body.dotThucTapId);
 if(typeof body.viTriThucTap!=='string'||!body.viTriThucTap.trim()||Array.from(body.viTriThucTap.trim()).length>200)throw fail(400,'Vị trí thực tập bắt buộc và tối đa 200 ký tự.');
 data.viTriThucTap=body.viTriThucTap.trim();return data;
}
async function period(client,periodId){
 const result=await client.query(`SELECT ngay_bat_dau_dang_ky AS "ngayBatDauDangKy",ngay_ket_thuc_dang_ky AS "ngayKetThucDangKy",to_char(ngay_bat_dau_thuc_tap,'YYYY-MM-DD') AS "ngayBatDauThucTap",to_char(ngay_ket_thuc_thuc_tap,'YYYY-MM-DD') AS "ngayKetThucThucTap" FROM dot_thuc_tap WHERE id=$1 FOR SHARE`,[periodId]);
 if(!result.rows.length)throw fail(404,'Không tìm thấy đợt thực tập.');return result.rows[0];
}
function requireOpen(dot){if(tinhTrangThaiDotThucTap(dot,new Date())!=='DANG_MO_DANG_KY')throw fail(409,closed);}
async function companySupervisor(client,data){
 if(!(await client.query('SELECT id FROM doanh_nghiep WHERE id=$1 FOR SHARE',[data.doanhNghiepId])).rows.length)throw fail(404,'Không tìm thấy doanh nghiệp.');
 if(!(await client.query('SELECT id FROM can_bo_huong_dan WHERE id=$1 AND doanh_nghiep_id=$2 FOR SHARE',[data.canBoHuongDanId,data.doanhNghiepId])).rows.length)throw fail(400,'Cán bộ hướng dẫn không thuộc doanh nghiệp đã chọn.');
}
async function mutate(req,res){
 let client;
 try{
  const create=req.method==='POST',remove=req.method==='DELETE';
  const registrationId=create?null:id(req.params.id),data=remove?null:payload(req.body,create);
  client=await pool.connect();await client.query('BEGIN');const student=await profile(client,req.user.id,true);
  let current;
  if(!create){
   current=(await client.query('SELECT id,dot_thuc_tap_id AS "dotThucTapId",trang_thai AS "trangThai" FROM dang_ky_thuc_tap WHERE id=$1 AND sinh_vien_id=$2 FOR UPDATE',[registrationId,student.id])).rows[0];
   if(!current)throw fail(404,'Không tìm thấy đăng ký của bạn.');
   if(current.trangThai!=='CHO_DUYET')throw fail(409,'Đăng ký đã được xử lý và không thể chỉnh sửa.');
  }
  const periodId=create?data.dotThucTapId:current.dotThucTapId,dot=await period(client,periodId);requireOpen(dot);
  if(create && (await client.query('SELECT id FROM dang_ky_thuc_tap WHERE sinh_vien_id=$1 AND dot_thuc_tap_id=$2',[student.id,periodId])).rows.length)throw fail(409,'Bạn đã đăng ký thực tập trong đợt này.');
  if(!remove)await companySupervisor(client,data);
  requireOpen(dot); // Recheck server clock after any lock waits.
  let result;
  if(create)result=await client.query(`INSERT INTO dang_ky_thuc_tap (sinh_vien_id,dot_thuc_tap_id,doanh_nghiep_id,can_bo_huong_dan_id,vi_tri_thuc_tap,ngay_bat_dau,ngay_ket_thuc,trang_thai,ly_do_tu_choi) VALUES ($1,$2,$3,$4,$5,$6,$7,'CHO_DUYET',NULL) RETURNING id`,[student.id,periodId,data.doanhNghiepId,data.canBoHuongDanId,data.viTriThucTap,dot.ngayBatDauThucTap,dot.ngayKetThucThucTap]);
  else if(remove)result=await client.query('DELETE FROM dang_ky_thuc_tap WHERE id=$1 AND sinh_vien_id=$2 RETURNING id',[registrationId,student.id]);
  else result=await client.query('UPDATE dang_ky_thuc_tap SET doanh_nghiep_id=$1,can_bo_huong_dan_id=$2,vi_tri_thuc_tap=$3,ngay_cap_nhat=NOW() WHERE id=$4 AND sinh_vien_id=$5 RETURNING id',[data.doanhNghiepId,data.canBoHuongDanId,data.viTriThucTap,registrationId,student.id]);
  await client.query('COMMIT');res.status(create?201:200).json({success:true,data:result.rows[0],message:create?'Đăng ký thực tập đã được gửi và đang chờ duyệt.':remove?'Đã hủy đăng ký thực tập.':'Đã cập nhật đăng ký thực tập.'});
 }catch(error){if(client)try{await client.query('ROLLBACK');}catch{/* keep original error */}report(res,error);}finally{client?.release();}
}
module.exports={openPeriods,companies,supervisors,mine,mutate};
