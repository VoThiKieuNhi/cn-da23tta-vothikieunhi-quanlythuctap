const {test}=require('node:test'),assert=require('node:assert/strict');
let total=9,tail=Promise.resolve();
const file=require.resolve('../src/config/database');
require.cache[file]={id:file,filename:file,loaded:true,exports:{async connect(){let unlock;return {release(){},async query(sql){
 if(sql==='BEGIN')return {rows:[]};
 if(sql==='COMMIT'||sql==='ROLLBACK'){unlock?.();return {rows:[]};}
 if(sql.startsWith('SELECT trang_thai'))return {rows:[{trang_thai:'DA_DUYET',dot_thuc_tap_id:'7'}]};
 if(sql.startsWith('SELECT id FROM phan_cong'))return {rows:[]};
 if(sql.startsWith('SELECT gv.id')){
  assert.match(sql,/FOR UPDATE OF gv/);
  const previous=tail;tail=new Promise(resolve=>{unlock=resolve;});await previous;return {rows:[{id:1}]};
 }
 if(sql.startsWith('SELECT COUNT'))return {rows:[{total}]};
 if(sql.startsWith('INSERT')){total++;return {rows:[{id:1}]};}
 throw new Error('Unexpected SQL');
 } };}}};
const {create}=require('../src/controllers/assignmentAdminController');
test('two concurrent assignments at 9 slots serialize: one succeeds, one conflicts, total 10',async()=>{
 const run=async id=>{const result={code:200,status(code){this.code=code;return this;},json(data){this.data=data;return this;}};await create({params:{id},body:{giangVienId:1},method:'POST'},result);return result.code;};
 assert.deepEqual((await Promise.all([run('1'),run('2')])).sort(),[201,409]);assert.equal(total,10);
});
