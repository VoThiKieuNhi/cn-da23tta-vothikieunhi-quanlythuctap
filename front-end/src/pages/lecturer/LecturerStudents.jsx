import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStudents } from '../../services/lecturerProgressService'
import { StudentHeader, StudentCard, EmptyState } from '../../components/StudentWorkspace'
import { registrationLabels } from '../../utils/studentWorkspace'

export default function LecturerStudents() {
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0)
  useEffect(() => { const c = new AbortController(); getStudents(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải danh sách sinh viên.' }) }); return () => c.abort() }, [revision])
  return <><StudentHeader title="Sinh viên hướng dẫn" subtitle="Theo dõi tiến độ thực tập của sinh viên được phân công." /><StudentCard title="Danh sách sinh viên" icon="people">
    {state.loading ? <p role="status">Đang tải...</p> : state.error ? <div role="alert">{state.error}<button className="btn btn-link" onClick={() => setRevision(v => v + 1)}>Thử lại</button></div> : !state.data.length ? <EmptyState text="Chưa có sinh viên được phân công." /> : <div className="table-responsive"><table className="table student-table align-middle"><thead><tr><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Doanh nghiệp</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{state.data.map(row => <tr key={row.registrationId}><td>{row.maSinhVien}</td><td>{row.hoTen}</td><td>{row.lop || 'Chưa có dữ liệu'}</td><td>{row.tenDoanhNghiep}</td><td><span className="student-badge active">{registrationLabels[row.trangThai] || row.trangThai}</span></td><td><Link className="btn btn-primary btn-sm" to={`/lecturer/students/${row.registrationId}/progress`}>Xem</Link></td></tr>)}</tbody></table></div>}
  </StudentCard></>
}
