require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const pool=require('../src/config/database'),support=require('./demo-support');
const {emailError}=require('../src/utils/validators');
const data=require('../seeds/companies.json');
const path=require('node:path');
const names=['Nguyễn Minh An','Trần Thanh Bình','Lê Ngọc Châu','Phạm Hải Dương','Võ Minh Đức','Đặng Thu Hà','Bùi Gia Huy','Đỗ Ngọc Lan','Hồ Tuấn Minh','Dương Thanh Nam'];
async function seedCompanies(){
 const c=await pool.connect();let committed=false;
 try{
  await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(74120301)');
  await c.query('LOCK TABLE doanh_nghiep,can_bo_huong_dan IN SHARE ROW EXCLUSIVE MODE');
  const before=(await c.query('SELECT * FROM doanh_nghiep ORDER BY id')).rows;
  const results=[];let updated=0,inserted=0,addedSupervisors=0;
  for(let i=0;i<data.length;i++){
   const values=data[i].map(v=>v.trim());
   if(values.length!==6||values.some(v=>!v)||emailError(values[3]))throw support.fail('Bộ dữ liệu doanh nghiệp không hợp lệ.');
   const matches=before.filter(r=>r.ten_doanh_nghiep.toLowerCase()===values[0].toLowerCase()||r.email?.toLowerCase()===values[3].toLowerCase());
   const aliases=i<3?before.filter(r=>new RegExp('^Doanh nghiệp(?: demo)? '+(i+1)+'$','iu').test(r.ten_doanh_nghiep.trim())):[];
   if(matches.length>1||aliases.length>1||(matches.length&&aliases.length&&String(matches[0].id)!==String(aliases[0].id)))throw support.fail('Có doanh nghiệp trùng tên/email hoặc demo không rõ ràng. Dừng để bảo vệ liên kết.');
   let id=(matches[0]||aliases[0])?.id;
   if(id){await c.query('UPDATE doanh_nghiep SET ten_doanh_nghiep=$1,dia_chi=$2,so_dien_thoai=$3,email=$4,linh_vuc_hoat_dong=$5,nguoi_dai_dien=$6,ngay_cap_nhat=NOW() WHERE id=$7',[...values,id]);if(aliases.length)updated++;}
   else {id=(await c.query('INSERT INTO doanh_nghiep (ten_doanh_nghiep,dia_chi,so_dien_thoai,email,linh_vuc_hoat_dong,nguoi_dai_dien) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',values)).rows[0].id;inserted++;}
   const email=`huongdan.company${i+1}.demo@example.com`;
   const supervisors=(await c.query('SELECT id FROM can_bo_huong_dan WHERE doanh_nghiep_id=$1 AND lower(email)=lower($2)',[id,email])).rows;
   if(supervisors.length>1)throw support.fail('Cán bộ demo bị trùng; cần đối chiếu trước khi cập nhật.');
   if(!supervisors.length){await c.query('INSERT INTO can_bo_huong_dan (doanh_nghiep_id,ho_ten,chuc_vu,email,so_dien_thoai) VALUES ($1,$2,$3,$4,$5)',[id,names[i],'Cán bộ hướng dẫn DEMO (giả lập)',email,'09000000'+String(i+1).padStart(2,'0')]);addedSupervisors++;}
   results.push(String(id));
  }
  // Keep a local pre-update snapshot; never delete rows to force the target count.
  const backup=path.join(path.dirname(support.manifestPath),'companies-before.json');
  await support.fs.mkdir(path.dirname(backup),{recursive:true});
  try{await support.fs.writeFile(backup,JSON.stringify(before,null,2),{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}
  await c.query('COMMIT');committed=true;
  // Converted companies are now maintained reference data, not disposable demo roots.
  // If this fails, the old manifest fingerprint blocks clear-demo; rerun repairs it.
  const manifest=await support.readManifest();
  if(manifest){
   if(JSON.stringify(manifest.database)!==JSON.stringify(await support.identity(c)))throw support.fail('Database đã cập nhật nhưng manifest thuộc database khác; không sửa manifest.');
   const supervisorIds=(await c.query('SELECT id FROM can_bo_huong_dan WHERE doanh_nghiep_id=ANY($1::bigint[])',[results])).rows.map(r=>String(r.id));
   manifest.records=manifest.records.filter(r=>!(r.table==='doanh_nghiep'&&results.includes(r.id))&&!(r.table==='can_bo_huong_dan'&&supervisorIds.includes(r.id)));
   manifest.preservedCompanyIds=results;
   const temporary=support.manifestPath+'.companies.tmp';
   await support.fs.writeFile(temporary,JSON.stringify(manifest,null,2));await support.fs.rename(temporary,support.manifestPath);
  }
  const counts=(await c.query('SELECT (SELECT count(*)::int FROM doanh_nghiep) AS total,(SELECT count(*)::int FROM can_bo_huong_dan WHERE doanh_nghiep_id=ANY($1::bigint[])) AS supervisors',[results])).rows[0];
  const result={...counts,updatedDemo:updated,inserted,addedSupervisors,seedCompanies:results.length};console.log(JSON.stringify(result));return result;
 }catch(e){if(!committed)await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}
}
if(require.main===module)seedCompanies().catch(support.safeError).finally(()=>pool.end());
module.exports=seedCompanies;
