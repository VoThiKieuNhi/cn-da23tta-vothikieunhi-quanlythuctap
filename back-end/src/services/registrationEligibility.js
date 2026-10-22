const overlapMessage = 'Bạn đã có một đăng ký thực tập trong khoảng thời gian này. Vui lòng đăng ký ở đợt thực tập tiếp theo.';
const majorMessage = 'Đợt thực tập này không áp dụng cho ngành của bạn.';
// Existing student profiles store the reference major name. Resolve against the
// reference table exactly; never infer majors from MSSV or abbreviations.
const majorEligible = (period = 'dt.id', student = '$3') => `(
 NOT EXISTS (SELECT 1 FROM dot_thuc_tap_nganh x WHERE x.dot_thuc_tap_id=${period})
 OR EXISTS (SELECT 1 FROM dot_thuc_tap_nganh x JOIN nganh_hoc n ON n.id=x.nganh_hoc_id
 JOIN sinh_vien sv ON sv.nganh=n.ten_nganh WHERE x.dot_thuc_tap_id=${period} AND sv.id=${student})
)`;
async function check(client, studentId, periodId, dot, excludeId = null) {
  const eligible = await client.query(`SELECT ${majorEligible('$1', '$2')} AS eligible`, [periodId, studentId]);
  if (!eligible.rows[0]?.eligible) throw Object.assign(new Error(majorMessage), { status: 403 });
  const overlaps = await client.query(`SELECT id FROM dang_ky_thuc_tap
    WHERE sinh_vien_id=$1 AND trang_thai IN ('CHO_DUYET','DA_DUYET','DANG_THUC_TAP')
    AND ngay_bat_dau <= $3::date AND ngay_ket_thuc >= $2::date
    AND ($4::bigint IS NULL OR id<>$4) LIMIT 1`, [studentId, dot.ngayBatDauThucTap, dot.ngayKetThucThucTap, excludeId]);
  if (overlaps.rows.length) throw Object.assign(new Error(overlapMessage), { status: 409 });
}
module.exports = { check, majorEligible, overlapMessage, majorMessage };
