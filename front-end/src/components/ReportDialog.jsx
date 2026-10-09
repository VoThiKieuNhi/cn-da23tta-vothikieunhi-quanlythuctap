import { useEffect, useRef, useState } from 'react'
import ReportDetails from './ReportDetails'
export default function ReportDialog({ mode, report, onClose, onConfirm }) {
  const ref = useRef(null), saving = useRef(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [comment, setComment] = useState('')
  const titles = { view: 'Chi tiết báo cáo', revision: 'Yêu cầu chỉnh sửa', approve: 'Duyệt báo cáo', delete: 'Xóa báo cáo' }
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close() }, [])
  function close() { if (!saving.current) onClose() }
  async function submit(e) {
    e.preventDefault(); if (saving.current) return
    if (mode === 'revision' && !comment.trim()) { setError('Vui lòng nhập nhận xét / yêu cầu chỉnh sửa.'); return }
    saving.current = true; setBusy(true); setError('')
    try { await onConfirm(comment.trim()); onClose() } catch (err) { setError(err.response?.data?.message || 'Không thể xử lý báo cáo. Vui lòng thử lại.') } finally { saving.current = false; setBusy(false) }
  }
  return <dialog ref={ref} className="student-modal" aria-labelledby="report-dialog-title" onCancel={e => { e.preventDefault(); close() }}><header><h2 id="report-dialog-title">{titles[mode]}</h2><button className="btn" onClick={close} disabled={busy} aria-label="Đóng"><i className="bi bi-x-lg" /></button></header>
    <form onSubmit={submit}><div className="student-modal-body">{error && <div className="alert alert-danger" role="alert">{error}</div>}
      {mode === 'view' ? <ReportDetails report={report} /> : <><p>{mode === 'approve' ? 'Duyệt báo cáo thực tập của sinh viên?' : mode === 'delete' ? 'Bạn có chắc muốn xóa báo cáo và tệp đã nộp?' : 'Nhập hướng dẫn để sinh viên chỉnh sửa và nộp lại báo cáo.'}</p><p><strong>{report.tenBaoCao}</strong></p>{mode === 'revision' && <><label htmlFor="report-review" className="form-label">Nhận xét / yêu cầu chỉnh sửa *</label><textarea id="report-review" className="form-control" rows={6} maxLength={20000} required value={comment} onChange={e => setComment(e.target.value)} disabled={busy} /></>}</>}
    </div><footer><button className="btn btn-light" type="button" onClick={close} disabled={busy}>{mode === 'view' ? 'Đóng' : 'Hủy'}</button>{mode !== 'view' && <button className={`btn ${mode === 'delete' ? 'btn-danger' : 'btn-primary'}`} disabled={busy}>{busy ? 'Đang xử lý...' : mode === 'revision' ? 'Gửi yêu cầu chỉnh sửa' : mode === 'approve' ? 'Duyệt báo cáo' : 'Xóa báo cáo'}</button>}</footer></form>
  </dialog>
}
