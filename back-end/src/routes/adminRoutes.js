const router = require('express').Router();
router.use('/reports', require('./adminReportRoutes'));
const xacThuc = require('../middleware/xacThuc');
const phanQuyen = require('../middleware/phanQuyen');
const { dashboard } = require('../controllers/adminDashboardController');
const students = require('../controllers/studentAdminController');
const lecturers = require('../controllers/lecturerAdminController');
const companies = require('../controllers/companyAdminController');
const periods = require('../controllers/internshipPeriodAdminController');
const registrations = require('../controllers/registrationAdminController');
const evaluations = require('../controllers/evaluationController');
router.get('/evaluations', xacThuc, phanQuyen('ADMIN'), evaluations.list);
router.get('/evaluations/:registrationId', xacThuc, phanQuyen('ADMIN'), evaluations.detail);

router.get('/dashboard', xacThuc, phanQuyen('ADMIN'), dashboard);
router.use('/students', xacThuc, phanQuyen('ADMIN'));
router.get('/students/resolve-email', require('../controllers/referenceController').resolveEmail);
router.get('/students', students.list);
router.get('/students/:id', students.detail);
router.post('/students', students.create);
router.put('/students/:id', students.update);
router.delete('/students/:id', students.remove);
router.use('/lecturers', xacThuc, phanQuyen('ADMIN'));
router.get('/lecturers', lecturers.list);
router.get('/lecturers/:id', lecturers.detail);
router.post('/lecturers', lecturers.create);
router.put('/lecturers/:id', lecturers.update);
router.delete('/lecturers/:id', lecturers.remove);

router.use('/companies', xacThuc, phanQuyen('ADMIN'));
router.get('/companies', companies.list);
router.get('/companies/:id', companies.detail);
router.post('/companies', companies.create);
router.put('/companies/:id', companies.update);
router.delete('/companies/:id', companies.remove);
router.get('/companies/:companyId/supervisors', companies.supervisors);
router.post('/companies/:companyId/supervisors', companies.saveSupervisor);
router.put('/companies/:companyId/supervisors/:supervisorId', companies.saveSupervisor);
router.delete('/companies/:companyId/supervisors/:supervisorId', companies.removeSupervisor);

router.use('/internship-periods', xacThuc, phanQuyen('ADMIN'));
router.get('/internship-periods', periods.list);
router.get('/internship-periods/:id', periods.detail);
router.post('/internship-periods', periods.save);
router.put('/internship-periods/:id', periods.save);
router.delete('/internship-periods/:id', periods.remove);

router.use('/registrations', xacThuc, phanQuyen('ADMIN'));
router.get('/registrations', registrations.list);
router.get('/registrations/:id', registrations.detail);
router.put('/registrations/:id/approve', registrations.approve);
router.put('/registrations/:id/reject', registrations.reject);

const assignments = require('../controllers/assignmentAdminController');
router.get('/assignments', xacThuc, phanQuyen('ADMIN'), assignments.list);
router.post('/assignments/:id', xacThuc, phanQuyen('ADMIN'), assignments.create);
router.put('/assignments/:id', xacThuc, phanQuyen('ADMIN'), assignments.create);
module.exports = router;
