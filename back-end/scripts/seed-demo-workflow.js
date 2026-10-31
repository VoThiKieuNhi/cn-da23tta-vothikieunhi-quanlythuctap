require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const pool=require('../src/config/database'),s=require('./demo-support'),files=require('../src/services/reportFiles');
const eligibility=require('../src/services/registrationEligibility');
const {evaluationInput}=require('../src/utils/evaluationRules');
async function seedWorkflow(){
 const c=await pool.connect(),createdFiles=[];let committed=false,commitAttempted=false,manifestChanged=false,original;
 try{
  await c.query('BEGIN');await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'");await c.query('SELECT pg_advisory_xact_lock(74120301)');
  const m=await s.readManifest();
  if(!m||m.profile!=='multi-major-20-v2'||JSON.stringify(m.database)!==JSON.stringify(await s.identity(c)))throw s.fail('Cần bộ demo 20 sinh viên/20 giảng viên đúng database trước khi bổ sung luồng.');
  await s.verifyRoots(c,m);
  if(m.workflowVersion===1){await c.query('COMMIT');console.log('Luồng demo đã tồn tại; không ghi đè dữ liệu hoặc mật khẩu.');return;}
  original=JSON.stringify(m,null,2);
  const ids=table=>m.records.filter(r=>r.table===table).map(r=>r.id);
  const regs=ids('dang_ky_thuc_tap'),teachers=ids('giang_vien');
  if(regs.length!==20||teachers.length!==20)throw s.fail('Bộ demo không đủ 20 sinh viên/20 giảng viên.');
  // Never overwrite progress made by people using the demo accounts.
  for(const table of ['phan_cong_giang_vien','tien_do_thuc_tap','bao_cao_thuc_tap','danh_gia_thuc_tap'])if((await c.query(`SELECT id FROM ${table} WHERE dang_ky_thuc_tap_id=ANY($1::bigint[]) LIMIT 1`,[regs])).rows.length)throw s.fail('Demo đã có nghiệp vụ phát sinh. Dừng để tránh ghi đè dữ liệu.');
  const rows=(await c.query('SELECT * FROM dang_ky_thuc_tap WHERE id=ANY($1::bigint[]) ORDER BY id FOR UPDATE',[regs])).rows;
  if(rows.some(r=>r.trang_thai!=='CHO_DUYET'))throw s.fail('Trạng thái demo đã thay đổi. Không ghi đè.');
  // Reuse existing schedules read-only; never alter real periods or invent academic years.
  const periods=(await c.query(`SELECT id,to_char(ngay_bat_dau_thuc_tap,'YYYY-MM-DD') AS start,to_char(ngay_ket_thuc_thuc_tap,'YYYY-MM-DD') AS finish,
    ngay_ket_thuc_thuc_tap<CURRENT_DATE AS ended,ngay_bat_dau_dang_ky AS opening,ngay_ket_thuc_dang_ky AS closing
    FROM dot_thuc_tap WHERE ngay_bat_dau_thuc_tap<=CURRENT_DATE-14 AND ngay_ket_thuc_thuc_tap>=ngay_bat_dau_thuc_tap+13
    AND ngay_ket_thuc_dang_ky<ngay_bat_dau_thuc_tap ORDER BY ngay_ket_thuc_thuc_tap DESC FOR SHARE`)).rows;
  const active=periods.find(p=>!p.ended),ended=periods.find(p=>p.ended);
  if(!active||!ended)throw s.fail('Cần đợt đang thực tập ít nhất 2 tuần và đợt đã kết thúc phù hợp để seed luồng; không tự sửa lịch đợt hiện có.');
  const add=(table,data)=>s.insert(c,m,table,data);
  for(let i=0;i<20;i++){
   const r=rows[i];if(i<5)continue;
   const lecturer=teachers[Math.floor((i-5)/5)];
   const period=i>=16?ended:i>=10?active:null;
   if(period){
    await eligibility.check(c,r.sinh_vien_id,period.id,{ngayBatDauThucTap:period.start,ngayKetThucThucTap:period.finish},r.id);
    await c.query('UPDATE dang_ky_thuc_tap SET dot_thuc_tap_id=$2,ngay_bat_dau=$3,ngay_ket_thuc=$4 WHERE id=$1',[r.id,period.id,period.start,period.finish]);
    m.records.find(x=>x.table==='dang_ky_thuc_tap'&&x.id===String(r.id)).keys.dot_thuc_tap_id=String(period.id);
   }
   const periodId=period?.id||r.dot_thuc_tap_id;
   await c.query('SELECT id FROM giang_vien WHERE id=$1 FOR UPDATE',[lecturer]);
   const count=(await c.query('SELECT COUNT(*)::int AS total FROM phan_cong_giang_vien pc JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id WHERE pc.giang_vien_id=$1 AND dk.dot_thuc_tap_id=$2',[lecturer,periodId])).rows[0].total;
   if(count>=10)throw s.fail('Giảng viên demo đã đủ 10 sinh viên trong đợt.');
   await add('phan_cong_giang_vien',{dang_ky_thuc_tap_id:r.id,giang_vien_id:lecturer,ghi_chu:'Phân công demo',...(period?{ngay_phan_cong:period.start+'T00:00:00+07:00'}:{})});
   await c.query('UPDATE dang_ky_thuc_tap SET trang_thai=$2 WHERE id=$1',[r.id,i<10?'DA_DUYET':i<16?'DANG_THUC_TAP':'HOAN_THANH']);
   if(i<10)continue;
   for(let week=1;week<=2;week++){
    const day=new Date(Date.parse(period.start+'T00:00:00Z')+(week*7-1)*86400000).toISOString().slice(0,10);
    await add('tien_do_thuc_tap',{dang_ky_thuc_tap_id:r.id,so_tuan:week,tieu_de:week===1?'Tìm hiểu môi trường và quy trình':'Thực hiện nhiệm vụ chuyên môn',noi_dung:`Báo cáo demo ${i+1}: ${week===1?'Tìm hiểu nội quy, phối hợp với cán bộ hướng dẫn.':'Thực hiện nhiệm vụ được giao, tổng hợp kết quả và khó khăn.'}`,ngay_bao_cao:day,nhan_xet_giang_vien:week===1?'Đã nắm được quy trình. Tiếp tục cập nhật kết quả công việc.':null});
   }
   if(i>=12){
    const uploaded=await files.save({originalname:'bao-cao-demo.pdf',mimetype:'application/pdf',buffer:s.pdf()},r.id);createdFiles.push(uploaded.stored);m.files.push(uploaded.stored);
    await add('bao_cao_thuc_tap',{dang_ky_thuc_tap_id:r.id,ten_bao_cao:'Báo cáo thực tập demo '+(i+1),ten_file:uploaded.name,duong_dan_file:uploaded.stored,trang_thai:i>=16?'DA_DUYET':i%2?'CAN_CHINH_SUA':'DA_NOP',nhan_xet_giang_vien:i>=16?'Báo cáo đạt yêu cầu.':i%2?'Bổ sung kết quả công việc và minh chứng.':null});
   }
   if(i>=16){
    const score=evaluationInput({diemChuyenMon:7+(i-16)*0.5,diemThaiDo:8,diemBaoCao:7.5,nhanXet:'Hoàn thành yêu cầu thực tập; kết quả minh họa cho bộ demo.'});
    await add('danh_gia_thuc_tap',{dang_ky_thuc_tap_id:r.id,giang_vien_id:lecturer,diem_chuyen_mon:score.diemChuyenMon,diem_thai_do:score.diemThaiDo,diem_bao_cao:score.diemBaoCao,diem_tong:score.diemTong,nhan_xet:score.nhanXet});
   }
  }
  m.workflowVersion=1;
  await s.fs.writeFile(s.manifestPath+'.workflow-backup',original,{flag:'wx'});
  await s.fs.writeFile(s.manifestPath+'.tmp',JSON.stringify(m,null,2));await s.fs.rename(s.manifestPath+'.tmp',s.manifestPath);manifestChanged=true;
  commitAttempted=true;await c.query('COMMIT');committed=true;
  console.log('Demo: 20 sinh viên, 20 giảng viên, 20 đăng ký, 15 phân công, 20 tiến độ, 8 báo cáo PDF thật, 4 đánh giá. Không đổi mật khẩu.');
 }catch(e){
  if(!committed)await c.query('ROLLBACK').catch(()=>{});
  if(!commitAttempted){if(manifestChanged)await s.fs.writeFile(s.manifestPath,original);for(const file of createdFiles)await files.cleanup(file);}
  throw e;
 }finally{c.release();}
}
async function seedDiemHanh(){
 const c=await pool.connect(),createdFiles=[];
 let original,manifestChanged=false,commitAttempted=false;
 try{
  await c.query('BEGIN');await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'");await c.query('SELECT pg_advisory_xact_lock(74120301)');
  const m=await s.readManifest();
  if(!m||m.profile!=='multi-major-20-v2'||JSON.stringify(m.database)!==JSON.stringify(await s.identity(c)))throw s.fail('Không có manifest demo đúng database.');
  original=JSON.stringify(m,null,2);
  const account=(await c.query("SELECT id,vai_tro,dang_hoat_dong FROM nguoi_dung WHERE lower(email)=$1 FOR UPDATE",['diemhanh@tvu.edu.vn'])).rows[0];
  if(account&&account.vai_tro!=='GIANG_VIEN')throw s.fail('Email Điểm Hạnh thuộc vai trò khác; không ghi đè.');
  // The existing demo account was renamed explicitly by the user. Reconcile only
  // this account's email; verify its original creation fingerprint and all other roots.
  const accountRoot=account&&m.records.find(r=>r.table==='nguoi_dung'&&r.id===String(account.id));
  if(accountRoot)accountRoot.keys.email='diemhanh@tvu.edu.vn';
  await s.verifyRoots(c,{records:m.records.filter(r=>r.table==='nguoi_dung'&&r.id===String(account?.id)||r.table==='giang_vien'&&r.keys?.nguoi_dung_id===String(account?.id))});
  const verifySelected=async registrations=>{
   const regIds=registrations.map(r=>String(r.id)),studentIds=registrations.map(r=>String(r.sinh_vien_id));
   const studentRoots=m.records.filter(r=>r.table==='sinh_vien'&&studentIds.includes(r.id));
   const userIds=studentRoots.map(r=>r.keys.nguoi_dung_id);
   await s.verifyRoots(c,{records:m.records.filter(r=>r.table==='dang_ky_thuc_tap'&&regIds.includes(r.id)||r.table==='sinh_vien'&&studentIds.includes(r.id)||r.table==='nguoi_dung'&&userIds.includes(r.id))});
  };
  const targetRecords=[];
  const addTarget=(table,data)=>s.insert(c,{records:targetRecords},table,data);
  let userId=account?.id;
  if(!userId)userId=await addTarget('nguoi_dung',{email:'diemhanh@tvu.edu.vn',mat_khau_hash:await require('bcryptjs').hash('12345678',12),vai_tro:'GIANG_VIEN',dang_hoat_dong:true});
  let lecturer=(await c.query('SELECT id FROM giang_vien WHERE nguoi_dung_id=$1 FOR UPDATE',[userId])).rows[0];
  if(!lecturer){
   // The reference catalog has no email/code column; do not infer verified identity by name.
   const id=await addTarget('giang_vien',{nguoi_dung_id:userId,ma_giang_vien:'DEMO-DIEMHANH',ho_ten:'Điểm Hạnh',hoc_vi:'ThS.',bo_mon:'Công nghệ thông tin',so_dien_thoai:'0900000016',chuc_vu:'Giảng viên DEMO',linh_vuc:'Dữ liệu demo, không phải danh mục TVU xác minh'});
   lecturer={id};
  }
  if(account&&!account.dang_hoat_dong)throw s.fail('Tài khoản Điểm Hạnh đang ngừng hoạt động; không tự mở khóa.');
  const assignments=async()=> (await c.query('SELECT pc.dang_ky_thuc_tap_id,dk.dot_thuc_tap_id,sv.ma_sinh_vien FROM phan_cong_giang_vien pc JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id WHERE pc.giang_vien_id=$1 ORDER BY sv.ma_sinh_vien',[lecturer.id])).rows;
  if(m.diemhanh){
   await verifySelected((await c.query('SELECT id,sinh_vien_id FROM dang_ky_thuc_tap WHERE id=ANY($1::bigint[])',[m.diemhanh.registrationIds])).rows);
   const rows=await assignments();
   if(rows.length!==10||rows.some(r=>String(r.dot_thuc_tap_id)!==m.diemhanh.periodId||!m.diemhanh.registrationIds.includes(String(r.dang_ky_thuc_tap_id)))||!rows.some(r=>r.ma_sinh_vien==='110123033'))throw s.fail('Bộ demo Điểm Hạnh đã thay đổi; không tự ghi đè.');
   for(const file of m.diemhanh.files)await files.resolveFile(file);
   await c.query('COMMIT');console.log('Demo Điểm Hạnh đã có đúng 10/10; không tạo trùng hoặc đổi dữ liệu.');return;
  }
  if((await assignments()).length)throw s.fail('Giảng viên đã có phân công ngoài manifest Điểm Hạnh; cần đối chiếu trước khi seed.');
  const {tinhTrangThaiDotThucTap}=require('../src/utils/periodStatus');
  const periods=(await c.query(`SELECT * FROM dot_thuc_tap WHERE ngay_bat_dau_dang_ky<=ngay_ket_thuc_dang_ky
   AND ngay_ket_thuc_dang_ky<ngay_bat_dau_thuc_tap AND ngay_bat_dau_thuc_tap<ngay_ket_thuc_thuc_tap
   AND ngay_bat_dau_thuc_tap<=CURRENT_DATE-13 AND ngay_ket_thuc_thuc_tap>=CURRENT_DATE ORDER BY id FOR SHARE`)).rows;
  const period=periods.find(p=>tinhTrangThaiDotThucTap(p)==='DANG_THUC_TAP');
  if(!period)throw s.fail('Không có đợt đang thực tập hợp lệ đủ 2 tuần; không sửa lịch thật để seed.');
  const special=(await c.query(`SELECT dk.* FROM dang_ky_thuc_tap dk JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN nguoi_dung nd ON nd.id=sv.nguoi_dung_id
   WHERE lower(nd.email)=$1 AND dk.trang_thai IN ('DA_DUYET','DANG_THUC_TAP') AND dk.ngay_bat_dau<=CURRENT_DATE AND dk.ngay_ket_thuc>=CURRENT_DATE
   ORDER BY dk.id LIMIT 1 FOR UPDATE OF dk`,['110123033@st.tvu.edu.vn'])).rows[0];
  if(!special)throw s.fail('Sinh viên test 110123033 chưa có đăng ký được duyệt đang thực tập.');
  const demoIds=m.records.filter(r=>r.table==='dang_ky_thuc_tap').map(r=>r.id);
  const candidates=(await c.query(`SELECT dk.* FROM dang_ky_thuc_tap dk WHERE dk.id=ANY($1::bigint[])
   AND dk.trang_thai IN ('CHO_DUYET','DA_DUYET')
   AND NOT EXISTS(SELECT 1 FROM tien_do_thuc_tap WHERE dang_ky_thuc_tap_id=dk.id)
   AND NOT EXISTS(SELECT 1 FROM bao_cao_thuc_tap WHERE dang_ky_thuc_tap_id=dk.id)
   AND NOT EXISTS(SELECT 1 FROM danh_gia_thuc_tap WHERE dang_ky_thuc_tap_id=dk.id)
   ORDER BY dk.id FOR UPDATE`,[demoIds])).rows;
  if(candidates.length<9)throw s.fail('Không đủ 9 đăng ký demo chưa phát sinh báo cáo/đánh giá; không ghi đè dữ liệu khác.');
  const selected=[special,...candidates.slice(0,9)],teacherIds=m.records.filter(r=>r.table==='giang_vien').map(r=>r.id);
  await verifySelected(selected);
  const dot={ngayBatDauThucTap:period.ngay_bat_dau_thuc_tap,ngayKetThucThucTap:period.ngay_ket_thuc_thuc_tap};
  const snapshots=[];
  for(let i=0;i<selected.length;i++){
   const r=selected[i];
   await c.query('SELECT id FROM sinh_vien WHERE id=$1 FOR UPDATE',[r.sinh_vien_id]);
   await eligibility.check(c,r.sinh_vien_id,period.id,dot,r.id);
   if((await c.query('SELECT id FROM dang_ky_thuc_tap WHERE sinh_vien_id=$1 AND dot_thuc_tap_id=$2 AND id<>$3',[r.sinh_vien_id,period.id,r.id])).rows.length)throw s.fail('Sinh viên đã có đăng ký khác trong đợt đích.');
   const current=(await c.query('SELECT * FROM phan_cong_giang_vien WHERE dang_ky_thuc_tap_id=$1 FOR UPDATE',[r.id])).rows[0];
   if(i!==0&&current&&!teacherIds.includes(String(current.giang_vien_id)))throw s.fail('Đăng ký demo đang thuộc giảng viên ngoài bộ demo; không tự chuyển.');
   if(i!==0&&current)await s.verifyRoots(c,{records:m.records.filter(x=>x.table==='giang_vien'&&x.id===String(current.giang_vien_id))});
   for(const table of ['tien_do_thuc_tap','bao_cao_thuc_tap','danh_gia_thuc_tap'])if((await c.query(`SELECT id FROM ${table} WHERE dang_ky_thuc_tap_id=$1 LIMIT 1`,[r.id])).rows.length)throw s.fail('Đăng ký đã có dữ liệu nghiệp vụ; không thay đổi lịch hoặc nhận xét.');
   if(!(await c.query('SELECT id FROM can_bo_huong_dan WHERE id=$1 AND doanh_nghiep_id=$2',[r.can_bo_huong_dan_id,r.doanh_nghiep_id])).rows.length)throw s.fail('Cán bộ không thuộc doanh nghiệp.');
   snapshots.push({registration:r,assignment:current||null});
   await c.query("UPDATE dang_ky_thuc_tap SET dot_thuc_tap_id=$2,ngay_bat_dau=$3,ngay_ket_thuc=$4,trang_thai='DA_DUYET' WHERE id=$1",[r.id,period.id,dot.ngayBatDauThucTap,dot.ngayKetThucThucTap]);
   const root=m.records.find(x=>x.table==='dang_ky_thuc_tap'&&x.id===String(r.id));if(root)root.keys.dot_thuc_tap_id=String(period.id);
   const capacity=(await c.query('SELECT COUNT(*)::int AS total FROM phan_cong_giang_vien pc JOIN dang_ky_thuc_tap dk ON dk.id=pc.dang_ky_thuc_tap_id WHERE pc.giang_vien_id=$1 AND dk.dot_thuc_tap_id=$2 AND dk.id<>$3',[lecturer.id,period.id,r.id])).rows[0].total;
   if(capacity>=10)throw s.fail('Giảng viên đã đạt giới hạn tối đa 10 sinh viên trong đợt thực tập này.');
   if(current)await c.query("UPDATE phan_cong_giang_vien SET giang_vien_id=$2,ghi_chu='Phân công demo Điểm Hạnh',ngay_phan_cong=NOW() WHERE dang_ky_thuc_tap_id=$1",[r.id,lecturer.id]);
   else await s.insert(c,m,'phan_cong_giang_vien',{dang_ky_thuc_tap_id:r.id,giang_vien_id:lecturer.id,ghi_chu:'Phân công demo Điểm Hạnh'});
   // Historical demo snapshots: the calendar is unchanged; all progress dates fall inside it.
   const childManifest=i===0?{records:[]}:m;
   for(let week=1;week<=2;week++){
    const day=new Date(Date.parse(dot.ngayBatDauThucTap+'T00:00:00Z')+(week*7-1)*86400000).toISOString().slice(0,10);
    await s.insert(c,childManifest,'tien_do_thuc_tap',{dang_ky_thuc_tap_id:r.id,so_tuan:week,tieu_de:week===1?'Tìm hiểu quy trình làm việc':'Thực hiện công việc chuyên môn',noi_dung:`Nhật ký demo sinh viên ${i+1}: ${week===1?'Tìm hiểu đơn vị và nhiệm vụ thực tập.':'Tổng hợp kết quả nhiệm vụ được hướng dẫn.'}`,ngay_bao_cao:day,nhan_xet_giang_vien:week===1?'Đã nắm được quy trình, tiếp tục cập nhật kết quả.':null});
   }
   if(i>=3){
    const upload=await files.save({originalname:'bao-cao-demo-diemhanh.pdf',mimetype:'application/pdf',buffer:s.pdf()},r.id);createdFiles.push(upload.stored);m.files.push(upload.stored);
    await s.insert(c,m,'bao_cao_thuc_tap',{dang_ky_thuc_tap_id:r.id,ten_bao_cao:'Báo cáo thực tập demo '+(i+1),ten_file:upload.name,duong_dan_file:upload.stored,trang_thai:i<6?'DA_NOP':i<8?'CAN_CHINH_SUA':'DA_DUYET',nhan_xet_giang_vien:i<6?null:i<8?'Bổ sung minh chứng và kết quả công việc.':'Báo cáo đạt yêu cầu.'});
   }
   if(i===9){const score=evaluationInput({diemChuyenMon:8,diemThaiDo:9,diemBaoCao:8,nhanXet:'Kết quả demo: hoàn thành yêu cầu thực tập.'});await s.insert(c,m,'danh_gia_thuc_tap',{dang_ky_thuc_tap_id:r.id,giang_vien_id:lecturer.id,diem_chuyen_mon:score.diemChuyenMon,diem_thai_do:score.diemThaiDo,diem_bao_cao:score.diemBaoCao,diem_tong:score.diemTong,nhan_xet:score.nhanXet});}
   await c.query('UPDATE dang_ky_thuc_tap SET trang_thai=$2 WHERE id=$1',[r.id,i===9?'HOAN_THANH':'DANG_THUC_TAP']);
  }
  const rows=await assignments();if(rows.length!==10||rows.some(r=>String(r.dot_thuc_tap_id)!==String(period.id)))throw s.fail('Kiểm tra cuối seed không đạt 10 sinh viên cùng đợt.');
  m.diemhanh={version:1,lecturerId:String(lecturer.id),periodId:String(period.id),registrationIds:selected.map(r=>String(r.id)),files:createdFiles,targetRecords,snapshots};
  const backup=s.manifestPath+'.diemhanh-'+require('node:crypto').randomUUID()+'.backup';await s.fs.writeFile(backup,original,{flag:'wx'});
  await s.fs.writeFile(s.manifestPath+'.tmp',JSON.stringify(m,null,2));await s.fs.rename(s.manifestPath+'.tmp',s.manifestPath);manifestChanged=true;
  commitAttempted=true;await c.query('COMMIT');console.log(JSON.stringify({lecturerId:lecturer.id,periodId:period.id,assignedCount:rows.length,maxCapacity:10,mssv:rows.map(r=>r.ma_sinh_vien)}));
 }catch(e){await c.query('ROLLBACK').catch(()=>{});if(!commitAttempted){if(manifestChanged)await s.fs.writeFile(s.manifestPath,original);for(const file of createdFiles)await files.cleanup(file);}throw e;}finally{c.release();}
}
if(require.main===module)(process.argv.includes('--diemhanh')?seedDiemHanh():seedWorkflow()).catch(s.safeError).finally(()=>pool.end());
module.exports=seedWorkflow;
module.exports.seedDiemHanh=seedDiemHanh;
