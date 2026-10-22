require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const pool=require('../src/config/database'),s=require('./demo-support'),files=require('../src/services/reportFiles');
async function clear(){const c=await pool.connect();let committed=false;try{
 await c.query('BEGIN');await c.query("SET LOCAL TIME ZONE 'Asia/Ho_Chi_Minh'");await c.query('SELECT pg_advisory_xact_lock(74120301)');
 const m=await s.readManifest();if(!m){await c.query('ROLLBACK');console.log('Không có manifest demo; không xóa dữ liệu nào.');return;}
 if(m.version!==1||!Array.isArray(m.records)||JSON.stringify(m.database)!==JSON.stringify(await s.identity(c)))throw s.fail('Manifest không thuộc database đang kết nối. Không xóa dữ liệu.');
 await s.verifyRoots(c,m);
 const ids=table=>m.records.filter(r=>r.table===table).map(r=>r.id);
 const registrations=ids('dang_ky_thuc_tap'),teachers=ids('giang_vien');
 const current=m.profile==='multi-major-20-v2';
 if(current?(registrations.length!==20||teachers.length!==20||ids('sinh_vien').length!==20):(registrations.length!==3||teachers.length!==2||ids('sinh_vien').length!==3))throw s.fail('Manifest demo thiếu dữ liệu nhận diện.');
 if(current&&m.records.some(r=>r.table==='nguoi_dung'&&r.keys?.vai_tro==='ADMIN'))throw s.fail('Bộ demo mới không được chứa Admin.');
 if(!Array.isArray(m.files)||m.files.some(file=>typeof file!=='string'||!registrations.some(id=>file.startsWith(`reports/report_${id}_`))))throw s.fail('Manifest chứa tệp ngoài phạm vi đăng ký demo.');
 // Children created while demonstrating these demo registrations belong to this same demo scope.
 // A real lecturer attached later is a cross-boundary dependency and requires manual review.
 for(const table of ['phan_cong_giang_vien','danh_gia_thuc_tap'])if((await c.query(`SELECT id FROM ${table} WHERE dang_ky_thuc_tap_id=ANY($1::bigint[]) AND NOT (giang_vien_id=ANY($2::bigint[]))`,[registrations,teachers])).rows.length)throw s.fail('Demo đang liên kết giảng viên ngoài bộ demo. Dừng xóa để kiểm tra dữ liệu.');
 const reports=(await c.query('SELECT dang_ky_thuc_tap_id,duong_dan_file FROM bao_cao_thuc_tap WHERE dang_ky_thuc_tap_id=ANY($1::bigint[]) FOR UPDATE',[registrations])).rows;
 for(const r of reports){if(!r.duong_dan_file.startsWith(`reports/report_${r.dang_ky_thuc_tap_id}_`))throw s.fail('Đường dẫn báo cáo không đúng phạm vi demo.');if((await c.query('SELECT id FROM bao_cao_thuc_tap WHERE duong_dan_file=$1 AND NOT (dang_ky_thuc_tap_id=ANY($2::bigint[]))',[r.duong_dan_file,registrations])).rows.length)throw s.fail('Tệp demo đang được báo cáo ngoài demo sử dụng.');}
 for(const table of ['danh_gia_thuc_tap','bao_cao_thuc_tap','tien_do_thuc_tap','phan_cong_giang_vien'])await c.query(`DELETE FROM ${table} WHERE dang_ky_thuc_tap_id=ANY($1::bigint[])`,[registrations]);
 for(const table of ['dang_ky_thuc_tap','can_bo_huong_dan','doanh_nghiep','giang_vien','sinh_vien','nguoi_dung','dot_thuc_tap'])await c.query(`DELETE FROM ${table} WHERE id=ANY($1::bigint[])`,[ids(table)]);
 // RESTRICT foreign keys abort the entire transaction if any non-demo record depends on demo roots.
 await c.query('COMMIT');committed=true;
 for(const stored of new Set([...m.files,...reports.map(r=>r.duong_dan_file)]))await files.remove(stored);
 await s.fs.unlink(s.manifestPath);
 console.log('Đã xóa đúng bộ demo và tệp báo cáo liên quan. Không xóa danh mục TVU hoặc dữ liệu ngoài demo.');
 }catch(e){if(!committed)await c.query('ROLLBACK').catch(()=>{});else console.error('Database đã clear; manifest được giữ nếu dọn file lỗi. Kiểm tra file còn lại trước khi seed lại.');throw e;}finally{c.release();}}
if(require.main===module)clear().catch(s.safeError).finally(()=>pool.end());
module.exports=clear;
