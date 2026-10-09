const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const pool = require('../config/database');

async function xacThuc(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get('Authorization') || '');
  if (!match) return res.status(401).json({ success: false, message: 'Vui long gui Bearer token.' });
  let secret;
  try {
    ({ secret } = jwtConfig());
  } catch {
    return res.status(500).json({ success: false, message: 'Cau hinh JWT tren server chua hop le.' });
  }
  let payload;
  try {
    payload = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
    if (!payload || !/^[1-9]\d{0,18}$/.test(String(payload.id)) || BigInt(payload.id)>9223372036854775807n || typeof payload.email !== 'string' ||
        !['ADMIN', 'SINH_VIEN', 'GIANG_VIEN'].includes(payload.vaiTro) || typeof payload.exp !== 'number') {
      throw new Error('Invalid claims');
    }
  } catch {
    return res.status(401).json({ success: false, message: 'Token khong hop le hoac da het han.' });
  }
  try {
    const account = (await pool.query('/* session */ SELECT id,email,vai_tro FROM nguoi_dung WHERE id=$1 AND vai_tro=$2 AND dang_hoat_dong=true', [payload.id,payload.vaiTro])).rows[0];
    if (!account) return res.status(401).json({success:false,message:'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.'});
    req.user = { id:account.id,email:account.email,vaiTro:account.vai_tro };
    return next();
  } catch {
    return res.status(503).json({success:false,message:'Không thể xác thực tài khoản. Vui lòng thử lại.'});
  }
}

module.exports = xacThuc;
