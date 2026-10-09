const pastMessage = 'Thời gian mở cổng đăng ký không được sớm hơn thời điểm hiện tại.';
function validDate(value) {
  if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0,4))===0) return false;
  const date=new Date(value+'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===value;
}
function instant(value) {
  if(typeof value!=='string') return NaN;
  const match=value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/);
  if(!match || !validDate(match[1]) || +match[2]>23 || +match[3]>59 || +(match[4]||0)>59) return NaN;
  if(match[6]!=='Z' && (+match[6].slice(1,3)>14 || +match[6].slice(4)>59 || (+match[6].slice(1,3)===14 && +match[6].slice(4)!==0))) return NaN;
  return Date.parse(value);
}
function timeErrors(data) {
  const errors={},opening=instant(data.ngayBatDauDangKy),closing=instant(data.ngayKetThucDangKy);
  if(!Number.isFinite(opening)) errors.ngayBatDauDangKy='Vui lòng nhập thời gian mở đăng ký hợp lệ, có múi giờ.';
  if(!Number.isFinite(closing)) errors.ngayKetThucDangKy='Vui lòng nhập thời gian đóng đăng ký hợp lệ, có múi giờ.';
  for(const key of ['ngayBatDauThucTap','ngayKetThucThucTap']) if(!validDate(data[key])) errors[key]='Vui lòng nhập ngày hợp lệ.';
  if(Number.isFinite(opening) && Number.isFinite(closing) && opening>=closing) errors.ngayKetThucDangKy='Thời gian kết thúc đăng ký phải sau thời gian mở đăng ký.';
  if(!errors.ngayBatDauThucTap && Number.isFinite(closing) && Date.parse(data.ngayBatDauThucTap+'T00:00:00+07:00')<=closing) errors.ngayBatDauThucTap='Ngày bắt đầu thực tập phải sau thời hạn kết thúc đăng ký.';
  if(validDate(data.ngayBatDauThucTap) && validDate(data.ngayKetThucThucTap) && data.ngayBatDauThucTap>=data.ngayKetThucThucTap) errors.ngayKetThucThucTap='Ngày kết thúc thực tập phải sau ngày bắt đầu thực tập.';
  return errors;
}
function openingInPast(data,existing,now=new Date()) {
  const changed=existing && instant(data.ngayBatDauDangKy)!==new Date(existing.ngayBatDauDangKy).getTime();
  // A period is upcoming only while its persisted opening instant is in the future.
  const check=!existing || (changed && new Date(existing.ngayBatDauDangKy).getTime()>now.getTime());
  return check && instant(data.ngayBatDauDangKy)<now.getTime();
}
module.exports={timeErrors,openingInPast,pastMessage};
