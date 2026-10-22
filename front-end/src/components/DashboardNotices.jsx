import { Link } from 'react-router-dom'
import { EmptyState } from './StudentWorkspace'
import { formatTime } from '../utils/dateFormat'

export default function DashboardNotices({ data }) {
  const registration = data.registration
  const items = []
  if (registration?.trangThai === 'CHO_DUYET') items.push({ key: 'registration', title: 'Đăng ký thực tập đang chờ duyệt', text: registration.tenDoanhNghiep, path: 'internship-registration', icon: 'clipboard', time: registration.ngayDangKy })
  if (['DA_DUYET', 'DANG_THUC_TAP', 'HOAN_THANH'].includes(registration?.trangThai)) items.push({ key: 'approved', title: 'Đăng ký thực tập đã được duyệt', text: registration.tenDoanhNghiep, path: 'internship-registration', icon: 'clipboard-check' })
  data.lecturers.forEach(item => items.push({ key: `lecturer-${item.id}`, title: 'Đã phân công giảng viên hướng dẫn', text: item.hoTen, path: 'progress', icon: 'person-check', time: item.ngayPhanCong }))
  data.progress.filter(item => item.nhanXetGiangVien?.trim()).forEach(item => items.push({ key: `progress-${item.id}`, title: `Giảng viên đã nhận xét tiến độ tuần ${item.soTuan}`, text: item.nhanXetGiangVien, path: 'progress', icon: 'chat-left-text' }))
  data.reports.filter(item => ['CAN_CHINH_SUA', 'DA_DUYET'].includes(item.trangThai)).forEach(item => items.push({ key: `report-${item.id}`, title: item.trangThai === 'DA_DUYET' ? 'Báo cáo thực tập đã được duyệt' : 'Báo cáo cần chỉnh sửa', text: item.tenBaoCao, path: 'reports', icon: 'file-earmark-text' }))
  data.evaluations.forEach(item => items.push({ key: `evaluation-${item.id}`, title: 'Đã có kết quả đánh giá thực tập', text: item.nhanXet, path: 'evaluation', icon: 'award', time: item.ngayDanhGia }))
  // Only use timestamps belonging to the event; submission time is not approval time.
  items.sort((a, b) => (Date.parse(b.time) || 0) - (Date.parse(a.time) || 0))
  return items.length ? <div className="dp2-notices">{items.map(item => {
    const tone = item.key.startsWith('evaluation-') ? 'purple' : item.key === 'approved' ? 'green' : item.key.startsWith('report-') ? (data.reports.find(report => `report-${report.id}` === item.key)?.trangThai === 'CAN_CHINH_SUA' ? 'orange' : 'green') : item.key === 'registration' ? 'orange' : 'blue'
    return <Link key={item.key} to={`/student/${item.path}`}><span className={`dp2-icon ${tone}`}><i className={`bi bi-${item.icon}`} /></span><div><strong>{item.title}</strong><p>{item.text}</p>{item.time && <time dateTime={item.time}>{formatTime(item.time)}</time>}</div></Link>
  })}</div> : <EmptyState icon="bell" text="Chưa có cập nhật mới." detail="Các cập nhật thực tập sẽ hiển thị tại đây." />
}
