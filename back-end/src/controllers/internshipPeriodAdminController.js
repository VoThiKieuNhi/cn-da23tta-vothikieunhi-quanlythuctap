const pool = require('../config/database');
const periodMajors = require('../services/periodMajors');
const { timeErrors, openingInPast, pastMessage } = require('../utils/periodTime');
const { statuses, tinhTrangThaiDotThucTap, periodSource } = require('../utils/periodStatus');
const dates = ['ngayBatDauDangKy', 'ngayKetThucDangKy', 'ngayBatDauThucTap', 'ngayKetThucThucTap'];
const fields = `dt.id, dt.hoc_ky AS "hocKy", dt.nam_hoc AS "namHoc",
  dt.ngay_bat_dau_dang_ky AS "ngayBatDauDangKy",
  dt.ngay_ket_thuc_dang_ky AS "ngayKetThucDangKy",
  to_char(dt.ngay_bat_dau_thuc_tap,'YYYY-MM-DD') AS "ngayBatDauThucTap",
  to_char(dt.ngay_ket_thuc_thuc_tap,'YYYY-MM-DD') AS "ngayKetThucThucTap",
  dt.trang_thai_tu_dong AS "trangThai", dt.ngay_tao AS "ngayTao", dt.ngay_cap_nhat AS "ngayCapNhat",
  (SELECT COUNT(*)::int FROM dang_ky_thuc_tap dk WHERE dk.dot_thuc_tap_id=dt.id) AS "soSinhVienDangKy", ${periodMajors.fields}`;
const fail = (status,message,errors) => Object.assign(new Error(message),{status,errors});
function parseId(value) {
  if(!/^[1-9]\d{0,18}$/.test(value || '') || BigInt(value)>9223372036854775807n) throw fail(400,'ID không hợp lệ.');
  return value;
}
function validate(body) {
  if(!body || typeof body!=='object' || Array.isArray(body)) throw fail(400,'Dữ liệu không hợp lệ.');
  const data={},errors={};
  for(const [key,label] of [['hocKy','Học kỳ'],['namHoc','Năm học']]) {
    data[key]=typeof body[key]==='string'?body[key].trim():'';
    if(!data[key]) errors[key]=`${label} bắt buộc.`;
    else if(Array.from(data[key]).length>30) errors[key]=`${label} tối đa 30 ký tự.`;
  }
  for(const key of dates) data[key]=body[key];
  Object.assign(errors,timeErrors(data));
  if(!['Học kỳ 1','Học kỳ 2'].includes(body.hocKy)) errors.hocKy='Chỉ được chọn Học kỳ 1 hoặc Học kỳ 2.';
  if(Object.keys(errors).length) throw fail(400,'Vui lòng kiểm tra thông tin đợt thực tập.',errors);
  return data;
}
function respondError(res,error) {
  if(error.status) return res.status(error.status).json({success:false,message:error.message,...(error.errors?{errors:error.errors}:{})});
  if(error.code==='23505') return res.status(409).json({success:false,message:'Đợt thực tập này đã tồn tại.'});
  if(error.code==='23503') return res.status(409).json({success:false,message:'Không thể xóa đợt thực tập đã có sinh viên đăng ký.'});
  console.error('INTERNSHIP PERIOD ERROR:',/^[0-9A-Z]{5}$/.test(error.code || '')?error.code:'DB_ERROR');
  return res.status(500).json({success:false,message:'Không thể xử lý dữ liệu đợt thực tập. Vui lòng thử lại.'});
}
async function list(req,res) {
  try {
    const q=req.query;
    for(const key of ['page','limit','search','trangThai']) if(q[key]!==undefined && typeof q[key]!=='string') throw fail(400,'Bộ lọc không hợp lệ.');
    const page=Number(q.page || 1),limit=Number(q.limit || 10);
    if(!Number.isInteger(page)||page<1||page>1000000||!Number.isInteger(limit)||limit<1||limit>100) throw fail(400,'Phân trang không hợp lệ.');
    if((q.search?.length || 0)>200 || (q.trangThai && !statuses.includes(q.trangThai))) throw fail(400,'Bộ lọc không hợp lệ.');
    const values=[new Date()],clauses=[];
    if(q.search?.trim()){values.push(`%${q.search.trim().replace(/[\\%_]/g,'\\$&')}%`);clauses.push('(dt.hoc_ky ILIKE $2 OR dt.nam_hoc ILIKE $2)');}
    if(q.trangThai){values.push(q.trangThai);clauses.push(`dt.trang_thai_tu_dong=$${values.length}`);}
    const where=clauses.length?'WHERE '+clauses.join(' AND '):'';
    const [count,records]=await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM ${periodSource()} dt ${where}`,values),
      pool.query(`SELECT ${fields} FROM ${periodSource()} dt ${where} ORDER BY dt.ngay_tao DESC,dt.id DESC LIMIT $${values.length+1} OFFSET $${values.length+2}`,[...values,limit,(page-1)*limit]),
    ]);
    const total=count.rows[0].total;
    res.json({success:true,data:records.rows,pagination:{page,limit,total,totalPages:Math.ceil(total/limit)}});
  }catch(error){respondError(res,error);}
}
async function detail(req,res) {
  try {
    const result=await pool.query(`SELECT ${fields} FROM ${periodSource()} dt WHERE dt.id=$2`,[new Date(),parseId(req.params.id)]);
    if(!result.rows.length) throw fail(404,'Không tìm thấy đợt thực tập.');
    res.json({success:true,data:result.rows[0]});
  }catch(error){respondError(res,error);}
}
async function save(req,res) {
  let client;
  try {
    const id=req.params.id?parseId(req.params.id):null,d=validate(req.body),majorIds=periodMajors.parse(req.body);
    let existing=null;
    if(id) {
      client=await pool.connect();await client.query('BEGIN');
      const current=await client.query(`SELECT ngay_bat_dau_dang_ky AS "ngayBatDauDangKy",ngay_ket_thuc_dang_ky AS "ngayKetThucDangKy",
        to_char(ngay_bat_dau_thuc_tap,'YYYY-MM-DD') AS "ngayBatDauThucTap",to_char(ngay_ket_thuc_thuc_tap,'YYYY-MM-DD') AS "ngayKetThucThucTap"
        FROM dot_thuc_tap WHERE id=$1 FOR UPDATE`,[id]);
      if(!current.rows.length) throw fail(404,'Không tìm thấy đợt thực tập.');
      existing=current.rows[0];
      if (d.ngayBatDauThucTap!==existing.ngayBatDauThucTap || d.ngayKetThucThucTap!==existing.ngayKetThucThucTap) {
        const related=await client.query('SELECT id FROM dang_ky_thuc_tap WHERE dot_thuc_tap_id=$1 LIMIT 1',[id]);
        if(related.rows.length) throw fail(409,'Đợt đã có đăng ký; không thể đổi ngày thực tập vì sẽ làm lệch lịch sinh viên.');
      }
    }
    const now=new Date();
    if(existing) existing.trangThai=tinhTrangThaiDotThucTap(existing,now);
    if(openingInPast(d,existing,now)) throw fail(400,pastMessage,{ngayBatDauDangKy:pastMessage});
    d.trangThai=tinhTrangThaiDotThucTap(d,now);
    if(!client){client=await pool.connect();await client.query('BEGIN');}
    const values=[d.hocKy,d.namHoc,...dates.map(key=>d[key]),d.trangThai];
    // The existing UNIQUE(hoc_ky, nam_hoc) also prevents concurrent duplicates.
    const result=id
      ?await client.query('UPDATE dot_thuc_tap SET hoc_ky=$1,nam_hoc=$2,ngay_bat_dau_dang_ky=$3,ngay_ket_thuc_dang_ky=$4,ngay_bat_dau_thuc_tap=$5,ngay_ket_thuc_thuc_tap=$6,trang_thai=$7,ngay_cap_nhat=NOW() WHERE id=$8 RETURNING id',[...values,id])
      :await client.query('INSERT INTO dot_thuc_tap (hoc_ky,nam_hoc,ngay_bat_dau_dang_ky,ngay_ket_thuc_dang_ky,ngay_bat_dau_thuc_tap,ngay_ket_thuc_thuc_tap,trang_thai) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',values);
    if(!result.rows.length) throw fail(404,'Không tìm thấy đợt thực tập.');
    await periodMajors.save(client,result.rows[0].id,majorIds,!!id);
    if(client) await client.query('COMMIT');
    res.status(id?200:201).json({success:true,data:{...result.rows[0],trangThai:d.trangThai},message:id?'Cập nhật đợt thực tập thành công.':'Thêm đợt thực tập thành công.'});
  }catch(error){if(client)try{await client.query('ROLLBACK');}catch{/* preserve original error */}respondError(res,error);}
  finally{client?.release();}
}
async function remove(req,res) {
  let client;
  try {
    const id=parseId(req.params.id);client=await pool.connect();await client.query('BEGIN');
    const record=await client.query('SELECT id FROM dot_thuc_tap WHERE id=$1 FOR UPDATE',[id]);
    if(!record.rows.length) throw fail(404,'Không tìm thấy đợt thực tập.');
    const used=await client.query('SELECT id FROM dang_ky_thuc_tap WHERE dot_thuc_tap_id=$1 LIMIT 1',[id]);
    if(used.rows.length) throw fail(409,'Không thể xóa đợt thực tập đã có sinh viên đăng ký.');
    await client.query('DELETE FROM dot_thuc_tap WHERE id=$1',[id]);await client.query('COMMIT');
    res.json({success:true,message:'Xóa đợt thực tập thành công.'});
  }catch(error){if(client)try{await client.query('ROLLBACK');}catch{/* preserve original error */}respondError(res,error);}
  finally{client?.release();}
}
module.exports={list,detail,save,remove};
