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

module.exports = { login, me };
