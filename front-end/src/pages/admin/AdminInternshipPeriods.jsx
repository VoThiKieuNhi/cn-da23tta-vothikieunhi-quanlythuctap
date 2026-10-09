import { formatTime } from '../../utils/dateFormat'
import { periodLabels as statuses } from '../../utils/statusLabels'
import { useEffect, useRef, useState } from 'react'
import { getInternshipPeriods, getInternshipPeriodById, createInternshipPeriod, updateInternshipPeriod, deleteInternshipPeriod } from '../../services/internshipPeriodAdminService'
import { timeErrors, openingInPast, pastMessage, registrationKeys, toLocalInput, registrationText, periodPayload } from '../../utils/periodTime'
import '../../assets/css/student-admin.css'
import '../../assets/css/internship-period-admin.css'

const semesters = ['Học kỳ 1', 'Học kỳ 2']
const fields = [['hocKy', 'Học kỳ'], ['namHoc', 'Năm học'], ['ngayBatDauDangKy', 'Thời gian mở đăng ký'], ['ngayKetThucDangKy', 'Thời gian đóng đăng ký'], ['ngayBatDauThucTap', 'Ngày bắt đầu thực tập'], ['ngayKetThucThucTap', 'Ngày kết thúc thực tập']]
const dateKeys = fields.slice(2, 6).map(([key]) => key)
const dateText = value => value ? value.slice(0, 10).split('-').reverse().join('/') : '—'
const badge = value => <span className={`student-badge period-${value}`}>{statuses[value] || value}</span>
function validate(data, existing) {
  const errors = {}
  for (const [key, label] of fields) if (!data[key]?.trim()) errors[key] = `${label} bắt buộc.`
  for (const key of ['hocKy', 'namHoc']) if (Array.from(data[key] || '').length > 30) errors[key] = 'Tối đa 30 ký tự.'
  const payload = periodPayload(data, existing)
  Object.assign(errors, timeErrors(payload))
  if (openingInPast(payload, existing)) errors.ngayBatDauDangKy = pastMessage
  if (!semesters.includes(data.hocKy)) errors.hocKy = 'Chỉ được chọn Học kỳ 1 hoặc Học kỳ 2.'
  return errors
}

function PeriodModal({ mode, record, onClose, onSaved }) {
  const dialog = useRef(null), saving = useRef(false)
  const [original, setOriginal] = useState(null)
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(([key]) => [key, key === 'hocKy' ? semesters[0] : ''])))
  const [loading, setLoading] = useState(mode === 'view' || mode === 'edit')
  const [loadError, setLoadError] = useState(false), [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [errors, setErrors] = useState({})
  const title = `${{ create: 'Thêm', edit: 'Sửa', view: 'Chi tiết', delete: 'Xóa' }[mode]} đợt thực tập`
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close() }, [])
  useEffect(() => {
    if (mode !== 'view' && mode !== 'edit') return
    const controller = new AbortController()
    getInternshipPeriodById(record.id, controller.signal).then(data => { if (!controller.signal.aborted) { setOriginal(data); setForm({ ...data, ngayBatDauDangKy: toLocalInput(data.ngayBatDauDangKy), ngayKetThucDangKy: toLocalInput(data.ngayKetThucDangKy) }); setLoading(false) } })
      .catch(() => { if (!controller.signal.aborted) { setLoading(false); setLoadError(true) } })
    return () => controller.abort()
  }, [record?.id, mode, revision])
  async function submit(e) {
    e.preventDefault()
    if (saving.current || loading || loadError) return
    const next = mode === 'delete' ? {} : validate(form, original)
    setErrors(next)
    if (Object.keys(next).length) return
    saving.current = true; setBusy(true); setError('')
    try {
      const data = periodPayload(Object.fromEntries(fields.map(([key]) => [key, form[key].trim()])), original)
      const result = mode === 'delete' ? await deleteInternshipPeriod(record.id) : mode === 'create' ? await createInternshipPeriod(data) : await updateInternshipPeriod(record.id, data)
      onSaved(result.message)
    } catch (err) { setError(err.response?.data?.message || 'Không thể lưu thay đổi. Vui lòng thử lại.'); setErrors(err.response?.data?.errors || {}) }
    finally { saving.current = false; setBusy(false) }
  }
  return <dialog ref={dialog} className="student-modal" aria-labelledby="period-modal-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }}>
    <header><h2 id="period-modal-title">{title}</h2><button type="button" className="admin-icon-button" aria-label="Đóng" disabled={busy} onClick={onClose}><i className="bi bi-x-lg" /></button></header>
    <form onSubmit={submit} noValidate><div className="student-modal-body">
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
      {loading ? <p role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải thông tin...</p>
        : loadError ? <div role="alert"><p>Không thể tải thông tin đợt thực tập.</p><button type="button" className="btn btn-primary" onClick={() => { setLoading(true); setLoadError(false); setRevision(v => v + 1) }}>Thử lại</button></div>
          : mode === 'delete' ? <><p>Bạn có chắc muốn xóa đợt thực tập này?</p><div className="student-delete-person"><strong>{record.hocKy}</strong><span>{record.namHoc}</span></div></>
            : mode === 'view' ? <dl className="student-details">{[...fields, ['trangThai', 'Trạng thái'], ['soSinhVienDangKy', 'Số sinh viên đăng ký'], ['ngayTao', 'Ngày tạo'], ['ngayCapNhat', 'Ngày cập nhật']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{key === 'trangThai' ? badge(form[key]) : registrationKeys.includes(key) ? registrationText(original?.[key]) : dateKeys.includes(key) ? dateText(form[key]) : ['ngayTao', 'ngayCapNhat'].includes(key) ? (form[key] ? formatTime(form[key]) : '—') : form[key]}</dd></div>)}</dl>
              : <div className="student-form-grid">{fields.map(([key, label]) => <div key={key}><label className="form-label" htmlFor={`period-${key}`}>{label} <span className="text-danger">*</span></label>
                {key === 'hocKy' ? <select id={`period-${key}`} className={`form-select ${errors[key] ? 'is-invalid' : ''}`} value={form[key]} disabled={busy} onChange={e => setForm({ ...form, [key]: e.target.value })} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `period-error-${key}` : undefined}>{semesters.map(value => <option key={value} value={value}>{value}</option>)}</select>
                  : <input id={`period-${key}`} className={`form-control ${errors[key] ? 'is-invalid' : ''}`} type={registrationKeys.includes(key) ? 'datetime-local' : dateKeys.includes(key) ? 'date' : 'text'} step={registrationKeys.includes(key) ? 60 : undefined} maxLength={dateKeys.includes(key) ? undefined : 30} placeholder={key === 'namHoc' ? '2026-2027' : key === 'hocKy' ? 'Học kỳ 1' : undefined} value={form[key]} disabled={busy} onChange={e => setForm({ ...form, [key]: e.target.value })} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `period-error-${key}` : undefined} />}
                {errors[key] && <div className="invalid-feedback" id={`period-error-${key}`}>{errors[key]}</div>}</div>)}</div>}
    </div><footer><button type="button" className="btn btn-light border" onClick={onClose} disabled={busy}>{mode === 'view' ? 'Đóng' : 'Hủy'}</button>{mode !== 'view' && <button className={`btn ${mode === 'delete' ? 'btn-danger' : 'btn-primary'}`} disabled={busy || loading || loadError}>{busy ? 'Đang xử lý...' : mode === 'edit' ? 'Lưu thay đổi' : title}</button>}</footer></form>
  </dialog>
}

export default function AdminInternshipPeriods() {
  const [draft, setDraft] = useState({ search: '', trangThai: '' })
  const [query, setQuery] = useState({ search: '', trangThai: '', page: 1, limit: 10 })
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0)
  const [modal, setModal] = useState(null), [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getInternshipPeriods(query, controller.signal).then(response => {
      if (controller.signal.aborted) return
      if (query.page > Math.max(1, response.pagination.totalPages)) { setQuery(prev => ({ ...prev, page: Math.max(1, response.pagination.totalPages) })); return }
      setState({ response })
    }).catch(() => { if (!controller.signal.aborted) setState({ error: true }) })
    return () => controller.abort()
  }, [query, revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  function change(next) { setState({ loading: true }); setQuery(next) }
  const result = state.response, pagination = result?.pagination
  const pageCount = Math.max(1, pagination?.totalPages || 0), start = Math.max(1, Math.min(query.page - 2, pageCount - 4))
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i)
  return <div className="student-admin">
    <div className="student-page-heading"><div><h1>Quản lý đợt thực tập</h1><p>Quản lý thời gian đăng ký, thời gian thực tập và trạng thái từng đợt.</p></div><button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}><i className="bi bi-plus-lg me-2" />Thêm đợt thực tập</button></div>
    {notice && <div className="alert alert-success d-flex justify-content-between py-2" role="status">{notice}<button className="btn-close" aria-label="Đóng thông báo" onClick={() => setNotice('')} /></div>}
    <section className="admin-panel student-list-panel"><form className="student-filters" onSubmit={e => { e.preventDefault(); change({ ...query, ...draft, page: 1 }) }}>
      <div className="student-search"><i className="bi bi-search" /><input className="form-control" placeholder="Tìm theo học kỳ hoặc năm học..." aria-label="Tìm theo học kỳ hoặc năm học" maxLength={200} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} /></div>
      <select className="form-select" aria-label="Lọc trạng thái" value={draft.trangThai} onChange={e => { const next = { ...draft, trangThai: e.target.value }; setDraft(next); change({ ...query, ...next, page: 1 }) }}><option value="">Tất cả</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <button className="btn btn-primary">Tìm kiếm</button><button type="button" className="btn btn-light border" onClick={() => { setDraft({ search: '', trangThai: '' }); change({ search: '', trangThai: '', page: 1, limit: 10 }); setNotice('') }}><i className="bi bi-arrow-clockwise me-1" />Làm mới</button>
    </form>
      {state.loading ? <div className="admin-loading" role="status"><span className="spinner-border spinner-border-sm text-primary" /><p>Đang tải danh sách đợt thực tập...</p></div>
        : state.error ? <div className="admin-empty" role="alert"><p>Không thể tải danh sách đợt thực tập.</p><button className="btn btn-primary" onClick={reload}>Thử lại</button></div>
          : !result?.data.length ? <div className="admin-empty"><i className="bi bi-calendar-event" /><p>{query.search || query.trangThai ? 'Không tìm thấy đợt thực tập phù hợp với bộ lọc.' : 'Chưa có đợt thực tập trong hệ thống.'}</p>{!query.search && !query.trangThai && <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>Thêm đợt thực tập đầu tiên</button>}</div>
            : <div className="table-responsive"><table className="table align-middle student-table"><thead><tr>{['STT', 'Học kỳ', 'Năm học', 'Thời gian đăng ký', 'Thời gian thực tập', 'Sinh viên đăng ký', 'Trạng thái', 'Thao tác'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{result.data.map((record, index) => <tr key={record.id}><td>{(pagination.page - 1) * pagination.limit + index + 1}</td><td className="fw-semibold">{record.hocKy}</td><td>{record.namHoc}</td><td>{registrationText(record.ngayBatDauDangKy)} - {registrationText(record.ngayKetThucDangKy)}</td><td>{dateText(record.ngayBatDauThucTap)} - {dateText(record.ngayKetThucThucTap)}</td><td>{record.soSinhVienDangKy}</td><td>{badge(record.trangThai)}</td><td><div className="student-actions">{[['view', 'Xem', 'eye'], ['edit', 'Sửa', 'pencil-square'], ['delete', 'Xóa', 'trash3']].map(([mode, label, icon]) => <button key={mode} className="btn btn-sm" title={label} aria-label={`${label} ${record.hocKy} ${record.namHoc}`} onClick={() => setModal({ mode, record })}><i className={`bi bi-${icon}`} /> <span>{label}</span></button>)}</div></td></tr>)}</tbody></table></div>}
      {pagination && <div className="student-pagination"><span>{pagination.total} đợt thực tập · Trang {pagination.totalPages ? pagination.page : 0} / {pagination.totalPages}</span><nav aria-label="Phân trang đợt thực tập"><button disabled={query.page <= 1} onClick={() => change({ ...query, page: query.page - 1 })}>Trước</button>{pages.map(page => <button key={page} className={query.page === page ? 'active' : ''} aria-current={query.page === page ? 'page' : undefined} disabled={!pagination.totalPages} onClick={() => change({ ...query, page })}>{page}</button>)}<button disabled={query.page >= pageCount} onClick={() => change({ ...query, page: query.page + 1 })}>Sau</button></nav></div>}
    </section>
    {modal && <PeriodModal {...modal} onClose={() => setModal(null)} onSaved={message => { setModal(null); setNotice(message); reload() }} />}
  </div>
}
