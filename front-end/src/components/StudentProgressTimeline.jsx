import { formatDate } from '../utils/studentWorkspace'
import StatusBadge from './StatusBadge'

export default function StudentProgressTimeline({ rows, onAction }) {
  return <ol className="st-progress-timeline">{rows.map(row => <li key={row.id}>
    <div className="st-week"><strong>Tuần {row.soTuan}</strong><small>{formatDate(row.ngayBaoCao)}</small></div>
    <span className={`st-timeline-dot ${row.nhanXetGiangVien?.trim() ? 'reviewed' : ''}`}><i className="bi bi-check-lg" aria-hidden="true" /></span>
    <article><header><h3>{row.tieuDe}</h3><StatusBadge status={row.nhanXetGiangVien?.trim() ? 'DA_DUYET' : 'DA_NOP'} label={row.nhanXetGiangVien?.trim() ? 'Có nhận xét' : 'Đã gửi'} /></header>
      <p className="st-preserve-text">{row.noiDung || 'Chưa có nội dung'}</p><p><strong>Ngày báo cáo:</strong> {formatDate(row.ngayBaoCao)}</p>
      <p className="st-preserve-text"><strong>Nhận xét:</strong> {row.nhanXetGiangVien?.trim() || 'Chưa có nhận xét giảng viên.'}</p>
      <div className="st-timeline-actions"><button className="btn btn-sm btn-light" onClick={() => onAction('view', row)}>Xem chi tiết</button>{row.coTheSua && <button className="btn btn-sm btn-outline-primary" onClick={() => onAction('edit', row)}><i className="bi bi-pencil" /> Sửa</button>}{row.coTheXoa && <button className="btn btn-sm btn-outline-danger" onClick={() => onAction('delete', row)}><i className="bi bi-trash" /> Xóa</button>}</div>
    </article>
  </li>)}</ol>
}
