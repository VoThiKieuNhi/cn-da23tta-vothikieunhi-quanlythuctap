const multer = require('multer');
const files = require('../services/reportFiles');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: files.MAX_SIZE, files: 1, fields: 8, fieldSize: 4096, parts: 9 },
  fileFilter(_req, file, cb) { try { files.checkType(file); cb(null, true); } catch (error) { cb(error); } },
}).single('file');
module.exports = (req, res, next) => upload(req, res, error => {
  if (!error) return next();
  const tooLarge = error.code === 'LIMIT_FILE_SIZE';
  res.status(tooLarge ? 413 : 400).json({ success: false, message: tooLarge ? 'Tệp báo cáo tối đa 10MB.' : error.status === 400 ? error.message : 'Dữ liệu tải lên không hợp lệ. Chỉ gửi một tệp báo cáo.' });
});
