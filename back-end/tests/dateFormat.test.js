const {test}=require('node:test'),assert=require('node:assert/strict');
test('dates use Vietnam timezone and hide invalid input',async()=>{
 const {formatDate,formatTime}=await import('../../front-end/src/utils/dateFormat.js');
 assert.equal(formatDate('2026-10-04'),'04/10/2026');assert.equal(formatTime('2026-10-03T17:00:00Z'),'04/10/2026 00:00');assert.equal(formatDate('invalid'),'—');assert.equal(formatTime(null),'—');
});
