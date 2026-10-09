import { formatDate, formatTime } from '../utils/studentWorkspace'
export default function ProgressTable({ rows, lecturer = false, onAction }) {
  return <div className="table-responsive"><table className="table student-table align-middle"><thead><tr><th>Tuần</th><th>Tiêu đề</th><th>Ngày cập nhật</th><th>Nhận xét GV</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}>
    <td>{row.soTuan}</td><td>{row.tieuDe}</td><td>{row.ngayCapNhat ? formatTime(row.ngayCapNhat) : formatDate(row.ngayBaoCao)}</td><td className="progress-content">{row.nhanXetGiangVien?.trim() || 'Chưa nhận xét'}</td><td><span className={`student-badge ${row.nhanXetGiangVien?.trim() ? 'active' : 'locked'}`}>{row.nhanXetGiangVien?.trim() ? 'Đã nhận xét' : 'Chưa nhận xét'}</span></td>
    <td><div className="student-actions"><button className="btn btn-sm" onClick={() => onAction('view', row)}>Xem</button>{lecturer ? <button className="btn btn-sm" onClick={() => onAction('comment', row)}>{row.nhanXetGiangVien?.trim() ? 'Sửa nhận xét' : 'Nhận xét'}</button> : <>{row.coTheSua && <button className="btn btn-sm" onClick={() => onAction('edit', row)}>Sửa</button>}{row.coTheXoa && <button className="btn btn-sm" onClick={() => onAction('delete', row)}>Xóa</button>}</>}</div></td>
  </tr>)}</tbody></table></div>
}
