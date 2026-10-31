const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),express=require('express'),jwt=require('jsonwebtoken');
const {profileInput}=require('../src/utils/studentProfileInput');
const valid={so_dien_thoai:'0901234567',ngay_sinh:'2004-02-29',gioi_tinh:'NU'};
test('profile validates phone, calendar date, Vietnam today, gender and protected fields',()=>{
 assert.deepEqual(profileInput(valid),{soDienThoai:valid.so_dien_thoai,ngaySinh:valid.ngay_sinh,gioiTinh:valid.gioi_tinh});
 for(const patch of [{so_dien_thoai:'123'},{ngay_sinh:'2003-02-29'},{ngay_sinh:'2099-01-01'},{gioi_tinh:'FEMALE'},{maSinhVien:'110123001'},{email:'other@st.tvu.edu.vn'},{vaiTro:'ADMIN'},{dangHoatDong:false}])assert.throws(()=>profileInput({...valid,...patch}),{status:400});
 assert.doesNotThrow(()=>profileInput({...valid,ngay_sinh:'2026-10-31'},new Date('2026-10-30T18:00:00Z')));
});
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
let calls=[],server,base;
const file=require.resolve('../src/config/database');
require.cache[file]={id:file,filename:file,loaded:true,exports:{async query(sql,params){if(sql.startsWith('/* session */'))return {rows:[{id:params[0],vai_tro:params[1]}]};calls.push({sql,params});return {rows:[{id:1}]};}}};
before(async()=>{const app=express();app.use(express.json());app.use('/api/student',require('../src/routes/studentRoutes'));await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base=`http://127.0.0.1:${server.address().port}`;});
after(()=>{server.close();server.closeAllConnections();});
test('profile endpoint enforces student JWT ownership and rejects protected updates',async()=>{
 for(const role of ['ADMIN','GIANG_VIEN','SINH_VIEN']){
  calls=[];const token=jwt.sign({id:42,email:'test@tvu.edu.vn',vaiTro:role},process.env.JWT_SECRET,{expiresIn:'1m'});
  const response=await fetch(base+'/api/student/profile',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(valid)});
  assert.equal(response.status,role==='SINH_VIEN'?200:403);
  if(role==='SINH_VIEN'){assert.deepEqual(calls[0].params,[valid.so_dien_thoai,valid.ngay_sinh,valid.gioi_tinh,42]);assert.match(calls[0].sql,/WHERE nguoi_dung_id=\$4/);}else assert.equal(calls.length,0);
 }
});

