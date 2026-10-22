export default function ProgressMilestones({ rows, onView }) {
  if (!rows.length) return null
  return <ol className="portal-week-timeline" aria-label="Tiến độ theo tuần">{rows.map(row => <li key={row.id}><button type="button" onClick={() => onView(row)}><span className={row.nhanXetGiangVien?.trim() ? 'reviewed' : ''}><i className={`bi bi-${row.nhanXetGiangVien?.trim() ? 'check-lg' : 'journal-text'}`} /></span><strong>Tuần {row.soTuan}</strong><small>{row.nhanXetGiangVien?.trim() ? 'Đã nhận xét' : 'Chờ nhận xét'}</small></button></li>)}</ol>
}
