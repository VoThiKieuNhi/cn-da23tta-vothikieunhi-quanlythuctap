const {test}=require('node:test'),assert=require('node:assert/strict');
const support=require('../scripts/demo-support');
let manifest=null,rows=[],calls=[],mode='',serial=0,removed=[];
const db={async connect(){return {...db,release(){}};},async end(){},async query(sql,p=[]){calls.push({sql,p});
 if(sql==='BEGIN'||sql==='COMMIT'||sql==='ROLLBACK'||sql.startsWith('SET ')||sql.includes('pg_advisory'))return {rows:[]};
 if(sql.startsWith('SELECT current_database'))return {rows:[{name:'unit-demo',oid:'1',host:'local',port:5432}]};
 if(sql.startsWith('SELECT n.id,n.ten_nganh')&&sql.includes('JOIN ma_mssv_nganh'))return {rows:[{id:'3',ten_nganh:'Công nghệ thông tin'}]};
 if(sql.startsWith('SELECT ma_lop'))return {rows:[{ma_lop:'DA23TTA'},{ma_lop:'DA23TTB'},{ma_lop:'DA23TTC'}]};
 if(sql.includes('FROM nganh_hoc n JOIN lop_hoc'))return {rows:[{id:'3',tenNganh:p[0],maLop:p[1],khoaHoc:2023}]};
 if(sql.includes('SELECT prefix_mssv'))return {rows:[{prefix_mssv:'1101'}]};
 if(sql.startsWith('SELECT NOW()'))return {rows:[{opening:'2026-09-15T00:00:00+07:00',closing:'2026-09-25T00:00:00+07:00',start:'2026-09-30',finish:'2026-11-04',today:'2026-10-05'}]};
 if(sql.startsWith('INSERT')){if(mode==='insert-error'&&sql.includes('sinh_vien'))throw Object.assign(Error('private'),{code:'23514'});const [,table,columns]=sql.match(/INSERT INTO (\w+) \(([^)]+)\)/);const row={table,id:String(++serial),...Object.fromEntries(columns.split(',').map((k,i)=>[k,p[i]]))};rows.push(row);return {rows:[{id:row.id}]};}
 if(sql.startsWith('SELECT to_jsonb')){const table=sql.match(/FROM (\w+) t/)[1];const row=rows.find(r=>r.table===table&&r.id===String(p[0]));return {rows:row?[{...Object.fromEntries(Object.entries(row).map(([k,v])=>[k,String(v)])),created:mode==='changed'?'different':'creation'}]:[]};}
 if(sql.startsWith('SELECT dang_ky_thuc_tap_id,duong_dan_file'))return {rows:rows.filter(r=>r.table==='bao_cao_thuc_tap')};
 if(sql.startsWith('DELETE'))return {rowCount:1,rows:[]};
 if(sql.startsWith('SELECT id'))return {rows:mode==='collision'&&sql.includes('nguoi_dung')||mode==='cross'&&sql.includes('NOT (giang_vien_id')?[{id:'999'}]:[]};
 throw Error('Unexpected query: '+sql.slice(0,70));
}};
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
support.readManifest=async()=>manifest;support.writeManifest=async m=>{manifest=structuredClone(m);};support.fs.unlink=async p=>{assert.equal(p,support.manifestPath);manifest=null;};
const reportFiles=require('../src/services/reportFiles');reportFiles.save=async(file,id)=>{reportFiles.validate(file);return {stored:`reports/report_${id}_123_12345678-1234-1234-1234-123456789abc.pdf`,name:'bao-cao-demo.pdf'};};reportFiles.cleanup=async p=>removed.push(p);reportFiles.remove=async p=>removed.push(p);
const seed=require('../scripts/seed-demo'),clear=require('../scripts/clear-demo');
function reset(){manifest=null;rows=[];calls=[];mode='';serial=0;removed=[];process.env.DEMO_PASSWORD='test-only-password';}
test('demo lifecycle uses only mocked database/files',async t=>{
 t.mock.method(console,'log',()=>{});
 await t.test('missing/short password stops before SQL',async()=>{for(const password of ['', '1234567']){reset();process.env.DEMO_PASSWORD=password;await assert.rejects(seed(),/DEMO_PASSWORD/);assert.equal(calls.length,0);}});
 await t.test('existing email is never adopted, changed or deleted',async()=>{reset();mode='collision';await assert.rejects(seed(),/Email demo/);assert.ok(!calls.some(x=>x.sql.startsWith('INSERT')));assert.equal(calls.at(-1).sql,'ROLLBACK');});
 await t.test('full demo, no duplicate, and scoped clear',async()=>{reset();await seed();assert.equal(rows.filter(r=>r.table==='nguoi_dung').length,6);assert.equal(rows.filter(r=>r.table==='sinh_vien').length,3);assert.equal(rows.filter(r=>r.table==='tien_do_thuc_tap').length,3);assert.equal(rows.find(r=>r.table==='danh_gia_thuc_tap').diem_tong,8.5);assert.ok(!JSON.stringify(manifest).includes('mat_khau_hash'));assert.ok(!JSON.stringify(manifest).includes(process.env.DEMO_PASSWORD));assert.ok(!rows.some(r=>['nganh_hoc','lop_hoc','ma_mssv_nganh','danh_muc_giang_vien_tvu'].includes(r.table)));await assert.rejects(seed(),/already exists/);assert.equal(rows.filter(r=>r.table==='nguoi_dung').length,6);calls=[];await clear();const deletes=calls.filter(x=>x.sql.startsWith('DELETE'));assert.equal(deletes.length,11);assert.ok(deletes.every(x=>x.sql.includes('ANY($1::bigint[])')));assert.equal(manifest,null);assert.equal(removed.length,1);});
 await t.test('failure rolls back and never writes a manifest',async()=>{reset();mode='insert-error';await assert.rejects(seed());assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(manifest,null);});
 await t.test('changed roots and real-lecturer dependencies block all deletion',async()=>{reset();await seed();for(const state of ['changed','cross']){mode=state;calls=[];await assert.rejects(clear());assert.ok(!calls.some(x=>x.sql.startsWith('DELETE')));assert.equal(calls.at(-1).sql,'ROLLBACK');}});
 await t.test('wrong database blocks clear',async()=>{reset();await seed();manifest.database.oid='another';calls=[];await assert.rejects(clear(),/database/);assert.ok(!calls.some(x=>x.sql.startsWith('DELETE')));});
 await t.test('PDF header, cross-reference and permitted file type are valid',()=>{const buffer=support.pdf();assert.equal(reportFiles.validate({originalname:'demo.pdf',mimetype:'application/pdf',buffer}),'.pdf');const text=buffer.toString();const offset=Number(text.match(/startxref\n(\d+)/)[1]);assert.equal(text.slice(offset,offset+4),'xref');});
});
