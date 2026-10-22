import { Link } from 'react-router-dom'
import { EmptyState } from './StudentWorkspace'

import { workspaceNotices } from '../utils/workspaceNotices'
export default function WorkspaceNotices({ data }) {
  const items = workspaceNotices(data)
  return items.length ? <div className="portal-notices">{items.map(item => <Link key={item.key} to={`/student/${item.path}`}><span className="sw-stat-icon blue"><i className={`bi bi-${item.icon}`} /></span><div><strong>{item.title}</strong><p>{item.text}</p></div><i className="bi bi-chevron-right" /></Link>)}</div> : <EmptyState icon="bell" text="Chưa có cập nhật mới." detail="Nhận xét, trạng thái báo cáo và kết quả sẽ hiển thị tại đây." />
}
