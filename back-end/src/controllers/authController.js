const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const jwtConfig = require('../config/jwt');
const { emailError } = require('../utils/validators');

async function login(req, res) {
  let passwordHash;
  const { email, password } = req.body || {};
  if (emailError(email)) return res.status(400).json({ success: false, message: emailError(email) });
  if (typeof password !== 'string' || !password) return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu.' });
  try {
    const { rows } = await pool.query(
      'SELECT id, email, mat_khau_hash, vai_tro, dang_hoat_dong FROM nguoi_dung WHERE LOWER(email) = LOWER($1)',
      [email.trim().toLowerCase()]
    );
    const account = rows[0];
    if (!account) return res.status(401).json({ success: false, message: 'Email hoac mat khau khong dung.' });
    passwordHash = account.mat_khau_hash;
    if (!account.dang_hoat_dong) return res.status(403).json({ success: false, message: 'Tai khoan da bi vo hieu hoa.' });
    if (!await bcrypt.compare(password, account.mat_khau_hash)) {
      return res.status(401).json({ success: false, message: 'Email hoac mat khau khong dung.' });
    }
    if (!['ADMIN', 'SINH_VIEN', 'GIANG_VIEN'].includes(account.vai_tro)) {
      return res.status(403).json({ success: false, message: 'Vai tro khong hop le.' });
    }
    const user = { id: account.id, email: account.email, vaiTro: account.vai_tro };
    const { secret, expiresIn } = jwtConfig();
    const token = jwt.sign(user, secret, { algorithm: 'HS256', expiresIn });
    return res.json({ success: true, message: 'Dang nhap thanh cong', token, user });
  } catch (error) {
    // Chi log thong bao va ma loi; che cac gia tri bi mat neu xuat hien.
    const redact = (value) => {
      let safe = String(value ?? 'UNKNOWN');
      for (const secret of [password, passwordHash, process.env.JWT_SECRET, process.env.DB_PASSWORD, process.env.ADMIN_PASSWORD]) {
        if (typeof secret === 'string' && secret) safe = safe.split(secret).join('[REDACTED]');
      }
      return safe.replace(/eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_TOKEN]');
    };
    console.error('LOGIN ERROR MESSAGE:', redact(error.message));
    console.error('LOGIN ERROR CODE:', redact(error.code));
    return res.status(500).json({ success: false, message: 'Khong the dang nhap. Kiem tra ket noi database va cau hinh JWT tren server.' });
  }
}

async function me(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, vai_tro, dang_hoat_dong FROM nguoi_dung WHERE id = $1', [req.user.id]
    );
    const account = rows[0];
    if (!account) return res.status(401).json({ success: false, message: 'Tai khoan khong ton tai.' });
    if (!account.dang_hoat_dong) return res.status(403).json({ success: false, message: 'Tai khoan da bi vo hieu hoa.' });
    return res.json({ success: true, user: {
      id: account.id, email: account.email, vaiTro: account.vai_tro, dangHoatDong: account.dang_hoat_dong,
    } });
  } catch {
    return res.status(500).json({ success: false, message: 'Khong the lay thong tin tai khoan.' });
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  const { passwordError } = require('../utils/validators');
  if (typeof currentPassword !== 'string' || !currentPassword) return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại.', errors: { currentPassword: 'Vui lòng nhập mật khẩu hiện tại.' } });
  const invalid = passwordError(newPassword);
  if (invalid) return res.status(400).json({ success: false, message: invalid, errors: { newPassword: invalid } });
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const account = (await client.query('SELECT mat_khau_hash FROM nguoi_dung WHERE id=$1 AND dang_hoat_dong=true FOR UPDATE', [req.user.id])).rows[0];
    if (!account) throw Object.assign(new Error('Tài khoản không khả dụng.'), { status: 401 });
    if (!await bcrypt.compare(currentPassword, account.mat_khau_hash)) throw Object.assign(new Error('Mật khẩu hiện tại không chính xác.'), { status: 400, field: 'currentPassword' });
    if (await bcrypt.compare(newPassword, account.mat_khau_hash)) throw Object.assign(new Error('Mật khẩu mới phải khác mật khẩu hiện tại.'), { status: 400, field: 'newPassword' });
    const hash = await bcrypt.hash(newPassword, 12);
    await client.query('UPDATE nguoi_dung SET mat_khau_hash=$1,ngay_cap_nhat=NOW() WHERE id=$2', [hash, req.user.id]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.', ...(error.field ? { errors: { [error.field]: error.message } } : {}) });
  } finally { client?.release(); }
}
module.exports = { login, me, changePassword };
