const { emailError, isValidPhone, passwordError, messages } = require('../utils/validators');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const reference = require('../services/referenceService');
const validName = require('../utils/lecturerName');

const fields = `sv.id, sv.ma_sinh_vien AS "maSinhVien", sv.ho_ten AS "hoTen", nd.email,
  to_char(sv.ngay_sinh, 'YYYY-MM-DD') AS "ngaySinh", sv.gioi_tinh AS "gioiTinh",
  sv.so_dien_thoai AS "soDienThoai", sv.lop, sv.nganh, sv.khoa_hoc AS "khoaHoc",
  nd.dang_hoat_dong AS "dangHoatDong", sv.ngay_tao AS "ngayTao"`;
const joined = 'FROM sinh_vien sv JOIN nguoi_dung nd ON nd.id = sv.nguoi_dung_id';
const fail = (status, message) => Object.assign(new Error(message), { status });
function idValue(value) {
  if (!/^[1-9]\d{0,18}$/.test(value || '') || BigInt(value) > 9223372036854775807n) throw fail(400, 'ID sinh viên không hợp lệ.');
  return value;
}
function input(body, creating) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'Dữ liệu không hợp lệ.');
  const data = {};
  for (const [key, max, required] of [['maSinhVien',30,true],['hoTen',150,true],['email',150,true],['soDienThoai',20],['lop',50],['nganh',150],['khoaHoc',50]]) {
    const value = body[key];
    if (value != null && typeof value !== 'string') throw fail(400, `Trường ${key} không hợp lệ.`);
    const text = (value || '').trim();
    if ((required && !text) || Array.from(text).length > max) throw fail(400, `Trường ${key} bắt buộc hoặc vượt quá ${max} ký tự.`);
    data[key] = text || null;
  }
  data.email = data.email.toLowerCase();
  if (!validName(data.hoTen)) throw fail(400,'Họ tên phải gồm ít nhất 2 từ, chỉ có chữ và khoảng trắng.');
  if (emailError(data.email, 'SINH_VIEN')) throw fail(400, emailError(data.email, 'SINH_VIEN'));
  if (data.soDienThoai && !isValidPhone(data.soDienThoai)) throw fail(400, messages.phone);
  reference.studentIdentity(data);
  data.gioiTinh = body.gioiTinh || null;
  if (data.gioiTinh && !['NAM','NU','KHAC'].includes(data.gioiTinh)) throw fail(400, 'Giới tính không hợp lệ.');
  data.ngaySinh = body.ngaySinh || null;
  if (data.ngaySinh) {
    const date = new Date(data.ngaySinh);
    if (typeof data.ngaySinh !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.ngaySinh) ||
      !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== data.ngaySinh || date > new Date() || data.ngaySinh < '0001-01-01') throw fail(400, 'Ngày sinh không hợp lệ.');
  }
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
  if (error.code === '23505') return res.status(409).json({success:false,message:'Email hoặc mã sinh viên đã tồn tại.'});
  if (error.code === '23503') return res.status(409).json({success:false,message:'Không thể xóa sinh viên đã phát sinh dữ liệu thực tập.'});
  console.error('STUDENT ADMIN ERROR:', /^[0-9A-Z]{5}$/.test(error.code || '') ? error.code : 'DB_ERROR');
  return res.status(500).json({success:false,message:'Không thể xử lý dữ liệu sinh viên. Vui lòng thử lại.'});
}
async function transaction(work) {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
  catch (error) { try { await client.query('ROLLBACK'); } catch { /* preserve original error */ } throw error; }
  finally { client.release(); }
}
async function getRecord(client, id) {
  const {rows} = await client.query(`SELECT ${fields} ${joined} WHERE sv.id = $1 AND nd.vai_tro = $2`,[id,'SINH_VIEN']);
  if (!rows.length) throw fail(404,'Không tìm thấy sinh viên.');
  return rows[0];
}
async function checkDuplicates(client, data, studentId = null, userId = null) {
  const email = await client.query('SELECT id FROM nguoi_dung WHERE LOWER(email) = $1 AND ($2::bigint IS NULL OR id <> $2)',[data.email,userId]);
  if (email.rows.length) throw fail(409,'Email đã tồn tại.');
  const code = await client.query('SELECT id FROM sinh_vien WHERE ma_sinh_vien = $1 AND ($2::bigint IS NULL OR id <> $2)',[data.maSinhVien,studentId]);
  if (code.rows.length) throw fail(409,'Mã sinh viên đã tồn tại.');
}
async function lockRecord(client, id) {
  const {rows} = await client.query(`SELECT sv.nguoi_dung_id ${joined} WHERE sv.id=$1 AND nd.vai_tro=$2 FOR UPDATE OF sv, nd`,[id,'SINH_VIEN']);
  if (!rows.length) throw fail(404,'Không tìm thấy sinh viên.');
  return rows[0].nguoi_dung_id;
}

async function list(req,res) {
  try {
    const q=req.query;
    for(const key of ['page','limit','search','nganh','lop','trangThai']) if(q[key] !== undefined && typeof q[key] !== 'string') throw fail(400,'Bộ lọc không hợp lệ.');
    const page=Number(q.page || 1), limit=Number(q.limit || 10);
    if(!Number.isSafeInteger(page)||page<1||page>1000000||!Number.isInteger(limit)||limit<1||limit>100) throw fail(400,'Phân trang không hợp lệ.');
    const values=['SINH_VIEN'], where=['nd.vai_tro=$1'];
    const bind=v=>{values.push(v);return `$${values.length}`;};
    if(q.search?.trim()) {
      if(q.search.length>200) throw fail(400,'Từ khóa quá dài.');
      const p=bind(`%${q.search.trim().replace(/[\\%_]/g,'\\$&')}%`);
      where.push(`(sv.ma_sinh_vien ILIKE ${p} OR sv.ho_ten ILIKE ${p} OR nd.email ILIKE ${p})`);
    }
    if(q.nganh) where.push(`sv.nganh=${bind(q.nganh)}`);
    if(q.lop) where.push(`sv.lop=${bind(q.lop)}`);
    if(q.trangThai) { if(!['true','false'].includes(q.trangThai)) throw fail(400,'Trạng thái không hợp lệ.'); where.push(`nd.dang_hoat_dong=${bind(q.trangThai==='true')}`); }
    const filter=where.join(' AND ');
    const [count,records,options]=await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total ${joined} WHERE ${filter}`,values),
      pool.query(`SELECT ${fields} ${joined} WHERE ${filter} ORDER BY sv.ngay_tao DESC, sv.id DESC LIMIT $${values.length+1} OFFSET $${values.length+2}`,[...values,limit,(page-1)*limit]),
      pool.query(`SELECT COALESCE(array_agg(DISTINCT sv.nganh ORDER BY sv.nganh) FILTER (WHERE NULLIF(TRIM(sv.nganh),'') IS NOT NULL), ARRAY[]::varchar[]) AS nganh,
        COALESCE(array_agg(DISTINCT sv.lop ORDER BY sv.lop) FILTER (WHERE NULLIF(TRIM(sv.lop),'') IS NOT NULL), ARRAY[]::varchar[]) AS lop ${joined} WHERE nd.vai_tro=$1`,['SINH_VIEN']),
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
      await reference.validateStudent(client,d);
      await checkDuplicates(client,d);
      const account=await client.query('INSERT INTO nguoi_dung (email,mat_khau_hash,vai_tro,dang_hoat_dong) VALUES ($1,$2,$3,$4) RETURNING id',[d.email,hash,'SINH_VIEN',true]);
      const student=await client.query(`INSERT INTO sinh_vien (nguoi_dung_id,ma_sinh_vien,ho_ten,ngay_sinh,gioi_tinh,so_dien_thoai,lop,nganh,khoa_hoc)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,[account.rows[0].id,d.maSinhVien,d.hoTen,d.ngaySinh,d.gioiTinh,d.soDienThoai,d.lop,d.nganh,d.khoaHoc]);
      return getRecord(client,student.rows[0].id);
    });
    res.status(201).json({success:true,data:record,message:'Thêm sinh viên thành công.'});
  }catch(error){handleError(res,error);}
}
async function update(req,res) {
  try {
    const id=idValue(req.params.id),d=input(req.body,false);
    const record=await transaction(async client=>{
      const userId=await lockRecord(client,id);await checkDuplicates(client,d,id,userId);
      await reference.validateStudent(client,d);
      await client.query('UPDATE nguoi_dung SET email=$1,dang_hoat_dong=$2,ngay_cap_nhat=NOW() WHERE id=$3',[d.email,d.dangHoatDong,userId]);
      await client.query(`UPDATE sinh_vien SET ma_sinh_vien=$1,ho_ten=$2,ngay_sinh=$3,gioi_tinh=$4,so_dien_thoai=$5,lop=$6,nganh=$7,khoa_hoc=$8,ngay_cap_nhat=NOW() WHERE id=$9`,[d.maSinhVien,d.hoTen,d.ngaySinh,d.gioiTinh,d.soDienThoai,d.lop,d.nganh,d.khoaHoc,id]);
      return getRecord(client,id);
    });
    res.json({success:true,data:record,message:'Cập nhật sinh viên thành công.'});
  }catch(error){handleError(res,error);}
}
async function remove(req,res) {
  try {
    const id=idValue(req.params.id);
    await transaction(async client=>{
      const userId=await lockRecord(client,id);
      const related=await client.query('SELECT id FROM dang_ky_thuc_tap WHERE sinh_vien_id=$1 LIMIT 1',[id]);
      if(related.rows.length) throw fail(409,'Không thể xóa sinh viên đã phát sinh dữ liệu thực tập.');
      await client.query('DELETE FROM sinh_vien WHERE id=$1',[id]);
      await client.query('DELETE FROM nguoi_dung WHERE id=$1 AND vai_tro=$2',[userId,'SINH_VIEN']);
    });
    res.json({success:true,message:'Xóa sinh viên thành công.'});
  }catch(error){handleError(res,error);}
}
module.exports={list,detail,create,update,remove};
