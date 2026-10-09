const pool=require('../config/database');
const statuses=['CHO_DUYET','DA_DUYET','TU_CHOI','DANG_THUC_TAP','HOAN_THANH'];
const fail=(status,message)=>Object.assign(new Error(message),{status});
function id(value){const text=String(value??'');if(!/^[1-9]\d{0,18}$/.test(text)||BigInt(text)>9223372036854775807n)throw fail(400,'ID không hợp lệ.');return text;}
const joins=`FROM dang_ky_thuc_tap dk JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id
 JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id JOIN can_bo_huong_dan cb ON cb.id=dk.can_bo_huong_dan_id
 JOIN dot_thuc_tap dt ON dt.id=dk.dot_thuc_tap_id`;
const fields=`dk.id,sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",sv.lop,sv.nganh,
 dn.ten_doanh_nghiep AS "tenDoanhNghiep",dn.dia_chi AS "diaChiDoanhNghiep",cb.ho_ten AS "canBoHuongDan",cb.chuc_vu AS "chucVuCanBo",
 dk.vi_tri_thuc_tap AS "viTriThucTap",dt.hoc_ky AS "hocKy",dt.nam_hoc AS "namHoc",
 to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc",
 dk.trang_thai AS "trangThai",dk.ly_do_tu_choi AS "lyDoTuChoi",dk.ngay_tao AS "ngayDangKy"`;
function report(res,error){
 if(error.status)return res.status(error.status).json({success:false,message:error.message});
 console.error('REGISTRATION ADMIN ERROR:',/^[0-9A-Z]{5}$/.test(error.code||'')?error.code:'DB_ERROR');
 return res.status(500).json({success:false,message:'Không thể xử lý đăng ký thực tập. Vui lòng thử lại.'});
}
async function list(req,res){try{
 const q=req.query;
 for(const key of ['page','limit','search','trangThai','dotThucTapId'])if(q[key]!==undefined&&typeof q[key]!=='string')throw fail(400,'Bộ lọc không hợp lệ.');
 const page=Number(q.page||1),limit=Number(q.limit||10);
 if(!Number.isInteger(page)||page<1||page>1000000||!Number.isInteger(limit)||limit<1||limit>100)throw fail(400,'Phân trang không hợp lệ.');
 if((q.search?.length||0)>200||(q.trangThai&&!statuses.includes(q.trangThai)))throw fail(400,'Bộ lọc không hợp lệ.');
 const params=[],clauses=[];
 if(q.search?.trim()){params.push(`%${q.search.trim().replace(/[\\%_]/g,'\\$&')}%`);clauses.push('(sv.ma_sinh_vien ILIKE $1 OR sv.ho_ten ILIKE $1 OR dn.ten_doanh_nghiep ILIKE $1)');}
 if(q.trangThai){params.push(q.trangThai);clauses.push(`dk.trang_thai=$${params.length}`);}
 if(q.dotThucTapId){params.push(id(q.dotThucTapId));clauses.push(`dk.dot_thuc_tap_id=$${params.length}`);}
 const where=clauses.length?'WHERE '+clauses.join(' AND '):'';
 const [count,records,periods]=await Promise.all([
  pool.query(`SELECT COUNT(*)::int AS total ${joins} ${where}`,params),
  pool.query(`SELECT ${fields} ${joins} ${where} ORDER BY dk.ngay_tao DESC,dk.id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,[...params,limit,(page-1)*limit]),
  pool.query('SELECT id,hoc_ky AS "hocKy",nam_hoc AS "namHoc" FROM dot_thuc_tap ORDER BY ngay_tao DESC,id DESC'),
 ]);
 const total=count.rows[0].total;res.json({success:true,data:records.rows,pagination:{page,limit,total,totalPages:Math.ceil(total/limit)},filters:{dotThucTap:periods.rows}});
}catch(error){report(res,error);}}
async function detail(req,res){try{
 const result=await pool.query(`SELECT ${fields} ${joins} WHERE dk.id=$1`,[id(req.params.id)]);
 if(!result.rows.length)throw fail(404,'Không tìm thấy đăng ký thực tập.');
 res.json({success:true,data:result.rows[0]});
}catch(error){report(res,error);}}
async function decide(req,res,reject){
 let client;
 try{
  const registrationId=id(req.params.id);
  let reason=null;
  if(reject){if(typeof req.body?.lyDo!=='string'||!req.body.lyDo.trim())throw fail(400,'Vui lòng nhập lý do từ chối.');reason=req.body.lyDo.trim();}
  client=await pool.connect();await client.query('BEGIN');
  const current=await client.query('SELECT trang_thai FROM dang_ky_thuc_tap WHERE id=$1 FOR UPDATE',[registrationId]);
  if(!current.rows.length)throw fail(404,'Không tìm thấy đăng ký thực tập.');
  if(current.rows[0].trang_thai!=='CHO_DUYET')throw fail(409,'Đăng ký này đã được xử lý.');
  const status=reject?'TU_CHOI':'DA_DUYET';
  const result=await client.query('UPDATE dang_ky_thuc_tap SET trang_thai=$1,ly_do_tu_choi=$2,ngay_cap_nhat=NOW() WHERE id=$3 RETURNING id,trang_thai AS "trangThai",ly_do_tu_choi AS "lyDoTuChoi"',[status,reason,registrationId]);
  await client.query('COMMIT');res.json({success:true,data:result.rows[0],message:reject?'Đã từ chối đăng ký thực tập.':'Đã duyệt đăng ký thực tập.'});
 }catch(error){if(client)try{await client.query('ROLLBACK');}catch{/* preserve original error */}report(res,error);}finally{client?.release();}
}
module.exports={list,detail,approve:(req,res)=>decide(req,res,false),reject:(req,res)=>decide(req,res,true)};
