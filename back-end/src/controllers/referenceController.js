const pool=require('../config/database');
const ref=require('../services/referenceService');
const {emailError}=require('../utils/validators');
function handle(res,error){if(error.status)return res.status(error.status).json({success:false,message:error.message});console.error('REFERENCE ERROR:',/^[0-9A-Z]{5}$/.test(error.code||'')?error.code:'DB_ERROR');res.status(500).json({success:false,message:'Không thể tải danh mục TVU. Vui lòng thử lại.'});}
async function majors(_req,res){try{
 const rows=(await pool.query(`SELECT n.id,n.ma_nganh AS "maNganh",n.ten_nganh AS "tenNganh",n.nhom_nganh AS "nhomNganh",n.ghi_chu_lop AS "ghiChuLop",COALESCE((SELECT json_agg(json_build_object('cohort',m.khoa_nhap_hoc,'prefix',m.prefix_mssv)) FROM ma_mssv_nganh m WHERE m.nganh_id=n.id AND m.xac_minh=true),'[]'::json) AS "mssvRules",COALESCE((SELECT array_agg(y.khoa ORDER BY y.khoa) FROM (SELECT l.khoa_nhap_hoc AS khoa FROM lop_hoc l WHERE l.nganh_id=n.id AND l.dang_hoat_dong AND l.khoa_nhap_hoc IS NOT NULL UNION SELECT m.khoa_nhap_hoc FROM ma_mssv_nganh m WHERE m.nganh_id=n.id) y),ARRAY[]::smallint[]) AS cohorts FROM nganh_hoc n WHERE n.dang_hoat_dong ORDER BY n.ten_nganh,n.id`)).rows;
 res.json({success:true,data:rows});
}catch(e){handle(res,e);}}
async function classes(req,res){try{res.json({success:true,data:await ref.classes(pool,req.params.majorId,req.query.cohort)});}catch(e){handle(res,e);}}
async function faculties(_req,res){try{res.json({success:true,data:(await pool.query('SELECT khoa_don_vi AS "khoaDonVi",COUNT(*)::int AS "soGiangVien" FROM danh_muc_giang_vien_tvu WHERE dang_hoat_dong GROUP BY khoa_don_vi ORDER BY khoa_don_vi')).rows});}catch(e){handle(res,e);}}
async function lecturers(req,res){try{const faculty=req.query.faculty??'',search=req.query.search??'';if(typeof faculty!=='string'||faculty.length>255||typeof search!=='string'||search.length>200)throw ref.fail('Bộ lọc giảng viên không hợp lệ.');const pattern='%'+search.trim().replace(/[\\%_]/g,'\\$&')+'%';res.json({success:true,data:(await pool.query(`SELECT ${ref.lecturerFields} FROM danh_muc_giang_vien_tvu WHERE dang_hoat_dong AND ($1='' OR khoa_don_vi=$1) AND ho_ten ILIKE $2 ORDER BY ho_ten,id`,[faculty,pattern])).rows});}catch(e){handle(res,e);}}
async function lecturer(req,res){try{res.json({success:true,data:await ref.lecturer(pool,req.params.id)});}catch(e){handle(res,e);}}
async function resolveEmail(req,res){try{
 const error=emailError(req.query.email,'SINH_VIEN');if(error)throw ref.fail(error);
 const email=req.query.email.trim().toLowerCase();
 const student=(await pool.query(`SELECT sv.id,sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",nd.email,to_char(sv.ngay_sinh,'YYYY-MM-DD') AS "ngaySinh",sv.gioi_tinh AS "gioiTinh",sv.so_dien_thoai AS "soDienThoai",sv.lop,sv.nganh,sv.khoa_hoc AS "khoaHoc" FROM sinh_vien sv JOIN nguoi_dung nd ON nd.id=sv.nguoi_dung_id WHERE LOWER(nd.email)=$1 AND nd.vai_tro='SINH_VIEN'`,[email])).rows[0]||null;
 const local=email.split('@')[0];
 if(!/^\d{9}$/.test(local))return res.json({success:true,existingStudent:Boolean(student),student,maSinhVien:student?.maSinhVien??null,khoaHoc:student?.khoaHoc??null,majors:[],classes:[],message:'Email không chứa MSSV 9 số; vui lòng chọn thông tin từ danh mục.'});
 const year=ref.cohort(local.slice(4,6));
 const majors=(await pool.query(`SELECT DISTINCT n.id,n.ma_nganh AS "maNganh",n.ten_nganh AS "tenNganh" FROM ma_mssv_nganh m JOIN nganh_hoc n ON n.id=m.nganh_id WHERE m.prefix_mssv=$1 AND m.khoa_nhap_hoc=$2 AND m.xac_minh=true AND n.dang_hoat_dong ORDER BY n.ten_nganh`,[local.slice(0,4),year])).rows;
 const classRows=(await Promise.all(majors.map(n=>ref.classes(pool,n.id,year)))).flat();
 res.json({success:true,existingStudent:Boolean(student),student,maSinhVien:local,khoaHoc:year,majors,classes:classRows,message:majors.length===1?null:majors.length?'Có nhiều ngành phù hợp; vui lòng chọn ngành chính xác.':'Chưa có quy tắc prefix đã xác minh; vui lòng chọn ngành và lớp từ danh mục.'});
}catch(e){handle(res,e);}}
module.exports={majors,classes,faculties,lecturers,lecturer,resolveEmail};
