import AdminStatusBadge from '../../components/AdminStatusBadge'
import { formatDate as dateText } from '../../utils/dateFormat'
import ManualLecturerFaculty from '../../components/ManualLecturerFaculty'
import validLecturerName from '../../utils/lecturerName'
import LecturerReferenceFields from '../../components/LecturerReferenceFields'
import { emailError, isValidPhone, messages, passwordError } from '../../utils/validators'
import { useEffect, useRef, useState } from 'react'
import { createLecturer, deleteLecturer, deactivateLecturer, getLecturerById, getLecturers, updateLecturer } from '../../services/lecturerAdminService'
import '../../assets/css/student-admin.css'

const emptyFilters = { search: '', boMon: '', hocVi: '', trangThai: '' }
const emptyForm = { maGiangVien: '', hoTen: '', email: '', password: '', soDienThoai: '', boMon: '', hocVi: '', danhMucGiangVienId: '', khoaDonVi: '', chucVu: '', linhVuc: '', dangHoatDong: true }
const fields = [
  ['maGiangVien', 'Mã giảng viên', 'text', 30, true], ['hoTen', 'Họ tên', 'text', 150, true],
  ['email', 'Email', 'email', 150, true], ['password', 'Mật khẩu', 'password', undefined, true],
  ['soDienThoai', 'Số điện thoại', 'tel', 10], ['boMon', 'Khoa / đơn vị', 'text', 150],
  ['hocVi', 'Học vị', 'text', 100],
  ['chucVu', 'Chức vụ', 'text'], ['linhVuc', 'Lĩnh vực', 'text'],
]
function validate(data, creating, manual) {
  const errors = {}
  for (const [key, label, , max, required] of fields) {
    if (key === 'password') continue
    if (required && !data[key]?.trim()) errors[key] = `Vui lòng nhập ${label.toLowerCase()}.`
    else if (max && Array.from(data[key] || '').length > max) errors[key] = `Tối đa ${max} ký tự.`
  }
  if (data.email?.trim() && emailError(data.email, 'GIANG_VIEN')) errors.email = 'Email giảng viên phải sử dụng tên miền @tvu.edu.vn.'
  if (creating && passwordError(data.password)) errors.password = passwordError(data.password)
  if (data.soDienThoai?.trim() && !isValidPhone(data.soDienThoai)) errors.soDienThoai = messages.phone
  if (manual && !validLecturerName(data.hoTen)) errors.hoTen = 'Họ tên phải có ít nhất 2 từ, chỉ gồm chữ và khoảng trắng, không chứa dữ liệu rác.';
  if (manual && !data.boMon.trim()) errors.boMon = 'Vui lòng chọn hoặc nhập khoa / đơn vị.';
  return errors
}

function LecturerModal({ mode, lecturer, onClose, onSaved }) {
  const dialog = useRef(null)
  const submitting = useRef(false)
  const [form, setForm] = useState(emptyForm)
  const [manual, setManual] = useState(false)
  const [referenceReady, setReferenceReady] = useState(false)
  const [loading, setLoading] = useState(mode === 'view' || mode === 'edit')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [canDeactivate, setCanDeactivate] = useState(false)
  const [errors, setErrors] = useState({})
  const [loaded, setLoaded] = useState(mode === 'create' || mode === 'delete')
  const titles = { create: 'Thêm giảng viên', edit: 'Sửa giảng viên', view: 'Chi tiết giảng viên', delete: 'Xóa giảng viên' }
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  useEffect(() => {
    if (mode !== 'view' && mode !== 'edit') return
    const controller = new AbortController()
    getLecturerById(lecturer.id, controller.signal).then(data => {
      if (!controller.signal.aborted) { setForm({ ...emptyForm, ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value ?? ''])) }); setManual(!data.danhMucGiangVienId); setLoaded(true); setLoading(false) }
    }).catch(() => { if (!controller.signal.aborted) { setError('Không thể tải thông tin giảng viên. Vui lòng đóng và thử lại.'); setLoading(false) } })
    return () => controller.abort()
  }, [mode, lecturer?.id])

  function changeMode(value) {
    setManual(value); setReferenceReady(false); setErrors({}); setError('');
    setForm(v => ({ ...v, danhMucGiangVienId: '', khoaDonVi: '', hoTen: '', hocVi: '', boMon: '', chucVu: '', linhVuc: '' }))
  }

  async function save(event) {
    event.preventDefault()
    if (submitting.current || !loaded) return
    const next = mode === 'delete' ? {} : validate(form, mode === 'create', manual)
    setErrors(next)
    if (Object.keys(next).length) return
    if (mode !== 'delete' && !manual && !referenceReady) { setError('Vui lòng chọn khoa và giảng viên trong danh mục TVU.'); return }
    submitting.current = true; setBusy(true); setError('')
    try {
      if (mode === 'delete') await deleteLecturer(lecturer.id)
      else {
        const payload = Object.fromEntries(fields.filter(([key]) => (!manual || key !== 'boMon') && (mode === 'create' || key !== 'password')).map(([key]) => [key, form[key]]))
        payload.referenceLecturerId = manual ? null : form.danhMucGiangVienId
        payload.khoaDonVi = form.boMon
        if (mode === 'create') await createLecturer(payload)
        else await updateLecturer(lecturer.id, { ...payload, dangHoatDong: form.dangHoatDong })
      }
      onSaved(mode === 'delete' ? 'Xóa giảng viên thành công.' : mode === 'create' ? 'Thêm giảng viên thành công.' : 'Cập nhật giảng viên thành công.')
    } catch (e) {
      if (mode === 'delete' && e.response?.status === 409) setCanDeactivate(true)
      setError(mode === 'delete' && e.response?.status === 409
        ? 'Không thể xóa giảng viên vì đã có dữ liệu thực tập liên quan. Bạn có thể chuyển tài khoản sang trạng thái ngừng hoạt động.'
        : e.response?.data?.message || 'Không thể lưu thay đổi. Vui lòng thử lại.')
    } finally { submitting.current = false; setBusy(false) }
  }

  async function deactivate() {
    if (submitting.current) return
    submitting.current = true; setBusy(true)
    try { const result = await deactivateLecturer(lecturer.id); onSaved(result.message) }
    catch (e) { setError(e.response?.data?.message || 'Không thể ngừng hoạt động tài khoản.') }
    finally { submitting.current = false; setBusy(false) }
  }
  return <dialog className="student-modal" ref={dialog} aria-labelledby="student-modal-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }}>
    <header><div><span>QUẢN LÝ GIẢNG VIÊN</span><h2 id="student-modal-title">{titles[mode]}</h2></div><button type="button" className="admin-icon-button" aria-label="Đóng" disabled={busy} onClick={onClose}><i className="bi bi-x-lg" /></button></header>
    <form onSubmit={save} noValidate>
      <div className="student-modal-body">
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        {loading ? <p role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải thông tin...</p>
          : mode === 'delete' ? <><p>Bạn có chắc muốn xóa giảng viên này?</p><div className="student-delete-person"><strong>{lecturer.hoTen}</strong><span>Mã giảng viên: {lecturer.maGiangVien}</span></div><p className="text-secondary small mt-3 mb-0">Hồ sơ và tài khoản tương ứng sẽ bị xóa. Thao tác không thể hoàn tác.</p></>
            : mode === 'view' && loaded ? <><div className="student-profile"><span><i className="bi bi-person" /></span><div><h3>{form.hoTen}</h3><p>{form.maGiangVien}</p></div></div><dl className="student-details">{fields.filter(([key]) => key !== 'password').map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{form[key] || '—'}</dd></div>)}<div><dt>Trạng thái tài khoản</dt><dd>{form.dangHoatDong ? 'Đang hoạt động' : 'Đã khóa'}</dd></div><div><dt>Ngày tạo</dt><dd>{dateText(form.ngayTao)}</dd></div></dl></>
              : loaded && <><div className="student-form-grid">{manual ? <><div><span>Nhập thủ công</span><button type="button" className="btn btn-link btn-sm" disabled={busy} onClick={() => changeMode(false)}>Chọn từ danh mục TVU</button></div><ManualLecturerFaculty form={form} setForm={setForm} busy={busy} />{errors.boMon && <div className="text-danger">{errors.boMon}</div>}</> : <LecturerReferenceFields form={form} setForm={setForm} busy={busy} onReady={setReferenceReady} onManual={() => changeMode(true)} />}{fields.filter(([key]) => (!manual || key !== 'boMon') && (mode === 'create' || key !== 'password')).map(([key, label, type, max, required]) => <div key={key}><label className="form-label" htmlFor={`lecturer-${key}`}>{label}{required && <span className="text-danger"> *</span>}</label><input id={`lecturer-${key}`} className={`form-control ${errors[key] ? 'is-invalid' : ''}`} type={type} readOnly={!manual && ['hoTen', 'boMon', 'hocVi', 'chucVu', 'linhVuc'].includes(key)} maxLength={max} minLength={key === 'password' ? 8 : undefined} inputMode={key === 'soDienThoai' ? 'numeric' : undefined} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} autoComplete={key === 'password' ? 'new-password' : 'off'} disabled={busy} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} />{errors[key] && <div id={`error-${key}`} className="invalid-feedback d-block">{errors[key]}</div>}</div>)}</div>{mode === 'edit' && <div className="form-check form-switch mt-4"><input id="student-active" className="form-check-input" type="checkbox" checked={form.dangHoatDong} disabled={busy} onChange={e => setForm({ ...form, dangHoatDong: e.target.checked })} /><label className="form-check-label" htmlFor="student-active">Tài khoản hoạt động</label></div>}</>}
      </div>
      <footer><button type="button" className="btn btn-light border" disabled={busy} onClick={onClose}>{mode === 'view' ? 'Đóng' : 'Hủy'}</button>{canDeactivate && lecturer.dangHoatDong && <button type="button" className="btn btn-warning" disabled={busy} onClick={deactivate}>Ngừng hoạt động tài khoản</button>}{mode !== 'view' && <button type="submit" disabled={busy || loading || !loaded} className={`btn ${mode === 'delete' ? 'btn-danger' : 'btn-primary'}`}>{busy && <span className="spinner-border spinner-border-sm me-2" />}{busy ? 'Đang xử lý...' : mode === 'delete' ? 'Xóa giảng viên' : mode === 'create' ? 'Thêm giảng viên' : 'Lưu thay đổi'}</button>}</footer>
    </form>
  </dialog>
}

export default function AdminLecturers() {
  const [draft, setDraft] = useState(emptyFilters)
  const [query, setQuery] = useState({ ...emptyFilters, page: 1, limit: 10 })
  const [state, setState] = useState({ loading: true })
  const [options, setOptions] = useState({ boMon: [], hocVi: [] })
  const [revision, setRevision] = useState(0)
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getLecturers(query, controller.signal).then(response => {
      if (controller.signal.aborted) return
      if (query.page > Math.max(1, response.pagination.totalPages)) { setQuery(prev => ({ ...prev, page: Math.max(1, response.pagination.totalPages) })); return }
      setState({ response }); setOptions(response.filters || { boMon: [], hocVi: [] })
    }).catch(() => { if (!controller.signal.aborted) setState({ error: true }) })
    return () => controller.abort()
  }, [query, revision])
  function changeQuery(next) { setState({ loading: true }); setQuery(next) }
  function refresh() { setDraft(emptyFilters); changeQuery({ ...emptyFilters, page: 1, limit: 10 }); setNotice('') }
  function saved(message) { setModal(null); setNotice(message); setState({ loading: true }); setRevision(r => r + 1) }
  const result = state.response
  const pagination = result?.pagination
  const pageCount = Math.max(1, pagination?.totalPages || 0)
  const start = Math.max(1, Math.min(query.page - 2, pageCount - 4))
  const pageButtons = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i)
  const filtered = Object.values(emptyFilters).some((_, i) => !!query[Object.keys(emptyFilters)[i]])

  return <div className="student-admin">
    <div className="student-page-heading"><div><h1>Quản lý giảng viên</h1><p>Xem, tìm kiếm và quản lý thông tin giảng viên.</p></div><button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}><i className="bi bi-plus-lg me-2" />Thêm giảng viên</button></div>
    {notice && <div className="alert alert-success d-flex justify-content-between align-items-center py-2" role="status">{notice}<button className="btn-close" aria-label="Đóng thông báo" onClick={() => setNotice('')} /></div>}
    <section className="admin-panel student-list-panel">
      <form className="student-filters" onSubmit={e => { e.preventDefault(); changeQuery({ ...query, ...draft, page: 1 }) }}>
        <div className="student-search"><i className="bi bi-search" aria-hidden="true" /><input className="form-control" aria-label="Tìm theo mã giảng viên, họ tên hoặc email" placeholder="Tìm theo mã giảng viên, họ tên hoặc email..." maxLength={200} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} /></div>
        {['boMon', 'hocVi'].map(key => <select key={key} className="form-select" aria-label={key === 'boMon' ? 'Lọc theo bộ môn' : 'Lọc theo học vị'} value={draft[key]} onChange={e => { const next = { ...draft, [key]: e.target.value }; setDraft(next); changeQuery({ ...query, ...next, page: 1 }) }}><option value="">{key === 'boMon' ? 'Tất cả bộ môn' : 'Tất cả học vị'}</option>{options[key].map(value => <option key={value} value={value}>{value}</option>)}</select>)}
        <select className="form-select" aria-label="Lọc trạng thái" value={draft.trangThai} onChange={e => { const next = { ...draft, trangThai: e.target.value }; setDraft(next); changeQuery({ ...query, ...next, page: 1 }) }}><option value="">Tất cả trạng thái</option><option value="true">Đang hoạt động</option><option value="false">Đã khóa</option></select>
        <button className="btn btn-primary" type="submit">Tìm kiếm</button><button className="btn btn-light border" type="button" onClick={refresh}><i className="bi bi-arrow-clockwise me-1" />Làm mới</button>
      </form>
      {state.loading ? <div className="admin-loading" role="status"><span className="spinner-border spinner-border-sm text-primary" /><p>Đang tải danh sách giảng viên...</p></div>
        : state.error ? <div className="admin-empty" role="alert"><p>Không thể tải danh sách giảng viên.</p><button className="btn btn-primary" onClick={() => { setState({ loading: true }); setRevision(r => r + 1) }}>Thử lại</button></div>
          : result?.data.length === 0 ? <div className="admin-empty"><i className="bi bi-people" /><p>{filtered ? 'Không tìm thấy giảng viên phù hợp với bộ lọc.' : 'Chưa có giảng viên trong hệ thống.'}</p>{!filtered && <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>Thêm giảng viên đầu tiên</button>}</div>
            : <div className="table-responsive"><table className="table align-middle student-table"><thead><tr>{['STT', 'Mã GV', 'Họ tên', 'Email', 'Số điện thoại', 'Bộ môn', 'Học vị', 'Trạng thái', 'Thao tác'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{result?.data.map((lecturer, index) => <tr key={lecturer.id}><td>{(pagination.page - 1) * pagination.limit + index + 1}</td><td>{lecturer.maGiangVien}</td><td className="fw-semibold">{lecturer.hoTen}</td><td>{lecturer.email}</td><td>{lecturer.soDienThoai || '—'}</td><td>{lecturer.boMon || '—'}</td><td>{lecturer.hocVi || '—'}</td><td><AdminStatusBadge active={lecturer.dangHoatDong} /></td><td><div className="student-actions">{[['view', 'Xem', 'eye'], ['edit', 'Sửa', 'pencil-square'], ['delete', 'Xóa', 'trash3']].map(([mode, label, icon]) => <button key={mode} className="btn btn-sm" title={label} aria-label={`${label} giảng viên ${lecturer.hoTen}`} onClick={() => setModal({ mode, lecturer })}><i className={`bi bi-${icon}`} /> <span>{label}</span></button>)}</div></td></tr>)}</tbody></table></div>}
      {pagination && <div className="student-pagination"><span>{pagination.total} giảng viên · Trang {pagination.totalPages ? pagination.page : 0} / {pagination.totalPages}</span><nav aria-label="Phân trang giảng viên"><button disabled={query.page <= 1} onClick={() => changeQuery({ ...query, page: query.page - 1 })}>Trước</button>{pageButtons.map(page => <button key={page} className={query.page === page ? 'active' : ''} aria-current={query.page === page ? 'page' : undefined} disabled={!pagination.totalPages} onClick={() => changeQuery({ ...query, page })}>{page}</button>)}<button disabled={query.page >= pageCount} onClick={() => changeQuery({ ...query, page: query.page + 1 })}>Sau</button></nav></div>}
    </section>
    {modal && <LecturerModal {...modal} onClose={() => setModal(null)} onSaved={saved} />}
  </div>
}
