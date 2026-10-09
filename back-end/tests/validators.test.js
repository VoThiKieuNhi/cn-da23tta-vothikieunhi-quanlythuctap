const { test } = require('node:test');
const assert = require('node:assert/strict');
const backend = require('../src/utils/validators');
test('frontend and backend use identical email, role, phone and password rules', async () => {
  const frontend = await import('../../front-end/src/utils/validators.js');
  for (const v of [backend, frontend]) {
    for (const email of ['abc@gmail.com','admin@tvu.edu.vn','110123001@st.tvu.edu.vn','contact@abc.vn','hr@company.com']) assert.equal(v.isValidEmail(email),true);
    for (const email of ['abcgmail.com','abc@','@tvu.edu.vn','abc.com','a@@tvu.edu.vn','a@-test.vn','a@tvu..edu.vn','a..b@tvu.edu.vn']) assert.equal(v.isValidEmail(email),false);
    for (const role of ['ADMIN','GIANG_VIEN']) { assert.equal(v.emailError(' GV001@TVU.EDU.VN ',role),''); assert.equal(v.emailError('admin@gmail.com',role),v.messages.tvu); assert.equal(v.emailError('gv001@st.tvu.edu.vn',role),v.messages.tvu); }
    assert.equal(v.emailError('110123001@st.tvu.edu.vn','SINH_VIEN'),''); assert.equal(v.emailError('110123001@tvu.edu.vn','SINH_VIEN'),v.messages.student);
    assert.equal(v.isValidPhone('0901234567'),true);
    for(const phone of ['901234567','090123456','09012345678','090-123-4567','+84901234567','abcdefghij',901234567]) assert.equal(v.isValidPhone(phone),false);
    assert.equal(v.isValidPassword('12345678'),true); assert.equal(v.passwordError('1234567'),v.messages.password); assert.equal(v.passwordError('á'.repeat(37)),v.messages.passwordBytes); assert.equal(v.isValidPassword('á'.repeat(36)),true);
  }
});
