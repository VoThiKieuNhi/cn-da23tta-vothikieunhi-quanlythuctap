const { emailError, isValidPhone, passwordError, messages } = require('../utils/validators');
const validLecturerName = require('../utils/lecturerName');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const reference = require('../services/referenceService');

const fields = `gv.id, gv.ma_giang_vien AS "maGiangVien", gv.ho_ten AS "hoTen", nd.email,
  gv.so_dien_thoai AS "soDienThoai", gv.bo_mon AS "boMon", gv.hoc_vi AS "hocVi",
  nd.dang_hoat_dong AS "dangHoatDong", gv.ngay_tao AS "ngayTao",gv.danh_muc_giang_vien_id AS "danhMucGiangVienId",COALESCE(dm.khoa_don_vi,gv.bo_mon) AS "khoaDonVi",CASE WHEN dm.id IS NULL THEN gv.chuc_vu ELSE dm.chuc_vu END AS "chucVu",CASE WHEN dm.id IS NULL THEN gv.linh_vuc ELSE dm.linh_vuc END AS "linhVuc"`;
const joined = 'FROM giang_vien gv JOIN nguoi_dung nd ON nd.id = gv.nguoi_dung_id LEFT JOIN danh_muc_giang_vien_tvu dm ON dm.id=gv.danh_muc_giang_vien_id';
const fail = (status, message) => Object.assign(new Error(message), { status });
function idValue(value) {
  if (!/^[1-9]\d{0,18}$/.test(value || '') || BigInt(value) > 9223372036854775807n) throw fail(400, 'ID giảng viên không hợp lệ.');
  return value;
}
function input(body, creating) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'Dữ liệu không hợp lệ.');
  const referenceId = Object.hasOwn(body,'referenceLecturerId') ? body.referenceLecturerId : body.danhMucGiangVienId;
  const manual = referenceId == null || referenceId === '';
  const data = {};
  if (manual) body = {...body,boMon:body.khoaDonVi ?? body.boMon};
  for (const [key, max, required] of [['maGiangVien',30,true],['hoTen',150,manual],['email',150,true],['soDienThoai',20],['boMon',150],['hocVi',100],['chucVu',120],['linhVuc',5000]]) {
    const value = !manual && ['hoTen','boMon','hocVi','chucVu','linhVuc'].includes(key) ? null : body[key];
    if (value != null && typeof value !== 'string') throw fail(400, `Trường ${key} không hợp lệ.`);
    const text = (value || '').trim();
    if ((required && !text) || Array.from(text).length > max) throw fail(400, `Trường ${key} bắt buộc hoặc vượt quá ${max} ký tự.`);
    data[key] = text || null;
  }
  data.email = data.email.toLowerCase();
  if (emailError(data.email, 'GIANG_VIEN')) throw fail(400, 'Email giảng viên phải sử dụng tên miền @tvu.edu.vn.');
  if (data.soDienThoai && !isValidPhone(data.soDienThoai)) throw fail(400, messages.phone);
  data.danhMucGiangVienId = manual ? null : reference.id(referenceId);
  if(manual && !validLecturerName(data.hoTen)) throw fail(400,'Họ tên phải có ít nhất 2 từ, chỉ gồm chữ và khoảng trắng, không chứa dữ liệu rác.');
  if(manual && !data.boMon) throw fail(400,'Vui lòng chọn hoặc nhập khoa / đơn vị.');
  if (creating) {
    if (passwordError(body.password)) throw fail(400, passwordError(body.password));
    data.password = body.password;
  } else {
    if (typeof body.dangHoatDong !== 'boolean') throw fail(400, 'Trạng thái tài khoản không hợp lệ.');
    data.dangHoatDong = body.dangHoatDong;
  }
  return data;
}
function handleError(res, error) {
  if (error.status) return res.status(error.status).json({ success:false, message:error.message });
  if (error.code === '23505') return res.status(409).json({success:false,message:'Email hoặc mã giảng viên đã tồn tại.'});
  if (error.code === '23503') return res.status(409).json({success:false,message:'Không thể xóa giảng viên đã phát sinh dữ liệu hướng dẫn hoặc đánh giá.'});
  console.error('LECTURER ADMIN ERROR:', /^[0-9A-Z]{5}$/.test(error.code || '') ? error.code : 'DB_ERROR');
  return res.status(500).json({success:false,message:'Không thể xử lý dữ liệu giảng viên. Vui lòng thử lại.'});
}
async function transaction(work) {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
  catch (error) { try { await client.query('ROLLBACK'); } catch { /* preserve original error */ } throw error; }
  finally { client.release(); }
}
async function getRecord(client, id) {
  const {rows} = await client.query(`SELECT ${fields} ${joined} WHERE gv.id = $1 AND nd.vai_tro = $2`,[id,'GIANG_VIEN']);
  if (!rows.length) throw fail(404,'Không tìm thấy giảng viên.');
  return rows[0];
}
async function checkDuplicates(client, data, lecturerId = null, userId = null) {
  const email = await client.query('SELECT id FROM nguoi_dung WHERE LOWER(email) = $1 AND ($2::bigint IS NULL OR id <> $2)',[data.email,userId]);
  if (email.rows.length) throw fail(409,'Email đã tồn tại.');
  const code = await client.query('SELECT id FROM giang_vien WHERE ma_giang_vien = $1 AND ($2::bigint IS NULL OR id <> $2)',[data.maGiangVien,lecturerId]);
  if (code.rows.length) throw fail(409,'Mã giảng viên đã tồn tại.');
}
async function lockRecord(client, id) {
  const {rows} = await client.query(`SELECT gv.nguoi_dung_id ${joined} WHERE gv.id=$1 AND nd.vai_tro=$2 FOR UPDATE OF gv, nd`,[id,'GIANG_VIEN']);
  if (!rows.length) throw fail(404,'Không tìm thấy giảng viên.');
  return rows[0].nguoi_dung_id;
}

async function list(req,res) {
  try {
    const q=req.query;
    for(const key of ['page','limit','search','boMon','hocVi','trangThai']) if(q[key] !== undefined && typeof q[key] !== 'string') throw fail(400,'Bộ lọc không hợp lệ.');
    const page=Number(q.page || 1), limit=Number(q.limit || 10);
    if(!Number.isSafeInteger(page)||page<1||page>1000000||!Number.isInteger(limit)||limit<1||limit>100) throw fail(400,'Phân trang không hợp lệ.');
    const values=['GIANG_VIEN'], where=['nd.vai_tro=$1'];
    const bind=v=>{values.push(v);return `$${values.length}`;};
    if(q.search?.trim()) {
      if(q.search.length>200) throw fail(400,'Từ khóa quá dài.');
      const p=bind(`%${q.search.trim().replace(/[\\%_]/g,'\\$&')}%`);
      where.push(`(gv.ma_giang_vien ILIKE ${p} OR gv.ho_ten ILIKE ${p} OR nd.email ILIKE ${p})`);
    }
    if(q.boMon) where.push(`gv.bo_mon=${bind(q.boMon)}`);
    if(q.hocVi) where.push(`gv.hoc_vi=${bind(q.hocVi)}`);
    if(q.trangThai) { if(!['true','false'].includes(q.trangThai)) throw fail(400,'Trạng thái không hợp lệ.'); where.push(`nd.dang_hoat_dong=${bind(q.trangThai==='true')}`); }
    const filter=where.join(' AND ');
    const [count,records,options]=await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total ${joined} WHERE ${filter}`,values),
      pool.query(`SELECT ${fields} ${joined} WHERE ${filter} ORDER BY gv.ngay_tao DESC, gv.id DESC LIMIT $${values.length+1} OFFSET $${values.length+2}`,[...values,limit,(page-1)*limit]),
      pool.query(`SELECT COALESCE(array_agg(DISTINCT gv.bo_mon ORDER BY gv.bo_mon) FILTER (WHERE NULLIF(TRIM(gv.bo_mon),'') IS NOT NULL), ARRAY[]::varchar[]) AS "boMon",
        COALESCE(array_agg(DISTINCT gv.hoc_vi ORDER BY gv.hoc_vi) FILTER (WHERE NULLIF(TRIM(gv.hoc_vi),'') IS NOT NULL), ARRAY[]::varchar[]) AS "hocVi" ${joined} WHERE nd.vai_tro=$1`,['GIANG_VIEN']),
    ]);
    const total=count.rows[0].total;
    res.json({success:true,data:records.rows,pagination:{page,limit,total,totalPages:Math.ceil(total/limit)},filters:options.rows[0]});
  } catch(error) { handleError(res,error); }
}
async function detail(req,res) {
  try { res.json({success:true,data:await getRecord(pool,idValue(req.params.id))}); }
  catch(error){handleError(res,error);}
}
async function create(req,res) {
  try {
    const d=input(req.body,true);const hash=await bcrypt.hash(d.password,12);
    const record=await transaction(async client=>{
      if(d.danhMucGiangVienId) await reference.applyLecturer(client,d);
      await checkDuplicates(client,d);
      const account=await client.query('INSERT INTO nguoi_dung (email,mat_khau_hash,vai_tro,dang_hoat_dong) VALUES ($1,$2,$3,$4) RETURNING id',[d.email,hash,'GIANG_VIEN',true]);
      const lecturer=await client.query(`INSERT INTO giang_vien (nguoi_dung_id,ma_giang_vien,ho_ten,so_dien_thoai,bo_mon,hoc_vi,danh_muc_giang_vien_id,chuc_vu,linh_vuc)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,[account.rows[0].id,d.maGiangVien,d.hoTen,d.soDienThoai,d.boMon,d.hocVi,d.danhMucGiangVienId,d.chucVu,d.linhVuc]);
      return getRecord(client,lecturer.rows[0].id);
    });
    res.status(201).json({success:true,data:record,message:'Thêm giảng viên thành công.'});
  }catch(error){handleError(res,error);}
}
async function update(req,res) {
  try {
    const id=idValue(req.params.id),d=input(req.body,false);
    const record=await transaction(async client=>{
      const userId=await lockRecord(client,id);await checkDuplicates(client,d,id,userId);
      if(d.danhMucGiangVienId) await reference.applyLecturer(client,d);
      await client.query('UPDATE nguoi_dung SET email=$1,dang_hoat_dong=$2,ngay_cap_nhat=NOW() WHERE id=$3',[d.email,d.dangHoatDong,userId]);
      await client.query(`UPDATE giang_vien SET ma_giang_vien=$1,ho_ten=$2,so_dien_thoai=$3,bo_mon=$4,hoc_vi=$5,danh_muc_giang_vien_id=$7,chuc_vu=$8,linh_vuc=$9,ngay_cap_nhat=NOW() WHERE id=$6`,[d.maGiangVien,d.hoTen,d.soDienThoai,d.boMon,d.hocVi,id,d.danhMucGiangVienId,d.chucVu,d.linhVuc]);
      return getRecord(client,id);
    });
    res.json({success:true,data:record,message:'Cập nhật giảng viên thành công.'});
  }catch(error){handleError(res,error);}
}
async function remove(req,res) {
  try {
    const id=idValue(req.params.id);
    await transaction(async client=>{
      const userId=await lockRecord(client,id);
      const related=await client.query('SELECT id FROM phan_cong_giang_vien WHERE giang_vien_id=$1 UNION ALL SELECT id FROM danh_gia_thuc_tap WHERE giang_vien_id=$1 LIMIT 1',[id]);
      if(related.rows.length) throw fail(409,'Không thể xóa giảng viên đã phát sinh dữ liệu hướng dẫn hoặc đánh giá.');
      await client.query('DELETE FROM giang_vien WHERE id=$1',[id]);
      await client.query('DELETE FROM nguoi_dung WHERE id=$1 AND vai_tro=$2',[userId,'GIANG_VIEN']);
    });
    res.json({success:true,message:'Xóa giảng viên thành công.'});
  }catch(error){handleError(res,error);}
}
module.exports={list,detail,create,update,remove};
