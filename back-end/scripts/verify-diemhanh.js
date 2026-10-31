// Read-only verification against the configured database and real HTTP routes.
require('dotenv').config({ path: require('node:path').join(__dirname, '../.env'), quiet: true });
const assert = require('node:assert/strict');
const pool = require('../src/config/database');
const express = require('express');
async function verify() {
  const lecturer = (await pool.query("SELECT gv.id FROM giang_vien gv JOIN nguoi_dung nd ON nd.id=gv.nguoi_dung_id WHERE lower(nd.email)=$1", ['diemhanh@tvu.edu.vn'])).rows[0];
  assert.ok(lecturer, 'Missing lecturer');
  const rows = (await pool.query(`SELECT dk.id, dk.dot_thuc_tap_id, sv.ma_sinh_vien, dk.trang_thai,
    (SELECT count(*)::int FROM tien_do_thuc_tap p WHERE p.dang_ky_thuc_tap_id=dk.id) AS progress,
    bc.trang_thai AS report_status, dg.id AS evaluation_id
    FROM phan_cong_giang_vien pc JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id
    JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id
    LEFT JOIN bao_cao_thuc_tap bc ON bc.dang_ky_thuc_tap_id=dk.id
    LEFT JOIN danh_gia_thuc_tap dg ON dg.dang_ky_thuc_tap_id=dk.id
    WHERE pc.giang_vien_id=$1 ORDER BY sv.ma_sinh_vien`, [lecturer.id])).rows;
  assert.equal(rows.length, 10);
  assert.equal(new Set(rows.map(r => r.id)).size, 10);
  assert.equal(new Set(rows.map(r => r.dot_thuc_tap_id)).size, 1);
  assert.ok(rows.some(r => r.ma_sinh_vien === '110123033'));
  assert.ok(rows.every(r => r.progress >= 1 && ['DA_DUYET', 'DANG_THUC_TAP', 'HOAN_THANH'].includes(r.trang_thai)));
  assert.equal(rows.filter(r => !r.report_status).length, 3);
  assert.equal(rows.filter(r => r.report_status === 'DA_NOP').length, 3);
  assert.equal(rows.filter(r => r.report_status === 'CAN_CHINH_SUA').length, 2);
  assert.equal(rows.filter(r => r.report_status === 'DA_DUYET' && !r.evaluation_id).length, 1);
  assert.equal(rows.filter(r => r.report_status === 'DA_DUYET' && r.evaluation_id).length, 1);
  const app = express(); app.use(express.json());
  app.use('/api/auth', require('../src/routes/authRoutes'));
  app.use('/api/lecturer', require('../src/routes/lecturerRoutes'));
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  try {
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const response = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'diemhanh@tvu.edu.vn', password: '12345678' }) });
    assert.equal(response.status, 200, 'Demo login failed; existing credentials were not changed');
    const login = await response.json();
    const headers = { Authorization: `Bearer ${login.token}` };
    async function get(path) { const r = await fetch(base + path, { headers }); assert.equal(r.status, 200); return r.json(); }
    const students = await get('/lecturer/students'); assert.equal(students.data.length, 10);
    const reports = await get('/lecturer/reports'); assert.equal(reports.data.length, 7);
    const evaluations = await get('/lecturer/evaluations'); assert.equal(evaluations.data.length, 10);
    for (const report of reports.data) {
      const r = await fetch(base + `/lecturer/reports/${report.id}/download`, { headers });
      assert.equal(r.status, 200);
      assert.equal(Buffer.from(await r.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    }
    const capacity = {};
    await require('../src/controllers/assignmentAdminController').list({ query: { periodId: String(rows[0].dot_thuc_tap_id), registrationId: String(rows[0].id) } }, {
      json(value) { capacity.value = value; }, status(code) { throw new Error('Capacity query failed: ' + code); }
    });
    const option = capacity.value.lecturers.find(r => String(r.id) === String(lecturer.id));
    assert.equal(option.assignedCount, 10); assert.equal(option.isCurrentLecturer, true); assert.equal(option.maxCapacity, 10);
    console.log(JSON.stringify({ lecturerId: lecturer.id, periodId: rows[0].dot_thuc_tap_id, assignedCount: rows.length, maxCapacity: 10, mssv: rows.map(r => r.ma_sinh_vien), reports: 7, evaluated: 1, httpLoginAndThreeLists: 'PASS', pdfDownloads: '7 PASS', currentLecturerCapacity: '10/10 PASS' }, null, 2));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
verify().catch(error => { console.error('Verification failed:', error.code || error.message); process.exitCode = 1; }).finally(() => pool.end());
