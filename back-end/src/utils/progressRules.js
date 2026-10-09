function progressPermission(registration,now=new Date()) {
 if(!registration)return {allowed:false,message:'Bạn chưa có đăng ký thực tập.',percent:0};
 const start=Date.parse(registration.ngayBatDau+'T00:00:00+07:00');
 // DATE fields represent Vietnam calendar days; allow updates throughout the final day.
 const end=Date.parse(registration.ngayKetThuc+'T00:00:00+07:00')+86400000;
 const percent=Number.isFinite(start)&&end>start?Math.round(Math.max(0,Math.min(1,(now.getTime()-start)/(end-start)))*100):0;
 if(!['DA_DUYET','DANG_THUC_TAP'].includes(registration.trangThai))return {allowed:false,message:'Đăng ký chưa được duyệt hoặc không còn cho phép cập nhật tiến độ.',percent};
 if(!registration.giangVienHuongDan)return {allowed:false,message:'Bạn chưa được phân công giảng viên hướng dẫn.',percent};
 if(now.getTime()<start)return {allowed:false,message:'Đợt thực tập chưa bắt đầu.',percent};
 if(now.getTime()>=end)return {allowed:false,message:'Thời gian thực tập đã kết thúc.',percent};
 if(!Number.isFinite(start)||!Number.isFinite(end))return {allowed:false,message:'Lịch thực tập không hợp lệ.',percent};
 return {allowed:true,message:null,percent};
}
module.exports={progressPermission};
