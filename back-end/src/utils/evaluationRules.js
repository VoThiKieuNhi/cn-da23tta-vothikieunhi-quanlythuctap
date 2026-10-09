const scoreKeys = ['diemChuyenMon', 'diemThaiDo', 'diemBaoCao'];
function validScore(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10 && Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}
function evaluationInput(body) {
  for (const key of scoreKeys) if (!validScore(body?.[key])) throw Object.assign(new Error('Điểm phải là số từ 0 đến 10, tối đa 2 chữ số thập phân.'), { status: 400 });
  if (typeof body.nhanXet !== 'string' || !body.nhanXet.trim()) throw Object.assign(new Error('Vui lòng nhập nhận xét chung.'), { status: 400 });
  if (body.nhanXet.trim().length > 20000) throw Object.assign(new Error('Nhận xét tối đa 20000 ký tự.'), { status: 400 });
  // Work in hundredths to avoid floating point errors in the rounded average.
  const diemTong = Math.round(scoreKeys.reduce((sum, key) => sum + Math.round(body[key] * 100), 0) / 3) / 100;
  return { diemChuyenMon: body.diemChuyenMon, diemThaiDo: body.diemThaiDo, diemBaoCao: body.diemBaoCao, diemTong, nhanXet: body.nhanXet.trim() };
}
module.exports = { validScore, evaluationInput };
