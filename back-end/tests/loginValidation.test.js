const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
let calls = 0;
const file = require.resolve('../src/config/database');
require.cache[file] = { id:file, filename:file, loaded:true, exports:{ async query(_sql, params) {
  calls++;
  assert.equal(params[0], 'legacy@gmail.com');
  return { rows:[{ id:'1', email:params[0], vai_tro:'GIANG_VIEN', dang_hoat_dong:true, mat_khau_hash:await bcrypt.hash('short',4) }] };
} } };
const { login } = require('../src/controllers/authController');
async function request(body) {
  let status = 200, result;
  await login({ body }, { status(value) { status = value; return this; }, json(value) { result = value; return this; } });
  return { status, result };
}
test('login validates format and nonempty password without imposing role domain or new-password length', async () => {
  for (const body of [{ email:'abcgmail.com',password:'12345678' },{ email:'abc@',password:'12345678' },{ email:'valid@gmail.com',password:'' }]) {
    assert.equal((await request(body)).status,400);
  }
  assert.equal(calls,0);
  const valid = await request({email:' LEGACY@GMAIL.COM ',password:'short'});
  assert.equal(valid.status,200); assert.equal(valid.result.success,true); assert.equal(valid.result.user.vaiTro,'GIANG_VIEN');
  assert.equal((await request({email:'legacy@gmail.com',password:'wrong'})).status,401);
});
