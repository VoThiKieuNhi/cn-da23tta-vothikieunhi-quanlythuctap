const {statusSql}=require('../utils/periodStatus');
const statuses=['CHO_DUYET','DA_DUYET','TU_CHOI','DANG_THUC_TAP','HOAN_THANH'];
const labels={CHO_DUYET:'Chờ duyệt',DA_DUYET:'Đã duyệt',TU_CHOI:'Từ chối',DANG_THUC_TAP:'Đang thực tập',HOAN_THANH:'Hoàn thành',CHUA_NOP:'Chưa nộp',DA_NOP:'Đã nộp',CAN_CHINH_SUA:'Cần chỉnh sửa'};
function filter(q={}) {
  const params=[],where=[];
  const fail=()=>{throw Object.assign(new Error('Bộ lọc thống kê không hợp lệ.'),{status:400});};
  for(const k of ['dotThucTapId','hocKy','namHoc','nganhId','trangThai','search','page','limit'])if(q[k]!=null&&typeof q[k]!=='string')fail();
  for(const k of ['dotThucTapId','nganhId'])if(q[k]&&(!/^[1-9]\d{0,18}$/.test(q[k])||BigInt(q[k])>9223372036854775807n))fail();
  if(q.trangThai&&!statuses.includes(q.trangThai))fail();
  if((q.search||'').length>200||(q.hocKy||'').length>30||(q.namHoc||'').length>30)fail();
  for(const [key,column] of [['dotThucTapId','"dotThucTapId"'],['hocKy','"hocKy"'],['namHoc','"namHoc"'],['nganhId','"nganhId"'],['trangThai','"trangThai"']])if(q[key]){params.push(q[key]);where.push(`${column}=$${params.length}`);}
  if(q.search?.trim()){params.push('%'+q.search.trim().replace(/[\\%_]/g,'\\$&')+'%');where.push(`("maSinhVien" ILIKE $${params.length} OR "hoTen" ILIKE $${params.length} OR lop ILIKE $${params.length} OR "tenDoanhNghiep" ILIKE $${params.length} OR "giangVienHuongDan" ILIKE $${params.length})`);}
  const page=Number(q.page||1),limit=Number(q.limit||20);if(!Number.isSafeInteger(page)||page<1||page>1000000||!Number.isInteger(limit)||limit<1||limit>100)fail();
  return {params,page,limit,where:where.length?'WHERE '+where.join(' AND '):''};
}
// One row per registration. No weekly-progress join; latest child rows prevent fan-out.
const source=`WITH source AS (SELECT dk.id,sv.id AS "studentId",sv.ma_sinh_vien AS "maSinhVien",sv.ho_ten AS "hoTen",sv.lop,COALESCE(n.ten_nganh,sv.nganh) AS nganh,n.id AS "nganhId",n.ma_nganh AS "maNganh",
dt.id AS "dotThucTapId",dt.hoc_ky::text AS "hocKy",dt.nam_hoc AS "namHoc",concat(dt.hoc_ky,' · ',dt.nam_hoc) AS "dotThucTap",
dn.id AS "companyId",dn.ten_doanh_nghiep AS "tenDoanhNghiep",dk.vi_tri_thuc_tap AS "viTriThucTap",cb.ho_ten AS "canBoHuongDan",
gv.id AS "lecturerId",gv.ma_giang_vien AS "maGiangVien",gv.ho_ten AS "giangVienHuongDan",gv.hoc_vi AS "hocVi",gv.bo_mon AS "khoaDonVi",
dk.trang_thai AS "trangThai",COALESCE(bc.trang_thai,'CHUA_NOP') AS "trangThaiBaoCao",dg.id AS "evaluationId",
dg.diem_chuyen_mon::float8 AS "diemChuyenMon",dg.diem_thai_do::float8 AS "diemThaiDo",dg.diem_bao_cao::float8 AS "diemBaoCao",dg.diem_tong::float8 AS "diemTong",
to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc",to_char(dg.ngay_danh_gia AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM-DD HH24:MI') AS "ngayDanhGia"
FROM dang_ky_thuc_tap dk JOIN sinh_vien sv ON sv.id=dk.sinh_vien_id JOIN dot_thuc_tap dt ON dt.id=dk.dot_thuc_tap_id
LEFT JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id LEFT JOIN can_bo_huong_dan cb ON cb.id=dk.can_bo_huong_dan_id
LEFT JOIN LATERAL (SELECT nh.* FROM nganh_hoc nh WHERE nh.ten_nganh=sv.nganh OR EXISTS(SELECT 1 FROM lop_hoc l WHERE l.nganh_id=nh.id AND l.ma_lop=sv.lop) ORDER BY (nh.ten_nganh=sv.nganh) DESC,nh.id LIMIT 1) n ON true
LEFT JOIN LATERAL (SELECT p.giang_vien_id FROM phan_cong_giang_vien p WHERE p.dang_ky_thuc_tap_id=dk.id ORDER BY p.ngay_phan_cong DESC NULLS LAST,p.id DESC LIMIT 1) pc ON true LEFT JOIN giang_vien gv ON gv.id=pc.giang_vien_id
LEFT JOIN LATERAL (SELECT b.trang_thai FROM bao_cao_thuc_tap b WHERE b.dang_ky_thuc_tap_id=dk.id ORDER BY b.ngay_nop DESC NULLS LAST,b.id DESC LIMIT 1) bc ON true
LEFT JOIN LATERAL (SELECT d.* FROM danh_gia_thuc_tap d WHERE d.dang_ky_thuc_tap_id=dk.id ORDER BY d.ngay_danh_gia DESC NULLS LAST,d.id DESC LIMIT 1) dg ON true), filtered AS (SELECT * FROM source `;
const countStatus=(s,name)=>`COUNT(DISTINCT "studentId") FILTER(WHERE "trangThai"='${s}')::int AS "${name}"`;
const queries={
overview:`SELECT COUNT(DISTINCT "studentId")::int AS "tongSinhVien",${countStatus('CHO_DUYET','choDuyet')},${countStatus('DA_DUYET','daDuyet')},${countStatus('DANG_THUC_TAP','dangThucTap')},${countStatus('HOAN_THANH','hoanThanh')},COUNT(*) FILTER(WHERE "lecturerId" IS NULL AND "trangThai" IN ('DA_DUYET','DANG_THUC_TAP','HOAN_THANH'))::int AS "chuaPhanCong",COUNT("lecturerId")::int AS "daPhanCong",COUNT(*) FILTER(WHERE "trangThaiBaoCao"<>'CHUA_NOP')::int AS "baoCaoDaNop",COUNT(*) FILTER(WHERE "trangThaiBaoCao"='DA_DUYET')::int AS "baoCaoDaDuyet",COUNT(*) FILTER(WHERE "evaluationId" IS NULL AND "trangThai" IN ('DA_DUYET','DANG_THUC_TAP','HOAN_THANH'))::int AS "chuaDanhGia",COUNT("evaluationId")::int AS "daDanhGia",ROUND(AVG("diemTong")::numeric,2)::float8 AS "diemTrungBinh" FROM filtered`,
'by-major':`SELECT "maNganh",nganh AS "tenNganh",COUNT(DISTINCT "studentId")::int AS "tongSinhVien",${countStatus('DANG_THUC_TAP','dangThucTap')},${countStatus('HOAN_THANH','hoanThanh')} FROM filtered GROUP BY "nganhId","maNganh",nganh ORDER BY "tongSinhVien" DESC,nganh`,
'by-company':`SELECT "tenDoanhNghiep",COUNT(DISTINCT "studentId")::int AS "tongSinhVien",${countStatus('DANG_THUC_TAP','dangThucTap')},${countStatus('HOAN_THANH','hoanThanh')} FROM filtered GROUP BY "companyId","tenDoanhNghiep" ORDER BY "tongSinhVien" DESC,"tenDoanhNghiep"`,
'by-lecturer':`SELECT "maGiangVien","giangVienHuongDan" AS "hoTen","hocVi","khoaDonVi",COUNT(DISTINCT "studentId") FILTER(WHERE "trangThai" IN ('DA_DUYET','DANG_THUC_TAP'))::int AS "soSinhVienHuongDan",${countStatus('HOAN_THANH','soDaHoanThanh')} FROM filtered WHERE "lecturerId" IS NOT NULL GROUP BY "lecturerId","maGiangVien","giangVienHuongDan","hocVi","khoaDonVi" ORDER BY "soSinhVienHuongDan" DESC,"giangVienHuongDan"`,
'registration-status':`SELECT "trangThai",COUNT(*)::int AS "soLuong" FROM filtered GROUP BY "trangThai" ORDER BY "trangThai"`,
'report-status':`SELECT "trangThaiBaoCao" AS "trangThai",COUNT(*)::int AS "soLuong" FROM filtered GROUP BY "trangThaiBaoCao" ORDER BY "trangThaiBaoCao"`,
evaluation:`SELECT COUNT("evaluationId")::int AS "soDaDanhGia",ROUND(AVG("diemTong")::numeric,2)::float8 AS "diemTrungBinh",MAX("diemTong") AS "caoNhat",MIN("diemTong") AS "thapNhat",json_build_array(${[['9.0 - 10','>=9'],['8.0 - <9.0','>=8 AND "diemTong"<9'],['6.5 - <8.0','>=6.5 AND "diemTong"<8'],['5.0 - <6.5','>=5 AND "diemTong"<6.5'],['<5.0','<5']].map(([name,condition])=>`json_build_object('nhom','${name}','soLuong',COUNT(*) FILTER(WHERE "diemTong"${condition}))`).join(',')}) AS "phanBo" FROM filtered`,
students:'SELECT * FROM filtered ORDER BY "hoTen",id',
};
async function query(c,type,q,all=false){const f=filter(q);let sql=source+f.where+') '+queries[type];if(!queries[type])throw Error('Unknown report');
if(type==='students'&&!all){const total=(await c.query(source+f.where+') SELECT COUNT(*)::int AS total FROM filtered',f.params)).rows[0].total;sql+=` LIMIT $${f.params.length+1} OFFSET $${f.params.length+2}`;return {data:(await c.query(sql,[...f.params,f.limit,(f.page-1)*f.limit])).rows,pagination:{page:f.page,limit:f.limit,total,totalPages:Math.ceil(total/f.limit)}};}
const rows=(await c.query(sql,f.params)).rows;
if(type==='registration-status'||type==='report-status')return (type==='registration-status'?statuses:['CHUA_NOP','DA_NOP','CAN_CHINH_SUA','DA_DUYET']).map(trangThai=>({trangThai,soLuong:rows.find(r=>r.trangThai===trangThai)?.soLuong||0}));
return ['overview','evaluation'].includes(type)?rows[0]:rows;}
async function options(c){const periods=(await c.query(`SELECT id,hoc_ky::text AS "hocKy",nam_hoc AS "namHoc",${statusSql('dt','CURRENT_TIMESTAMP')} AS "trangThai" FROM dot_thuc_tap dt ORDER BY ngay_bat_dau_thuc_tap DESC,id DESC`)).rows;return {periods,majors:(await c.query('SELECT id,ten_nganh AS "tenNganh" FROM nganh_hoc ORDER BY ten_nganh')).rows,statuses:statuses.map(value=>({value,label:labels[value]})),hocKy:[...new Set(periods.map(x=>x.hocKy))],namHoc:[...new Set(periods.map(x=>x.namHoc))]};}
module.exports={query,filter,options,labels};
