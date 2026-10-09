const {emailError} = require('../utils/validators');
const fail = (message,status=400)=>Object.assign(new Error(message),{status});
function id(value) { const s=String(value??''); if(!/^[1-9]\d{0,18}$/.test(s)||BigInt(s)>9223372036854775807n)throw fail('ID tham chiếu không hợp lệ.');return s; }
function cohort(value) {
  if(typeof value!=='string'&&typeof value!=='number')throw fail('Khóa nhập học không hợp lệ.');
  const s=String(value).trim();if(!/^(?:\d{2}|20\d{2})$/.test(s))throw fail('Khóa nhập học phải có dạng 2023 hoặc 23.');return s.length===2?2000+Number(s):Number(s);
}
function studentIdentity(data) {
  if(!/^\d{9}$/.test(data.maSinhVien||''))throw fail('MSSV phải gồm đúng 9 chữ số.');
  const error=emailError(data.email,'SINH_VIEN');if(error)throw fail(error);
  const local=data.email.trim().split('@')[0];
  if(/^\d{9}$/.test(local)&&local!==data.maSinhVien)throw fail('Email sinh viên và MSSV không khớp.');
}
async function classes(c,majorId,year) {
  return (await c.query(`SELECT l.id,l.ma_lop AS "maLop",l.nganh_id AS "nganhId",l.khoa_nhap_hoc AS "khoaHoc",l.ghi_chu AS "ghiChu" FROM lop_hoc l JOIN nganh_hoc n ON n.id=l.nganh_id WHERE l.nganh_id=$1 AND l.dang_hoat_dong AND n.dang_hoat_dong AND ($2::smallint IS NULL OR l.khoa_nhap_hoc=$2) ORDER BY l.khoa_nhap_hoc,l.ma_lop`,[id(majorId),year==null?null:cohort(year)])).rows;
}
async function validateStudent(c,data) {
  studentIdentity(data);
  const year=cohort(data.khoaHoc);
  const row=(await c.query(`SELECT n.id,n.ten_nganh AS "tenNganh",l.ma_lop AS "maLop",l.khoa_nhap_hoc AS "khoaHoc" FROM nganh_hoc n JOIN lop_hoc l ON l.nganh_id=n.id WHERE n.ten_nganh=$1 AND l.ma_lop=$2 AND n.dang_hoat_dong AND l.dang_hoat_dong FOR SHARE OF n,l`,[data.nganh,data.lop])).rows[0];
  if(!row)throw fail('Lớp phải thuộc đúng ngành trong danh mục TVU.');
  if(Number(row.khoaHoc)!==year)throw fail('Lớp không phù hợp với khóa nhập học.');
  const rules=(await c.query('SELECT prefix_mssv FROM ma_mssv_nganh WHERE nganh_id=$1 AND khoa_nhap_hoc=$2 AND xac_minh=true FOR SHARE',[row.id,year])).rows;
  if(rules.length && (!rules.some(r=>data.maSinhVien.startsWith(r.prefix_mssv))||data.maSinhVien.slice(4,6)!==String(year).slice(-2)))throw fail('MSSV không khớp quy tắc prefix đã xác minh cho ngành và khóa.');
  data.nganh=row.tenNganh;data.lop=row.maLop;data.khoaHoc=String(year);
}
const lecturerFields=`id,khoa_don_vi AS "khoaDonVi",ho_ten AS "hoTen",hoc_vi AS "hocVi",chuc_vu AS "chucVu",linh_vuc AS "linhVuc",nguon_url AS "nguonUrl"`;
async function lecturer(c,referenceId,lock=false) {
  const row=(await c.query(`SELECT ${lecturerFields} FROM danh_muc_giang_vien_tvu WHERE id=$1 AND dang_hoat_dong ${lock?'FOR SHARE':''}`,[id(referenceId)])).rows[0];
  if(!row)throw fail('Không tìm thấy giảng viên trong danh mục TVU.',404);return row;
}
async function applyLecturer(c,data) {
  const row=await lecturer(c,data.danhMucGiangVienId,true);
  data.hoTen=row.hoTen;data.hocVi=row.hocVi;data.boMon=row.khoaDonVi;
}
module.exports={fail,id,cohort,studentIdentity,classes,validateStudent,lecturer,lecturerFields,applyLecturer};
