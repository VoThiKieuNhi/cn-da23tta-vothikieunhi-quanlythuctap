import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStudentProgress, commentProgress } from '../../services/lecturerProgressService'
import { StudentHeader, StudentCard, EmptyState } from '../../components/StudentWorkspace'
import ProgressTable from '../../components/ProgressTable'
import ProgressModal from '../../components/ProgressModal'
import { formatDate } from '../../utils/studentWorkspace'

export default function LecturerStudentProgress() {
  const { registrationId } = useParams()
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0), [modal, setModal] = useState(null), [notice, setNotice] = useState('')
  useEffect(() => { const c = new AbortController(); getStudentProgress(registrationId, c.signal).then(data => { if (!c.signal.aborted) setState({ data, registrationId }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải tiến độ.', registrationId }) }); return () => c.abort() }, [registrationId, revision])
  async function save(nhanXet) { await commentProgress(modal.registrationId, modal.row.id, nhanXet); setNotice('Đã lưu nhận xét.'); setState({ loading: true }); setRevision(v => v + 1) }
  const data = state.registrationId === registrationId ? state.data : null, s = data?.student, r = data?.internship
  return <><StudentHeader title="Tiến độ thực tập của sinh viên" subtitle="Xem công việc theo tuần và gửi nhận xét hướng dẫn."><Link className="btn btn-light" to="/lecturer/students">Quay lại danh sách</Link></StudentHeader>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    {state.loading || state.registrationId !== registrationId ? <div className="admin-loading" role="status">Đang tải...</div> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={() => setRevision(v => v + 1)}>Thử lại</button></div> : <>
      <StudentCard title="Thông tin sinh viên" icon="person"><dl className="student-details">{[['MSSV', s.maSinhVien], ['Họ tên', s.hoTen], ['Lớp', s.lop], ['Ngành', s.nganh], ['Doanh nghiệp', r.tenDoanhNghiep], ['Vị trí thực tập', r.viTriThucTap], ['Thời gian thực tập', `${formatDate(r.ngayBatDau)} – ${formatDate(r.ngayKetThuc)}`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa có dữ liệu'}</dd></div>)}</dl></StudentCard>
      <StudentCard title="Danh sách tiến độ" icon="journal-text">{data.progress.length ? <ProgressTable rows={data.progress} lecturer onAction={(mode, row) => setModal({ mode, row, registrationId })} /> : <EmptyState text="Sinh viên chưa cập nhật tiến độ thực tập." />}</StudentCard>
    </>}
    {modal?.registrationId === registrationId && <ProgressModal {...modal} onClose={() => setModal(null)} onSave={save} />}
  </>
}
