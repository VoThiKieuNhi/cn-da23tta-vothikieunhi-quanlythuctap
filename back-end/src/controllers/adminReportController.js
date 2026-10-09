const pool=require('../config/database');
const service=require('../services/adminReportService');
const summaryTypes=['overview','by-major','by-company','by-lecturer','registration-status','report-status','evaluation'];
async function snapshot(work){const c=await pool.connect();try{await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');const result=await work(c);await c.query('COMMIT');return result;}catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}}
async function summary(c,q){const data={};for(const type of summaryTypes)data[type]=await service.query(c,type,q);return data;}
function error(res,e){if(e.status)return res.status(e.status).json({success:false,message:e.message});console.error('ADMIN REPORT ERROR:',/^[0-9A-Z]{5}$/.test(e.code||'')?e.code:'DB_ERROR');if(!res.headersSent)res.status(500).json({success:false,message:'Không thể tải báo cáo thống kê. Vui lòng thử lại.'});}
const endpoint=type=>async(req,res)=>{try{service.filter(req.query);const data=await snapshot(c=>type==='options'?service.options(c):type==='summary'?summary(c,req.query):service.query(c,type,req.query));res.json({success:true,...(type==='students'?data:{data})});}catch(e){error(res,e);}};
async function exportExcel(req,res){try{
  service.filter(req.query);
  const data=await snapshot(async c=>({summary:await summary(c,req.query),students:await service.query(c,'students',req.query,true)}));
  const ExcelJS=require('exceljs'),book=new ExcelJS.Workbook();
  function sheet(name,columns,rows){const s=book.addWorksheet(name);s.columns=columns.map(([key,header])=>({key,header,width:24}));for(const row of rows)s.addRow(row);s.getRow(1).font={bold:true};s.views=[{state:'frozen',ySplit:1}];s.autoFilter={from:{row:1,column:1},to:{row:1,column:columns.length}};}
  const names={tongSinhVien:'Tổng sinh viên',choDuyet:'Chờ duyệt',daDuyet:'Đã duyệt',chuaPhanCong:'Chưa phân công',daPhanCong:'Đã phân công',dangThucTap:'Đang thực tập',hoanThanh:'Hoàn thành',baoCaoDaNop:'Báo cáo đã nộp',baoCaoDaDuyet:'Báo cáo đã duyệt',chuaDanhGia:'Chưa đánh giá',daDanhGia:'Đã đánh giá',diemTrungBinh:'Điểm trung bình'};
  sheet('Tổng quan',[['chiTieu','Chỉ tiêu'],['giaTri','Giá trị']],Object.entries(data.summary.overview).map(([key,value])=>({chiTieu:names[key]||key,giaTri:value})));
  sheet('Sinh viên thực tập',[['stt','STT'],['maSinhVien','MSSV'],['hoTen','Họ tên'],['lop','Lớp'],['nganh','Ngành'],['dotThucTap','Đợt thực tập'],['tenDoanhNghiep','Doanh nghiệp'],['viTriThucTap','Vị trí thực tập'],['canBoHuongDan','Cán bộ hướng dẫn doanh nghiệp'],['giangVienHuongDan','Giảng viên hướng dẫn'],['ngayBatDau','Ngày bắt đầu'],['ngayKetThuc','Ngày kết thúc'],['trangThai','Trạng thái'],['trangThaiBaoCao','Trạng thái báo cáo'],['diemChuyenMon','Điểm chuyên môn'],['diemThaiDo','Điểm thái độ'],['diemBaoCao','Điểm báo cáo'],['diemTong','Điểm tổng'],['ngayDanhGia','Ngày đánh giá']],data.students.map((r,i)=>({...r,stt:i+1,trangThai:service.labels[r.trangThai]||r.trangThai,trangThaiBaoCao:service.labels[r.trangThaiBaoCao]||r.trangThaiBaoCao,giangVienHuongDan:r.giangVienHuongDan||'Chưa phân công'})));
  sheet('Theo doanh nghiệp',[['tenDoanhNghiep','Doanh nghiệp'],['tongSinhVien','Số sinh viên'],['dangThucTap','Đang thực tập'],['hoanThanh','Hoàn thành']],data.summary['by-company']);
  sheet('Theo giảng viên',[['maGiangVien','Mã GV'],['hoTen','Họ tên'],['khoaDonVi','Khoa / đơn vị'],['soSinhVienHuongDan','Đang hướng dẫn'],['soDaHoanThanh','Đã hoàn thành']],data.summary['by-lecturer']);
  const evaluation=data.summary.evaluation;
  sheet('Kết quả đánh giá',[['chiTieu','Chỉ tiêu'],['giaTri','Giá trị']],[{chiTieu:'Số đã đánh giá',giaTri:evaluation.soDaDanhGia},{chiTieu:'Điểm trung bình',giaTri:evaluation.diemTrungBinh},{chiTieu:'Cao nhất',giaTri:evaluation.caoNhat},{chiTieu:'Thấp nhất',giaTri:evaluation.thapNhat},...evaluation.phanBo.map(r=>({chiTieu:r.nhom,giaTri:r.soLuong}))]);
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const buffer=await book.xlsx.writeBuffer();res.set('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.set('Access-Control-Expose-Headers','Content-Disposition');res.set('Content-Disposition',`attachment; filename="bao_cao_thuc_tap_${date}.xlsx"`);res.send(Buffer.from(buffer));
}catch(e){error(res,e);}}
module.exports={endpoint,exportExcel};
