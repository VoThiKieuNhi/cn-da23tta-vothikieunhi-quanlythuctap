const {isValidPhone,messages}=require('./validators');
function profileInput(body,now=new Date()) {
 const fail=message=>{throw Object.assign(new Error(message),{status:400});};
 if(!body || typeof body!=='object' || Array.isArray(body))fail('Thông tin hồ sơ không hợp lệ.');
 if(Object.keys(body).some(k=>!['so_dien_thoai','ngay_sinh','gioi_tinh'].includes(k)))fail('Chỉ được cập nhật số điện thoại, ngày sinh và giới tính.');
 if(!isValidPhone(body.so_dien_thoai))fail(messages.phone);
 const date=body.ngay_sinh;
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>today||date<'0001-01-01')fail('Ngày sinh phải hợp lệ và không lớn hơn ngày hiện tại.');
 if(!['NAM','NU','KHAC'].includes(body.gioi_tinh))fail('Giới tính không hợp lệ.');
 return {soDienThoai:body.so_dien_thoai.trim(),ngaySinh:date,gioiTinh:body.gioi_tinh};
}
module.exports={profileInput};
