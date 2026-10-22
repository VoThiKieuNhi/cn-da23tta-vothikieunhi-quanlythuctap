const router = require('express').Router();
const { login, me, changePassword } = require('../controllers/authController');
const xacThuc = require('../middleware/xacThuc');
const phanQuyen = require('../middleware/phanQuyen');

router.post('/login', login);
router.get('/me', xacThuc, me);
router.put('/change-password', xacThuc, changePassword);
router.get('/admin-only', xacThuc, phanQuyen('ADMIN'), (_req, res) => {
  res.json({ success: true, message: 'Ban co quyen ADMIN' });
});

module.exports = router;
