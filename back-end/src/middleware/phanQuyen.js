function phanQuyen(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.vaiTro)) {
      return res.status(403).json({ success: false, message: 'Ban khong co quyen truy cap.' });
    }
    return next();
  };
}

module.exports = phanQuyen;
