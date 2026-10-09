import { formatTime } from '../utils/studentWorkspace'
import { reportLabels } from '../utils/reportLabels'
import '../assets/css/reports.css'
export function ReportBadge({ status }) { return <span className={`report-badge report-${status || 'empty'}`}>{reportLabels[status] || 'Chưa nộp'}</span> }
export default function ReportDetails({ report }) {
  const pairs = [['Tên báo cáo', report.tenBaoCao], ['Tên file', report.tenFile], ['Ngày nộp', formatTime(report.ngayNop)]]
  if (report.maSinhVien) pairs.unshift(['MSSV', report.maSinhVien], ['Họ tên', report.hoTen], ['Lớp', report.lop], ['Ngành', report.nganh], ['Doanh nghiệp', report.tenDoanhNghiep])
  return <><dl className="student-details">{pairs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa có dữ liệu'}</dd></div>)}<div><dt>Trạng thái</dt><dd><ReportBadge status={report.trangThai} /></dd></div></dl><div className="report-comment"><strong>Nhận xét giảng viên</strong><p>{report.nhanXetGiangVien || 'Chưa có nhận xét.'}</p></div></>
}
