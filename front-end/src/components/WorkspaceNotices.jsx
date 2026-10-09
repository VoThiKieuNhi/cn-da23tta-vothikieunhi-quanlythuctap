import { Link } from 'react-router-dom'
import { EmptyState } from './StudentWorkspace'

export function workspaceNotices(data) {
  if (!data) return []
  return [
    ...data.evaluations.map(item => ({ key: `evaluation-${item.id}`, title: 'Đã có kết quả đánh giá', text: item.nhanXet, path: 'evaluation', icon: 'award' })),
    ...data.reports.filter(item => ['CAN_CHINH_SUA', 'DA_DUYET'].includes(item.trangThai)).map(item => ({ key: `report-${item.id}`, title: item.trangThai === 'DA_DUYET' ? 'Báo cáo đã được duyệt' : 'Báo cáo cần chỉnh sửa', text: item.tenBaoCao, path: 'reports', icon: 'file-earmark-text' })),
    ...data.progress.filter(item => item.nhanXetGiangVien?.trim()).map(item => ({ key: `progress-${item.id}`, title: `Nhận xét tiến độ tuần ${item.soTuan}`, text: item.nhanXetGiangVien, path: 'progress', icon: 'chat-left-text' })),
  ]
}
export default function WorkspaceNotices({ data }) {
  const items = workspaceNotices(data)
  return items.length ? <div className="portal-notices">{items.map(item => <Link key={item.key} to={`/student/${item.path}`}><span className="sw-stat-icon blue"><i className={`bi bi-${item.icon}`} /></span><div><strong>{item.title}</strong><p>{item.text}</p></div><i className="bi bi-chevron-right" /></Link>)}</div> : <EmptyState icon="bell" text="Chưa có cập nhật mới." detail="Nhận xét, trạng thái báo cáo và kết quả sẽ hiển thị tại đây." />
}
