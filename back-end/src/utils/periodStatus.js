const statuses = ['SAP_MO','DANG_MO_DANG_KY','CHO_BAT_DAU','DANG_THUC_TAP','DA_KET_THUC'];
// One ordered set of boundaries drives both JS writes and SQL reads/filters.
const boundaries = [
  {status:'SAP_MO',key:'ngayBatDauDangKy',column:'ngay_bat_dau_dang_ky',operator:'<'},
  {status:'DANG_MO_DANG_KY',key:'ngayKetThucDangKy',column:'ngay_ket_thuc_dang_ky',operator:'<='},
  {status:'CHO_BAT_DAU',key:'ngayBatDauThucTap',column:'ngay_bat_dau_thuc_tap',operator:'<',date:true},
  {status:'DANG_THUC_TAP',key:'ngayKetThucThucTap',column:'ngay_ket_thuc_thuc_tap',operator:'<',date:true,end:true},
];
function tinhTrangThaiDotThucTap(dot, now=new Date()) {
  for(const boundary of boundaries) {
    const value=dot[boundary.key] ?? dot[boundary.column];
    let time=boundary.date ? Date.parse(value+'T00:00:00+07:00') : new Date(value).getTime();
    if(boundary.end) time+=86400000; // Entire final calendar day in Vietnam.
    if(!Number.isFinite(time)) throw new Error('Invalid period date');
    if(boundary.operator==='<=' ? now.getTime()<=time : now.getTime()<time) return boundary.status;
  }
  return 'DA_KET_THUC';
}
// Arguments are internal SQL identifiers/placeholders, never request values.
function statusSql(alias, nowParameter) {
  return 'CASE '+boundaries.map(b=>{
    const column=`${alias}.${b.column}`;
    const time=b.date ? `((${column}::timestamp${b.end?" + interval '1 day'":''}) AT TIME ZONE 'Asia/Ho_Chi_Minh')` : column;
    return `WHEN ${nowParameter}::timestamptz ${b.operator} ${time} THEN '${b.status}'`;
  }).join(' ')+" ELSE 'DA_KET_THUC' END";
}
function periodSource(nowParameter='$1') {
  return `(SELECT source.*, ${statusSql('source',nowParameter)} AS trang_thai_tu_dong FROM dot_thuc_tap source)`;
}
module.exports={statuses,tinhTrangThaiDotThucTap,statusSql,periodSource};
