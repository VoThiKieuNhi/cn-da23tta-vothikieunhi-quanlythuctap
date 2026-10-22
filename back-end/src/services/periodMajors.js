const fail = message => Object.assign(new Error(message), { status: 400, errors: { nganhIds: message } });
function parse(body) {
  if (body.apDungTatCaNganh === undefined && body.nganhIds === undefined) return undefined;
  if (typeof body.apDungTatCaNganh !== 'boolean' || !Array.isArray(body.nganhIds)) throw fail('Vui lòng chọn ngành áp dụng.');
  if (body.apDungTatCaNganh) return [];
  if (!body.nganhIds.length || body.nganhIds.length > 1000) throw fail('Vui lòng chọn ít nhất một ngành.');
  return [...new Set(body.nganhIds.map(value => {
    const id = String(value);
    if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) throw fail('Ngành không hợp lệ.');
    return id;
  }))];
}
const fields = `COALESCE((SELECT json_agg(json_build_object('id',n.id::text,'tenNganh',n.ten_nganh) ORDER BY n.ten_nganh)
 FROM dot_thuc_tap_nganh x JOIN nganh_hoc n ON n.id=x.nganh_hoc_id WHERE x.dot_thuc_tap_id=dt.id),'[]'::json) AS "nganhApDung"`;
async function save(client, periodId, ids, updating) {
  if (ids === undefined) return; // Old clients preserve the existing configuration.
  if (ids.length) {
    const found = await client.query('SELECT id FROM nganh_hoc WHERE id=ANY($1::bigint[]) AND dang_hoat_dong=true FOR SHARE', [ids]);
    if (found.rows.length !== ids.length) throw fail('Ngành đã chọn không tồn tại hoặc ngừng hoạt động.');
    if (updating) {
      const excluded = await client.query(`SELECT dk.id FROM dang_ky_thuc_tap dk JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id
        WHERE dk.dot_thuc_tap_id=$1 AND dk.trang_thai<>'TU_CHOI'
        AND NOT EXISTS (SELECT 1 FROM nganh_hoc n WHERE n.id=ANY($2::bigint[]) AND n.ten_nganh=sv.nganh) LIMIT 1`, [periodId, ids]);
      if (excluded.rows.length) throw Object.assign(new Error('Không thể loại ngành của sinh viên đã đăng ký khỏi đợt thực tập.'), { status: 409 });
    }
  }
  await client.query('DELETE FROM dot_thuc_tap_nganh WHERE dot_thuc_tap_id=$1', [periodId]);
  if (ids.length) await client.query('INSERT INTO dot_thuc_tap_nganh (dot_thuc_tap_id,nganh_hoc_id) SELECT $1,unnest($2::bigint[])', [periodId, ids]);
}
module.exports = { parse, fields, save };
