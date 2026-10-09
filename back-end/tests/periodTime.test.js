const {test}=require('node:test');
const assert=require('node:assert/strict');
const backend=require('../src/utils/periodTime');
test('frontend/backend time validation and Vietnam conversions agree',async()=>{
  const frontend=await import('../../front-end/src/utils/periodTime.js');
  const now=new Date('2026-09-28T09:30:00+07:00');
  const valid={ngayBatDauDangKy:'2026-10-01T08:00:00+07:00',ngayKetThucDangKy:'2026-10-10T17:00:00+07:00',ngayBatDauThucTap:'2026-10-12',ngayKetThucThucTap:'2026-12-06',trangThai:'SAP_MO'};
  for(const changes of [{},{ngayBatDauDangKy:'2026-09-28T08:00:00+07:00'},{ngayKetThucDangKy:valid.ngayBatDauDangKy},{ngayBatDauThucTap:'2026-10-10'},{ngayKetThucDangKy:'2026-10-11T17:00:00Z'},{ngayBatDauDangKy:'2026-02-30T08:00:00+07:00'},{ngayBatDauDangKy:'2026-10-01T08:00'},{ngayBatDauDangKy:'2026-10-01T25:00:00+07:00'}]) {
    const data={...valid,...changes};assert.deepEqual(frontend.timeErrors(data),backend.timeErrors(data));
    for(const status of [null,'SAP_MO','DANG_MO_DANG_KY','DANG_THUC_TAP','DA_KET_THUC']) {
      const existing=status?{...valid,trangThai:status}:null;
      assert.equal(frontend.openingInPast(data,existing,now),backend.openingInPast(data,existing,now));
    }
  }
  assert.deepEqual(backend.timeErrors(valid),{});
  assert.ok(backend.timeErrors({...valid,ngayKetThucDangKy:'2026-10-11T17:00:00Z'}).ngayBatDauThucTap);
  assert.equal(frontend.toLocalInput('2026-09-30T17:00:00Z'),'2026-10-01T00:00');
  assert.equal(frontend.registrationText('2026-10-01T01:00:00Z'),'01/10/2026 08:00');
  const original={...valid,ngayKetThucDangKy:'2026-10-10T16:59:59.999Z'};
  const form={...original,ngayBatDauDangKy:frontend.toLocalInput(original.ngayBatDauDangKy),ngayKetThucDangKy:frontend.toLocalInput(original.ngayKetThucDangKy)};
  assert.deepEqual(frontend.periodPayload(form,original),original);
  assert.equal(frontend.periodPayload({...form,ngayBatDauDangKy:'2026-10-02T08:00'},original).ngayBatDauDangKy,'2026-10-02T08:00+07:00');
});
