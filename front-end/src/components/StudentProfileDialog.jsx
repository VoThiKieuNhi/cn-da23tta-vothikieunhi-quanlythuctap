import { useEffect, useRef, useState } from 'react'
import api from '../services/api'

export default function StudentProfileDialog({ student, onClose, onSaved }) {
  const ref = useRef(null), saving = useRef(false)
  const [form, setForm] = useState({ soDienThoai: student.soDienThoai || '', ngaySinh: student.ngaySinh || '', gioiTinh: student.gioiTinh || '' })
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  useEffect(() => { const el = ref.current; el.showModal(); return () => el.close() }, [])
  const change = e => setForm({ ...form, [e.target.name]: e.target.value })
  async function submit(e) {
    e.preventDefault()
    if (saving.current) return
    if (!/^0\d{9}$/.test(form.soDienThoai.trim())) { setError('Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.'); return }
    if (!form.ngaySinh || form.ngaySinh > today) { setError('Ngày sinh phải hợp lệ và không lớn hơn ngày hiện tại.'); return }
    saving.current = true; setBusy(true); setError('')
    try { const { data } = await api.put('/student/profile', { so_dien_thoai: form.soDienThoai.trim(), ngay_sinh: form.ngaySinh, gioi_tinh: form.gioiTinh }); onSaved(data.message) }
    catch (err) { setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ.') }
    finally { saving.current = false; setBusy(false) }
  }
  return <dialog ref={ref} className="student-modal" aria-labelledby="profile-edit-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }}>
    <header><h2 id="profile-edit-title">Cập nhật thông tin cá nhân</h2><button className="admin-icon-button" disabled={busy} onClick={onClose} aria-label="Đóng"><i className="bi bi-x-lg" /></button></header>
    <form onSubmit={submit}><div className="student-modal-body">{error && <div className="alert alert-danger" role="alert">{error}</div>}<div className="student-form-grid">
      <div><label className="form-label" htmlFor="profile-phone">Số điện thoại</label><input id="profile-phone" className="form-control" name="soDienThoai" type="tel" maxLength={10} pattern="0[0-9]{9}" required disabled={busy} value={form.soDienThoai} onChange={change} /></div>
      <div><label className="form-label" htmlFor="profile-birth">Ngày sinh</label><input id="profile-birth" className="form-control" name="ngaySinh" type="date" min="0001-01-01" max={today} required disabled={busy} value={form.ngaySinh} onChange={change} /></div>
      <div><label className="form-label" htmlFor="profile-gender">Giới tính</label><select id="profile-gender" className="form-select" name="gioiTinh" required disabled={busy} value={form.gioiTinh} onChange={change}><option value="">Chọn giới tính</option><option value="NAM">Nam</option><option value="NU">Nữ</option><option value="KHAC">Khác</option></select></div>
    </div></div><footer><button type="button" className="btn btn-light border" disabled={busy} onClick={onClose}>Hủy</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu thông tin'}</button></footer></form>
  </dialog>
}
