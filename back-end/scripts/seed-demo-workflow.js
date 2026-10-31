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
if(require.main===module)seedWorkflow().catch(s.safeError).finally(()=>pool.end());
module.exports=seedWorkflow;
