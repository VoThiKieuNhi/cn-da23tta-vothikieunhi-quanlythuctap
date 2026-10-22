import { registrationLabels } from './statusLabels'
import { formatDate, formatTime } from './dateFormat'
import { useOutletContext } from 'react-router-dom'
export const useStudentWorkspace = () => useOutletContext()
export { registrationLabels } from './statusLabels'
export { formatDate, formatTime } from './dateFormat'
export function internshipSteps(data) {
  const r = data.registration, approved = ['DA_DUYET', 'DANG_THUC_TAP', 'HOAN_THANH'].includes(r?.trangThai)
  return [
    { label: 'Đăng ký thực tập', done: !!r, note: r ? formatTime(r.ngayDangKy) : 'Chưa đăng ký' },
    { label: 'Phê duyệt đăng ký', done: approved, note: registrationLabels[r?.trangThai] || 'Chưa có đăng ký' },
    { label: 'Phân công giảng viên', done: !!data.lecturers.length, note: data.lecturers.map(x => x.hoTen).join(', ') || 'Chưa phân công' },
    { label: 'Thực tập tại doanh nghiệp', done: ['DANG_THUC_TAP', 'HOAN_THANH'].includes(r?.trangThai), note: r ? `${formatDate(r.ngayBatDau)} – ${formatDate(r.ngayKetThuc)}` : 'Chưa có lịch thực tập' },
    { label: 'Nộp báo cáo', done: !!data.reports.length, note: `${data.reports.length} tệp đã nộp` },
    { label: 'Đánh giá kết quả', done: !!data.evaluations.length, note: data.evaluations.length ? 'Đã có kết quả đánh giá' : 'Chưa có kết quả' },
    { label: 'Hoàn thành', done: r?.trangThai === 'HOAN_THANH', note: r?.trangThai === 'HOAN_THANH' ? 'Đã hoàn thành thực tập' : 'Chưa hoàn thành' },
  ]
}
