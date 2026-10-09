const { test, before, after } = require('node:test');
const assert = require('node:assert/strict'), express = require('express'), jwt = require('jsonwebtoken');
const fs = require('node:fs/promises');
const files = require('../src/services/reportFiles');
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
let server, base, report = null, snapshot, failWrite = false, assigned = true, calls = [];
let reg = { id: '99999991', trangThai: 'DA_DUYET', ngayBatDau: '2026-10-01', ngayKetThuc: '2026-12-06', tenDoanhNghiep: 'Test only' };
const created = new Set(), actualSave = files.save;
files.save = async (...args) => { const result = await actualSave(...args); created.add(result.stored); return result; };
function result(row, sql) {
  if (!row) return { rows: [] };
  const copy = structuredClone(row);
  if (!sql.includes('AS "storedPath"')) delete copy.storedPath;
  return { rows: [copy] };
}
const db = { async connect() { return { ...db, release() {} }; }, async query(sql, p = []) {
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

  calls.push({ sql, p });
  if (sql === 'BEGIN') { snapshot = structuredClone(report); return { rows: [] }; }
  if (sql === 'ROLLBACK') { report = snapshot; return { rows: [] }; }
  if (sql === 'COMMIT' || sql.startsWith('SET LOCAL')) return { rows: [] };
  if (sql.includes('FROM dang_ky_thuc_tap dk JOIN sinh_vien')) { assert.match(sql, /sv.nguoi_dung_id=\$1/); assert.match(sql, /FOR UPDATE OF dk/); return { rows: p[0] === '22' ? [{ ...reg }] : [] }; }
  if (sql.startsWith('SELECT gv.ho_ten')) return { rows: assigned ? [{ ho_ten: 'Giảng viên kiểm thử' }] : [] };
  if (sql.startsWith('SELECT bc.dang_ky_thuc_tap_id')) { assert.match(sql, /bc.id=\$1 AND sv.nguoi_dung_id=\$2/); return { rows: report && p[0] === report.id && p[1] === '22' ? [{ dang_ky_thuc_tap_id: reg.id }] : [] }; }
  if (sql.includes('gv.nguoi_dung_id=$1')) {
    assert.match(sql, /JOIN phan_cong_giang_vien pc/);
    if (p[0] !== '33' || !assigned) return { rows: [] };
    if (sql.includes('AND bc.id=$2') && p[1] !== report?.id) return { rows: [] };
    if (sql.includes('ILIKE')) { assert.ok(p[2].startsWith('%')); if (p[1] && p[1] !== report?.trangThai) return { rows: [] }; }
    return result(report && { ...report, maSinhVien: 'TEST', hoTen: 'Test', lop: 'Test', nganh: 'Test', tenDoanhNghiep: 'Test' }, sql);
  }
  if (sql.startsWith('SELECT id FROM bao_cao_thuc_tap')) { assert.equal(p[0], reg.id); return { rows: report ? [{ id: report.id }] : [] }; }
  if (sql.startsWith('SELECT') && sql.includes('FROM bao_cao_thuc_tap bc')) {
    if (sql.includes('bc.id=$1')) { assert.equal(p[1], reg.id); return result(report?.id === p[0] ? report : null, sql); }
    assert.equal(p[0], reg.id); return result(report, sql);
  }
  if (failWrite && /^(INSERT|UPDATE|DELETE)/.test(sql)) throw Object.assign(new Error('private database error'), { code: 'XX000' });
  if (sql.startsWith('INSERT INTO bao_cao_thuc_tap')) {
    assert.equal(p[0], reg.id); assert.match(sql, /CURRENT_TIMESTAMP,'DA_NOP'/); assert.equal(p.length, 4);
    if (report) throw Object.assign(new Error('duplicate'), { code: '23505' });
    report = { id: '1', registrationId: p[0], tenBaoCao: p[1], tenFile: p[2], storedPath: p[3], trangThai: 'DA_NOP', nhanXetGiangVien: null, ngayNop: '2026-10-02T03:00:00Z' }; return result(report, sql);
  }
  if (sql.startsWith('UPDATE bao_cao_thuc_tap AS bc SET ten_bao_cao')) {
    assert.equal(p[3], report.id); assert.equal(p[4], reg.id); assert.doesNotMatch(sql.split('WHERE')[0], /nhan_xet_giang_vien/);
    Object.assign(report, { tenBaoCao: p[0], tenFile: p[1], storedPath: p[2], trangThai: 'DA_NOP', ngayNop: '2026-10-03T03:00:00Z' }); return result(report, sql);
  }
  if (sql.startsWith('UPDATE bao_cao_thuc_tap AS bc SET trang_thai')) {
    assert.equal(p[2], report.id); report.trangThai = p[0]; if (p[1] !== null) report.nhanXetGiangVien = p[1]; return result(report, sql);
  }
  if (sql.startsWith('DELETE FROM bao_cao_thuc_tap')) { assert.equal(p[0], report.id); assert.equal(p[1], reg.id); report = null; return { rows: [] }; }
  throw new Error('Unexpected SQL in report test');
} };
const file = require.resolve('../src/config/database'); require.cache[file] = { id: file, filename: file, loaded: true, exports: db };
before(async () => { const app = express(); app.use(express.json()); app.use('/api/student', require('../src/routes/studentRoutes')); app.use('/api/lecturer', require('../src/routes/lecturerRoutes')); await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); }); base = `http://127.0.0.1:${server.address().port}/api`; });
after(async () => { server.close(); server.closeAllConnections(); files.save = actualSave; for (const stored of created) await files.remove(stored); });
const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF');
function upload(name = 'bao-cao.pdf', type = 'application/pdf', bytes = pdf, title = '  Báo cáo kiểm thử  ') { const body = new FormData(); body.append('tenBaoCao', title); body.append('file', new Blob([bytes], { type }), name); body.append('dangKyThucTapId', '777'); return body; }
async function request(path, method = 'GET', body, role = 'SINH_VIEN', user = '22') {
  const headers = {}; if (role) headers.Authorization = 'Bearer ' + jwt.sign({ id: user, email: 'test@example.test', vaiTro: role }, process.env.JWT_SECRET, { expiresIn: '1m' });
  if (body && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
  const response = await fetch(base + path, { method, headers, body });
  return { status: response.status, headers: response.headers, body: response.headers.get('content-type')?.includes('application/json') ? await response.json() : Buffer.from(await response.arrayBuffer()) };
}
test('report upload, review and download lifecycle', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-02T10:00:00+07:00') });
  await t.test('all routes require correct JWT role before processing files', async () => {
    calls = []; for (const [path, method] of [['/student/reports', 'GET'], ['/student/reports', 'POST'], ['/student/reports/1', 'PUT'], ['/student/reports/1', 'DELETE'], ['/student/reports/1/download', 'GET']]) { assert.equal((await request(path, method, undefined, null)).status, 401); assert.equal((await request(path, method, undefined, 'GIANG_VIEN')).status, 403); }
    for (const [path, method] of [['/lecturer/reports', 'GET'], ['/lecturer/reports/1', 'GET'], ['/lecturer/reports/1/download', 'GET'], ['/lecturer/reports/1/request-revision', 'PUT'], ['/lecturer/reports/1/approve', 'PUT']]) assert.equal((await request(path, method)).status, 403);
    assert.equal(calls.length, 0);
  });
  await t.test('before start, unapproved and unassigned cannot submit', async () => {
    reg.ngayBatDau = '2026-10-10'; assert.equal((await request('/student/reports', 'POST', upload())).status, 409); reg.ngayBatDau = '2026-10-01';
    reg.trangThai = 'CHO_DUYET'; assert.equal((await request('/student/reports', 'POST', upload())).status, 409); reg.trangThai = 'DA_DUYET';
    assigned = false; assert.equal((await request('/student/reports', 'POST', upload())).status, 409); assigned = true; assert.equal(created.size, 0);
    const list = await request('/student/reports'); assert.equal(list.body.report, null); assert.equal(list.body.canSubmit, true);
  });
  await t.test('case 1: upload PDF saves safe file and ignores forged registration ID', async () => {
    const r = await request('/student/reports', 'POST', upload()); assert.equal(r.status, 201); assert.equal(r.body.data.trangThai, 'DA_NOP'); assert.equal(r.body.data.tenBaoCao, 'Báo cáo kiểm thử'); assert.equal(r.body.data.registrationId, reg.id); assert.ok(!JSON.stringify(r.body).includes('storedPath'));
    assert.deepEqual(await fs.readFile(await files.resolveFile(report.storedPath)), pdf);
    assert.equal((await request('/student/reports', 'POST', upload())).status, 409); assert.equal(created.size, 1);
  });
  await t.test('case 2: reject over 10MB without disk write', async () => { assert.equal((await request('/student/reports', 'POST', upload('large.pdf', 'application/pdf', Buffer.alloc(files.MAX_SIZE + 1)))).status, 413); assert.equal(created.size, 1); });
  await t.test('case 3: reject exe, mismatched MIME and forged PDF contents', async () => {
    for (const body of [upload('bad.exe', 'application/octet-stream'), upload('bad.pdf', 'image/png'), upload('bad.pdf', 'application/pdf', Buffer.from('console.log(1)'))]) assert.equal((await request('/student/reports', 'POST', body)).status, 400);
    assert.equal(created.size, 1);
  });
  await t.test('case 4: unassigned lecturer cannot read, download or process', async () => {
    for (const [path, method, body] of [['/lecturer/reports/1', 'GET'], ['/lecturer/reports/1/download', 'GET'], ['/lecturer/reports/1/request-revision', 'PUT', { nhanXet: 'Sai quyền' }], ['/lecturer/reports/1/approve', 'PUT']]) assert.equal((await request(path, method, body, 'GIANG_VIEN', '44')).status, 403);
  });
  await t.test('owner and assigned lecturer download correct bytes, other student denied', async () => {
    const s = await request('/student/reports/1/download'); assert.equal(s.status, 200); assert.deepEqual(s.body, pdf); assert.match(s.headers.get('content-disposition'), /^attachment/); assert.equal(s.headers.get('x-content-type-options'), 'nosniff');
    const g = await request('/lecturer/reports/1/download', 'GET', undefined, 'GIANG_VIEN', '33'); assert.equal(g.status, 200); assert.deepEqual(g.body, pdf);
    for (const [path, method, body] of [['/student/reports/1/download', 'GET'], ['/student/reports/1', 'PUT', upload()], ['/student/reports/1', 'DELETE']]) assert.equal((await request(path, method, body, 'SINH_VIEN', '23')).status, 404);
  });
  await t.test('case 5: revision requires nonblank comment and persists CAN_CHINH_SUA', async () => {
    assert.equal((await request('/lecturer/reports/1/request-revision', 'PUT', { nhanXet: ' ' }, 'GIANG_VIEN', '33')).status, 400);
    const r = await request('/lecturer/reports/1/request-revision', 'PUT', { nhanXet: '  Bổ sung kết luận  ' }, 'GIANG_VIEN', '33'); assert.equal(r.status, 200); assert.equal(r.body.data.trangThai, 'CAN_CHINH_SUA');
    const s = await request('/student/reports'); assert.equal(s.body.report.nhanXetGiangVien, 'Bổ sung kết luận'); assert.equal(s.body.report.canDelete, false); assert.equal((await request('/student/reports/1', 'DELETE')).status, 409);
    assert.equal((await request('/lecturer/reports/1/approve', 'PUT', undefined, 'GIANG_VIEN', '33')).status, 409);
  });
  await t.test('case 6: resubmit returns DA_NOP, preserves review, removes old file', async () => {
    const old = report.storedPath; const r = await request('/student/reports/1', 'PUT', upload('ban-moi.pdf')); assert.equal(r.status, 200); assert.equal(r.body.data.trangThai, 'DA_NOP'); assert.equal(r.body.data.nhanXetGiangVien, 'Bổ sung kết luận'); assert.equal(r.body.data.ngayNop, '2026-10-03T03:00:00Z'); assert.notEqual(report.storedPath, old); await assert.rejects(files.resolveFile(old), { code: 'ENOENT' });
    assert.equal((await request('/student/reports/1', 'DELETE')).status, 409);
  });
  await t.test('title-only update retains file', async () => { const old = report.storedPath; const r = await request('/student/reports/1', 'PUT', { tenBaoCao: 'Tiêu đề mới' }); assert.equal(r.status, 200); assert.equal(report.storedPath, old); });
  await t.test('case 7: assigned lecturer approves submitted report', async () => { const r = await request('/lecturer/reports/1/approve', 'PUT', undefined, 'GIANG_VIEN', '33'); assert.equal(r.status, 200); assert.equal(r.body.data.trangThai, 'DA_DUYET'); assert.equal(report.nhanXetGiangVien, 'Bổ sung kết luận'); });
  await t.test('case 8: approved report cannot be edited or deleted', async () => { const old = report.storedPath; assert.equal((await request('/student/reports/1', 'PUT', upload())).status, 409); assert.equal((await request('/student/reports/1', 'DELETE')).status, 409); assert.equal(report.storedPath, old); assert.equal((await request('/student/reports')).body.report.canEdit, false); });
  await t.test('search/status filters scoped, no filesystem path in responses', async () => { const r = await request('/lecturer/reports?search=Test&trangThai=DA_DUYET', 'GET', undefined, 'GIANG_VIEN', '33'); assert.equal(r.status, 200); assert.equal(r.body.data.length, 1); assert.ok(!JSON.stringify(r.body).includes('storedPath')); assert.equal((await request('/lecturer/reports?trangThai=BAD', 'GET', undefined, 'GIANG_VIEN', '33')).status, 400); });
  await t.test('failed DB update removes new file and retains old file', async () => {
    report.trangThai = 'DA_NOP'; const old = report.storedPath; failWrite = true;
    const r = await request('/student/reports/1', 'PUT', upload()); failWrite = false; assert.equal(r.status, 500); assert.ok(!JSON.stringify(r.body).includes('private')); assert.equal(report.storedPath, old); await files.resolveFile(old);
    const latest = [...created].at(-1); assert.notEqual(latest, old); await assert.rejects(files.resolveFile(latest), { code: 'ENOENT' });
  });
  await t.test('delete only unprocessed submission, remove physical file', async () => { report.nhanXetGiangVien = null; const old = report.storedPath; assert.equal((await request('/student/reports/1', 'DELETE')).status, 200); assert.equal(report, null); await assert.rejects(files.resolveFile(old), { code: 'ENOENT' }); });
  await t.test('submission after internship end remains allowed without invented deadline', async () => { reg.ngayKetThuc = '2026-10-01'; assert.equal((await request('/student/reports', 'POST', upload())).status, 201); });
  await t.test('traversal is rejected; unsafe paths never deleted', async () => { await assert.rejects(files.resolveFile('../.env')); await assert.rejects(files.remove('reports/../../.env')); const old = report.storedPath; report.storedPath = '../.env'; const r = await request('/student/reports/1/download'); assert.equal(r.status, 400); assert.ok(!JSON.stringify(r.body).includes('.env')); report.storedPath = old; });
});
