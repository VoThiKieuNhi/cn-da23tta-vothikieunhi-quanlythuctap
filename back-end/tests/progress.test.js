const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
const {progressPermission}=require('../src/utils/progressRules');
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
let server,base,reg,rows,assigned,calls,snapshot;
function reset(){reg={id:'9',trangThai:'DA_DUYET',ngayBatDau:'2026-10-01',ngayKetThuc:'2026-12-06'};rows=[];assigned=true;calls=[];}
const db={async connect(){return {...db,release(){}};},async query(sql,p=[]){
 if(sql.startsWith('/* session */')) { const a=arguments[1]; return {rows:[{id:a[0],email:'session@example.test',vai_tro:a[1]}]}; }

 calls.push({sql,p});
 if(sql==='BEGIN'){snapshot=structuredClone({reg,rows});return {rows:[]};}
 if(sql==='ROLLBACK'){({reg,rows}=snapshot);return {rows:[]};}
 if(sql==='COMMIT'||sql.startsWith('SET LOCAL'))return {rows:[]};
 if(sql==='SELECT id FROM sinh_vien WHERE nguoi_dung_id=$1')return {rows:[{id:p[0]==='22'?'7':'8'}]};
 if(sql.includes('FROM dang_ky_thuc_tap dk JOIN doanh_nghiep')){assert.match(sql,/dk.sinh_vien_id=\$1/);assert.match(sql,/FOR UPDATE OF dk/);return {rows:p[0]==='7'?[{...reg}]:[]};}
 if(sql.startsWith('SELECT gv.ho_ten'))return {rows:assigned?[{hoTen:'Giảng viên kiểm thử'}]:[]};
 if(sql.startsWith('UPDATE dang_ky_thuc_tap')){reg.trangThai='DANG_THUC_TAP';return {rows:[]};}
 if(sql.startsWith('SELECT td.dang_ky_thuc_tap_id')){assert.match(sql,/td.id=\$1 AND dk.sinh_vien_id=\$2/);return {rows:p[1]==='7'&&rows.some(r=>r.id===p[0])?[{dang_ky_thuc_tap_id:'9'}]:[]};}
 if(sql.includes('FROM phan_cong_giang_vien pc JOIN giang_vien gv')&&sql.includes('gv.nguoi_dung_id=$1')){
   assert.equal(p[1],'9');return {rows:p[0]==='33'&&assigned?[{...reg,hoTen:'Sinh viên kiểm thử',maSinhVien:'TEST'}]:[]};
 }
 if(sql.startsWith('SELECT')&&sql.includes('FROM tien_do_thuc_tap')){
   if(sql.includes('WHERE id=$1')){assert.equal(p[1],'9');return {rows:rows.filter(r=>r.id===p[0]).map(r=>({...r}))};}
   assert.match(sql,/WHERE dang_ky_thuc_tap_id=\$1 ORDER BY so_tuan ASC/);assert.equal(p[0],'9');return {rows:[...rows].sort((a,b)=>a.soTuan-b.soTuan).map(r=>({...r}))};
 }
 if(sql.startsWith('INSERT INTO tien_do_thuc_tap')){
   assert.equal(p[0],'9');assert.match(sql,/CURRENT_DATE/);assert.equal(p.length,4);
   if(rows.some(r=>r.soTuan===p[1]))throw Object.assign(new Error('duplicate'),{code:'23505'});
   const row={id:String(rows.length+1),soTuan:p[1],tieuDe:p[2],noiDung:p[3],ngayBaoCao:'2026-10-02',nhanXetGiangVien:null};rows.push(row);return {rows:[{...row}]};
 }
 if(sql.startsWith('UPDATE tien_do_thuc_tap SET nhan_xet_giang_vien')){
   assert.equal(p[2],'9');assert.match(sql,/WHERE id=\$2 AND dang_ky_thuc_tap_id=\$3/);const row=rows.find(r=>r.id===p[1]);if(!row)return {rows:[]};row.nhanXetGiangVien=p[0];return {rows:[{...row}]};
 }
 if(sql.startsWith('UPDATE tien_do_thuc_tap SET so_tuan')){
   assert.equal(p[4],'9');assert.match(sql,/WHERE id=\$4 AND dang_ky_thuc_tap_id=\$5/);assert.doesNotMatch(sql.split('WHERE')[0],/nhan_xet_giang_vien|ngay_tao|dang_ky_thuc_tap_id/);
   const row=rows.find(r=>r.id===p[3]);if(rows.some(r=>r.soTuan===p[0]&&r.id!==p[3]))throw Object.assign(new Error('duplicate'),{code:'23505'});
   Object.assign(row,{soTuan:p[0],tieuDe:p[1],noiDung:p[2]});return {rows:[{...row}]};
 }
 if(sql.startsWith('DELETE FROM tien_do_thuc_tap')){assert.equal(p[1],'9');rows=rows.filter(r=>r.id!==p[0]);return {rows:[]};}
 throw new Error('Unexpected query in test');
}};
const file=require.resolve('../src/config/database');require.cache[file]={id:file,filename:file,loaded:true,exports:db};
before(async()=>{const app=express();app.use(express.json());app.use('/api/student',require('../src/routes/studentRoutes'));app.use('/api/lecturer',require('../src/routes/lecturerRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}/api`;});
after(()=>{server.close();server.closeAllConnections();});
async function request(path,method='GET',body,role='SINH_VIEN',user='22'){
 const headers={'Content-Type':'application/json'};if(role)headers.Authorization='Bearer '+jwt.sign({id:user,email:'test@example.test',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});
 const r=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,body:await r.json()};
}
const payload={soTuan:1,tieuDe:'  Tuần đầu  ',noiDung:'  Nội dung công việc  ',dangKyThucTapId:'999',nhanXetGiangVien:'Không được ghi',trangThai:'HOAN_THANH'};
test('weekly progress API authorization and lifecycle',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-02T10:00:00+07:00')});
 await t.test('JWT and correct role required before DB access',async()=>{reset();for(const [role,status]of [[null,401],['ADMIN',403],['GIANG_VIEN',403]])assert.equal((await request('/student/progress','GET',undefined,role)).status,status);assert.equal((await request('/lecturer/students/9/progress')).status,403);assert.equal(calls.length,0);});
 await t.test('case 1: before start rejects create and returns 0 percent',async()=>{reset();reg.ngayBatDau='2026-10-12';const r=await request('/student/progress','POST',payload);assert.equal(r.status,409);assert.equal(r.body.message,'Đợt thực tập chưa bắt đầu.');const list=await request('/student/progress');assert.equal(list.body.percent,0);assert.equal(list.body.canCreate,false);assert.equal(reg.trangThai,'DA_DUYET');});
 await t.test('case 2: active assigned approved registration creates, trims, ignores forged fields',async()=>{reset();const r=await request('/student/progress','POST',payload);assert.equal(r.status,201);assert.equal(r.body.data.tieuDe,'Tuần đầu');assert.equal(r.body.data.noiDung,'Nội dung công việc');assert.equal(r.body.data.nhanXetGiangVien,null);assert.equal(reg.trangThai,'DANG_THUC_TAP');});
 await t.test('case 3: duplicate week returns 409',async()=>{const r=await request('/student/progress','POST',payload);assert.equal(r.status,409);assert.equal(r.body.message,'Bạn đã cập nhật tiến độ cho tuần này.');assert.equal(rows.length,1);});
 await t.test('case 4: assigned lecturer reads progress',async()=>{const r=await request('/lecturer/students/9/progress','GET',undefined,'GIANG_VIEN','33');assert.equal(r.status,200);assert.equal(r.body.progress[0].soTuan,1);assert.equal(r.body.student.maSinhVien,'TEST');});
 await t.test('case 5: lecturer comments and student sees comment',async()=>{const r=await request('/lecturer/students/9/progress/1/comment','PUT',{nhanXet:'  Cần bổ sung chi tiết  '},'GIANG_VIEN','33');assert.equal(r.status,200);const list=await request('/student/progress');assert.equal(list.body.progress[0].nhanXetGiangVien,'Cần bổ sung chi tiết');assert.equal(list.body.progress[0].coTheXoa,false);assert.equal(list.body.progress[0].coTheSua,true);});
 await t.test('case 6: other lecturer cannot read or comment',async()=>{for(const [path,method,body]of [['/lecturer/students/9/progress','GET'],['/lecturer/students/9/progress/1/comment','PUT',{nhanXet:'Sai quyền'}]]){const r=await request(path,method,body,'GIANG_VIEN','44');assert.equal(r.status,403);assert.equal(r.body.message,'Bạn không được phân công hướng dẫn sinh viên này.');}});
 await t.test('case 7: commented progress cannot be deleted',async()=>{const r=await request('/student/progress/1','DELETE');assert.equal(r.status,409);assert.equal(r.body.message,'Không thể xóa tiến độ đã được giảng viên nhận xét.');assert.equal(rows.length,1);});
 await t.test('case 8: other student cannot read, edit or delete',async()=>{for(const method of ['GET','PUT','DELETE'])assert.equal((await request('/student/progress/1',method,method==='PUT'?payload:undefined,'SINH_VIEN','23')).status,404);});
 await t.test('editing preserves lecturer comment, lecturer can update own comment',async()=>{const r=await request('/student/progress/1','PUT',{...payload,noiDung:'Nội dung mới'});assert.equal(r.status,200);assert.equal(r.body.data.nhanXetGiangVien,'Cần bổ sung chi tiết');assert.equal((await request('/lecturer/students/9/progress/1/comment','PUT',{nhanXet:'Đã bổ sung'},'GIANG_VIEN','33')).status,200);assert.equal((await request('/student/progress/1')).body.data.nhanXetGiangVien,'Đã bổ sung');});
 await t.test('end of internship rejects writes but keeps read access and no auto completion',async()=>{reg.ngayKetThuc='2026-10-01';for(const [path,method]of [['/student/progress','POST'],['/student/progress/1','PUT'],['/student/progress/1','DELETE']]){const r=await request(path,method,method==='DELETE'?undefined:payload);assert.equal(r.status,409);assert.equal(r.body.message,'Thời gian thực tập đã kết thúc.');}const r=await request('/student/progress');assert.equal(r.body.percent,100);assert.equal(r.body.progress[0].coTheSua,false);assert.equal(reg.trangThai,'DANG_THUC_TAP');});
 await t.test('approval and assignment required',async()=>{reset();reg.trangThai='CHO_DUYET';assert.equal((await request('/student/progress','POST',payload)).status,409);reg.trangThai='DA_DUYET';assigned=false;assert.equal((await request('/student/progress','POST',payload)).status,409);assert.equal(reg.trangThai,'DA_DUYET');});
 await t.test('invalid inputs, blank comments and malformed IDs rejected',async()=>{reset();for(const body of [{...payload,soTuan:0},{...payload,soTuan:1.5},{...payload,soTuan:'1'},{...payload,tieuDe:' '},{...payload,noiDung:' '},{...payload,tieuDe:'a'.repeat(201)}])assert.equal((await request('/student/progress','POST',body)).status,400);assert.equal((await request('/student/progress/abc')).status,400);assert.equal((await request('/lecturer/students/9/progress/1/comment','PUT',{nhanXet:'  '},'GIANG_VIEN','33')).status,400);assert.equal(rows.length,0);});
 await t.test('sort weeks and delete uncommented progress',async()=>{reset();await request('/student/progress','POST',{...payload,soTuan:2});await request('/student/progress','POST',payload);const r=await request('/student/progress');assert.deepEqual(r.body.progress.map(x=>x.soTuan),[1,2]);assert.equal((await request('/student/progress/1','DELETE')).status,200);assert.equal(rows.length,1);});
});
test('Vietnam date boundaries include the entire final day',()=>{
 const r={trangThai:'DA_DUYET',giangVienHuongDan:{},ngayBatDau:'2026-10-01',ngayKetThuc:'2026-10-02'};
 assert.equal(progressPermission(r,new Date('2026-09-30T23:59:59+07:00')).allowed,false);
 assert.equal(progressPermission(r,new Date('2026-10-01T00:00:00+07:00')).allowed,true);
 assert.equal(progressPermission(r,new Date('2026-10-02T23:59:59+07:00')).allowed,true);
 assert.equal(progressPermission(r,new Date('2026-10-03T00:00:00+07:00')).allowed,false);
});
