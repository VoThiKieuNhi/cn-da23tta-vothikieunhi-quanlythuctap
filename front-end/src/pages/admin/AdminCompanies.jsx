import { formatDate } from '../../utils/dateFormat'
import { emailError, isValidPhone, isValidCompanyPhone, messages } from '../../utils/validators'
import { useEffect, useRef, useState } from 'react'
import { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany, createSupervisor, updateSupervisor, deleteSupervisor } from '../../services/companyAdminService'
import '../../assets/css/student-admin.css'
import '../../assets/css/company-admin.css'

const companyFields = [
  ['tenDoanhNghiep', 'Tên doanh nghiệp', 200, true], ['diaChi', 'Địa chỉ', undefined, true],
  ['soDienThoai', 'Số điện thoại', 20], ['email', 'Email', 150],
  ['linhVucHoatDong', 'Lĩnh vực hoạt động', 200], ['nguoiDaiDien', 'Người đại diện', 150],
]
const supervisorFields = [['hoTen', 'Họ tên', 150, true], ['chucVu', 'Chức vụ', 100], ['email', 'Email', 150], ['soDienThoai', 'Số điện thoại', 20]]
function validate(data, fields) {
  const errors = {}
  for (const [key, label, max, required] of fields) {
    if (required && !data[key]?.trim()) errors[key] = `Vui lòng nhập ${label.toLowerCase()}.`
    else if (max && Array.from(data[key] || '').length > max) errors[key] = `Tối đa ${max} ký tự.`
  }
  if (data.email?.trim() && emailError(data.email)) errors.email = emailError(data.email)
  if (fields === supervisorFields && data.soDienThoai?.trim() && !isValidPhone(data.soDienThoai)) errors.soDienThoai = messages.phone
  if (fields === companyFields && data.soDienThoai?.trim() && !isValidCompanyPhone(data.soDienThoai)) errors.soDienThoai = 'Số điện thoại doanh nghiệp không hợp lệ.'
  return errors
}

function Dialog({ title, children, onClose, busy = false, compact = false }) {
  const ref = useRef(null)
  const titleId = compact ? 'supervisor-dialog-title' : 'company-dialog-title'
  useEffect(() => { const element = ref.current; element.showModal(); return () => element.close() }, [])
  return <dialog ref={ref} className={`student-modal ${compact ? 'company-supervisor-modal' : ''}`} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); if (!busy) onClose() }}>
    <header><h2 id={titleId}>{title}</h2><button type="button" className="admin-icon-button" aria-label="Đóng" disabled={busy} onClick={onClose}><i className="bi bi-x-lg" /></button></header>{children}
  </dialog>
}

function EditDialog({ mode, record, companyId, supervisor = false, onClose, onSaved }) {
  const fields = supervisor ? supervisorFields : companyFields
  const noun = supervisor ? 'cán bộ hướng dẫn' : 'doanh nghiệp'
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(([key]) => [key, record?.[key] || ''])))
  const [busy, setBusy] = useState(false)
  const saving = useRef(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const title = `${mode === 'create' ? 'Thêm' : mode === 'edit' ? 'Sửa' : 'Xóa'} ${noun}`
  async function submit(e) {
    e.preventDefault()
    if (saving.current) return
    const next = mode === 'delete' ? {} : validate(form, fields)
    setErrors(next)
    if (Object.keys(next).length) return
    saving.current = true; setBusy(true); setError('')
    try {
      const data = Object.fromEntries(fields.map(([key]) => [key, form[key].trim()]))
      if (supervisor) {
        if (mode === 'delete') await deleteSupervisor(companyId, record.id)
        else if (mode === 'create') await createSupervisor(companyId, data)
        else await updateSupervisor(companyId, record.id, data)
      } else {
        if (mode === 'delete') await deleteCompany(record.id)
        else if (mode === 'create') await createCompany(data)
        else await updateCompany(record.id, data)
      }
      onSaved(`${title} thành công.`)
    } catch (err) { setError(err.response?.data?.message || 'Không thể lưu thay đổi. Vui lòng thử lại.') }
    finally { saving.current = false; setBusy(false) }
  }
  return <Dialog title={title} onClose={onClose} busy={busy} compact={supervisor}>
    <form onSubmit={submit} noValidate><div className="student-modal-body">
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
      {mode === 'delete' ? <><p>Bạn có chắc muốn xóa {noun} này?</p><div className="student-delete-person"><strong>{supervisor ? record.hoTen : record.tenDoanhNghiep}</strong>{!supervisor && <span>{record.diaChi}</span>}</div><p className="small text-secondary mt-3 mb-0">Thao tác không thể hoàn tác.{!supervisor && ' Các cán bộ chưa được sử dụng cũng sẽ bị xóa.'}</p></>
        : <div className="student-form-grid">{fields.map(([key, label, max, required]) => <div key={key}><label className="form-label" htmlFor={`${supervisor ? 'supervisor' : 'company'}-${key}`}>{label}{required && <span className="text-danger"> *</span>}</label><input id={`${supervisor ? 'supervisor' : 'company'}-${key}`} className={`form-control ${errors[key] ? 'is-invalid' : ''}`} type={key === 'email' ? 'email' : key === 'soDienThoai' ? 'tel' : 'text'} value={form[key]} maxLength={max} inputMode={key === 'soDienThoai' ? 'numeric' : undefined} disabled={busy} onChange={e => setForm({ ...form, [key]: e.target.value })} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `company-error-${key}` : undefined} />{errors[key] && <div className="invalid-feedback" id={`company-error-${key}`}>{errors[key]}</div>}</div>)}</div>}
    </div><footer><button type="button" className="btn btn-light border" disabled={busy} onClick={onClose}>Hủy</button><button className={`btn ${mode === 'delete' ? 'btn-danger' : 'btn-primary'}`} disabled={busy}>{busy ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</> : mode === 'edit' ? 'Lưu thay đổi' : title}</button></footer></form>
  </Dialog>
}

function CompanyDetail({ id, onClose, onChanged }) {
  const [state, setState] = useState({ loading: true })
  const [revision, setRevision] = useState(0)
  const [child, setChild] = useState(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getCompanyById(id, controller.signal).then(data => { if (!controller.signal.aborted) setState({ data }) })
      .catch(() => { if (!controller.signal.aborted) setState({ error: true }) })
    return () => controller.abort()
  }, [id, revision])
  function retry() { setState({ loading: true }); setRevision(value => value + 1) }
  function saved(message) { setChild(null); setNotice(message); retry(); onChanged() }
  const data = state.data
  return <Dialog title="Chi tiết doanh nghiệp" onClose={onClose} busy={!!child}>
    <div className="student-modal-body">
      {notice && <div className="alert alert-success py-2" role="status">{notice}</div>}
      {state.loading ? <p role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải thông tin...</p>
        : state.error ? <div role="alert"><p>Không thể tải thông tin doanh nghiệp.</p><button className="btn btn-primary" onClick={retry}>Thử lại</button></div>
          : data && <><h3 className="company-detail-title">Thông tin doanh nghiệp</h3><dl className="student-details">{companyFields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{data[key] || '—'}</dd></div>)}<div><dt>Ngày tạo</dt><dd>{formatDate(data.ngayTao)}</dd></div></dl>
            <div className="company-supervisor-heading"><h3 className="company-detail-title">Cán bộ hướng dẫn</h3><button className="btn btn-primary" onClick={() => setChild({ mode: 'create' })}><i className="bi bi-plus-lg me-2" />Thêm cán bộ</button></div>
            <div className="table-responsive"><table className="table align-middle student-table"><thead><tr>{['Họ tên', 'Chức vụ', 'Email', 'Số điện thoại', 'Thao tác'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{data.canBoHuongDan.length ? data.canBoHuongDan.map(record => <tr key={record.id}><td className="fw-semibold">{record.hoTen}</td><td>{record.chucVu || '—'}</td><td>{record.email || '—'}</td><td>{record.soDienThoai || '—'}</td><td><div className="student-actions"><button className="btn btn-sm" onClick={() => setChild({ mode: 'edit', record })} aria-label={`Sửa cán bộ ${record.hoTen}`}><i className="bi bi-pencil-square" /> Sửa</button><button className="btn btn-sm" onClick={() => setChild({ mode: 'delete', record })} aria-label={`Xóa cán bộ ${record.hoTen}`}><i className="bi bi-trash3" /> Xóa</button></div></td></tr>) : <tr><td colSpan={5} className="text-center py-4 text-secondary">Chưa có cán bộ hướng dẫn tại doanh nghiệp.</td></tr>}</tbody></table></div>
          </>}
    </div><footer><button className="btn btn-light border" onClick={onClose} disabled={!!child}>Đóng</button></footer>
    {child && <EditDialog {...child} supervisor companyId={id} onClose={() => setChild(null)} onSaved={saved} />}
  </Dialog>
}

export default function AdminCompanies() {
  const [draft, setDraft] = useState({ search: '', linhVuc: '' })
  const [query, setQuery] = useState({ search: '', linhVuc: '', page: 1, limit: 10 })
  const [state, setState] = useState({ loading: true })
  const [options, setOptions] = useState([])
  const [revision, setRevision] = useState(0)
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getCompanies(query, controller.signal).then(response => {
      if (controller.signal.aborted) return
      if (query.page > Math.max(1, response.pagination.totalPages)) { setQuery(prev => ({ ...prev, page: Math.max(1, response.pagination.totalPages) })); return }
      setState({ response }); setOptions(response.filters.linhVuc)
    }).catch(() => { if (!controller.signal.aborted) setState({ error: true }) })
    return () => controller.abort()
  }, [query, revision])
  function reload() { setState({ loading: true }); setRevision(value => value + 1) }
  function change(next) { setState({ loading: true }); setQuery(next) }
  function saved(message) { setModal(null); setNotice(message); reload() }
  const result = state.response, pagination = result?.pagination
  const pageCount = Math.max(1, pagination?.totalPages || 0)
  const start = Math.max(1, Math.min(query.page - 2, pageCount - 4))
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i)
  return <div className="student-admin company-admin">
    <div className="student-page-heading"><div><h1>Quản lý doanh nghiệp</h1><p>Quản lý thông tin doanh nghiệp và cán bộ hướng dẫn.</p></div><button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}><i className="bi bi-plus-lg me-2" />Thêm doanh nghiệp</button></div>
    {notice && <div className="alert alert-success d-flex align-items-center justify-content-between py-2" role="status">{notice}<button className="btn-close" aria-label="Đóng thông báo" onClick={() => setNotice('')} /></div>}
    <section className="admin-panel student-list-panel"><form className="student-filters" onSubmit={e => { e.preventDefault(); change({ ...query, ...draft, page: 1 }) }}>
      <div className="student-search"><i className="bi bi-search" /><input className="form-control" placeholder="Tìm theo tên doanh nghiệp, địa chỉ, email..." aria-label="Tìm doanh nghiệp theo tên, địa chỉ, email hoặc người đại diện" maxLength={200} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} /></div>
      <select className="form-select" aria-label="Lọc lĩnh vực" value={draft.linhVuc} onChange={e => { const next = { ...draft, linhVuc: e.target.value }; setDraft(next); change({ ...query, ...next, page: 1 }) }}><option value="">Tất cả lĩnh vực</option>{options.map(value => <option key={value} value={value}>{value}</option>)}</select>
      <button className="btn btn-primary">Tìm kiếm</button><button className="btn btn-light border" type="button" onClick={() => { setDraft({ search: '', linhVuc: '' }); change({ search: '', linhVuc: '', page: 1, limit: 10 }); setNotice('') }}><i className="bi bi-arrow-clockwise me-1" />Làm mới</button>
    </form>
      {state.loading ? <div className="admin-loading" role="status"><span className="spinner-border spinner-border-sm text-primary" /><p>Đang tải danh sách doanh nghiệp...</p></div>
        : state.error ? <div className="admin-empty" role="alert"><p>Không thể tải danh sách doanh nghiệp.</p><button className="btn btn-primary" onClick={reload}>Thử lại</button></div>
          : !result?.data.length ? <div className="admin-empty"><i className="bi bi-buildings" /><p>{query.search || query.linhVuc ? 'Không tìm thấy doanh nghiệp phù hợp với bộ lọc.' : 'Chưa có doanh nghiệp trong hệ thống.'}</p>{!query.search && !query.linhVuc && <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>Thêm doanh nghiệp đầu tiên</button>}</div>
            : <div className="table-responsive"><table className="table align-middle student-table"><thead><tr>{['STT', 'Tên doanh nghiệp', 'Địa chỉ', 'Lĩnh vực', 'Email', 'Số điện thoại', 'Cán bộ HD', 'Thao tác'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{result.data.map((record, index) => <tr key={record.id}><td>{(pagination.page - 1) * pagination.limit + index + 1}</td><td className="fw-semibold">{record.tenDoanhNghiep}</td><td><span className="company-address" title={record.diaChi}>{record.diaChi}</span></td><td>{record.linhVucHoatDong || '—'}</td><td>{record.email || '—'}</td><td>{record.soDienThoai || '—'}</td><td><span className="student-badge locked">{record.soCanBoHuongDan}</span></td><td><div className="student-actions">{[['view', 'Xem', 'eye'], ['edit', 'Sửa', 'pencil-square'], ['delete', 'Xóa', 'trash3']].map(([mode, label, icon]) => <button key={mode} className="btn btn-sm" title={label} aria-label={`${label} ${record.tenDoanhNghiep}`} onClick={() => setModal({ mode, record })}><i className={`bi bi-${icon}`} /> <span>{label}</span></button>)}</div></td></tr>)}</tbody></table></div>}
      {pagination && <div className="student-pagination"><span>{pagination.total} doanh nghiệp · Trang {pagination.totalPages ? pagination.page : 0} / {pagination.totalPages}</span><nav aria-label="Phân trang doanh nghiệp"><button disabled={query.page <= 1} onClick={() => change({ ...query, page: query.page - 1 })}>Trước</button>{pages.map(page => <button key={page} className={query.page === page ? 'active' : ''} aria-current={query.page === page ? 'page' : undefined} disabled={!pagination.totalPages} onClick={() => change({ ...query, page })}>{page}</button>)}<button disabled={query.page >= pageCount} onClick={() => change({ ...query, page: query.page + 1 })}>Sau</button></nav></div>}
    </section>
    {modal?.mode === 'view' ? <CompanyDetail id={modal.record.id} onClose={() => setModal(null)} onChanged={reload} /> : modal && <EditDialog {...modal} onClose={() => setModal(null)} onSaved={saved} />}
  </div>
}
