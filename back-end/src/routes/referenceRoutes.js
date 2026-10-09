const router=require('express').Router();
const c=require('../controllers/referenceController');
router.use(require('../middleware/xacThuc'));
router.get('/majors',c.majors);
router.get('/majors/:majorId/classes',c.classes);
router.get('/lecturer-faculties',c.faculties);
router.get('/lecturers',c.lecturers);
router.get('/lecturers/:id',c.lecturer);
module.exports=router;
