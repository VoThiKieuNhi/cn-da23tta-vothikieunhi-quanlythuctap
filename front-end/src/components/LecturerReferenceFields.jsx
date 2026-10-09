import { useEffect, useState } from 'react'
import { getLecturerFaculties, getReferenceLecturers } from '../services/referenceService'
export default function LecturerReferenceFields({ form, setForm, busy, onReady, onManual }) {
  const [faculties, setFaculties] = useState({}), [lecturers, setLecturers] = useState({ data: [], faculty: '' }), [retry, setRetry] = useState(0)
  const faculty = form.khoaDonVi || ''
  useEffect(() => { const c = new AbortController(); getLecturerFaculties(c.signal).then(data => { if (!c.signal.aborted) setFaculties({ data }) }).catch(() => { if (!c.signal.aborted) setFaculties({ error: 'Không thể tải khoa/đơn vị.' }) }); return () => c.abort() }, [retry])
  useEffect(() => { if (!faculty) return; const c = new AbortController(); getReferenceLecturers(faculty, c.signal).then(data => { if (!c.signal.aborted) setLecturers({ data, faculty }) }).catch(() => { if (!c.signal.aborted) setLecturers({ data: [], faculty, error: 'Không thể tải danh mục giảng viên.' }) }); return () => c.abort() }, [faculty, retry])
  const rows = faculty && lecturers.faculty === faculty ? lecturers.data : [], ready = rows.some(row => String(row.id) === String(form.danhMucGiangVienId))
  useEffect(() => { onReady(ready) }, [ready, onReady])
  function choose(id) { const row = rows.find(row => String(row.id) === id); setForm(v => ({ ...v, danhMucGiangVienId: row?.id || '', hoTen: row?.hoTen || '', hocVi: row?.hocVi || '', boMon: row?.khoaDonVi || '', chucVu: row?.chucVu || '', linhVuc: row?.linhVuc || '' })) }
  const error = faculties.error || (lecturers.faculty === faculty ? lecturers.error : '')
  return <>
    <div><label htmlFor="lecturer-faculty" className="form-label">Khoa / đơn vị *</label><select id="lecturer-faculty" className="form-select" value={faculty} disabled={busy || !faculties.data} onChange={e => setForm(v => ({ ...v, khoaDonVi: e.target.value, danhMucGiangVienId: '', hoTen: '', hocVi: '', boMon: '', chucVu: '', linhVuc: '' }))}><option value="">Chọn khoa / đơn vị</option>{faculties.data?.map(row => <option key={row.khoaDonVi} value={row.khoaDonVi}>{row.khoaDonVi}</option>)}</select></div>
    <div><label htmlFor="lecturer-reference" className="form-label">Giảng viên trong danh mục *</label><select id="lecturer-reference" className="form-select" value={form.danhMucGiangVienId || ''} disabled={busy || !faculty || lecturers.faculty !== faculty || !rows.length} onChange={e => choose(e.target.value)}><option value="">{faculty && lecturers.faculty !== faculty ? 'Đang tải giảng viên...' : 'Chọn giảng viên'}</option>{rows.map(row => <option key={row.id} value={row.id}>{row.hoTen} {row.hocVi ? `— ${row.hocVi}` : ''}</option>)}</select><button type="button" className="btn btn-link btn-sm px-0" disabled={busy} onClick={onManual}>Không tìm thấy giảng viên? Nhập thông tin thủ công</button>{form.id && !form.danhMucGiangVienId && <small className="text-secondary">Hồ sơ cũ chưa liên kết danh mục. Hãy chọn đúng giảng viên khi cập nhật.</small>}</div>
    {error && <div role="alert" className="text-danger">{error}<button className="btn btn-link btn-sm" type="button" disabled={busy} onClick={() => setRetry(v => v + 1)}>Thử lại</button></div>}
  </>
}
