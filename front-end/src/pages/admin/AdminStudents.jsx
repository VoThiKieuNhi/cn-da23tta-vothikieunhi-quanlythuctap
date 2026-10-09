import { formatDate as dateText } from '../../utils/dateFormat'
import StudentReferenceFields from '../../components/StudentReferenceFields'
import validName from '../../utils/lecturerName'
import StudentEmailResolver from '../../components/StudentEmailResolver'
import { emailError, isValidPhone, messages, passwordError } from '../../utils/validators'
import { useEffect, useRef, useState } from 'react'
import { createStudent, deleteStudent, getStudentById, getStudents, updateStudent } from '../../services/studentAdminService'
import '../../assets/css/student-admin.css'

const emptyFilters = { search: '', nganh: '', lop: '', trangThai: '' }
const emptyForm = { maSinhVien: '', hoTen: '', email: '', password: '', ngaySinh: '', gioiTinh: '', soDienThoai: '', lop: '', nganh: '', khoaHoc: '', dangHoatDong: true }
const fields = [
  ['maSinhVien', 'MSSV', 'text', 9, true], ['hoTen', 'Họ tên', 'text', 150, true],
  ['email', 'Email', 'email', 150, true], ['password', 'Mật khẩu', 'password', undefined, true],
  ['ngaySinh', 'Ngày sinh', 'date'], ['gioiTinh', 'Giới tính', 'select'],
  ['soDienThoai', 'Số điện thoại', 'tel', 10], ['lop', 'Lớp', 'text', 50],
  ['nganh', 'Ngành', 'text', 150], ['khoaHoc', 'Khóa học', 'text', 50],
]
const genders = { NAM: 'Nam', NU: 'Nữ', KHAC: 'Khác' }
function validate(data, creating) {
  const errors = {}
  if (!validName(data.hoTen)) errors.hoTen = 'Họ tên phải gồm ít nhất 2 từ, chỉ có chữ và khoảng trắng.'
  for (const [key, label, , max, required] of fields) {
    if (key === 'password') continue
    if (required && !data[key]?.trim()) errors[key] = `Vui lòng nhập ${label.toLowerCase()}.`
    else if (max && Array.from(data[key] || '').length > max) errors[key] = `Tối đa ${max} ký tự.`
  }
  if (data.email?.trim() && emailError(data.email, 'SINH_VIEN')) errors.email = emailError(data.email, 'SINH_VIEN')
  if (creating && passwordError(data.password)) errors.password = passwordError(data.password)
  if (data.ngaySinh && (!Number.isFinite(new Date(data.ngaySinh).getTime()) || new Date(data.ngaySinh) > new Date() || data.ngaySinh < '0001-01-01')) errors.ngaySinh = 'Ngày sinh không hợp lệ.'
  if (data.soDienThoai?.trim() && !isValidPhone(data.soDienThoai)) errors.soDienThoai = messages.phone
  if (!/^\d{9}$/.test(data.maSinhVien)) errors.maSinhVien = 'MSSV phải gồm đúng 9 chữ số.'
  const local = data.email.trim().split('@')[0]
  if (/^\d{9}$/.test(local) && local !== data.maSinhVien) errors.email = 'Email sinh viên và MSSV không khớp.'
  return errors
}

function StudentModal({ mode, student, onClose, onSaved }) {
  const dialog = useRef(null)
  const submitting = useRef(false)
  const [form, setForm] = useState(emptyForm)
  const [referenceReady, setReferenceReady] = useState(false)
  const [loading, setLoading] = useState(mode === 'view' || mode === 'edit')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [loaded, setLoaded] = useState(mode === 'create' || mode === 'delete')
  const titles = { create: 'Thêm sinh viên', edit: 'Sửa sinh viên', view: 'Chi tiết sinh viên', delete: 'Xóa sinh viên' }
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  useEffect(() => {
    if (mode !== 'view' && mode !== 'edit') return
    const controller = new AbortController()
    getStudentById(student.id, controller.signal).then(data => {
      if (!controller.signal.aborted) { setForm({ ...emptyForm, ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value ?? ''])) }); setLoaded(true); setLoading(false) }
    }).catch(() => { if (!controller.signal.aborted) { setError('Không thể tải thông tin sinh viên. Vui lòng đóng và thử lại.'); setLoading(false) } })
    return () => controller.abort()
  }, [mode, student?.id])

  async function save(event) {
    event.preventDefault()
    if (submitting.current || !loaded) return
    const next = mode === 'delete' ? {} : validate(form, mode === 'create')
    setErrors(next)
    if (Object.keys(next).length) return
    if (mode !== 'delete' && !referenceReady) { setError('Vui lòng chọn ngành, khóa và lớp hợp lệ từ danh mục TVU.'); return }
    submitting.current = true; setBusy(true); setError('')
    try {
      if (mode === 'delete') await deleteStudent(student.id)
      else {
        const payload = Object.fromEntries(fields.filter(([key]) => mode === 'create' || key !== 'password').map(([key]) => [key, form[key]]))
        if (mode === 'create') await createStudent(payload)
        else await updateStudent(student.id, { ...payload, dangHoatDong: form.dangHoatDong })
      }
      onSaved(mode === 'delete' ? 'Xóa sinh viên thành công.' : mode === 'create' ? 'Thêm sinh viên thành công.' : 'Cập nhật sinh viên thành công.')
    } catch (e) {
      setError(mode === 'delete' && e.response?.status === 409
        ? 'Không thể xóa sinh viên đã phát sinh dữ liệu thực tập. Bạn có thể khóa tài khoản thay thế.'
        : e.response?.data?.message || 'Không thể lưu thay đổi. Vui lòng thử lại.')
    } finally { submitting.current = false; setBusy(false) }
  }

  return <dialog className="student-modal" ref={dialog} aria-labelledby="student-modal-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }}>
    <header><div><span>QUẢN LÝ SINH VIÊN</span><h2 id="student-modal-title">{titles[mode]}</h2></div><button type="button" className="admin-icon-button" aria-label="Đóng" disabled={busy} onClick={onClose}><i className="bi bi-x-lg" /></button></header>
    <form onSubmit={save} noValidate>
      <div className="student-modal-body">
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        {loading ? <p role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải thông tin...</p>
          : mode === 'delete' ? <><p>Bạn có chắc muốn xóa sinh viên này?</p><div className="student-delete-person"><strong>{student.hoTen}</strong><span>MSSV: {student.maSinhVien}</span></div><p className="text-secondary small mt-3 mb-0">Hồ sơ và tài khoản tương ứng sẽ bị xóa. Thao tác không thể hoàn tác.</p></>
            : mode === 'view' && loaded ? <><div className="student-profile"><span><i className="bi bi-person" /></span><div><h3>{form.hoTen}</h3><p>{form.maSinhVien}</p></div></div><dl className="student-details">{fields.filter(([key]) => key !== 'password').map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{key === 'gioiTinh' ? genders[form[key]] || '—' : key === 'ngaySinh' ? dateText(form[key]) : form[key] || '—'}</dd></div>)}<div><dt>Trạng thái tài khoản</dt><dd>{form.dangHoatDong ? 'Đang hoạt động' : 'Đã khóa'}</dd></div><div><dt>Ngày tạo</dt><dd>{dateText(form.ngayTao)}</dd></div></dl></>
              : loaded && <><StudentEmailResolver form={form} setForm={setForm} busy={busy} /><div className="student-form-grid"><StudentReferenceFields form={form} setForm={setForm} busy={busy} onReady={setReferenceReady} codeError={errors.maSinhVien} />{fields.filter(([key]) => !['nganh', 'lop', 'khoaHoc', 'maSinhVien'].includes(key) && (mode === 'create' || key !== 'password')).map(([key, label, type, max, required]) => <div key={key}><label className="form-label" htmlFor={`student-${key}`}>{label}{required && <span className="text-danger"> *</span>}</label>{type === 'select' ? <select id={`student-${key}`} className="form-select" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value, ...(key === 'email' ? { emailManual: true } : {}) })} disabled={busy}><option value="">Chưa cập nhật</option>{Object.entries(genders).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> : <input id={`student-${key}`} className={`form-control ${errors[key] ? 'is-invalid' : ''}`} type={type} maxLength={max} minLength={key === 'password' ? 8 : undefined} inputMode={key === 'soDienThoai' ? 'numeric' : undefined} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value, ...(key === 'email' ? { emailManual: true } : {}) })} autoComplete={key === 'password' ? 'new-password' : 'off'} disabled={busy} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} />}{errors[key] && <div id={`error-${key}`} className="invalid-feedback d-block">{errors[key]}</div>}</div>)}</div>{mode === 'edit' && <div className="form-check form-switch mt-4"><input id="student-active" className="form-check-input" type="checkbox" checked={form.dangHoatDong} disabled={busy} onChange={e => setForm({ ...form, dangHoatDong: e.target.checked })} /><label className="form-check-label" htmlFor="student-active">Tài khoản hoạt động</label></div>}</>}
      </div>
      <footer><button type="button" className="btn btn-light border" disabled={busy} onClick={onClose}>{mode === 'view' ? 'Đóng' : 'Hủy'}</button>{mode !== 'view' && <button type="submit" disabled={busy || loading || !loaded} className={`btn ${mode === 'delete' ? 'btn-danger' : 'btn-primary'}`}>{busy && <span className="spinner-border spinner-border-sm me-2" />}{busy ? 'Đang xử lý...' : mode === 'delete' ? 'Xóa sinh viên' : mode === 'create' ? 'Thêm sinh viên' : 'Lưu thay đổi'}</button>}</footer>
    </form>
  </dialog>
}

export default function AdminStudents() {
  const [draft, setDraft] = useState(emptyFilters)
  const [query, setQuery] = useState({ ...emptyFilters, page: 1, limit: 10 })
  const [state, setState] = useState({ loading: true })
  const [options, setOptions] = useState({ nganh: [], lop: [] })
  const [revision, setRevision] = useState(0)
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getStudents(query, controller.signal).then(response => {
      if (controller.signal.aborted) return
      if (query.page > Math.max(1, response.pagination.totalPages)) { setQuery(prev => ({ ...prev, page: Math.max(1, response.pagination.totalPages) })); return }
      setState({ response }); setOptions(response.filters || { nganh: [], lop: [] })
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
    <div className="student-page-heading"><div><h1>Quản lý sinh viên</h1><p>Quản lý hồ sơ và tài khoản sinh viên trong hệ thống.</p></div><button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}><i className="bi bi-plus-lg me-2" />Thêm sinh viên</button></div>
    {notice && <div className="alert alert-success d-flex justify-content-between align-items-center py-2" role="status">{notice}<button className="btn-close" aria-label="Đóng thông báo" onClick={() => setNotice('')} /></div>}
    <section className="admin-panel student-list-panel">
      <form className="student-filters" onSubmit={e => { e.preventDefault(); changeQuery({ ...query, ...draft, page: 1 }) }}>
        <div className="student-search"><i className="bi bi-search" aria-hidden="true" /><input className="form-control" aria-label="Tìm theo MSSV, họ tên hoặc email" placeholder="Tìm theo MSSV, họ tên hoặc email..." maxLength={200} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} /></div>
        {['nganh', 'lop'].map(key => <select key={key} className="form-select" aria-label={key === 'nganh' ? 'Lọc theo ngành' : 'Lọc theo lớp'} value={draft[key]} onChange={e => { const next = { ...draft, [key]: e.target.value }; setDraft(next); changeQuery({ ...query, ...next, page: 1 }) }}><option value="">{key === 'nganh' ? 'Tất cả ngành' : 'Tất cả lớp'}</option>{options[key].map(value => <option key={value} value={value}>{value}</option>)}</select>)}
        <select className="form-select" aria-label="Lọc trạng thái" value={draft.trangThai} onChange={e => { const next = { ...draft, trangThai: e.target.value }; setDraft(next); changeQuery({ ...query, ...next, page: 1 }) }}><option value="">Tất cả trạng thái</option><option value="true">Đang hoạt động</option><option value="false">Đã khóa</option></select>
        <button className="btn btn-primary" type="submit">Tìm kiếm</button><button className="btn btn-light border" type="button" onClick={refresh}><i className="bi bi-arrow-clockwise me-1" />Làm mới</button>
      </form>
      {state.loading ? <div className="admin-loading" role="status"><span className="spinner-border spinner-border-sm text-primary" /><p>Đang tải danh sách sinh viên...</p></div>
        : state.error ? <div className="admin-empty" role="alert"><p>Không thể tải danh sách sinh viên.</p><button className="btn btn-primary" onClick={() => { setState({ loading: true }); setRevision(r => r + 1) }}>Thử lại</button></div>
          : result?.data.length === 0 ? <div className="admin-empty"><i className="bi bi-people" /><p>{filtered ? 'Không tìm thấy sinh viên phù hợp với bộ lọc.' : 'Chưa có sinh viên trong hệ thống.'}</p>{!filtered && <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>Thêm sinh viên đầu tiên</button>}</div>
            : <div className="table-responsive"><table className="table align-middle student-table"><thead><tr>{['STT', 'MSSV', 'Họ tên', 'Email', 'Lớp', 'Ngành', 'Khóa', 'Trạng thái', 'Thao tác'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{result?.data.map((student, index) => <tr key={student.id}><td>{(pagination.page - 1) * pagination.limit + index + 1}</td><td>{student.maSinhVien}</td><td className="fw-semibold">{student.hoTen}</td><td>{student.email}</td><td>{student.lop || '—'}</td><td>{student.nganh || '—'}</td><td>{student.khoaHoc || '—'}</td><td><span className={`student-badge ${student.dangHoatDong ? 'active' : 'locked'}`}>{student.dangHoatDong ? 'Đang hoạt động' : 'Đã khóa'}</span></td><td><div className="student-actions">{[['view', 'Xem', 'eye'], ['edit', 'Sửa', 'pencil-square'], ['delete', 'Xóa', 'trash3']].map(([mode, label, icon]) => <button key={mode} className="btn btn-sm" title={label} aria-label={`${label} sinh viên ${student.hoTen}`} onClick={() => setModal({ mode, student })}><i className={`bi bi-${icon}`} /> <span>{label}</span></button>)}</div></td></tr>)}</tbody></table></div>}
      {pagination && <div className="student-pagination"><span>{pagination.total} sinh viên · Trang {pagination.totalPages ? pagination.page : 0} / {pagination.totalPages}</span><nav aria-label="Phân trang sinh viên"><button disabled={query.page <= 1} onClick={() => changeQuery({ ...query, page: query.page - 1 })}>Trước</button>{pageButtons.map(page => <button key={page} className={query.page === page ? 'active' : ''} aria-current={query.page === page ? 'page' : undefined} disabled={!pagination.totalPages} onClick={() => changeQuery({ ...query, page })}>{page}</button>)}<button disabled={query.page >= pageCount} onClick={() => changeQuery({ ...query, page: query.page + 1 })}>Sau</button></nav></div>}
    </section>
    {modal && <StudentModal {...modal} onClose={() => setModal(null)} onSaved={saved} />}
  </div>
}
