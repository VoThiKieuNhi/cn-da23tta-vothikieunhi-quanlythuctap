import { useEffect } from 'react'
import { updateStudentCode as updateCode } from '../utils/studentCode'

export default function StudentCodeFields({ form, setForm, major, selected, busy, error }) {
  const prefixes = [...new Set((major?.mssvRules || []).filter(r => Number(r.cohort) === Number(form.khoaHoc)).map(r => r.prefix + String(r.cohort).slice(-2)))]
  const prefix = prefixes.length === 1 ? prefixes[0] : prefixes.find(p => form.maSinhVien.startsWith(p)) || ''
  const sequence = form.maSinhVien.slice(6)
  useEffect(() => {
    if (!selected || !prefix) return
    setForm(previous => {
      const code = prefix + previous.maSinhVien.slice(6)
      return code === previous.maSinhVien ? previous : updateCode(previous, code)
    })
  }, [selected, prefix, setForm])
  const fallback = selected && prefixes.length === 0
  return <>
    {!fallback && <><div><label className="form-label" htmlFor="student-prefix">Tiền tố MSSV</label>{prefixes.length > 1 ? <select id="student-prefix" className="form-select" value={prefix} disabled={busy} onChange={e => setForm(v => updateCode(v, e.target.value + v.maSinhVien.slice(6)))}><option value="">Chọn tiền tố đã xác minh</option>{prefixes.map(p => <option key={p}>{p}</option>)}</select> : <input id="student-prefix" className="form-control" value={selected ? prefix : ''} readOnly />}</div><div><label className="form-label" htmlFor="student-sequence">Số thứ tự *</label><input id="student-sequence" className="form-control" inputMode="numeric" pattern="[0-9]{3}" maxLength={3} value={selected && prefix ? sequence : ''} disabled={busy || !selected || !prefix} onChange={e => { if (/^\d{0,3}$/.test(e.target.value)) setForm(v => updateCode(v, prefix + e.target.value)) }} />{!selected && <small className="text-secondary">Vui lòng chọn ngành và khóa trước.</small>}{selected && prefix && sequence.length !== 3 && <small className="text-secondary">Nhập đúng 3 chữ số, ví dụ 001 hoặc 033.</small>}</div></>}
    {fallback && <div><label className="form-label" htmlFor="student-full-code">MSSV *</label><input id="student-full-code" className="form-control" inputMode="numeric" maxLength={9} value={form.maSinhVien} disabled={busy} onChange={e => { if (/^\d{0,9}$/.test(e.target.value)) setForm(v => updateCode(v, e.target.value)) }} /><small className="text-warning">Ngành này chưa có quy tắc MSSV được xác minh. Vui lòng nhập đầy đủ MSSV.</small></div>}
    <div aria-live="polite"><label className="form-label">MSSV đầy đủ</label><div>{selected && /^\d{9}$/.test(form.maSinhVien) ? form.maSinhVien : 'Chưa đủ thông tin'}</div>{error && <div className="text-danger">{error}</div>}{selected && /^\d{9}$/.test(form.maSinhVien) && <small className="text-secondary">Email gợi ý: {form.maSinhVien}@st.tvu.edu.vn</small>}</div>
  </>
}
