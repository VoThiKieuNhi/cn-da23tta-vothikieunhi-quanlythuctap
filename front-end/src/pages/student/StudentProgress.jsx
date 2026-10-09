import { useEffect, useState } from 'react'
import { StudentHeader, StudentCard, StudentStats, StudentTimeline, EmptyState } from '../../components/StudentWorkspace'
import ProgressModal from '../../components/ProgressModal'
import ProgressTable from '../../components/ProgressTable'
import { useStudentWorkspace, formatDate } from '../../utils/studentWorkspace'
import { getProgress, getProgressDetail, createProgress, updateProgress, deleteProgress } from '../../services/studentProgressService'
import '../../assets/css/progress.css'

export default function StudentProgress() {
  const { state: workspace } = useStudentWorkspace()
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
  const timeline = workspace.data && data ? { ...workspace.data, registration: r ? { ...workspace.data.registration, ...r } : null, lecturers: r?.giangVienHuongDan ? [r.giangVienHuongDan] : [] } : null
  return <>
    <StudentHeader title="Tiến độ thực tập" subtitle="Theo dõi các mốc công việc và cập nhật tiến độ trong thời gian thực tập."><button className="btn btn-primary" disabled={!data?.canCreate} onClick={() => setModal({ mode: 'create' })}><i className="bi bi-plus-lg" /> Cập nhật tiến độ</button></StudentHeader>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}{actionError && <div className="alert alert-danger" role="alert">{actionError}</div>}
    {state.loading ? <div className="admin-loading" role="status">Đang tải tiến độ...</div> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={reload}>Thử lại</button></div> : <>
      <StudentStats items={[{ label: 'Tiến độ tổng thể', value: `${data.percent}%`, detail: 'Theo thời gian thực tập', icon: 'graph-up-arrow' }, { label: 'Tuần đã cập nhật', value: data.progress.length, icon: 'journal-check', tone: 'green' }, { label: 'Tuần đã được nhận xét', value: data.progress.filter(x => x.nhanXetGiangVien?.trim()).length, icon: 'chat-left-text', tone: 'orange' }, { label: 'Giảng viên hướng dẫn', value: r?.giangVienHuongDan?.hoTen || 'Chưa phân công', icon: 'person-badge', tone: 'purple' }]} />
      <div className="sw-two-column"><StudentCard title="Lộ trình thực tập" icon="signpost-split">{timeline ? <StudentTimeline data={timeline} /> : <EmptyState text={workspace.error || 'Đang tải lộ trình...'} />}</StudentCard><StudentCard title="Thời gian thực tập" icon="calendar-week"><p>{r ? `${formatDate(r.ngayBatDau)} – ${formatDate(r.ngayKetThuc)}` : 'Chưa có lịch thực tập'}</p><div className="progress-time"><p className="sw-muted">{data.percent}% thời gian thực tập đã trôi qua</p><div className="progress" role="progressbar" aria-label="Tiến độ theo thời gian" aria-valuenow={data.percent} aria-valuemin={0} aria-valuemax={100}><div className="progress-bar" style={{ width: `${data.percent}%` }} /></div></div>{!data.canCreate && <EmptyState text={data.message} detail={data.message === 'Đợt thực tập chưa bắt đầu.' ? 'Khi đến thời gian thực tập, bạn có thể cập nhật tiến độ theo tuần tại đây.' : undefined} />}</StudentCard></div>
      <StudentCard title="Nhật ký tiến độ" icon="journal-text"><div className="progress-toolbar"><button className="btn btn-light btn-sm" onClick={reload}>Làm mới</button></div>{data.progress.length ? <ProgressTable rows={data.progress} onAction={action} /> : <><EmptyState text={data.canCreate ? 'Bạn chưa cập nhật tiến độ thực tập.' : data.message} />{data.canCreate && <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>Cập nhật tuần đầu tiên</button>}</>}</StudentCard>
    </>}
    {modal && <ProgressModal {...modal} onClose={() => setModal(null)} onSave={save} />}
  </>
}
