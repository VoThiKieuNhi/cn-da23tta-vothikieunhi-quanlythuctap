const {test}=require('node:test');
const assert=require('node:assert/strict');
const {tinhTrangThaiDotThucTap,statusSql}=require('../src/utils/periodStatus');
const dot={ngayBatDauDangKy:'2026-10-01T08:00:00+07:00',ngayKetThucDangKy:'2026-10-10T17:00:00+07:00',ngayBatDauThucTap:'2026-10-12',ngayKetThucThucTap:'2026-12-06'};
const cases=[
 ['2026-10-01T07:59:59.999+07:00','SAP_MO'],
 ['2026-10-01T08:00:00+07:00','DANG_MO_DANG_KY'],
 ['2026-10-05T12:00:00+07:00','DANG_MO_DANG_KY'],
 ['2026-10-10T17:00:00+07:00','DANG_MO_DANG_KY'],
 ['2026-10-10T17:00:00.001+07:00','CHO_BAT_DAU'],
 ['2026-10-11T23:59:59.999+07:00','CHO_BAT_DAU'],
 ['2026-10-12T00:00:00+07:00','DANG_THUC_TAP'],
 ['2026-12-06T23:59:59.999+07:00','DANG_THUC_TAP'],
 ['2026-12-07T00:00:00+07:00','DA_KET_THUC'],
];
test('automatic status at every Vietnam time boundary',()=>{
 for(const [now,expected] of cases) assert.equal(tinhTrangThaiDotThucTap(dot,new Date(now)),expected,now);
 assert.match(statusSql('dt','$1'),/Asia\/Ho_Chi_Minh/);
});
module.exports={dot,cases};
