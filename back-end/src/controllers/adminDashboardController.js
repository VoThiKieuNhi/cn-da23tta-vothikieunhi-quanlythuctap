const pool = require('../config/database');
const { statusSql } = require('../utils/periodStatus');

async function dashboard(_req, res) {
  try {
    const [overview, majors, statuses, pending] = await Promise.all([
      pool.query(`SELECT
        (SELECT COUNT(*)::int FROM sinh_vien) AS "tongSinhVien",
        (SELECT COUNT(*)::int FROM giang_vien) AS "tongGiangVien",
        (SELECT COUNT(*)::int FROM doanh_nghiep) AS "tongDoanhNghiep",
        (SELECT COUNT(*)::int FROM dot_thuc_tap) AS "tongDotThucTap",
        COUNT(*) FILTER (WHERE trang_thai = $1)::int AS "dangKyChoDuyet",
        COUNT(*) FILTER (WHERE trang_thai = $2 AND EXISTS (
          SELECT 1 FROM dot_thuc_tap dt WHERE dt.id=dang_ky_thuc_tap.dot_thuc_tap_id
          AND (${statusSql('dt','$4')})=$2
        ))::int AS "dangThucTap",
        COUNT(*) FILTER (WHERE trang_thai = $3)::int AS "hoanThanh"
        FROM dang_ky_thuc_tap`, ['CHO_DUYET', 'DANG_THUC_TAP', 'HOAN_THANH', new Date()]),
      pool.query(`SELECT COALESCE(NULLIF(TRIM(nganh), ''), 'Chưa cập nhật') AS nganh,
        COUNT(*)::int AS "soLuong" FROM sinh_vien GROUP BY 1 ORDER BY COUNT(*) DESC, 1`),
      pool.query(`SELECT trang_thai AS "trangThai", COUNT(*)::int AS "soLuong"
        FROM dang_ky_thuc_tap GROUP BY trang_thai ORDER BY trang_thai`),
      pool.query(`SELECT dk.id, sv.ma_sinh_vien AS "maSinhVien", sv.ho_ten AS "hoTen",
        sv.lop, sv.nganh, dn.ten_doanh_nghiep AS "doanhNghiep",
        dk.vi_tri_thuc_tap AS "viTriThucTap", dt.hoc_ky AS "hocKy",
        dt.nam_hoc AS "namHoc", dk.ngay_tao AS "ngayDangKy"
        FROM dang_ky_thuc_tap dk
        LEFT JOIN sinh_vien sv ON sv.id = dk.sinh_vien_id
        LEFT JOIN doanh_nghiep dn ON dn.id = dk.doanh_nghiep_id
        LEFT JOIN dot_thuc_tap dt ON dt.id = dk.dot_thuc_tap_id
        WHERE dk.trang_thai = $1 ORDER BY dk.ngay_tao DESC, dk.id DESC LIMIT 5`, ['CHO_DUYET']),
    ]);
    res.json({ success: true, data: {
      tongQuan: overview.rows[0], sinhVienTheoNganh: majors.rows,
      trangThaiDangKy: statuses.rows, dangKyChoDuyet: pending.rows,
    } });
  } catch (error) {
    // Only a PostgreSQL SQLSTATE is logged; never connection details or query values.
    const code = /^[0-9A-Z]{5}$/.test(error.code || '') ? error.code : 'DB_ERROR';
    console.error('ADMIN DASHBOARD ERROR:', code);
    res.status(500).json({ success: false, message: 'Khong the tai du lieu Dashboard. Vui long thu lai.' });
  }
}

module.exports = { dashboard };
