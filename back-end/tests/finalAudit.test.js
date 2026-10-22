const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
const database = require.resolve('../src/config/database');
let account;
const transactions = [];
require.cache[database] = { id: database, filename: database, loaded: true, exports: {
  query: async () => ({ rows: account ? [account] : [] }),
  connect: async () => ({ query: async sql => { transactions.push(sql); return { rows: [] }; }, release() {} }),
} };
const auth = require('../src/controllers/authController');

test('all three roles use database role despite forged login role; me never exposes hash', async () => {
  const password = 'audit-password-only';
  const hash = await bcrypt.hash(password, 4);
  for (const role of ['ADMIN', 'SINH_VIEN', 'GIANG_VIEN']) {
    account = { id: 1, email: 'audit@tvu.edu.vn', vai_tro: role, dang_hoat_dong: true, mat_khau_hash: hash };
    let result;
    const res = { status(code) { assert.equal(code, 200); return this; }, json(value) { result = value; } };
    await auth.login({ body: { email: account.email, password, vaiTro: 'DOANH_NGHIEP', role: 'ADMIN' } }, res);
    assert.equal(jwt.verify(result.token, process.env.JWT_SECRET).vaiTro, role);
    assert.equal(result.user.vaiTro, role);
    await auth.me({ user: { id: 1 } }, res);
    assert.equal(result.user.vaiTro, role);
    assert.equal(result.user.dangHoatDong, true);
    assert.ok(!JSON.stringify(result).includes(hash));
  }
});

test('Excel export keeps filters, exports all matching rows, and produces readable sheets with zero scores', async () => {
  const service = require('../src/services/adminReportService');
  const original = service.query;
  const filters = { hocKy: '1', nganhId: '2', trangThai: 'DA_DUYET', page: '2' };
  const calls = [];
  service.query = async (_client, type, query, all) => {
    assert.deepEqual(query, filters);
    calls.push([type, all]);
    if (type === 'students') return [{ maSinhVien: '110123033', hoTen: 'Kiểm Thử', diemTong: 0, trangThai: 'DA_DUYET' }];
    if (type === 'overview') return { tongSinhVien: 1 };
    if (type === 'evaluation') return { soDaDanhGia: 1, diemTrungBinh: 0, caoNhat: 0, thapNhat: 0, phanBo: [] };
    return [];
  };
  try {
    let buffer;
    const headers = {};
    await require('../src/controllers/adminReportController').exportExcel({ query: filters }, {
      set(name, value) { headers[name] = value; }, send(value) { buffer = value; },
      status(code) { assert.fail(`Unexpected HTTP ${code}`); },
    });
    assert.equal(calls.find(([type]) => type === 'students')[1], true);
    assert.match(headers['Content-Type'], /spreadsheetml/);
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(buffer);
    assert.deepEqual(book.worksheets.map(s => s.name), ['Tổng quan', 'Sinh viên thực tập', 'Theo doanh nghiệp', 'Theo giảng viên', 'Kết quả đánh giá']);
    const students = book.getWorksheet('Sinh viên thực tập');
    assert.equal(students.rowCount, 2);
    assert.equal(students.getCell('B2').value, '110123033');
    assert.equal(students.getCell('J2').value, 'Chưa phân công');
    assert.equal(students.getCell('R2').value, 0);
    assert.ok(transactions.includes('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'));
    assert.ok(transactions.includes('COMMIT'));
  } finally { service.query = original; }
});
