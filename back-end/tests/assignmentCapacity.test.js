const { test } = require('node:test');
const assert = require('node:assert/strict');
let registrations, assignments, calls;
const file = require.resolve('../src/config/database');
const db = { async connect() { return { release() {}, async query(sql, params = []) {
  calls.push(sql);
  if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)) return { rows: [] };
  if (sql.startsWith('SELECT trang_thai')) return { rows: [registrations.get(params[0])] };
  if (sql.startsWith('SELECT id FROM phan_cong')) return { rows: assignments.has(params[0]) ? [{ id: params[0] }] : [] };
  if (sql.startsWith('SELECT gv.id')) return { rows: [{ id: params[0] }] };
  if (sql.startsWith('SELECT COUNT')) {
    assert.match(sql, /dk.dot_thuc_tap_id=\$2 AND dk.id<>\$3/);
    assert.ok(calls.slice(0, -1).some(q => q.includes('FOR UPDATE OF gv')));
    return { rows: [{ total: [...assignments].filter(([id, lecturer]) => lecturer === params[0] && registrations.get(id).dot_thuc_tap_id === params[1] && id !== params[2]).length }] };
  }
  if (sql.startsWith('INSERT') || sql.startsWith('UPDATE phan_cong')) {
    assignments.set(params[0], params[1]); return { rows: [{ id: params[0] }] };
  }
  throw new Error('Unexpected SQL');
} }; } };
require.cache[file] = { id: file, filename: file, loaded: true, exports: db };
const { create } = require('../src/controllers/assignmentAdminController');
function setup(count, period = '7', current = null) {
  calls = []; registrations = new Map(); assignments = new Map();
  for (let i = 1; i <= count; i++) {
    registrations.set(String(i), { trang_thai: 'DA_DUYET', dot_thuc_tap_id: '7' });
    assignments.set(String(i), '2');
  }
  registrations.set('99', { trang_thai: 'DA_DUYET', dot_thuc_tap_id: period });
  if (current) assignments.set('99', current);
}
async function run(method, expected) {
  const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  await create({ method, params: { id: '99' }, body: { giangVienId: '2' } }, res);
  assert.equal(res.code, expected);
  assert.equal(calls.at(-1), expected === 409 ? 'ROLLBACK' : 'COMMIT');
  if (expected === 409) assert.equal(res.body.message, 'Giảng viên đã đạt giới hạn tối đa 10 sinh viên trong đợt thực tập này.');
}
test('capacity: assign tenth student to lecturer with nine', async () => { setup(9); await run('POST', 201); assert.equal(assignments.size, 10); });
test('capacity: eleventh student rejected without assignment', async () => { setup(10); await run('POST', 409); assert.equal(assignments.has('99'), false); });
test('capacity: ten in period A do not consume capacity in period B', async () => { setup(10, '8'); await run('POST', 201); assert.equal(assignments.get('99'), '2'); });
test('capacity: reassign to lecturer with nine reaches ten', async () => { setup(9, '7', '3'); await run('PUT', 200); assert.equal([...assignments.values()].filter(x => x === '2').length, 10); });
test('capacity: reassign to full lecturer preserves previous lecturer', async () => { setup(10, '7', '3'); await run('PUT', 409); assert.equal(assignments.get('99'), '3'); });
test('capacity: keeping same lecturer at ten excludes current registration', async () => { setup(9, '7', '2'); await run('PUT', 200); assert.equal(assignments.size, 10); });
