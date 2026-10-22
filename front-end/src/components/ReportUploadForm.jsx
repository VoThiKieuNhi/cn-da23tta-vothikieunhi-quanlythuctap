import { useRef, useState } from 'react'
import ReportSteps from './ReportSteps'
export default function ReportUploadForm({ report, registration, disabled, onSave, onCancel }) {
  const [title, setTitle] = useState(report?.tenBaoCao || ''), [file, setFile] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [drag, setDrag] = useState(false)
  const input = useRef(null), saving = useRef(false)
  const [step, setStep] = useState(1)
  function next() {
    setError('')
    if (step === 1 && !title.trim()) { setError('Vui lòng nhập tiêu đề báo cáo.'); return }
    if (step === 2 && !report && !file) { setError('Vui lòng chọn tệp báo cáo.'); return }
    setStep(value => Math.min(value + 1, 3))
  }
  function choose(value) {
    if (busy || disabled || !value) return
    setError(''); setFile(null)
    if (!/\.(pdf|doc|docx)$/i.test(value.name)) { setError('Vui lòng chọn tệp PDF, DOC hoặc DOCX.'); return }
    if (!value.size || value.size > 10 * 1024 * 1024) { setError('Tệp không được rỗng và không vượt quá 10MB.'); return }
    setFile(value)
  }
  async function submit(e) {
    e.preventDefault(); if (saving.current || disabled) return
    if (step < 3) { next(); return }
    if (!title.trim() || (!report && !file)) { setError('Vui lòng nhập tiêu đề và chọn tệp báo cáo.'); return }
    saving.current = true; setBusy(true); setError('')
    try { await onSave(title.trim(), file) } catch (err) { setError(err.response?.data?.message || 'Không thể tải báo cáo lên. Vui lòng thử lại.') } finally { saving.current = false; setBusy(false) }
  }
  return <form onSubmit={submit} className="report-upload-form"><ReportSteps current={step} /><div className="mb-3" hidden={step !== 1}>{registration && <dl className="sw-facts mb-4"><div><dt>Doanh nghiệp</dt><dd>{registration.tenDoanhNghiep || 'Chưa có dữ liệu'}</dd></div><div><dt>Giảng viên hướng dẫn</dt><dd>{registration.giangVienHuongDan || 'Chưa phân công'}</dd></div></dl>}<label htmlFor="report-title" className="form-label">Tiêu đề báo cáo *</label><input id="report-title" className="form-control" required maxLength={255} value={title} onChange={e => setTitle(e.target.value)} disabled={busy || disabled} /></div>
    <div hidden={step !== 2}>
    <div className={`sw-upload ${drag ? 'dragging' : ''}`} onDragOver={e => { e.preventDefault(); if (!busy && !disabled) setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); choose(e.dataTransfer.files[0]) }}><span className="sw-stat-icon blue"><i className="bi bi-cloud-arrow-up" /></span><h3>Kéo thả tệp báo cáo vào đây</h3><p>Hỗ trợ PDF, DOC, DOCX - tối đa 10MB</p><input ref={input} className="visually-hidden" type="file" accept=".pdf,.doc,.docx" tabIndex={-1} aria-label="Chọn tệp báo cáo" disabled={busy || disabled} onChange={e => choose(e.target.files[0])} /><button className="btn btn-primary" type="button" disabled={busy || disabled} onClick={() => input.current.click()}>Chọn tệp</button></div>
    {file && <p className="report-selected-file">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB <button className="btn btn-link btn-sm" type="button" disabled={busy} onClick={() => { setFile(null); input.current.value = '' }}>Bỏ chọn</button></p>}
    {report && !file && <p className="sw-muted mt-3">Giữ tệp hiện tại: {report.tenFile}. Chọn tệp mới nếu cần thay thế.</p>}
    </div>
    {step === 3 && <div className="report-confirmation"><h3>Xác nhận báo cáo</h3><dl className="sw-facts"><div><dt>Tiêu đề</dt><dd>{title}</dd></div><div><dt>Tệp đính kèm</dt><dd>{file?.name || report?.tenFile}</dd></div></dl><p className="sw-inline-note"><i className="bi bi-info-circle" />Kiểm tra thông tin trước khi gửi báo cáo cho giảng viên.</p></div>}
    {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
    <div className="report-actions mt-3">{step > 1 && <button className="btn btn-light border" type="button" disabled={busy} onClick={() => { setStep(value => value - 1); setError('') }}>Quay lại</button>}<button className="btn btn-primary" disabled={busy || disabled}>{step < 3 ? 'Tiếp tục' : busy ? 'Đang tải lên...' : report ? report.trangThai === 'CAN_CHINH_SUA' ? 'Nộp lại báo cáo' : 'Lưu cập nhật' : 'Nộp báo cáo'}</button>{onCancel && <button className="btn btn-light" type="button" disabled={busy} onClick={onCancel}>Hủy</button>}</div>
  </form>
}
