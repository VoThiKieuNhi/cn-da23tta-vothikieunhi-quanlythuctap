const pool = require('../config/database');
const files = require('../services/reportFiles');
const fail = (status, message) => Object.assign(new Error(message), { status });
const fields = `bc.id,bc.dang_ky_thuc_tap_id AS "registrationId",bc.ten_bao_cao AS "tenBaoCao",bc.ten_file AS "tenFile",
 bc.ngay_nop AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "ngayNop",bc.trang_thai AS "trangThai",
 bc.ngay_cap_nhat AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "ngayCapNhat",bc.nhan_xet_giang_vien AS "nhanXetGiangVien"`;
const privateFields = `${fields},bc.duong_dan_file AS "storedPath"`;
function id(value) { const v = String(value ?? ''); if (!/^[1-9]\d{0,18}$/.test(v) || BigInt(v) > 9223372036854775807n) throw fail(400, 'ID không hợp lệ.'); return v; }
function text(value, label, max) { if (typeof value !== 'string' || !value.trim()) throw fail(400, `${label} bắt buộc.`); if (Array.from(value.trim()).length > max) throw fail(400, `${label} tối đa ${max} ký tự.`); return value.trim(); }
function safe(row) { if (!row) return null; const { storedPath: _path, ...data } = row; return data; }
function errorResponse(res, error) {
  if (res.headersSent) return;
  if (error.status) return res.status(error.status).json({ success: false, message: error.message });
  if (error.code === '23505') return res.status(409).json({ success: false, message: 'Bạn đã nộp báo cáo thực tập.' });
  console.error('REPORT ERROR:', /^[0-9A-Z]{5}$/.test(error.code || '') ? error.code : 'SERVER_ERROR');
  res.status(500).json({ success: false, message: 'Không thể xử lý báo cáo thực tập. Vui lòng thử lại.' });
}
async function transaction(work) {
  const c = await pool.connect();
  try { await c.query('BEGIN'); await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'"); const data = await work(c); await c.query('COMMIT'); return data; }
  catch (error) { await c.query('ROLLBACK').catch(() => {}); throw error; }
  finally { c.release(); }
}
async function studentRegistration(c, userId, registrationId) {
  const row = (await c.query(`SELECT dk.id,dk.trang_thai AS "trangThai",dn.ten_doanh_nghiep AS "tenDoanhNghiep",
   to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc"
   FROM dang_ky_thuc_tap dk JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id
   WHERE sv.nguoi_dung_id=$1 ${registrationId ? 'AND dk.id=$2' : ''} ORDER BY dk.ngay_tao DESC,dk.id DESC LIMIT 1 FOR UPDATE OF dk`, registrationId ? [userId, registrationId] : [userId])).rows[0];
  if (!row) return null;
  const teacher = (await c.query(`SELECT gv.ho_ten FROM phan_cong_giang_vien pc JOIN giang_vien gv ON gv.id=pc.giang_vien_id WHERE pc.dang_ky_thuc_tap_id=$1 FOR SHARE OF pc`, [row.id])).rows[0];
  row.giangVienHuongDan = teacher?.ho_ten || null;
  return row;
}
function permission(reg) {
  if (!reg) return 'Bạn chưa có đăng ký thực tập.';
  if (!['DA_DUYET', 'DANG_THUC_TAP', 'HOAN_THANH'].includes(reg.trangThai)) return 'Đăng ký thực tập chưa được duyệt.';
  if (!reg.giangVienHuongDan) return 'Bạn chưa được phân công giảng viên hướng dẫn.';
  const start = Date.parse(reg.ngayBatDau + 'T00:00:00+07:00');
  if (!Number.isFinite(start)) return 'Ngày bắt đầu thực tập không hợp lệ.';
  if (Date.now() < start) return 'Đợt thực tập chưa bắt đầu.';
  // No report deadline exists yet: submissions remain possible after the internship end date.
  return null;
}
async function ownReport(c, userId, reportId) {
  const owner = (await c.query(`SELECT bc.dang_ky_thuc_tap_id FROM bao_cao_thuc_tap bc JOIN dang_ky_thuc_tap dk ON dk.id=bc.dang_ky_thuc_tap_id JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id WHERE bc.id=$1 AND sv.nguoi_dung_id=$2`, [reportId, userId])).rows[0];
  if (!owner) throw fail(404, 'Không tìm thấy báo cáo của bạn.');
  const reg = await studentRegistration(c, userId, owner.dang_ky_thuc_tap_id);
  if (!reg) throw fail(404, 'Không tìm thấy đăng ký của bạn.');
  const report = (await c.query(`SELECT ${privateFields} FROM bao_cao_thuc_tap bc WHERE bc.id=$1 AND bc.dang_ky_thuc_tap_id=$2 FOR UPDATE OF bc`, [reportId, reg.id])).rows[0];
  if (!report) throw fail(404, 'Không tìm thấy báo cáo của bạn.');
  return { reg, report };
}
function decorate(report, reg) {
  if (!report) return null;
  const allowed = !permission(reg);
  return { ...safe(report), canEdit: allowed && ['DA_NOP', 'CAN_CHINH_SUA'].includes(report.trangThai), canDelete: allowed && report.trangThai === 'DA_NOP' && !report.nhanXetGiangVien?.trim() };
}
async function studentList(req, res) {
  try { const result = await transaction(async c => {
    const reg = await studentRegistration(c, req.user.id);
    const report = reg ? (await c.query(`SELECT ${fields} FROM bao_cao_thuc_tap bc WHERE bc.dang_ky_thuc_tap_id=$1`, [reg.id])).rows[0] : null;
    return { registration: reg, report: decorate(report, reg), canSubmit: !report && !permission(reg), message: permission(reg) };
  }); res.json({ success: true, ...result }); } catch (error) { errorResponse(res, error); }
}
async function studentWrite(req, res) {
  let newPath, oldPath;
  try {
    const create = req.method === 'POST', remove = req.method === 'DELETE';
    const reportId = create ? null : id(req.params.id);
    const title = remove ? null : text(req.body?.tenBaoCao, 'Tiêu đề báo cáo', 255);
    if (create && !req.file) throw fail(400, 'Vui lòng chọn tệp báo cáo.');
    if (req.file) files.validate(req.file);
    const result = await transaction(async c => {
      let reg, report;
      if (create) reg = await studentRegistration(c, req.user.id);
      else ({ reg, report } = await ownReport(c, req.user.id, reportId));
      const reason = permission(reg); if (reason) throw fail(409, reason);
      if (create) {
        if ((await c.query('SELECT id FROM bao_cao_thuc_tap WHERE dang_ky_thuc_tap_id=$1', [reg.id])).rows.length) throw fail(409, 'Bạn đã nộp báo cáo thực tập.');
      } else if (remove) {
        // Keep the nonempty revision comment on resubmission as evidence of lecturer processing.
        if (report.trangThai !== 'DA_NOP' || report.nhanXetGiangVien?.trim()) throw fail(409, 'Không thể xóa báo cáo đã được giảng viên xử lý.');
        await c.query('DELETE FROM bao_cao_thuc_tap WHERE id=$1 AND dang_ky_thuc_tap_id=$2', [reportId, reg.id]);
        oldPath = report.storedPath; return { id: reportId };
      } else if (!['DA_NOP', 'CAN_CHINH_SUA'].includes(report.trangThai)) throw fail(409, 'Báo cáo đã duyệt không được chỉnh sửa.');
      const uploaded = req.file ? await files.save(req.file, reg.id) : null;
      newPath = uploaded?.stored;
      if (create) return (await c.query(`INSERT INTO bao_cao_thuc_tap AS bc (dang_ky_thuc_tap_id,ten_bao_cao,ten_file,duong_dan_file,ngay_nop,trang_thai) VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP,'DA_NOP') RETURNING ${fields}`, [reg.id, title, uploaded.name, uploaded.stored])).rows[0];
      if (uploaded) oldPath = report.storedPath;
      return (await c.query(`UPDATE bao_cao_thuc_tap AS bc SET ten_bao_cao=$1,ten_file=$2,duong_dan_file=$3,ngay_nop=CURRENT_TIMESTAMP,trang_thai='DA_NOP',ngay_cap_nhat=CURRENT_TIMESTAMP WHERE bc.id=$4 AND bc.dang_ky_thuc_tap_id=$5 RETURNING ${fields}`, [title, uploaded?.name || report.tenFile, uploaded?.stored || report.storedPath, reportId, reg.id])).rows[0];
    });
    // Commit the new database reference before removing the old file. Failed SQL removes only the new file.
    newPath = null;
    if (oldPath) await files.cleanup(oldPath);
    res.status(create ? 201 : 200).json({ success: true, data: result, message: remove ? 'Đã xóa báo cáo.' : 'Đã nộp báo cáo thực tập.' });
  } catch (error) { if (newPath) await files.cleanup(newPath); errorResponse(res, error); }
}
const lecturerJoin = `FROM bao_cao_thuc_tap bc JOIN dang_ky_thuc_tap dk ON dk.id=bc.dang_ky_thuc_tap_id JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id JOIN phan_cong_giang_vien pc ON pc.dang_ky_thuc_tap_id=dk.id JOIN giang_vien gv ON gv.id=pc.giang_vien_id`;
const studentFields = `sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",sv.lop,sv.nganh,dn.ten_doanh_nghiep AS "tenDoanhNghiep"`;
async function assignedReport(c, userId, reportId) {
  const row = (await c.query(`SELECT ${privateFields},${studentFields} ${lecturerJoin} WHERE gv.nguoi_dung_id=$1 AND bc.id=$2 FOR UPDATE OF dk,bc FOR SHARE OF pc`, [userId, reportId])).rows[0];
  if (!row) throw fail(403, 'Bạn không được phân công hướng dẫn sinh viên của báo cáo này.');
  return row;
}
async function lecturerList(req, res) {
  try {
    const search = req.query.search ?? '', status = req.query.trangThai ?? '';
    if (typeof search !== 'string' || search.length > 200 || typeof status !== 'string' || status && !['DA_NOP', 'CAN_CHINH_SUA', 'DA_DUYET'].includes(status)) throw fail(400, 'Bộ lọc báo cáo không hợp lệ.');
    const pattern = '%' + search.trim().replace(/[\\%_]/g, '\\$&') + '%';
    const result = await pool.query(`SELECT ${fields},${studentFields} ${lecturerJoin} WHERE gv.nguoi_dung_id=$1 AND ($2='' OR bc.trang_thai=$2) AND (sv.ma_sinh_vien ILIKE $3 OR sv.ho_ten ILIKE $3 OR bc.ten_bao_cao ILIKE $3) ORDER BY bc.ngay_nop DESC,bc.id DESC`, [req.user.id, status, pattern]);
    res.json({ success: true, data: result.rows });
  } catch (error) { errorResponse(res, error); }
}
async function lecturerDetail(req, res) {
  try { const data = await transaction(c => assignedReport(c, req.user.id, id(req.params.id))); res.json({ success: true, data: safe(data) }); }
  catch (error) { errorResponse(res, error); }
}
async function lecturerWrite(req, res) {
  try {
    const reportId = id(req.params.id), revision = req.path.endsWith('/request-revision');
    const comment = revision ? text(req.body?.nhanXet, 'Nhận xét', 20000) : null;
    const result = await transaction(async c => {
      const row = await assignedReport(c, req.user.id, reportId);
      if (row.trangThai !== 'DA_NOP') throw fail(409, 'Chỉ xử lý báo cáo đang ở trạng thái Đã nộp.');
      return (await c.query(`UPDATE bao_cao_thuc_tap AS bc SET trang_thai=$1,nhan_xet_giang_vien=COALESCE($2,nhan_xet_giang_vien),ngay_cap_nhat=CURRENT_TIMESTAMP WHERE bc.id=$3 RETURNING ${fields}`, [revision ? 'CAN_CHINH_SUA' : 'DA_DUYET', comment, reportId])).rows[0];
    }); res.json({ success: true, data: result, message: revision ? 'Đã gửi yêu cầu chỉnh sửa.' : 'Đã duyệt báo cáo.' });
  } catch (error) { errorResponse(res, error); }
}
async function download(req, res) {
  try {
    const row = await transaction(async c => req.user.vaiTro === 'SINH_VIEN' ? (await ownReport(c, req.user.id, id(req.params.id))).report : assignedReport(c, req.user.id, id(req.params.id)));
    let target;
    try { target = await files.resolveFile(row.storedPath); } catch (error) { if (error.code === 'ENOENT') throw fail(404, 'Tệp báo cáo không còn trên hệ thống.'); throw error; }
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' });
    res.download(target, row.tenFile, error => { if (error && !res.headersSent) errorResponse(res, fail(404, 'Không thể tải tệp báo cáo.')); });
  } catch (error) { errorResponse(res, error); }
}
module.exports = { studentList, studentWrite, lecturerList, lecturerDetail, lecturerWrite, download, permission };
