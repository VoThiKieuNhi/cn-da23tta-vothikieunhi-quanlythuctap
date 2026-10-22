import AdminStatusBadge from '../../components/AdminStatusBadge'
import { formatTime as timestamp } from '../../utils/dateFormat'
import { registrationLabels as statuses } from '../../utils/statusLabels'
import { useEffect, useRef, useState } from 'react'
import { getRegistrations, getRegistrationById, approveRegistration, rejectRegistration } from '../../services/registrationAdminService'
import '../../assets/css/student-admin.css'
import '../../assets/css/registration-admin.css'

const badge = value => <AdminStatusBadge status={value} />
const date = value => value ? value.slice(0, 10).split('-').reverse().join('/') : '—'
function ReviewModal({ mode, record, onClose, onSaved }) {
  const dialog = useRef(null), saving = useRef(false)
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0)
  const [reason, setReason] = useState(''), [reasonError, setReasonError] = useState('')
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false)
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close() }, [])
  useEffect(() => {
    const c = new AbortController()
    getRegistrationById(record.id, c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải chi tiết đăng ký.' }) })
    return () => c.abort()
  }, [record.id, revision])
  const data = state.data, canProcess = data?.trangThai === 'CHO_DUYET' && !conflict
  async function submit(e) {
    e.preventDefault(); if (saving.current || !canProcess) return
    setReasonError('')
    if (mode === 'reject' && !reason.trim()) { setReasonError('Vui lòng nhập lý do từ chối.'); return }
    saving.current = true; setBusy(true); setError('')
    try { const result = mode === 'approve' ? await approveRegistration(record.id) : await rejectRegistration(record.id, reason.trim()); onSaved(result.message) }
    catch (err) { setError(err.response?.data?.message || 'Không thể xử lý đăng ký. Vui lòng thử lại.'); if ([404, 409].includes(err.response?.status)) setConflict(true) }
    finally { saving.current = false; setBusy(false) }
  }
  const title = mode === 'view' ? 'Chi tiết đăng ký thực tập' : mode === 'approve' ? 'Xác nhận duyệt đăng ký thực tập?' : 'Từ chối đăng ký thực tập'
  return <dialog ref={dialog} className="student-modal registration-review-modal" aria-labelledby="review-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }}><header><h2 id="review-title">{title}</h2><button className="admin-icon-button" aria-label="Đóng" disabled={busy} onClick={onClose}><i className="bi bi-x-lg" /></button></header>
    <form onSubmit={submit} noValidate><div className="student-modal-body">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {state.loading ? <p role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải chi tiết...</p> : state.error ? <div role="alert"><p>{state.error}</p><button type="button" className="btn btn-primary" onClick={() => { setState({ loading: true }); setRevision(v => v + 1) }}>Thử lại</button></div> : data && <>
        {mode === 'view' ? <><h3>Thông tin sinh viên</h3><dl className="student-details">{[['maSinhVien', 'MSSV'], ['hoTen', 'Họ tên'], ['lop', 'Lớp'], ['nganh', 'Ngành']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{data[key] || '—'}</dd></div>)}</dl><h3 className="mt-4">Thông tin đăng ký thực tập</h3><dl className="student-details">{[['hocKy', 'Học kỳ'], ['namHoc', 'Năm học'], ['tenDoanhNghiep', 'Doanh nghiệp'], ['diaChiDoanhNghiep', 'Địa chỉ doanh nghiệp'], ['canBoHuongDan', 'Cán bộ hướng dẫn'], ['chucVuCanBo', 'Chức vụ'], ['viTriThucTap', 'Vị trí thực tập']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{data[key] || '—'}</dd></div>)}<div><dt>Ngày bắt đầu</dt><dd>{date(data.ngayBatDau)}</dd></div><div><dt>Ngày kết thúc</dt><dd>{date(data.ngayKetThuc)}</dd></div><div><dt>Ngày đăng ký</dt><dd>{timestamp(data.ngayDangKy)}</dd></div><div><dt>Trạng thái</dt><dd>{badge(data.trangThai)}</dd></div></dl>{data.trangThai === 'TU_CHOI' && <div className="alert alert-danger mt-3 review-reason"><strong>Lý do từ chối:</strong><p className="mb-0">{data.lyDoTuChoi || '—'}</p></div>}</>
          : <><dl className="student-details">{[['hoTen', 'Sinh viên'], ['maSinhVien', 'MSSV'], ['tenDoanhNghiep', 'Doanh nghiệp'], ['viTriThucTap', 'Vị trí']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{data[key] || '—'}</dd></div>)}</dl>{!canProcess && !error && <div className="alert alert-warning mt-3" role="alert">Đăng ký này đã được xử lý.</div>}{mode === 'reject' && <div className="student-form-grid review-reason-input mt-4"><div><label className="form-label" htmlFor="review-reason">Lý do từ chối <span className="text-danger">*</span></label><textarea id="review-reason" className={`form-control ${reasonError ? 'is-invalid' : ''}`} rows={4} placeholder="Nhập lý do từ chối để sinh viên có thể điều chỉnh..." value={reason} disabled={busy || !canProcess} onChange={e => setReason(e.target.value)} aria-invalid={!!reasonError} aria-describedby={reasonError ? 'review-reason-error' : undefined} />{reasonError && <div id="review-reason-error" className="invalid-feedback">{reasonError}</div>}</div></div>}</>}
      </>}
    </div><footer><button type="button" className="btn btn-light border" disabled={busy} onClick={onClose}>{mode === 'view' ? 'Đóng' : 'Hủy'}</button>{mode !== 'view' && <button className={`btn ${mode === 'reject' ? 'btn-danger' : 'btn-primary'}`} disabled={busy || !canProcess}>{busy ? 'Đang xử lý...' : mode === 'approve' ? 'Duyệt đăng ký' : 'Xác nhận từ chối'}</button>}</footer></form>
  </dialog>
}
export default function AdminRegistrations() {
  const initial = { search: '', trangThai: '', dotThucTapId: '' }
  const [draft, setDraft] = useState(initial), [query, setQuery] = useState({ ...initial, page: 1, limit: 10 })
  const [state, setState] = useState({ loading: true }), [periods, setPeriods] = useState([]), [revision, setRevision] = useState(0)
  const [modal, setModal] = useState(null), [notice, setNotice] = useState('')
  useEffect(() => {
    const c = new AbortController()
    getRegistrations(query, c.signal).then(response => {
      if (c.signal.aborted) return
      if (query.page > Math.max(1, response.pagination.totalPages)) { setQuery(q => ({ ...q, page: Math.max(1, response.pagination.totalPages) })); return }
      setState({ response }); setPeriods(response.filters.dotThucTap)
    }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải danh sách đăng ký.' }) })
    return () => c.abort()
  }, [query, revision])
  function change(next) { setState({ loading: true }); setQuery(next) }
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  const result = state.response, pagination = result?.pagination
  const count = Math.max(1, pagination?.totalPages || 0), start = Math.max(1, Math.min(query.page - 2, count - 4))
  const pages = Array.from({ length: Math.min(5, count) }, (_, i) => start + i)
  return <div className="student-admin"><div className="student-page-heading"><div><h1>Duyệt đăng ký thực tập</h1><p>Xem và xử lý đăng ký thực tập của sinh viên.</p></div></div>
    {notice && <div className="alert alert-success d-flex justify-content-between" role="status">{notice}<button className="btn-close" aria-label="Đóng thông báo" onClick={() => setNotice('')} /></div>}
    <section className="admin-panel student-list-panel"><form className="student-filters" onSubmit={e => { e.preventDefault(); change({ ...query, ...draft, page: 1 }) }}>
      <div className="student-search"><i className="bi bi-search" /><input className="form-control" aria-label="Tìm theo MSSV, họ tên hoặc doanh nghiệp" placeholder="Tìm theo MSSV, họ tên hoặc doanh nghiệp..." maxLength={200} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} /></div>
      <select className="form-select" aria-label="Lọc trạng thái" value={draft.trangThai} onChange={e => { const next = { ...draft, trangThai: e.target.value }; setDraft(next); change({ ...query, ...next, page: 1 }) }}><option value="">Tất cả trạng thái</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select className="form-select" aria-label="Lọc đợt thực tập" value={draft.dotThucTapId} onChange={e => { const next = { ...draft, dotThucTapId: e.target.value }; setDraft(next); change({ ...query, ...next, page: 1 }) }}><option value="">Tất cả đợt thực tập</option>{periods.map(p => <option key={p.id} value={p.id}>{p.hocKy} · {p.namHoc}</option>)}</select>
      <button className="btn btn-primary">Tìm kiếm</button><button type="button" className="btn btn-light border" onClick={() => { setDraft(initial); change({ ...initial, page: 1, limit: 10 }); setNotice('') }}><i className="bi bi-arrow-clockwise me-1" />Làm mới</button>
    </form>
      {state.loading ? <div className="admin-loading" role="status"><span className="spinner-border spinner-border-sm text-primary" /><p>Đang tải danh sách đăng ký...</p></div> : state.error ? <div className="admin-empty" role="alert"><p>{state.error}</p><button className="btn btn-primary" onClick={reload}>Thử lại</button></div> : !result?.data.length ? <div className="admin-empty"><i className="bi bi-clipboard-check" /><p>Chưa có đăng ký phù hợp với bộ lọc.</p></div> : <div className="table-responsive"><table className="table align-middle student-table"><thead><tr>{['STT', 'MSSV', 'Họ tên', 'Doanh nghiệp', 'Vị trí', 'Đợt thực tập', 'Ngày đăng ký', 'Trạng thái', 'Thao tác'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{result.data.map((r, i) => <tr key={r.id}><td>{(pagination.page - 1) * pagination.limit + i + 1}</td><td>{r.maSinhVien}</td><td className="fw-semibold">{r.hoTen}</td><td>{r.tenDoanhNghiep}</td><td>{r.viTriThucTap || '—'}</td><td>{r.hocKy} · {r.namHoc}</td><td>{timestamp(r.ngayDangKy)}</td><td>{badge(r.trangThai)}</td><td><div className="student-actions"><button className="btn btn-sm" title="Xem" aria-label={`Xem đăng ký của ${r.hoTen}`} onClick={() => setModal({ mode: 'view', record: r })}><i className="bi bi-eye" aria-hidden="true" /></button>{r.trangThai === 'CHO_DUYET' && <><button className="btn btn-sm" title="Duyệt" aria-label={`Duyệt đăng ký của ${r.hoTen}`} onClick={() => setModal({ mode: 'approve', record: r })}><i className="bi bi-check-circle" aria-hidden="true" /></button><button className="btn btn-sm" title="Từ chối" aria-label={`Từ chối đăng ký của ${r.hoTen}`} onClick={() => setModal({ mode: 'reject', record: r })}><i className="bi bi-x-circle" aria-hidden="true" /></button></>}</div></td></tr>)}</tbody></table></div>}
      {pagination && <div className="student-pagination"><span>{pagination.total} đăng ký · Trang {pagination.totalPages ? pagination.page : 0} / {pagination.totalPages}</span><nav aria-label="Phân trang đăng ký"><button disabled={query.page <= 1} onClick={() => change({ ...query, page: query.page - 1 })}>Trước</button>{pages.map(page => <button key={page} className={query.page === page ? 'active' : ''} aria-current={query.page === page ? 'page' : undefined} disabled={!pagination.totalPages} onClick={() => change({ ...query, page })}>{page}</button>)}<button disabled={query.page >= count} onClick={() => change({ ...query, page: query.page + 1 })}>Sau</button></nav></div>}
    </section>
    {modal && <ReviewModal {...modal} onClose={() => { setModal(null); reload() }} onSaved={message => { setModal(null); setNotice(message); reload() }} />}
  </div>
}
