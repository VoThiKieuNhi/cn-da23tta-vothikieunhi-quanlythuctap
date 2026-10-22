import { useEffect, useState } from 'react'
import { StudentHeader, StudentCard, EmptyState } from '../../components/StudentWorkspace'
import ProgressModal from '../../components/ProgressModal'
import StudentProgressTimeline from '../../components/StudentProgressTimeline'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/studentWorkspace'
import { getProgress, getProgressDetail, createProgress, updateProgress, deleteProgress } from '../../services/studentProgressService'
import '../../assets/css/progress.css'

export default function StudentProgress() {
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0), [modal, setModal] = useState(null), [notice, setNotice] = useState(''), [actionError, setActionError] = useState('')
  useEffect(() => { const c = new AbortController(); getProgress(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải tiến độ.' }) }); return () => c.abort() }, [revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  async function action(mode, row) {
    setActionError('')
    try { setModal({ mode, row: await getProgressDetail(row.id) }) } catch (err) { setActionError(err.response?.data?.message || 'Không thể tải chi tiết tiến độ.') }
  }
  async function save(body) {
    if (modal.mode === 'create') await createProgress(body)
    else if (modal.mode === 'delete') await deleteProgress(modal.row.id)
    else await updateProgress(modal.row.id, body)
    setNotice(modal.mode === 'delete' ? 'Đã xóa tiến độ.' : 'Đã lưu tiến độ thực tập.'); reload()
  }
  const data = state.data, r = data?.registration
  return <>
    <StudentHeader title="Tiến độ thực tập" subtitle="Cập nhật và theo dõi tiến độ thực tập của bạn."><button className="btn btn-primary" disabled={!data?.canCreate} onClick={() => setModal({ mode: 'create' })}><i className="bi bi-plus-lg" /> Thêm tiến độ</button></StudentHeader>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}{actionError && <div className="alert alert-danger" role="alert">{actionError}</div>}
    {state.loading ? <div className="admin-loading" role="status">Đang tải tiến độ...</div> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={reload}>Thử lại</button></div> : <>
      <StudentCard title="Thông tin thực tập" icon="briefcase"><div className="st-internship-facts">{[['Doanh nghiệp', r?.tenDoanhNghiep, 'buildings'], ['Giảng viên hướng dẫn', r?.giangVienHuongDan?.hoTen, 'person-badge'], ['Thời gian', r ? `${formatDate(r.ngayBatDau)} – ${formatDate(r.ngayKetThuc)}` : null, 'calendar3']].map(([label, value, icon]) => <div key={label}><span className="sw-stat-icon blue"><i className={`bi bi-${icon}`} /></span><div><small>{label}</small><strong>{value || 'Chưa có dữ liệu'}</strong></div></div>)}<div><StatusBadge status={r?.trangThai} /></div></div></StudentCard>
      {!data.canCreate && <div className="alert alert-info" role="status">{data.message}</div>}
      <StudentCard title="Nhật ký tiến độ" icon="journal-text"><div className="progress-toolbar"><button className="btn btn-light btn-sm" onClick={reload}>Làm mới</button></div>{data.progress.length ? <StudentProgressTimeline rows={data.progress} onAction={action} /> : <><EmptyState text={data.canCreate ? 'Bạn chưa cập nhật tiến độ thực tập.' : data.message} />{data.canCreate && <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>Cập nhật tuần đầu tiên</button>}</>}</StudentCard>
    </>}
    {modal && <ProgressModal {...modal} onClose={() => setModal(null)} onSave={save} />}
  </>
}
