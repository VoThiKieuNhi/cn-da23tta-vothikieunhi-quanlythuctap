import { formatTime } from '../../utils/dateFormat'
import { registrationLabels as labels } from '../../utils/statusLabels'
import { useEffect, useRef, useState } from 'react'
import { getOpenInternshipPeriods, getCompanies, getCompanySupervisors, getMyRegistration, createRegistration, updateRegistration, deleteRegistration } from '../../services/studentInternshipService'
import { registrationText } from '../../utils/periodTime'
import { StudentCard } from '../../components/StudentWorkspace'
import { useStudentWorkspace } from '../../utils/studentWorkspace'
import '../../assets/css/student-admin.css'
import '../../assets/css/student-registration.css'

const date = value => value ? value.slice(0, 10).split('-').reverse().join('/') : '—'
const emptyForm = { doanhNghiepId: '', canBoHuongDanId: '', viTriThucTap: '' }
function CancelDialog({ record, onClose, onSaved }) {
  const ref = useRef(null), saving = useRef(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => { const element = ref.current; element.showModal(); return () => element.close() }, [])
  async function cancel() { if (saving.current) return; saving.current = true; setBusy(true); setError(''); try { const result = await deleteRegistration(record.id); onSaved(result.message) } catch (err) { setError(err.response?.data?.message || 'Không thể hủy đăng ký. Vui lòng thử lại.') } finally { saving.current = false; setBusy(false) } }
  return <dialog ref={ref} className="student-modal" aria-labelledby="cancel-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }}><header><h2 id="cancel-title">Hủy đăng ký thực tập</h2><button className="admin-icon-button" aria-label="Đóng" disabled={busy} onClick={onClose}><i className="bi bi-x-lg" /></button></header><div className="student-modal-body">{error && <div className="alert alert-danger" role="alert">{error}</div>}<p>Bạn có chắc muốn hủy đăng ký thực tập này?</p><div className="student-delete-person"><strong>{record.tenDoanhNghiep}</strong><span>{record.hocKy} · {record.namHoc}</span></div></div><footer><button className="btn btn-light border" disabled={busy} onClick={onClose}>Quay lại</button><button className="btn btn-danger" disabled={busy} onClick={cancel}>{busy ? 'Đang xử lý...' : 'Hủy đăng ký'}</button></footer></dialog>
}

export default function StudentInternshipRegistration() {
  const { refresh } = useStudentWorkspace()
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0)
  const [selected, setSelected] = useState(''), [editing, setEditing] = useState(false), [cancel, setCancel] = useState(null)
  const [form, setForm] = useState(emptyForm), [supervisors, setSupervisors] = useState({ data: [] }), [supervisorRevision, setSupervisorRevision] = useState(0)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [errors, setErrors] = useState({}), [notice, setNotice] = useState('')
  const saving = useRef(false)
  useEffect(() => {
    const c = new AbortController()
    Promise.all([getMyRegistration(c.signal), getOpenInternshipPeriods(c.signal), getCompanies('', c.signal)]).then(([mine, periods, companies]) => {
      if (c.signal.aborted) return
      setState({ ...mine, periods, companies })
      setSelected(previous => periods.some(p => String(p.id) === previous) || mine.data.some(r => String(r.dotThucTapId) === previous) ? previous : String(periods[0]?.id || mine.data[0]?.dotThucTapId || ''))
    }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải thông tin đăng ký thực tập.' }) })
    return () => c.abort()
  }, [revision])
  useEffect(() => {
    if (!form.doanhNghiepId) return
    const c = new AbortController()
    getCompanySupervisors(form.doanhNghiepId, c.signal).then(data => { if (!c.signal.aborted) setSupervisors({ data }) }).catch(err => { if (!c.signal.aborted) setSupervisors({ error: err.response?.data?.message || 'Không thể tải cán bộ hướng dẫn.' }) })
    return () => c.abort()
  }, [form.doanhNghiepId, supervisorRevision])
  const period = state.periods?.find(p => String(p.id) === selected)
  const registration = state.data?.find(r => String(r.dotThucTapId) === selected)
  const canEdit = registration?.coTheChinhSua && !!period
  const noSupervisors = !!form.doanhNghiepId && !supervisors.loading && !supervisors.error && supervisors.data?.length === 0
  const supervisorsUnavailable = !form.doanhNghiepId || !!supervisors.loading || !!supervisors.error || !supervisors.data?.length
  function resetForm() { setForm(emptyForm); setSupervisors({ data: [] }); setErrors({}); setError(''); setEditing(false) }
  function reload(message) { setNotice(message || ''); resetForm(); setCancel(null); setState({ loading: true }); setRevision(v => v + 1); refresh() }
  async function submit(e) {
    e.preventDefault(); if (saving.current || supervisorsUnavailable) return
    const next = {}
    if (!period) next.dotThucTapId = 'Vui lòng chọn đợt đang mở đăng ký.'
    if (!form.doanhNghiepId) next.doanhNghiepId = 'Vui lòng chọn doanh nghiệp.'
    if (!form.canBoHuongDanId || !supervisors.data?.some(x => String(x.id) === form.canBoHuongDanId)) next.canBoHuongDanId = 'Vui lòng chọn cán bộ thuộc doanh nghiệp.'
    if (!form.viTriThucTap.trim() || Array.from(form.viTriThucTap.trim()).length > 200) next.viTriThucTap = 'Vị trí thực tập bắt buộc và tối đa 200 ký tự.'
    setErrors(next); if (Object.keys(next).length) return
    saving.current = true; setBusy(true); setError('')
    try {
      const data = { doanhNghiepId: form.doanhNghiepId, canBoHuongDanId: form.canBoHuongDanId, viTriThucTap: form.viTriThucTap.trim() }
      const result = editing ? await updateRegistration(registration.id, data) : await createRegistration({ ...data, dotThucTapId: selected })
      reload(result.message)
    } catch (err) { setError(err.response?.data?.message || 'Không thể gửi đăng ký. Vui lòng thử lại.') }
    finally { saving.current = false; setBusy(false) }
  }
  if (state.loading) return <div className="admin-loading" role="status"><span className="spinner-border spinner-border-sm text-primary" /><p>Đang tải đăng ký thực tập...</p></div>
  if (state.error) return <div className="admin-panel admin-empty" role="alert"><p>{state.error}</p><button className="btn btn-primary" onClick={() => reload()}>Thử lại</button></div>
  const choices = [...state.periods, ...state.data.filter(r => !state.periods.some(p => String(p.id) === String(r.dotThucTapId))).map(r => ({ id: r.dotThucTapId, hocKy: r.hocKy, namHoc: r.namHoc }))]
  return <div className="student-admin student-registration">
    <div className="student-page-heading"><div><h1>Đăng ký thực tập</h1><p>Đăng ký doanh nghiệp và vị trí thực tập trong đợt đang mở.</p></div><button className="btn btn-light border" disabled={busy} onClick={() => reload()}>Làm mới</button></div>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    <section className="admin-panel registration-panel"><h2>Thông tin sinh viên</h2><dl className="registration-profile">{[['maSinhVien', 'MSSV'], ['hoTen', 'Họ tên'], ['lop', 'Lớp'], ['nganh', 'Ngành']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{state.student[key] || '—'}</dd></div>)}</dl></section>
    <div className="sw-main-aside"><div>
    {!state.periods.length && <section className="admin-panel admin-empty"><i className="bi bi-calendar-event" /><p>Hiện chưa có đợt thực tập nào đang mở đăng ký.</p><span>Vui lòng quay lại khi cổng đăng ký được mở.</span></section>}
    {!!choices.length && <section className="admin-panel registration-panel"><h2>{period ? 'Thông tin đợt thực tập đang mở' : 'Thông tin đợt thực tập'}</h2><label className="form-label" htmlFor="registration-period">Đợt thực tập *</label><select id="registration-period" className="form-select" value={selected} disabled={busy || editing} onChange={e => { setSelected(e.target.value); resetForm(); setNotice('') }}>{choices.map(p => <option key={p.id} value={p.id}>{p.hocKy} · {p.namHoc}</option>)}</select>
      {period && <div className="registration-period-info"><span className="student-badge registration-DA_DUYET">Đang mở đăng ký</span><p>Thời gian đăng ký: {registrationText(period.thoiGianMoDangKy)} – {registrationText(period.thoiGianDongDangKy)}</p><p>Thời gian thực tập: {date(period.ngayBatDauThucTap)} – {date(period.ngayKetThucThucTap)}</p><small>Cổng đăng ký đóng vào {registrationText(period.thoiGianDongDangKy)}</small></div>}
    </section>}
    {registration && !editing && <section className="admin-panel registration-panel"><h2>Thông tin đăng ký</h2><dl className="student-details">{[['tenDoanhNghiep', 'Doanh nghiệp'], ['diaChiDoanhNghiep', 'Địa chỉ'], ['linhVucHoatDong', 'Lĩnh vực'], ['canBoHuongDan', 'Cán bộ hướng dẫn'], ['chucVuCanBo', 'Chức vụ cán bộ'], ['viTriThucTap', 'Vị trí thực tập']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{registration[key] || '—'}</dd></div>)}<div><dt>Thời gian thực tập</dt><dd>{date(registration.ngayBatDau)} – {date(registration.ngayKetThuc)}</dd></div><div><dt>Ngày đăng ký</dt><dd>{formatTime(registration.ngayDangKy)}</dd></div><div><dt>Trạng thái</dt><dd><span className={`student-badge registration-${registration.trangThai}`}>{labels[registration.trangThai]}</span></dd></div></dl>{registration.trangThai === 'TU_CHOI' && <div className="alert alert-danger mt-3"><strong>Lý do từ chối:</strong> {registration.lyDoTuChoi || 'Chưa có nội dung.'}</div>}{canEdit && <div className="registration-actions"><button className="btn btn-primary" onClick={() => { setEditing(true); setForm({ doanhNghiepId: String(registration.doanhNghiepId), canBoHuongDanId: String(registration.canBoHuongDanId), viTriThucTap: registration.viTriThucTap }); setSupervisors({ loading: true }); setSupervisorRevision(v => v + 1) }}>Chỉnh sửa</button><button className="btn btn-outline-danger" onClick={() => setCancel(registration)}>Hủy đăng ký</button></div>}</section>}
    {period && (!registration || (editing && canEdit)) && <section className="admin-panel registration-panel"><h2>{editing ? 'Chỉnh sửa đăng ký' : 'Thông tin đăng ký'}</h2><form onSubmit={submit} noValidate>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="student-form-grid"><div><label className="form-label" htmlFor="registration-company">Doanh nghiệp *</label><select id="registration-company" className={`form-select ${errors.doanhNghiepId ? 'is-invalid' : ''}`} value={form.doanhNghiepId} disabled={busy} onChange={e => { setForm({ ...form, doanhNghiepId: e.target.value, canBoHuongDanId: '' }); setErrors(previous => ({ ...previous, canBoHuongDanId: '' })); setError(''); setSupervisors(e.target.value ? { loading: true } : { data: [] }) }}><option value="">Chọn doanh nghiệp</option>{state.companies.map(c => <option key={c.id} value={c.id}>{c.tenDoanhNghiep}</option>)}</select>{errors.doanhNghiepId && <div className="invalid-feedback">{errors.doanhNghiepId}</div>}{!state.companies.length && <p className="small text-secondary">Chưa có doanh nghiệp để đăng ký.</p>}</div>
      <div><label className="form-label" htmlFor="registration-supervisor">Cán bộ hướng dẫn tại doanh nghiệp *</label><select id="registration-supervisor" className={`form-select ${errors.canBoHuongDanId ? 'is-invalid' : ''}`} value={noSupervisors ? '' : form.canBoHuongDanId} disabled={busy || supervisorsUnavailable} aria-describedby={noSupervisors ? 'registration-supervisor-note' : undefined} onChange={e => setForm({ ...form, canBoHuongDanId: e.target.value })}><option value="">{supervisors.loading ? 'Đang tải...' : noSupervisors ? 'Doanh nghiệp chưa có cán bộ hướng dẫn' : 'Chọn cán bộ hướng dẫn'}</option>{supervisors.data?.map(c => <option key={c.id} value={c.id}>{c.hoTen}{c.chucVu ? ` - ${c.chucVu}` : ''}</option>)}</select>{errors.canBoHuongDanId && !noSupervisors && <div className="invalid-feedback">{errors.canBoHuongDanId}</div>}{supervisors.error && <div role="alert"><p>{supervisors.error}</p><button type="button" className="btn btn-light border" onClick={() => { setSupervisors({ loading: true }); setSupervisorRevision(v => v + 1) }}>Thử lại</button></div>}{noSupervisors && <p id="registration-supervisor-note" className="small mt-2 mb-0" style={{ color: '#b87517' }} role="status">Doanh nghiệp này chưa có cán bộ hướng dẫn. Vui lòng liên hệ quản trị viên để bổ sung thông tin.</p>}</div>
      <div><label className="form-label" htmlFor="registration-position">Vị trí thực tập *</label><input id="registration-position" className={`form-control ${errors.viTriThucTap ? 'is-invalid' : ''}`} value={form.viTriThucTap} maxLength={200} disabled={busy} onChange={e => setForm({ ...form, viTriThucTap: e.target.value })} />{errors.viTriThucTap && <div className="invalid-feedback">{errors.viTriThucTap}</div>}</div></div>
      <div className="registration-actions">{editing && <button type="button" className="btn btn-light border" disabled={busy} onClick={resetForm}>Quay lại</button>}<button className="btn btn-primary" disabled={busy || supervisorsUnavailable}>{busy ? 'Đang gửi...' : editing ? 'Lưu thay đổi' : 'Gửi đăng ký'}</button></div>
    </form></section>}
    </div><aside><StudentCard title="Lưu ý khi đăng ký" icon="info-circle"><ol className="sw-tips"><li>Chọn đúng doanh nghiệp phù hợp với thông tin thực tập.</li><li>Chọn đúng cán bộ hướng dẫn thuộc doanh nghiệp.</li><li>Kiểm tra thời hạn đăng ký trước khi gửi.</li></ol><p className="sw-inline-note"><i className="bi bi-calendar-check" />Thời gian thực tập được lấy từ đợt đã chọn và không thể tự chỉnh sửa.</p></StudentCard></aside></div>
    {cancel && <CancelDialog record={cancel} onClose={() => setCancel(null)} onSaved={reload} />}
  </div>
}
