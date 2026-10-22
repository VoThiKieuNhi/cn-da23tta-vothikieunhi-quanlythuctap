const { test } = require('node:test');
const assert = require('node:assert/strict');
const majors = require('../src/services/periodMajors');
test('major selection preserves old clients, validates identifiers and requires explicit selection', () => {
  assert.equal(majors.parse({}), undefined);
  assert.deepEqual(majors.parse({ apDungTatCaNganh: true, nganhIds: [] }), []);
  assert.deepEqual(majors.parse({ apDungTatCaNganh: false, nganhIds: [1, '1', '2'] }), ['1', '2']);
  for (const body of [{ apDungTatCaNganh: false, nganhIds: [] }, { apDungTatCaNganh: 'false', nganhIds: [1] }, { apDungTatCaNganh: false, nganhIds: ['1;DROP'] }]) assert.throws(() => majors.parse(body), e => e.status === 400);
});
test('missing major and narrowing across existing students cannot delete current configuration', async () => {
  for (const mode of ['missing', 'enrolled']) {
    const calls = [];
    const client = { async query(sql) { calls.push(sql); return { rows: sql.startsWith('SELECT id FROM nganh_hoc') ? (mode === 'missing' ? [] : [{ id: 2 }]) : [{ id: 1 }] }; } };
    await assert.rejects(majors.save(client, 1, ['2'], true), e => e.status === (mode === 'missing' ? 400 : 409));
    assert.ok(!calls.some(sql => sql.startsWith('DELETE')));
  }
});
