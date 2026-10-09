import StudentCodeFields from './StudentCodeFields'
import { useEffect, useState } from 'react'
import { getMajors, getMajorClasses } from '../services/referenceService'
export default function StudentReferenceFields({ form, setForm, busy, onReady, codeError }) {
  const [state, setState] = useState({ loading: true }), [classes, setClasses] = useState({ key: '', data: [] }), [retry, setRetry] = useState(0)
  useEffect(() => { const c = new AbortController(); getMajors(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(() => { if (!c.signal.aborted) setState({ error: 'Không thể tải danh mục ngành.' }) }); return () => c.abort() }, [retry])
  const majors = state.data || [], major = majors.find(row => row.tenNganh === form.nganh), cohorts = major?.cohorts.map(String) || []
  const key = major && cohorts.includes(String(form.khoaHoc)) ? `${major.id}:${form.khoaHoc}` : ''
  useEffect(() => { if (!key) return; const c = new AbortController(); const [id, year] = key.split(':'); getMajorClasses(id, year, c.signal).then(data => { if (!c.signal.aborted) setClasses({ key, data }) }).catch(() => { if (!c.signal.aborted) setClasses({ key, data: [], error: 'Không thể tải danh sách lớp.' }) }); return () => c.abort() }, [key, retry])
  const rows = key && classes.key === key ? classes.data : [], error = state.error || (key === classes.key ? classes.error : '')
  const ready = !!major && cohorts.includes(form.khoaHoc) && rows.some(row => row.maLop === form.lop)
  useEffect(() => { onReady(ready) }, [ready, onReady])
  function select(field, value) { setForm(v => ({ ...v, [field]: value, ...(field === 'nganh' ? { khoaHoc: '', lop: '' } : field === 'khoaHoc' ? { lop: '' } : {}) })) }
  return <>
    <div><label className="form-label" htmlFor="student-major">Ngành *</label><select id="student-major" className="form-select" value={form.nganh} disabled={busy || !state.data} onChange={e => select('nganh', e.target.value)}><option value="">{state.loading ? 'Đang tải ngành...' : 'Chọn ngành'}</option>{form.nganh && !major && <option value={form.nganh} disabled>Giá trị cũ: {form.nganh} — cần chọn lại</option>}{majors.map(row => <option key={row.id} value={row.tenNganh}>{row.tenNganh}</option>)}</select>{major?.ghiChuLop && <small className="text-secondary">{major.ghiChuLop}</small>}</div>
    <div><label className="form-label" htmlFor="student-cohort">Khóa *</label><select id="student-cohort" className="form-select" value={form.khoaHoc} disabled={busy || !major} onChange={e => select('khoaHoc', e.target.value)}><option value="">Chọn khóa</option>{form.khoaHoc && !cohorts.includes(form.khoaHoc) && <option value={form.khoaHoc} disabled>Giá trị hiện tại: {form.khoaHoc} — chưa có lớp</option>}{cohorts.map(year => <option key={year} value={year}>{year}</option>)}</select></div>
    <StudentCodeFields form={form} setForm={setForm} major={major} selected={!!key} busy={busy} error={codeError} />
    <div><label className="form-label" htmlFor="student-class">Lớp *</label><select id="student-class" className="form-select" value={form.lop} disabled={busy || !key || classes.key !== key || !rows.length} onChange={e => select('lop', e.target.value)}><option value="">{key && classes.key !== key ? 'Đang tải lớp...' : key && !rows.length ? 'Chưa có lớp xác minh cho ngành và khóa' : 'Chọn lớp'}</option>{form.lop && !rows.some(row => row.maLop === form.lop) && <option value={form.lop} disabled>Giá trị cũ: {form.lop} — cần chọn lại</option>}{rows.map(row => <option key={row.id} value={row.maLop}>{row.maLop}</option>)}</select>{rows.find(row => row.maLop === form.lop)?.ghiChu && <small className="text-secondary">{rows.find(row => row.maLop === form.lop).ghiChu}</small>}</div>
    {error && <div className="text-danger" role="alert">{error}<button className="btn btn-link btn-sm" type="button" disabled={busy} onClick={() => setRetry(v => v + 1)}>Thử lại</button></div>}
  </>
}
