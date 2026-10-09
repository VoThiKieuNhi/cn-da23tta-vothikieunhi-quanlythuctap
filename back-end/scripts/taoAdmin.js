const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');
const { emailError, passwordError } = require('../src/utils/validators');

async function taoAdmin() {
  try {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';
    const validationError = emailError(email, 'ADMIN') || passwordError(password);
    if (validationError) { console.error(validationError); process.exitCode = 1; return; }
    const { rows } = await pool.query('SELECT id FROM nguoi_dung WHERE LOWER(email) = $1', [email]);
    if (rows.length) {
      console.log('Email da ton tai. Khong tao trung hoac thay doi tai khoan hien co.');
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO nguoi_dung (email, mat_khau_hash, vai_tro, dang_hoat_dong) VALUES ($1, $2, $3, $4)',
      [email, hash, 'ADMIN', true]
    );
    console.log('Tao tai khoan ADMIN thanh cong.');
  } catch (error) {
    if (error.code === '23505') {
      console.log('Tai khoan da ton tai. Khong tao trung.');
    } else {
      console.error('Khong the tao ADMIN. Kiem tra ket noi va bang nguoi_dung.');
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

taoAdmin();
