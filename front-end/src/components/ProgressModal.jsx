import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../utils/studentWorkspace'

export default function ProgressModal({ mode, row, onClose, onSave }) {
  const dialog = useRef(null), saving = useRef(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const [form, setForm] = useState({ soTuan: row?.soTuan ?? '', tieuDe: row?.tieuDe ?? '', noiDung: row?.noiDung ?? '', nhanXet: row?.nhanXetGiangVien ?? '' })
  const edit = mode === 'create' || mode === 'edit', comment = mode === 'comment', remove = mode === 'delete'
  const title = comment ? `Nhận xét tiến độ tuần ${row.soTuan}` : remove ? 'Xóa tiến độ' : mode === 'view' ? `Tiến độ tuần ${row.soTuan}` : mode === 'edit' ? 'Chỉnh sửa tiến độ' : 'Cập nhật tiến độ'
  useEffect(() => { const el = dialog.current; el.showModal(); return () => el.close() }, [])
  function close() { if (!saving.current) onClose() }
  function change(e) { setForm(v => ({ ...v, [e.target.name]: e.target.value })) }
  async function submit(e) {
    e.preventDefault()
    if (saving.current) return
    if (edit && (!Number.isInteger(Number(form.soTuan)) || Number(form.soTuan) < 1 || Number(form.soTuan) > 2147483647 || !form.tieuDe.trim() || !form.noiDung.trim())) { setError('Vui lòng nhập tuần là số nguyên dương, tiêu đề và nội dung.'); return }
    if (comment && !form.nhanXet.trim()) { setError('Nhận xét bắt buộc.'); return }
    saving.current = true; setBusy(true); setError('')
    try { await onSave(edit ? { soTuan: Number(form.soTuan), tieuDe: form.tieuDe.trim(), noiDung: form.noiDung.trim() } : comment ? form.nhanXet.trim() : undefined); onClose() }
    catch (err) { setError(err.response?.data?.message || 'Không thể lưu thay đổi. Vui lòng thử lại.') }
    finally { saving.current = false; setBusy(false) }
  }
  return <dialog ref={dialog} className="student-modal progress-modal" aria-labelledby="progress-modal-title" onCancel={e => { e.preventDefault(); close() }}>
    <header><h2 id="progress-modal-title">{title}</h2><button className="btn" type="button" onClick={close} disabled={busy} aria-label="Đóng"><i className="bi bi-x-lg" /></button></header>
    <form onSubmit={submit}><div className="student-modal-body">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {edit ? <>
        {row?.nhanXetGiangVien?.trim() && <div className="alert alert-warning">Nội dung này đã được giảng viên nhận xét. Việc chỉnh sửa sẽ thay đổi nội dung đã được xem.</div>}
        <div className="mb-3"><label className="form-label" htmlFor="progress-week">Tuần *</label><input id="progress-week" className="form-control" type="number" min="1" max="2147483647" step="1" required name="soTuan" value={form.soTuan} onChange={change} disabled={busy} /></div>
        <div className="mb-3"><label className="form-label" htmlFor="progress-title">Tiêu đề *</label><input id="progress-title" className="form-control" required maxLength={200} name="tieuDe" value={form.tieuDe} onChange={change} disabled={busy} /></div>
        <label className="form-label" htmlFor="progress-content">Nội dung công việc *</label><textarea id="progress-content" className="form-control" rows={7} required maxLength={20000} name="noiDung" value={form.noiDung} onChange={change} disabled={busy} />
      </> : remove ? <p>Bạn có chắc muốn xóa tiến độ tuần {row.soTuan}: <strong>{row.tieuDe}</strong>?</p> : <>
        <p className="text-secondary">Tuần {row.soTuan} · Ngày báo cáo: {formatDate(row.ngayBaoCao)}</p><h3 className="h6">{row.tieuDe}</h3><p className="progress-content">{row.noiDung}</p>
        {comment ? <><label className="form-label" htmlFor="progress-comment">Nhận xét của giảng viên *</label><textarea id="progress-comment" className="form-control" rows={6} required maxLength={20000} name="nhanXet" value={form.nhanXet} onChange={change} disabled={busy} /></> : <><h3 className="h6">Nhận xét của giảng viên</h3><p className="progress-content">{row.nhanXetGiangVien?.trim() || 'Giảng viên chưa nhận xét tiến độ này.'}</p></>}
      </>}
    </div><footer><button className="btn btn-light" type="button" onClick={close} disabled={busy}>{mode === 'view' ? 'Đóng' : 'Hủy'}</button>{mode !== 'view' && <button className={`btn ${remove ? 'btn-danger' : 'btn-primary'}`} disabled={busy}>{busy ? 'Đang lưu...' : remove ? 'Xóa tiến độ' : comment ? 'Lưu nhận xét' : 'Lưu tiến độ'}</button>}</footer></form>
  </dialog>
}
