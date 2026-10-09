const {test}=require('node:test'),assert=require('node:assert/strict');
const service=require('../src/services/adminReportService');
test('report filters parameterize injection and reject malformed input',()=>{
 const f=service.filter({search:"%' OR 1=1--",nganhId:'13',hocKy:'1',namHoc:'2026 - 2027'});
 assert.ok(!f.where.includes('OR 1=1'));assert.ok(f.params.some(p=>p.includes('OR 1=1')));
 for(const q of [{page:'0'},{limit:'101'},{search:[]},{nganhId:'1;DROP'},{dotThucTapId:'9999999999999999999'},{trangThai:'X'}])assert.throws(()=>service.filter(q));
});
test('report base cannot fan out weekly progress and aggregates unique students',async()=>{
 let sql;await service.query({query:async s=>{sql=s;return {rows:[{}]};}},'overview',{});
 assert.ok(!sql.includes('tien_do_thuc_tap'));assert.match(sql,/COUNT\(DISTINCT "studentId"\)/);
 assert.equal((sql.match(/LIMIT 1/g)||[]).length,4);
});
