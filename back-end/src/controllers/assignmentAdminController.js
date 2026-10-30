const pool=require('../config/database');
const fail=(status,message)=>Object.assign(new Error(message),{status});
function id(value){const v=String(value??'');if(!/^[1-9]\d{0,18}$/.test(v)||BigInt(v)>9223372036854775807n)throw fail(400,'ID không hợp lệ.');return v;}
function error(res,e){if(e.status)return res.status(e.status).json({success:false,message:e.message});if(e.code==='23505')return res.status(409).json({success:false,message:'Đăng ký đã được phân công giảng viên.'});console.error('ASSIGNMENT ERROR:',/^[0-9A-Z]{5}$/.test(e.code||'')?e.code:'DB_ERROR');return res.status(500).json({success:false,message:'Không thể xử lý phân công. Vui lòng thử lại.'});}
async function list(req,res){try{
 const {search='',page='1'}=req.query;
 const periodId=req.query.periodId ? id(req.query.periodId) : null;
 const excludeId=req.query.registrationId ? id(req.query.registrationId) : null;
 if(typeof search!=='string'||search.length>200||typeof page!=='string'||!Number.isInteger(Number(page))||Number(page)<1||Number(page)>1000000)throw fail(400,'Bộ lọc không hợp lệ.');
 const params=[`%${search.trim().replace(/[\\%_]/g,'\\$&')}%`];
 const from=`FROM dang_ky_thuc_tap dk JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id JOIN dot_thuc_tap dt ON dt.id=dk.dot_thuc_tap_id LEFT JOIN phan_cong_giang_vien pc ON pc.dang_ky_thuc_tap_id=dk.id LEFT JOIN giang_vien gv ON gv.id=pc.giang_vien_id WHERE dk.trang_thai IN ('DA_DUYET','DANG_THUC_TAP','HOAN_THANH') AND (sv.ma_sinh_vien ILIKE $1 OR sv.ho_ten ILIKE $1 OR dn.ten_doanh_nghiep ILIKE $1)`;
 const [count,records,lecturers]=await Promise.all([
 pool.query(`SELECT COUNT(*)::int AS total ${from}`,params),
 pool.query(`SELECT dk.id,dk.dot_thuc_tap_id AS "dotThucTapId",sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",dn.ten_doanh_nghiep AS "tenDoanhNghiep",dt.hoc_ky AS "hocKy",dt.nam_hoc AS "namHoc",dk.trang_thai AS "trangThai",gv.ho_ten AS "giangVien",pc.id AS "phanCongId",pc.ngay_phan_cong AS "ngayPhanCong",pc.ghi_chu AS "ghiChu" ${from} ORDER BY (pc.id IS NULL) DESC,dk.ngay_tao DESC,dk.id DESC LIMIT 10 OFFSET $2`,[...params,(Number(page)-1)*10]),
 pool.query(`SELECT gv.id,gv.ma_giang_vien AS "maGiangVien",gv.ho_ten AS "hoTen",gv.bo_mon AS "boMon",(SELECT COUNT(*)::int FROM phan_cong_giang_vien pc JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id WHERE pc.giang_vien_id=gv.id AND dk.dot_thuc_tap_id=$1 AND ($2::bigint IS NULL OR dk.id<>$2)) AS "assignedCount" FROM giang_vien gv JOIN nguoi_dung nd ON nd.id=gv.nguoi_dung_id WHERE nd.dang_hoat_dong=true AND nd.vai_tro='GIANG_VIEN' ORDER BY gv.ho_ten,gv.id`,[periodId,excludeId]),
 ]);
 const total=count.rows[0].total;res.json({success:true,data:records.rows,lecturers:lecturers.rows,pagination:{page:Number(page),total,totalPages:Math.ceil(total/10)}});
}catch(e){error(res,e);}}
async function create(req,res){let client;try{
 const registrationId=id(req.params.id),lecturerId=id(req.body?.giangVienId);
 if(req.body?.ghiChu!=null&&(typeof req.body.ghiChu!=='string'||req.body.ghiChu.length>2000))throw fail(400,'Ghi chú tối đa 2000 ký tự.');
 const note=req.body?.ghiChu?.trim()||null;
 client=await pool.connect();await client.query('BEGIN');
 const registration=(await client.query('SELECT trang_thai,dot_thuc_tap_id FROM dang_ky_thuc_tap WHERE id=$1 FOR UPDATE',[registrationId])).rows[0];
 if(!registration)throw fail(404,'Không tìm thấy đăng ký.');
 if(registration.trang_thai!=='DA_DUYET')throw fail(409,'Chỉ phân công cho đăng ký đã được duyệt.');
 const current=(await client.query('SELECT id FROM phan_cong_giang_vien WHERE dang_ky_thuc_tap_id=$1',[registrationId])).rows[0];
 const updating=req.method==='PUT';
 if(current&&!updating)throw fail(409,'Đăng ký đã được phân công giảng viên.');
 if(!current&&updating)throw fail(404,'Đăng ký chưa được phân công giảng viên.');
 const lecturer=await client.query(`SELECT gv.id FROM giang_vien gv JOIN nguoi_dung nd ON nd.id=gv.nguoi_dung_id WHERE gv.id=$1 AND nd.dang_hoat_dong=true AND nd.vai_tro='GIANG_VIEN' FOR UPDATE OF gv FOR SHARE OF nd`,[lecturerId]);
 if(!lecturer.rows.length)throw fail(400,'Giảng viên không tồn tại hoặc tài khoản đã ngừng hoạt động.');
 // Lock the target lecturer before counting so concurrent requests cannot both claim slot 10.
 const capacity=await client.query(`SELECT COUNT(*)::int AS total FROM phan_cong_giang_vien pc JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id WHERE pc.giang_vien_id=$1 AND dk.dot_thuc_tap_id=$2 AND dk.id<>$3`,[lecturerId,registration.dot_thuc_tap_id,registrationId]);
 if(capacity.rows[0].total>=10)throw fail(409,'Giảng viên đã đạt giới hạn tối đa 10 sinh viên trong đợt thực tập này.');
 const result=await client.query(updating?'UPDATE phan_cong_giang_vien SET giang_vien_id=$2,ghi_chu=$3,ngay_phan_cong=NOW() WHERE dang_ky_thuc_tap_id=$1 RETURNING id':'INSERT INTO phan_cong_giang_vien (dang_ky_thuc_tap_id,giang_vien_id,ghi_chu) VALUES ($1,$2,$3) RETURNING id',[registrationId,lecturerId,note]);
 await client.query('COMMIT');res.status(updating?200:201).json({success:true,data:result.rows[0],message:'Phân công giảng viên thành công.'});
}catch(e){if(client)try{await client.query('ROLLBACK');}catch{/* keep original */}error(res,e);}finally{client?.release();}}
module.exports={list,create};
