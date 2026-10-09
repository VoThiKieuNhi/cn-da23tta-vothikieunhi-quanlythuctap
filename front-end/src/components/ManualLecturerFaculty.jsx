import { useEffect, useState } from 'react'
import { getLecturerFaculties } from '../services/referenceService'
export default function ManualLecturerFaculty({ form, setForm, busy }) {
  const [state, setState] = useState({}), [other, setOther] = useState(false), [retry, setRetry] = useState(0)
  useEffect(() => { const c = new AbortController(); getLecturerFaculties(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(() => { if (!c.signal.aborted) setState({ error: true }) }); return () => c.abort() }, [retry])
  const rows = state.data || [], custom = other || !!(state.data && form.boMon && !rows.some(r => r.khoaDonVi === form.boMon))
  function update(value) { setForm(v => ({ ...v, boMon: value, khoaDonVi: value })) }
  return <div><label className="form-label" htmlFor="manual-faculty">Khoa / đơn vị *</label><select id="manual-faculty" className="form-select" disabled={busy || !state.data} value={custom ? '__other' : form.boMon} onChange={e => { setOther(e.target.value === '__other'); update(e.target.value === '__other' ? '' : e.target.value) }}><option value="">Chọn khoa / đơn vị</option>{rows.map(r => <option key={r.khoaDonVi}>{r.khoaDonVi}</option>)}<option value="__other">Khác</option></select>{custom && <><label htmlFor="manual-other-faculty" className="form-label">Tên đơn vị khác *</label><input id="manual-other-faculty" className="form-control" value={form.boMon} maxLength={150} disabled={busy} onChange={e => update(e.target.value)} /></>}{state.error && <div role="alert">Không thể tải khoa / đơn vị. <button type="button" className="btn btn-link btn-sm" disabled={busy} onClick={() => setRetry(v => v + 1)}>Thử lại</button></div>}</div>
}
