import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getStudentProgress, commentProgress } from '../../services/lecturerProgressService'
import { EmptyState } from '../../components/StudentWorkspace'
import ProgressModal from '../../components/ProgressModal'
import StatusBadge from '../../components/StatusBadge'
import { LecturerHeader, LecturerBoundary } from '../../components/LecturerWorkspace'
import { formatDate } from '../../utils/studentWorkspace'

export default function LecturerStudentProgress() {
  const { registrationId } = useParams()
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0), [modal, setModal] = useState(null), [notice, setNotice] = useState('')
  useEffect(() => { const c = new AbortController(); getStudentProgress(registrationId, c.signal).then(data => { if (!c.signal.aborted) setState({ data, registrationId }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải tiến độ.', registrationId }) }); return () => c.abort() }, [registrationId, revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  async function save(nhanXet) { await commentProgress(modal.registrationId, modal.row.id, nhanXet); setNotice('Đã lưu nhận xét.'); reload() }
  const data = state.registrationId === registrationId ? state.data : null, s = data?.student, r = data?.internship
  return <><LecturerHeader title="Chi tiết tiến độ thực tập" subtitle="Xem và nhận xét tiến độ thực tập của sinh viên." progress />
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    <LecturerBoundary state={state.registrationId !== registrationId && !state.loading ? { loading: true } : state} retry={reload}>
      {data && <><section className="lec-card lec-student-info"><div className="lec-student-identity"><span className="lec-avatar">{s.hoTen?.trim().split(/\s+/).slice(-2).map(word => word[0]).join('') || <i className="bi bi-person" />}</span><div><h2>{s.hoTen}</h2><p>MSSV: {s.maSinhVien}</p><p>Lớp: {s.lop || 'Chưa cập nhật'}</p><p>Ngành: {s.nganh || 'Chưa cập nhật'}</p></div></div><dl>{[['Doanh nghiệp', r.tenDoanhNghiep], ['Cán bộ hướng dẫn', r.canBoHuongDan || 'Chưa có dữ liệu'], ['Thời gian thực tập', `${formatDate(r.ngayBatDau)} – ${formatDate(r.ngayKetThuc)}`], ['Trạng thái', <StatusBadge key="status" status={r.trangThai} />]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <section className="lec-card"><h2><i className="bi bi-file-earmark-text" aria-hidden="true" /> Tiến độ thực tập theo tuần</h2>{data.progress.length ? <ol className="lec-timeline">{[...data.progress].sort((a, b) => b.soTuan - a.soTuan).map(row => <li key={row.id}><div className="lec-week"><strong>Tuần {row.soTuan}</strong><small>{formatDate(row.ngayBaoCao)}</small></div><span className={`lec-timeline-dot ${row.nhanXetGiangVien?.trim() ? 'reviewed' : ''}`}><i className="bi bi-check-lg" aria-hidden="true" /></span><article><header><h3>{row.tieuDe}</h3><StatusBadge status={row.nhanXetGiangVien?.trim() ? 'DA_DUYET' : 'DA_NOP'} label={row.nhanXetGiangVien?.trim() ? 'Có nhận xét' : 'Đã gửi'} /></header><p>{row.noiDung}</p><small>Ngày báo cáo: {formatDate(row.ngayBaoCao)}</small></article><div className="lec-comment"><strong>Nhận xét của giảng viên</strong><p>{row.nhanXetGiangVien?.trim() || 'Chưa có nhận xét.'}</p><button className="btn btn-outline-primary btn-sm" onClick={() => setModal({ mode: 'comment', row, registrationId })}><i className={`bi bi-${row.nhanXetGiangVien?.trim() ? 'pencil' : 'plus-lg'}`} aria-hidden="true" /> {row.nhanXetGiangVien?.trim() ? 'Sửa nhận xét' : 'Nhận xét'}</button></div></li>)}</ol> : <EmptyState text="Sinh viên chưa cập nhật tiến độ thực tập." />}</section></>}
    </LecturerBoundary>
    {modal?.registrationId === registrationId && <ProgressModal {...modal} onClose={() => setModal(null)} onSave={save} />}
  </>
}
