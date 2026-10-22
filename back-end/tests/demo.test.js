const {test}=require('node:test'),assert=require('node:assert/strict');
const support=require('../scripts/demo-support');
const bcrypt=require('bcryptjs');const realHash=bcrypt.hash;bcrypt.hash=(password)=>realHash(password,4);
let manifest=null,rows=[],calls=[],mode='',serial=0,removed=[];
const db={async connect(){return {...db,release(){}};},async end(){},async query(sql,p=[]){calls.push({sql,p});
 if(sql==='BEGIN'||sql==='COMMIT'||sql==='ROLLBACK'||sql.startsWith('SET ')||sql.includes('pg_advisory'))return {rows:[]};
 if(sql.startsWith('SELECT current_database'))return {rows:[{name:'unit-demo',oid:'1',host:'local',port:5432}]};
 if(sql.includes('AS eligible'))return {rows:[{eligible:mode!=='wrong-major'}]};
 if(sql.startsWith('SELECT n.id AS major_id'))return {rows:mode==='no-reference'?[]:[{major_id:'3',ten_nganh:'Ngành A',ma_lop:'DA23A',khoa_nhap_hoc:2023,prefix_mssv:'1101'},{major_id:'4',ten_nganh:'Ngành B',ma_lop:'DA24B',khoa_nhap_hoc:2024,prefix_mssv:'1121'}]};
 if(sql.startsWith('SELECT id,ho_ten,khoa_don_vi'))return {rows:Array.from({length:20},(_,i)=>({id:String(i+1),ho_ten:'Giảng viên Tham Chiếu',khoa_don_vi:'Khoa '+(i%4),hoc_vi:'Thạc sĩ',chuc_vu:'Giảng viên',linh_vuc:'Tham chiếu'}))};
 if(sql.startsWith('SELECT ma_sinh_vien AS code'))return {rows:[]};
 if(sql.startsWith('SELECT EXTRACT'))return {rows:[{year:2026,now:new Date()}]};
 if(sql.startsWith('SELECT n.id,n.ten_nganh')&&sql.includes('JOIN ma_mssv_nganh'))return {rows:[{id:'3',ten_nganh:'Công nghệ thông tin'}]};
 if(sql.startsWith('SELECT ma_lop'))return {rows:[{ma_lop:'DA23TTA'},{ma_lop:'DA23TTB'},{ma_lop:'DA23TTC'}]};
 if(sql.includes('FROM nganh_hoc n JOIN lop_hoc'))return {rows:[{id:p[0]==='Ngành B'?'4':'3',tenNganh:p[0],maLop:p[1],khoaHoc:p[0]==='Ngành B'?2024:2023}]};
 if(sql.includes('SELECT prefix_mssv'))return {rows:[{prefix_mssv:p[0]==='4'?'1121':'1101'}]};
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
 await t.test('missing verified reference stops before writes',async()=>{reset();mode='no-reference';await assert.rejects(seed());assert.ok(!calls.some(x=>x.sql.startsWith('INSERT')));});
 await t.test('existing email is never adopted, changed or deleted',async()=>{reset();mode='collision';await assert.rejects(seed(),/Email demo/);assert.ok(!calls.some(x=>x.sql.startsWith('INSERT')));assert.equal(calls.at(-1).sql,'ROLLBACK');});
 await t.test('20+20 accounts use required bcrypt passwords, no Admin, no duplicate, and scoped clear',async()=>{
 reset();delete process.env.DEMO_PASSWORD;await seed();
 const users=rows.filter(r=>r.table==='nguoi_dung'),students=rows.filter(r=>r.table==='sinh_vien'),teachers=rows.filter(r=>r.table==='giang_vien');
 assert.equal(users.length,40);assert.equal(students.length,20);assert.equal(teachers.length,20);assert.equal(rows.filter(r=>r.table==='dang_ky_thuc_tap').length,20);
 assert.ok(users.every(r=>r.vai_tro!=='ADMIN'));assert.equal(new Set(students.map(r=>r.nganh)).size,2);
 for(const student of students){const user=users.find(u=>u.id===student.nguoi_dung_id);assert.equal(user.email,student.ma_sinh_vien+'@st.tvu.edu.vn');assert.ok(await bcrypt.compare(student.ma_sinh_vien,user.mat_khau_hash));assert.notEqual(student.ma_sinh_vien,user.mat_khau_hash);}
 for(const teacher of teachers){const user=users.find(u=>u.id===teacher.nguoi_dung_id);assert.ok(await bcrypt.compare('12345678',user.mat_khau_hash));assert.ok(teacher.danh_muc_giang_vien_id);}
 assert.ok(!JSON.stringify(manifest).includes('mat_khau_hash'));assert.ok(!rows.some(r=>['nganh_hoc','lop_hoc','ma_mssv_nganh','danh_muc_giang_vien_tvu'].includes(r.table)));
 await seed();assert.equal(rows.filter(r=>r.table==='nguoi_dung').length,40);calls=[];await clear();const deletes=calls.filter(x=>x.sql.startsWith('DELETE'));assert.equal(deletes.length,11);assert.ok(deletes.every(x=>x.sql.includes('ANY($1::bigint[])')));assert.equal(manifest,null);assert.equal(removed.length,0);
 });
 await t.test('major restriction failure rolls back seed',async()=>{reset();mode='wrong-major';await assert.rejects(seed(),e=>e.status===403);assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(manifest,null);});
 await t.test('failure rolls back and never writes a manifest',async()=>{reset();mode='insert-error';await assert.rejects(seed());assert.equal(calls.at(-1).sql,'ROLLBACK');assert.equal(manifest,null);});
 await t.test('changed roots and real-lecturer dependencies block all deletion',async()=>{reset();await seed();for(const state of ['changed','cross']){mode=state;calls=[];await assert.rejects(clear());assert.ok(!calls.some(x=>x.sql.startsWith('DELETE')));assert.equal(calls.at(-1).sql,'ROLLBACK');}});
 await t.test('wrong database blocks clear',async()=>{reset();await seed();manifest.database.oid='another';calls=[];await assert.rejects(clear(),/database/);assert.ok(!calls.some(x=>x.sql.startsWith('DELETE')));});
 await t.test('PDF header, cross-reference and permitted file type are valid',()=>{const buffer=support.pdf();assert.equal(reportFiles.validate({originalname:'demo.pdf',mimetype:'application/pdf',buffer}),'.pdf');const text=buffer.toString();const offset=Number(text.match(/startxref\n(\d+)/)[1]);assert.equal(text.slice(offset,offset+4),'xref');});
});
