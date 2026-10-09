const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');
const { emailError, passwordError } = require('../src/utils/validators');

async function datLaiMatKhauAdmin() {
  try {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';
    const validationError = emailError(email, 'ADMIN') || passwordError(password);
    if (validationError) {
      console.error(validationError);
      process.exitCode = 1;
      return;
    }

    const { rows } = await pool.query(
      'SELECT id FROM nguoi_dung WHERE LOWER(email) = LOWER($1) AND vai_tro = $2',
      [email, 'ADMIN']
    );
    if (!rows.length) {
      console.log('Khong tim thay tai khoan ADMIN');
      process.exitCode = 1;
      return;
    }
    if (rows.length > 1) {
      console.error('Co nhieu tai khoan ADMIN cung email. Khong cap nhat mat khau.');
      process.exitCode = 1;
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'UPDATE nguoi_dung SET mat_khau_hash = $1, dang_hoat_dong = $2 WHERE id = $3 AND vai_tro = $4',
      [hash, true, rows[0].id, 'ADMIN']
    );
    if (result.rowCount !== 1) {
      console.log('Khong tim thay tai khoan ADMIN');
      process.exitCode = 1;
      return;
    }
    console.log('Dat lai mat khau ADMIN thanh cong.');
  } catch {
    console.error('Khong the dat lai mat khau ADMIN. Kiem tra ket noi va bang nguoi_dung.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

datLaiMatKhauAdmin().catch(() => {
  console.error('Khong the dong ket noi PostgreSQL.');
  process.exitCode = 1;
});
