const pool = require('../config/database');
const { evaluationInput } = require('../utils/evaluationRules');
const fail = (status, message) => Object.assign(new Error(message), { status });
const reportNotApproved = 'Chưa thể đánh giá vì báo cáo thực tập chưa được duyệt.';
const evaluationFields = `dg.id,dg.diem_chuyen_mon::float8 AS "diemChuyenMon",dg.diem_thai_do::float8 AS "diemThaiDo",dg.diem_bao_cao::float8 AS "diemBaoCao",dg.diem_tong::float8 AS "diemTong",dg.nhan_xet AS "nhanXet",dg.ngay_danh_gia AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "ngayDanhGia"`;
const reportFields = `bc.id,bc.ten_bao_cao AS "tenBaoCao",bc.ngay_nop AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "ngayNop",bc.trang_thai AS "trangThai"`;
const baseJoin = `FROM phan_cong_giang_vien pc JOIN giang_vien gv ON gv.id=pc.giang_vien_id JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id`;
const profileFields = `dk.id AS "registrationId",dk.trang_thai AS "trangThai",sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",sv.lop,sv.nganh,dn.ten_doanh_nghiep AS "tenDoanhNghiep",dk.vi_tri_thuc_tap AS "viTriThucTap",to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc",gv.ho_ten AS "giangVienHuongDan"`;
const approved = status => ['DA_DUYET','DANG_THUC_TAP','HOAN_THANH'].includes(status);
function id(value) { const v = String(value ?? ''); if (!/^[1-9]\d{0,18}$/.test(v) || BigInt(v) > 9223372036854775807n) throw fail(400,'ID đăng ký không hợp lệ.'); return v; }
function errorResponse(res, error) {
  if (error.status) return res.status(error.status).json({ success:false,message:error.message });
  if (error.code === '23505') return res.status(409).json({ success:false,message:'Sinh viên đã được đánh giá.' });
  console.error('EVALUATION ERROR:',/^[0-9A-Z]{5}$/.test(error.code || '') ? error.code : 'DB_ERROR');
  res.status(500).json({ success:false,message:'Không thể xử lý kết quả đánh giá. Vui lòng thử lại.' });
}
async function transaction(work) {
  const c = await pool.connect();
  try { await c.query('BEGIN'); await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'"); const result = await work(c); await c.query('COMMIT'); return result; }
  catch (error) { await c.query('ROLLBACK').catch(() => {}); throw error; } finally { c.release(); }
}
async function assigned(c, userId, registrationId, adminRead = false) {
  const row = (await c.query(`SELECT ${profileFields},gv.id AS "giangVienId" ${baseJoin} WHERE ${adminRead ? 'dk.id=$1' : 'gv.nguoi_dung_id=$1 AND dk.id=$2'} FOR UPDATE OF dk FOR SHARE OF pc`,adminRead ? [registrationId] : [userId,registrationId])).rows[0];
  if (!row) throw fail(403,'Bạn không được phân công hướng dẫn sinh viên này.');
  return row;
}
async function getEvaluation(c, registrationId) { return (await c.query(`SELECT ${evaluationFields} FROM danh_gia_thuc_tap dg WHERE dg.dang_ky_thuc_tap_id=$1`,[registrationId])).rows[0] || null; }
async function getReport(c, registrationId) { return (await c.query(`SELECT ${reportFields} FROM bao_cao_thuc_tap bc WHERE bc.dang_ky_thuc_tap_id=$1 FOR UPDATE OF bc`,[registrationId])).rows[0] || null; }
function detailShape(row, report, evaluation, progressSummary) {
  return { student:{ maSinhVien:row.maSinhVien,hoTen:row.hoTen,lop:row.lop,nganh:row.nganh }, internship:{ tenDoanhNghiep:row.tenDoanhNghiep,viTriThucTap:row.viTriThucTap,ngayBatDau:row.ngayBatDau,ngayKetThuc:row.ngayKetThuc,giangVienHuongDan:row.giangVienHuongDan }, report,evaluation,progressSummary,canEvaluate:approved(row.trangThai) && report?.trangThai === 'DA_DUYET' };
}
async function list(req,res) {
  try {
    const search = req.query.search ?? '', status = req.query.trangThaiDanhGia ?? '';
    if (typeof search !== 'string' || search.length > 200 || typeof status !== 'string' || status && !['CHUA_DANH_GIA','DA_DANH_GIA'].includes(status)) throw fail(400,'Bộ lọc đánh giá không hợp lệ.');
    const pattern = '%' + search.trim().replace(/[\\%_]/g,'\\$&') + '%';
    const viewerId = req.user.vaiTro === 'ADMIN' ? null : req.user.id;
    const joins = `${baseJoin} LEFT JOIN bao_cao_thuc_tap bc ON bc.dang_ky_thuc_tap_id=dk.id LEFT JOIN danh_gia_thuc_tap dg ON dg.dang_ky_thuc_tap_id=dk.id`;
    const result = await pool.query(`SELECT ${profileFields},
      CASE WHEN bc.id IS NULL THEN NULL ELSE json_build_object('id',bc.id::text,'tenBaoCao',bc.ten_bao_cao,'trangThai',bc.trang_thai) END AS "baoCao",
      CASE WHEN dg.id IS NULL THEN NULL ELSE json_build_object('diemChuyenMon',dg.diem_chuyen_mon,'diemThaiDo',dg.diem_thai_do,'diemBaoCao',dg.diem_bao_cao,'diemTong',dg.diem_tong,'nhanXet',dg.nhan_xet,'ngayDanhGia',dg.ngay_danh_gia AT TIME ZONE 'Asia/Ho_Chi_Minh') END AS evaluation
      ${joins} WHERE ($1::bigint IS NULL OR gv.nguoi_dung_id=$1) AND ($2='' OR CASE WHEN dg.id IS NULL THEN 'CHUA_DANH_GIA' ELSE 'DA_DANH_GIA' END=$2)
      AND (sv.ma_sinh_vien ILIKE $3 OR sv.ho_ten ILIKE $3 OR dn.ten_doanh_nghiep ILIKE $3) ORDER BY sv.ho_ten,dk.id`,[viewerId,status,pattern]);
    const stats = (await pool.query(`SELECT COUNT(*)::int AS "tongSinhVien",COUNT(*) FILTER (WHERE dg.id IS NULL)::int AS "chuaDanhGia",COUNT(dg.id)::int AS "daDanhGia",ROUND(AVG(dg.diem_tong),2)::float8 AS "diemTrungBinh" ${joins} WHERE ($1::bigint IS NULL OR gv.nguoi_dung_id=$1)`,[viewerId])).rows[0];
    const data = result.rows.map(row => {
      const eligibleForEvaluation = approved(row.trangThai) && row.baoCao?.trangThai === 'DA_DUYET';
      return { ...row,trangThaiDanhGia:row.evaluation ? 'DA_DANH_GIA' : 'CHUA_DANH_GIA',eligibleForEvaluation,canEvaluate:viewerId !== null && eligibleForEvaluation };
    });
    res.json({ success:true,data,stats });
  } catch (error) { errorResponse(res,error); }
}
async function detail(req,res) {
  try { const data = await transaction(async c => {
    const row = await assigned(c,req.user.id,id(req.params.registrationId),req.user.vaiTro === 'ADMIN');
    const report = await getReport(c,row.registrationId), evaluation = await getEvaluation(c,row.registrationId);
    const summary = (await c.query(`SELECT COUNT(*)::int AS "tongSoTuanDaCapNhat",COUNT(*) FILTER (WHERE NULLIF(TRIM(nhan_xet_giang_vien),'') IS NOT NULL)::int AS "soTuanDaNhanXet" FROM tien_do_thuc_tap WHERE dang_ky_thuc_tap_id=$1`,[row.registrationId])).rows[0];
    const data = detailShape(row,report,evaluation,summary);
    if (req.user.vaiTro === 'ADMIN') data.canEvaluate = false;
    return data;
  }); res.json({ success:true,...data }); } catch (error) { errorResponse(res,error); }
}
async function write(req,res) {
  try {
    const registrationId = id(req.params.registrationId), values = evaluationInput(req.body), create = req.method === 'POST';
    const data = await transaction(async c => {
      // Serialize with assignment/report updates on the registration, then lock the report.
      const row = await assigned(c,req.user.id,registrationId);
      if (!approved(row.trangThai)) throw fail(409,'Đăng ký thực tập chưa được duyệt.');
      const report = await getReport(c,registrationId);
      if (report?.trangThai !== 'DA_DUYET') throw fail(409,reportNotApproved);
      const existing = await getEvaluation(c,registrationId);
      if (create && existing) throw fail(409,'Sinh viên đã được đánh giá.');
      if (!create && !existing) throw fail(404,'Chưa có kết quả đánh giá để chỉnh sửa.');
      const params = [registrationId,row.giangVienId,values.diemChuyenMon,values.diemThaiDo,values.diemBaoCao,values.diemTong,values.nhanXet];
      const result = create
        ? await c.query(`INSERT INTO danh_gia_thuc_tap AS dg (dang_ky_thuc_tap_id,giang_vien_id,diem_chuyen_mon,diem_thai_do,diem_bao_cao,diem_tong,nhan_xet,ngay_danh_gia) VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP) RETURNING ${evaluationFields}`,params)
        : await c.query(`UPDATE danh_gia_thuc_tap AS dg SET giang_vien_id=$2,diem_chuyen_mon=$3,diem_thai_do=$4,diem_bao_cao=$5,diem_tong=$6,nhan_xet=$7,ngay_danh_gia=CURRENT_TIMESTAMP,ngay_cap_nhat=CURRENT_TIMESTAMP WHERE dg.dang_ky_thuc_tap_id=$1 RETURNING ${evaluationFields}`,params);
      if (create) await c.query("UPDATE dang_ky_thuc_tap SET trang_thai='HOAN_THANH',ngay_cap_nhat=CURRENT_TIMESTAMP WHERE id=$1",[registrationId]);
      return result.rows[0];
    }); res.status(create ? 201 : 200).json({ success:true,data,message:'Đã lưu kết quả đánh giá.' });
  } catch (error) { errorResponse(res,error); }
}
async function student(req,res) {
  try { const data = await transaction(async c => {
    const profile = (await c.query(`SELECT id,ma_sinh_vien AS "maSinhVien",ho_ten AS "hoTen",lop,nganh FROM sinh_vien WHERE nguoi_dung_id=$1`,[req.user.id])).rows[0];
    if (!profile) throw fail(403,'Tài khoản chưa có hồ sơ sinh viên.');
    const row = (await c.query(`SELECT dk.id AS "registrationId",dn.ten_doanh_nghiep AS "tenDoanhNghiep",dk.vi_tri_thuc_tap AS "viTriThucTap",to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc",gv.ho_ten AS "giangVienHuongDan" FROM dang_ky_thuc_tap dk JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id LEFT JOIN phan_cong_giang_vien pc ON pc.dang_ky_thuc_tap_id=dk.id LEFT JOIN giang_vien gv ON gv.id=pc.giang_vien_id WHERE dk.sinh_vien_id=$1 ORDER BY dk.ngay_tao DESC,dk.id DESC LIMIT 1`,[profile.id])).rows[0] || null;
    const evaluation = row ? await getEvaluation(c,row.registrationId) : null;
    const { id: _id,...student } = profile;
    return { student,internship:row,evaluation };
  }); res.json({ success:true,...data }); } catch (error) { errorResponse(res,error); }
}
module.exports = { list,detail,write,student };
