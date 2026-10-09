const pool=require('../config/database');
const {progressPermission}=require('../utils/progressRules');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const denied='Bạn không được phân công hướng dẫn sinh viên này.';
const fields=`id,so_tuan AS "soTuan",tieu_de AS "tieuDe",noi_dung AS "noiDung",to_char(ngay_bao_cao,'YYYY-MM-DD') AS "ngayBaoCao",nhan_xet_giang_vien AS "nhanXetGiangVien",ngay_tao AS "ngayTao",ngay_cap_nhat AS "ngayCapNhat"`;
function id(value){const v=String(value??'');if(!/^[1-9]\d{0,18}$/.test(v)||BigInt(v)>9223372036854775807n)throw fail(400,'ID không hợp lệ.');return v;}
function text(value,label,max){if(typeof value!=='string'||!value.trim())throw fail(400,`${label} bắt buộc.`);if(Array.from(value.trim()).length>max)throw fail(400,`${label} tối đa ${max} ký tự.`);return value.trim();}
function input(body){if(!Number.isInteger(body?.soTuan)||body.soTuan<1||body.soTuan>2147483647)throw fail(400,'Tuần phải là số nguyên dương.');return {soTuan:body.soTuan,tieuDe:text(body.tieuDe,'Tiêu đề',200),noiDung:text(body.noiDung,'Nội dung',20000)};}
function report(res,e){if(e.status)return res.status(e.status).json({success:false,message:e.message});if(e.code==='23505')return res.status(409).json({success:false,message:'Bạn đã cập nhật tiến độ cho tuần này.'});console.error('PROGRESS ERROR:',/^[0-9A-Z]{5}$/.test(e.code||'')?e.code:'DB_ERROR');return res.status(500).json({success:false,message:'Không thể xử lý tiến độ thực tập. Vui lòng thử lại.'});}
async function transaction(work){const c=await pool.connect();try{await c.query('BEGIN');await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'");const result=await work(c);await c.query('COMMIT');return result;}catch(e){try{await c.query('ROLLBACK');}catch{/* preserve error */}throw e;}finally{c.release();}}
async function studentId(c,userId){const row=(await c.query('SELECT id FROM sinh_vien WHERE nguoi_dung_id=$1',[userId])).rows[0];if(!row)throw fail(403,'Tài khoản chưa có hồ sơ sinh viên.');return row.id;}
async function registration(c,student,registrationId){
 const params=[student];if(registrationId)params.push(registrationId);
 const row=(await c.query(`SELECT dk.id,dk.trang_thai AS "trangThai",dk.vi_tri_thuc_tap AS "viTriThucTap",dn.ten_doanh_nghiep AS "tenDoanhNghiep",to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc" FROM dang_ky_thuc_tap dk JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id WHERE dk.sinh_vien_id=$1 ${registrationId?'AND dk.id=$2':''} ORDER BY dk.ngay_tao DESC,dk.id DESC LIMIT 1 FOR UPDATE OF dk`,params)).rows[0];
 if(!row)return null;
 row.giangVienHuongDan=(await c.query(`SELECT gv.ho_ten AS "hoTen",gv.bo_mon AS "boMon",gv.hoc_vi AS "hocVi" FROM phan_cong_giang_vien pc JOIN giang_vien gv ON gv.id=pc.giang_vien_id WHERE pc.dang_ky_thuc_tap_id=$1 FOR SHARE OF pc`,[row.id])).rows[0]||null;
 const permission=progressPermission(row);
 if(permission.allowed&&row.trangThai==='DA_DUYET'){await c.query("UPDATE dang_ky_thuc_tap SET trang_thai='DANG_THUC_TAP',ngay_cap_nhat=NOW() WHERE id=$1 AND trang_thai='DA_DUYET'",[row.id]);row.trangThai='DANG_THUC_TAP';}
 return row;
}
function decorate(row,permission){return {...row,coTheSua:permission.allowed,coTheXoa:permission.allowed&&!row.nhanXetGiangVien?.trim()};}
async function ownProgress(c,userId,progressId){
 // Lock the registration before the progress row, matching lecturer comments and assignments.
 // Recheck ownership after locking so concurrent changes cannot bypass the rules.
 const student=await studentId(c,userId);
 const owner=(await c.query('SELECT td.dang_ky_thuc_tap_id FROM tien_do_thuc_tap td JOIN dang_ky_thuc_tap dk ON dk.id=td.dang_ky_thuc_tap_id WHERE td.id=$1 AND dk.sinh_vien_id=$2',[progressId,student])).rows[0];
 if(!owner)throw fail(404,'Không tìm thấy tiến độ của bạn.');
 const reg=await registration(c,student,owner.dang_ky_thuc_tap_id);
 if(!reg)throw fail(404,'Không tìm thấy đăng ký của bạn.');
 const row=(await c.query(`SELECT ${fields} FROM tien_do_thuc_tap WHERE id=$1 AND dang_ky_thuc_tap_id=$2 FOR UPDATE`,[progressId,reg.id])).rows[0];
 if(!row)throw fail(404,'Không tìm thấy tiến độ của bạn.');return {reg,row};
}
async function studentList(req,res){try{const result=await transaction(async c=>{const reg=await registration(c,await studentId(c,req.user.id));const permission=progressPermission(reg);const rows=reg?(await c.query(`SELECT ${fields} FROM tien_do_thuc_tap WHERE dang_ky_thuc_tap_id=$1 ORDER BY so_tuan ASC,id ASC`,[reg.id])).rows:[];return {registration:reg,progress:rows.map(row=>decorate(row,permission)),canCreate:permission.allowed,message:permission.message,percent:permission.percent};});res.json({success:true,...result});}catch(e){report(res,e);}}
async function studentDetail(req,res){try{const result=await transaction(async c=>{const {reg,row}=await ownProgress(c,req.user.id,id(req.params.id));return decorate(row,progressPermission(reg));});res.json({success:true,data:result});}catch(e){report(res,e);}}
async function studentWrite(req,res){try{
 const create=req.method==='POST',remove=req.method==='DELETE';const progressId=create?null:id(req.params.id),data=remove?null:input(req.body);
 const result=await transaction(async c=>{
  let reg,row;
  if(create)reg=await registration(c,await studentId(c,req.user.id));else ({reg,row}=await ownProgress(c,req.user.id,progressId));
  const permission=progressPermission(reg);if(!permission.allowed)throw fail(409,permission.message);
  if(remove&&row.nhanXetGiangVien?.trim())throw fail(409,'Không thể xóa tiến độ đã được giảng viên nhận xét.');
  if(create)return (await c.query(`INSERT INTO tien_do_thuc_tap (dang_ky_thuc_tap_id,so_tuan,tieu_de,noi_dung,ngay_bao_cao) VALUES ($1,$2,$3,$4,CURRENT_DATE) RETURNING ${fields}`,[reg.id,data.soTuan,data.tieuDe,data.noiDung])).rows[0];
  if(remove){await c.query('DELETE FROM tien_do_thuc_tap WHERE id=$1 AND dang_ky_thuc_tap_id=$2',[progressId,reg.id]);return {id:progressId};}
  return (await c.query(`UPDATE tien_do_thuc_tap SET so_tuan=$1,tieu_de=$2,noi_dung=$3,ngay_cap_nhat=NOW() WHERE id=$4 AND dang_ky_thuc_tap_id=$5 RETURNING ${fields}`,[data.soTuan,data.tieuDe,data.noiDung,progressId,reg.id])).rows[0];
 });res.status(create?201:200).json({success:true,data:result,message:remove?'Đã xóa tiến độ.':'Đã lưu tiến độ thực tập.'});
}catch(e){report(res,e);}}
async function lecturerRegistration(c,userId,registrationId,lock=false){
 const row=(await c.query(`SELECT dk.id,sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",sv.lop,sv.nganh,dk.trang_thai AS "trangThai",dn.ten_doanh_nghiep AS "tenDoanhNghiep",dk.vi_tri_thuc_tap AS "viTriThucTap",to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc" FROM phan_cong_giang_vien pc JOIN giang_vien gv ON gv.id=pc.giang_vien_id JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id WHERE gv.nguoi_dung_id=$1 AND dk.id=$2 ${lock?'FOR UPDATE OF dk FOR SHARE OF pc':''}`,[userId,registrationId])).rows[0];
 if(!row)throw fail(403,denied);return row;
}
async function lecturerStudents(req,res){try{const rows=(await pool.query(`SELECT dk.id AS "registrationId",sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",sv.lop,dn.ten_doanh_nghiep AS "tenDoanhNghiep",dk.trang_thai AS "trangThai" FROM phan_cong_giang_vien pc JOIN giang_vien gv ON gv.id=pc.giang_vien_id JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id WHERE gv.nguoi_dung_id=$1 ORDER BY pc.ngay_phan_cong DESC,pc.id DESC`,[req.user.id])).rows;res.json({success:true,data:rows});}catch(e){report(res,e);}}
async function lecturerList(req,res){try{const result=await transaction(async c=>{const reg=await lecturerRegistration(c,req.user.id,id(req.params.registrationId),true);const rows=(await c.query(`SELECT ${fields} FROM tien_do_thuc_tap WHERE dang_ky_thuc_tap_id=$1 ORDER BY so_tuan ASC,id ASC`,[reg.id])).rows;return {student:{maSinhVien:reg.maSinhVien,hoTen:reg.hoTen,lop:reg.lop,nganh:reg.nganh},internship:{tenDoanhNghiep:reg.tenDoanhNghiep,viTriThucTap:reg.viTriThucTap,ngayBatDau:reg.ngayBatDau,ngayKetThuc:reg.ngayKetThuc,trangThai:reg.trangThai},progress:rows};});res.json({success:true,...result});}catch(e){report(res,e);}}
async function comment(req,res){try{
 const registrationId=id(req.params.registrationId),progressId=id(req.params.progressId),value=text(req.body?.nhanXet,'Nhận xét',20000);
 const row=await transaction(async c=>{await lecturerRegistration(c,req.user.id,registrationId,true);const result=await c.query(`UPDATE tien_do_thuc_tap SET nhan_xet_giang_vien=$1,ngay_cap_nhat=NOW() WHERE id=$2 AND dang_ky_thuc_tap_id=$3 RETURNING ${fields}`,[value,progressId,registrationId]);if(!result.rows.length)throw fail(404,'Không tìm thấy tiến độ của sinh viên này.');return result.rows[0];});
 res.json({success:true,data:row,message:'Đã lưu nhận xét.'});
}catch(e){report(res,e);}}
module.exports={studentList,studentDetail,studentWrite,lecturerStudents,lecturerList,comment};
