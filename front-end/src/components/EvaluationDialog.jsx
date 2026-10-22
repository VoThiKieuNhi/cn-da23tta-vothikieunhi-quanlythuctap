import { useEffect, useRef, useState } from 'react'
import { formatTime } from '../utils/studentWorkspace'
import { scoreFields, formatScore, parseScore, totalScore } from '../utils/evaluationScores'
import { ReportBadge } from './ReportDetails'
export default function EvaluationDialog({ mode, data, onClose, onSave, scoreStep = '0.25' }) {
  const dialog = useRef(null), saving = useRef(false)
  const [form, setForm] = useState({ diemChuyenMon: data.evaluation?.diemChuyenMon ?? '', diemThaiDo: data.evaluation?.diemThaiDo ?? '', diemBaoCao: data.evaluation?.diemBaoCao ?? '', nhanXet: data.evaluation?.nhanXet || '' })
  const [errors, setErrors] = useState({}), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const view = mode === 'view', s = data.student, r = data.internship
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close() }, [])
  function close() { if (!saving.current) onClose() }
  async function submit(e) {
    e.preventDefault(); if (saving.current || view || !data.canEvaluate) return
    const next = {}, payload = {}
    for (const [key] of scoreFields) { payload[key] = parseScore(form[key]); if (payload[key] === null) next[key] = 'Nhập điểm từ 0 đến 10, tối đa 2 chữ số thập phân.' }
    if (!form.nhanXet.trim()) next.nhanXet = 'Vui lòng nhập nhận xét chung.'
    setErrors(next); if (Object.keys(next).length) return
    payload.nhanXet = form.nhanXet.trim()
    saving.current = true; setBusy(true); setError('')
    try { await onSave(payload); onClose() } catch (err) { setError(err.response?.data?.message || 'Không thể lưu kết quả đánh giá.') } finally { saving.current = false; setBusy(false) }
  }
  return <dialog ref={dialog} className="student-modal" aria-labelledby="evaluation-title" onCancel={e => { e.preventDefault(); close() }}><header><h2 id="evaluation-title">{view ? 'Kết quả đánh giá' : mode === 'edit' ? 'Chỉnh sửa đánh giá' : 'Đánh giá thực tập'}</h2><button className="btn" disabled={busy} onClick={close} aria-label="Đóng"><i className="bi bi-x-lg" /></button></header>
    <form noValidate onSubmit={submit}><div className="student-modal-body">{error && <div className="alert alert-danger" role="alert">{error}</div>}
      <dl className="student-details mb-4">{[['MSSV', s.maSinhVien], ['Họ tên', s.hoTen], ['Lớp', s.lop], ['Ngành', s.nganh], ['Doanh nghiệp', r.tenDoanhNghiep], ['Vị trí thực tập', r.viTriThucTap], ['Báo cáo thực tập', data.report?.tenBaoCao]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa có dữ liệu'}</dd></div>)}<div><dt>Trạng thái báo cáo</dt><dd><ReportBadge status={data.report?.trangThai} /></dd></div></dl>
      <p className="text-secondary">Đã cập nhật {data.progressSummary.tongSoTuanDaCapNhat} tuần · Đã nhận xét {data.progressSummary.soTuanDaNhanXet} tuần</p>
      {!view && !data.canEvaluate && <div className="alert alert-warning">Chưa đủ điều kiện đánh giá. Đăng ký và báo cáo phải được duyệt.</div>}
      {view ? <><dl className="student-details">{[...scoreFields, ['diemTong', 'Điểm tổng']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{formatScore(data.evaluation?.[key])}</dd></div>)}</dl><div className="report-comment"><strong>Nhận xét chung</strong><p>{data.evaluation?.nhanXet || 'Chưa có kết quả đánh giá.'}</p></div><p className="text-secondary mt-3">{formatTime(data.evaluation?.ngayDanhGia)}</p></> : <>
        <div className="student-form-grid">{scoreFields.map(([key, label]) => <div key={key}><label className="form-label" htmlFor={key}>{label} *</label><input id={key} className={`form-control ${errors[key] ? 'is-invalid' : ''}`} type="number" min="0" max="10" step={scoreStep} required value={form[key]} disabled={busy || !data.canEvaluate} onChange={e => setForm(v => ({ ...v, [key]: e.target.value }))} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />{errors[key] && <div id={`${key}-error`} className="invalid-feedback">{errors[key]}</div>}</div>)}</div>
        <div className="alert alert-primary mt-3">Điểm tổng dự kiến: <strong>{totalScore(form) == null ? '—' : formatScore(totalScore(form))}</strong><small className="d-block">Trung bình cộng 3 điểm, làm tròn 2 chữ số thập phân.</small></div>
        <label htmlFor="evaluation-comment" className="form-label">Nhận xét chung *</label><textarea id="evaluation-comment" className={`form-control ${errors.nhanXet ? 'is-invalid' : ''}`} rows={5} required maxLength={20000} placeholder="Nhập nhận xét về quá trình và kết quả thực tập của sinh viên..." value={form.nhanXet} disabled={busy || !data.canEvaluate} onChange={e => setForm(v => ({ ...v, nhanXet: e.target.value }))} aria-invalid={!!errors.nhanXet} aria-describedby={errors.nhanXet ? 'evaluation-comment-error' : undefined} />{errors.nhanXet && <div id="evaluation-comment-error" className="invalid-feedback">{errors.nhanXet}</div>}
      </>}
    </div><footer><button className="btn btn-light" type="button" onClick={close} disabled={busy}>{view ? 'Đóng' : 'Hủy'}</button>{!view && <button className="btn btn-primary" disabled={busy || !data.canEvaluate}>{busy ? 'Đang lưu...' : 'Lưu đánh giá'}</button>}</footer></form>
  </dialog>
}
