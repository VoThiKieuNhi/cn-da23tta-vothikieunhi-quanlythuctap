const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express'), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
let hash, server, base, writes = 0;
const db = { async query(sql, params) {
  if (sql.startsWith('/* session */')) return { rows: [{ id: params[0], email: 'test@st.tvu.edu.vn', vai_tro: 'SINH_VIEN' }] };
  if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)) return { rows: [] };
  if (sql.startsWith('SELECT mat_khau_hash')) { assert.equal(String(params[0]), '7'); assert.match(sql, /FOR UPDATE/); return { rows: [{ mat_khau_hash: hash }] }; }
  if (sql.startsWith('UPDATE nguoi_dung')) { assert.equal(String(params[1]), '7'); hash = params[0]; writes++; return { rows: [] }; }
  if (sql.startsWith('SELECT id, email')) return { rows: [{ id: 7, email: 'test@st.tvu.edu.vn', vai_tro: 'SINH_VIEN', dang_hoat_dong: true, mat_khau_hash: hash }] };
  throw Error('Unexpected query');
}, async connect() { return { ...db, release() {} }; } };
const file = require.resolve('../src/config/database');
require.cache[file] = { id: file, filename: file, loaded: true, exports: db };
before(async () => { hash = await bcrypt.hash('OldPassword123', 4); const app = express(); app.use(express.json()); app.use('/auth', require('../src/routes/authRoutes')); await new Promise(r => { server = app.listen(0, '127.0.0.1', r); }); base = `http://127.0.0.1:${server.address().port}/auth`; });
after(() => { server.close(); server.closeAllConnections(); });
async function request(body, auth = true, path = '/change-password') {
  const response = await fetch(base + path, { method: path === '/login' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer ' + jwt.sign({ id: 7, email: 'test@st.tvu.edu.vn', vaiTro: 'SINH_VIEN' }, process.env.JWT_SECRET, { expiresIn: '1m' }) } : {}) }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
test('authenticated password change validates current/new secrets and new password logs in', async t => {
  await t.test('JWT required', async () => assert.equal((await request({}, false)).status, 401));
  await t.test('wrong current password rejected', async () => { const r = await request({ currentPassword: 'WrongPassword', newPassword: 'NewPassword123' }); assert.equal(r.status, 400); assert.equal(r.body.message, 'Mật khẩu hiện tại không chính xác.'); });
  await t.test('missing, short, oversized and unchanged passwords rejected', async () => {
    for (const body of [{}, { currentPassword: 'OldPassword123', newPassword: '1234567' }, { currentPassword: 'OldPassword123', newPassword: 'a'.repeat(73) }, { currentPassword: 'OldPassword123', newPassword: 'OldPassword123' }]) assert.equal((await request(body)).status, 400);
    assert.equal(writes, 0);
  });
  await t.test('only JWT account updated; bcrypt hash persisted; no secret in response', async () => {
    const r = await request({ currentPassword: 'OldPassword123', newPassword: 'NewPassword123', user_id: 999 });
    assert.equal(r.status, 200); assert.equal(r.body.message, 'Đổi mật khẩu thành công.'); assert.equal(writes, 1);
    assert.ok(await bcrypt.compare('NewPassword123', hash)); assert.notEqual(hash, 'NewPassword123');
    assert.ok(!JSON.stringify(r.body).includes(hash)); assert.ok(!JSON.stringify(r.body).includes('NewPassword123'));
    assert.equal((await request({ email: 'test@st.tvu.edu.vn', password: 'OldPassword123' }, false, '/login')).status, 401);
    assert.equal((await request({ email: 'test@st.tvu.edu.vn', password: 'NewPassword123' }, false, '/login')).status, 200);
  });
});
