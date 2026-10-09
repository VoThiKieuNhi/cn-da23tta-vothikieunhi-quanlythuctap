const router=require('express').Router();
const c=require('../controllers/adminReportController');
router.use(require('../middleware/xacThuc'),require('../middleware/phanQuyen')('ADMIN'));
for(const type of ['options','summary','overview','by-major','by-company','by-lecturer','registration-status','report-status','evaluation','students'])router.get('/'+type,c.endpoint(type));
router.get('/export',c.exportExcel);
module.exports=router;
