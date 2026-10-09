const { emailError, isValidPhone, messages } = require('../utils/validators');
const pool = require('../config/database');

const companyFields = `dn.id, dn.ten_doanh_nghiep AS "tenDoanhNghiep", dn.dia_chi AS "diaChi",
  dn.so_dien_thoai AS "soDienThoai", dn.email, dn.linh_vuc_hoat_dong AS "linhVucHoatDong",
  dn.nguoi_dai_dien AS "nguoiDaiDien", dn.ngay_tao AS "ngayTao",
  (SELECT COUNT(*)::int FROM can_bo_huong_dan cb WHERE cb.doanh_nghiep_id=dn.id) AS "soCanBoHuongDan"`;
const supervisorFields = `id, ho_ten AS "hoTen", chuc_vu AS "chucVu", email, so_dien_thoai AS "soDienThoai"`;
const companySpec = [['tenDoanhNghiep',200,true],['diaChi',null,true],['soDienThoai',20],['email',150],['linhVucHoatDong',200],['nguoiDaiDien',150]];
const supervisorSpec = [['hoTen',150,true],['chucVu',100],['email',150],['soDienThoai',20]];
const companyConflict = 'Không thể xóa doanh nghiệp đã phát sinh dữ liệu thực tập.';
const supervisorConflict = 'Không thể xóa cán bộ hướng dẫn đã được phân công cho sinh viên thực tập.';
const fail = (status,message) => Object.assign(new Error(message),{status});
function id(value) {
  if (!/^[1-9]\d{0,18}$/.test(value || '') || BigInt(value)>9223372036854775807n) throw fail(400,'ID không hợp lệ.');
  return value;
}
function validate(body,spec) {
  if (!body || typeof body!=='object' || Array.isArray(body)) throw fail(400,'Dữ liệu không hợp lệ.');
  const data={};
  for(const [key,max,required] of spec) {
    if(body[key]!=null && typeof body[key]!=='string') throw fail(400,`Trường ${key} không hợp lệ.`);
    const value=(body[key] || '').trim();
    if(required && !value) throw fail(400,`Vui lòng nhập ${key}.`);
    if(max && Array.from(value).length>max) throw fail(400,`Trường ${key} tối đa ${max} ký tự.`);
    data[key]=value || null;
  }
  if(data.email) {
    if(emailError(data.email)) throw fail(400,emailError(data.email));
    data.email=data.email.toLowerCase();
  }
  if(data.soDienThoai && !isValidPhone(data.soDienThoai)) throw fail(400,messages.phone);
  return data;
}
function errorResponse(res,error,conflict=companyConflict) {
  if(error.status) return res.status(error.status).json({success:false,message:error.message});
  if(error.code==='23503') return res.status(409).json({success:false,message:conflict});
  if(error.code==='23505') return res.status(409).json({success:false,message:'Thông tin đã tồn tại.'});
  console.error('COMPANY ADMIN ERROR:',/^[0-9A-Z]{5}$/.test(error.code || '')?error.code:'DB_ERROR');
  return res.status(500).json({success:false,message:'Không thể xử lý dữ liệu. Vui lòng thử lại.'});
}
async function transaction(work) {
  const client=await pool.connect();
  try { await client.query('BEGIN'); const result=await work(client); await client.query('COMMIT');return result; }
  catch(error){try{await client.query('ROLLBACK');}catch{/* preserve original failure */}throw error;}
  finally{client.release();}
}
async function requireCompany(client,companyId,lock=false) {
  const result=await client.query(`SELECT id FROM doanh_nghiep WHERE id=$1${lock?' FOR UPDATE':''}`,[companyId]);
  if(!result.rows.length) throw fail(404,'Không tìm thấy doanh nghiệp.');
}
async function readCompany(client,companyId) {
  const result=await client.query(`SELECT ${companyFields} FROM doanh_nghiep dn WHERE dn.id=$1`,[companyId]);
  if(!result.rows.length) throw fail(404,'Không tìm thấy doanh nghiệp.');
  return result.rows[0];
}
async function readSupervisors(client,companyId) {
  return (await client.query(`SELECT ${supervisorFields} FROM can_bo_huong_dan WHERE doanh_nghiep_id=$1 ORDER BY ngay_tao DESC,id DESC`,[companyId])).rows;
}
async function list(req,res) {
  try {
    const q=req.query;
    for(const key of ['page','limit','search','linhVuc']) if(q[key]!==undefined && typeof q[key]!=='string') throw fail(400,'Bộ lọc không hợp lệ.');
    const page=Number(q.page || 1),limit=Number(q.limit || 10);
    if(!Number.isInteger(page)||page<1||page>1000000||!Number.isInteger(limit)||limit<1||limit>100) throw fail(400,'Phân trang không hợp lệ.');
    if((q.search?.length || 0)>200 || (q.linhVuc?.length || 0)>200) throw fail(400,'Bộ lọc quá dài.');
    const values=[],clauses=[];
    if(q.search?.trim()) {values.push(`%${q.search.trim().replace(/[\\%_]/g,'\\$&')}%`);clauses.push('(dn.ten_doanh_nghiep ILIKE $1 OR dn.dia_chi ILIKE $1 OR dn.email ILIKE $1 OR dn.nguoi_dai_dien ILIKE $1)');}
    if(q.linhVuc){values.push(q.linhVuc);clauses.push(`dn.linh_vuc_hoat_dong=$${values.length}`);}
    const where=clauses.length?'WHERE '+clauses.join(' AND '):'';
    const [count,records,options]=await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM doanh_nghiep dn ${where}`,values),
      pool.query(`SELECT ${companyFields} FROM doanh_nghiep dn ${where} ORDER BY dn.ngay_tao DESC,dn.id DESC LIMIT $${values.length+1} OFFSET $${values.length+2}`,[...values,limit,(page-1)*limit]),
      pool.query("SELECT DISTINCT linh_vuc_hoat_dong AS value FROM doanh_nghiep WHERE NULLIF(TRIM(linh_vuc_hoat_dong),'') IS NOT NULL ORDER BY value"),
    ]);
    const total=count.rows[0].total;
    res.json({success:true,data:records.rows,pagination:{page,limit,total,totalPages:Math.ceil(total/limit)},filters:{linhVuc:options.rows.map(x=>x.value)}});
  }catch(error){errorResponse(res,error);}
}
async function detail(req,res) {
  try{const companyId=id(req.params.id);const record=await readCompany(pool,companyId);record.canBoHuongDan=await readSupervisors(pool,companyId);res.json({success:true,data:record});}
  catch(error){errorResponse(res,error);}
}
async function create(req,res) {
  try {
    const d=validate(req.body,companySpec);
    const result=await pool.query(`INSERT INTO doanh_nghiep (ten_doanh_nghiep,dia_chi,so_dien_thoai,email,linh_vuc_hoat_dong,nguoi_dai_dien) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,[d.tenDoanhNghiep,d.diaChi,d.soDienThoai,d.email,d.linhVucHoatDong,d.nguoiDaiDien]);
    res.status(201).json({success:true,data:{id:result.rows[0].id},message:'Thêm doanh nghiệp thành công.'});
  }catch(error){errorResponse(res,error);}
}
async function update(req,res) {
  try {
    const companyId=id(req.params.id),d=validate(req.body,companySpec);
    const result=await pool.query(`UPDATE doanh_nghiep SET ten_doanh_nghiep=$1,dia_chi=$2,so_dien_thoai=$3,email=$4,linh_vuc_hoat_dong=$5,nguoi_dai_dien=$6,ngay_cap_nhat=NOW() WHERE id=$7 RETURNING id`,[d.tenDoanhNghiep,d.diaChi,d.soDienThoai,d.email,d.linhVucHoatDong,d.nguoiDaiDien,companyId]);
    if(!result.rows.length)throw fail(404,'Không tìm thấy doanh nghiệp.');
    res.json({success:true,data:{id:companyId},message:'Cập nhật doanh nghiệp thành công.'});
  }catch(error){errorResponse(res,error);}
}
async function remove(req,res) {
  try {
    const companyId=id(req.params.id);
    await transaction(async client=>{
      await requireCompany(client,companyId,true);
      // Lock child rows as well so new registrations cannot race the checks.
      await client.query('SELECT id FROM can_bo_huong_dan WHERE doanh_nghiep_id=$1 ORDER BY id FOR UPDATE',[companyId]);
      const used=await client.query(`SELECT dk.id FROM dang_ky_thuc_tap dk WHERE dk.doanh_nghiep_id=$1
        OR dk.can_bo_huong_dan_id IN (SELECT id FROM can_bo_huong_dan WHERE doanh_nghiep_id=$1) LIMIT 1`,[companyId]);
      if(used.rows.length)throw fail(409,companyConflict);
      await client.query('DELETE FROM can_bo_huong_dan WHERE doanh_nghiep_id=$1',[companyId]);
      await client.query('DELETE FROM doanh_nghiep WHERE id=$1',[companyId]);
    });
    res.json({success:true,message:'Xóa doanh nghiệp thành công.'});
  }catch(error){errorResponse(res,error);}
}
async function supervisors(req,res) {
  try{const companyId=id(req.params.companyId);await requireCompany(pool,companyId);res.json({success:true,data:await readSupervisors(pool,companyId)});}
  catch(error){errorResponse(res,error);}
}
async function saveSupervisor(req,res) {
  try {
    const companyId=id(req.params.companyId),supervisorId=req.params.supervisorId?id(req.params.supervisorId):null;
    const d=validate(req.body,supervisorSpec);
    const record=await transaction(async client=>{
      await requireCompany(client,companyId,true);
      const result=supervisorId
        ?await client.query(`UPDATE can_bo_huong_dan SET ho_ten=$1,chuc_vu=$2,email=$3,so_dien_thoai=$4,ngay_cap_nhat=NOW() WHERE id=$5 AND doanh_nghiep_id=$6 RETURNING ${supervisorFields}`,[d.hoTen,d.chucVu,d.email,d.soDienThoai,supervisorId,companyId])
        :await client.query(`INSERT INTO can_bo_huong_dan (ho_ten,chuc_vu,email,so_dien_thoai,doanh_nghiep_id) VALUES ($1,$2,$3,$4,$5) RETURNING ${supervisorFields}`,[d.hoTen,d.chucVu,d.email,d.soDienThoai,companyId]);
      if(!result.rows.length)throw fail(404,'Không tìm thấy cán bộ hướng dẫn thuộc doanh nghiệp này.');
      return result.rows[0];
    });
    res.status(supervisorId?200:201).json({success:true,data:record,message:'Lưu cán bộ hướng dẫn thành công.'});
  }catch(error){errorResponse(res,error,supervisorConflict);}
}
async function removeSupervisor(req,res) {
  try {
    const companyId=id(req.params.companyId),supervisorId=id(req.params.supervisorId);
    await transaction(async client=>{
      await requireCompany(client,companyId,true);
      const record=await client.query('SELECT id FROM can_bo_huong_dan WHERE id=$1 AND doanh_nghiep_id=$2 FOR UPDATE',[supervisorId,companyId]);
      if(!record.rows.length)throw fail(404,'Không tìm thấy cán bộ hướng dẫn thuộc doanh nghiệp này.');
      const used=await client.query('SELECT id FROM dang_ky_thuc_tap WHERE can_bo_huong_dan_id=$1 LIMIT 1',[supervisorId]);
      if(used.rows.length)throw fail(409,supervisorConflict);
      await client.query('DELETE FROM can_bo_huong_dan WHERE id=$1 AND doanh_nghiep_id=$2',[supervisorId,companyId]);
    });
    res.json({success:true,message:'Xóa cán bộ hướng dẫn thành công.'});
  }catch(error){errorResponse(res,error,supervisorConflict);}
}
module.exports={list,detail,create,update,remove,supervisors,saveSupervisor,removeSupervisor};
