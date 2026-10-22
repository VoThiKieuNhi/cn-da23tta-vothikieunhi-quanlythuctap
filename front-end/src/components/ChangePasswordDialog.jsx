import { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { passwordError } from '../utils/validators'

export default function ChangePasswordDialog({ onClose, onSuccess }) {
  const ref = useRef(null), saving = useRef(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [shown, setShown] = useState({}), [errors, setErrors] = useState({}), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { const el = ref.current; el.showModal(); return () => el.close() }, [])
  function close() { if (!saving.current) onClose() }
  async function submit(event) {
    event.preventDefault()
    if (saving.current) return
    const next = {}
    if (!form.currentPassword) next.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.'
    const invalid = passwordError(form.newPassword)
    if (invalid) next.newPassword = invalid
    else if (form.newPassword === form.currentPassword) next.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.'
    if (!form.confirmPassword) next.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.'
    else if (form.confirmPassword !== form.newPassword) next.confirmPassword = 'Xác nhận mật khẩu mới không khớp.'
    setErrors(next); setError('')
    if (Object.keys(next).length) return
    saving.current = true; setBusy(true)
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onSuccess('Đổi mật khẩu thành công.')
    } catch (err) {
      setErrors(err.response?.data?.errors || {})
      setError(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.')
    } finally { saving.current = false; setBusy(false) }
  }
  return <dialog ref={ref} className="student-modal" aria-labelledby="password-title" onCancel={e => { e.preventDefault(); close() }}>
    <header><h2 id="password-title">Đổi mật khẩu</h2><button type="button" className="btn" disabled={busy} aria-label="Đóng" onClick={close}><i className="bi bi-x-lg" /></button></header>
    <form noValidate onSubmit={submit}><div className="student-modal-body">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {Object.entries({ currentPassword: 'Mật khẩu hiện tại', newPassword: 'Mật khẩu mới', confirmPassword: 'Xác nhận mật khẩu mới' }).map(([key, label]) => <div className="mb-3" key={key}>
        <label className="form-label" htmlFor={`password-${key}`}>{label}</label><div className="input-group"><span className="input-group-text"><i className="bi bi-lock" aria-hidden="true" /></span>
          <input id={`password-${key}`} className={`form-control ${errors[key] ? 'is-invalid' : ''}`} type={shown[key] ? 'text' : 'password'} autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'} value={form[key]} disabled={busy} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `password-error-${key}` : undefined} onChange={e => setForm({ ...form, [key]: e.target.value })} />
          <button type="button" className="btn btn-outline-secondary" disabled={busy} aria-label={`${shown[key] ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`} aria-pressed={!!shown[key]} onClick={() => setShown({ ...shown, [key]: !shown[key] })}><i className={`bi bi-eye${shown[key] ? '-slash' : ''}`} /></button>
        </div>{errors[key] && <div className="invalid-feedback d-block" id={`password-error-${key}`}>{errors[key]}</div>}
      </div>)}
    </div><footer><button type="button" className="btn btn-light border" disabled={busy} onClick={close}>Hủy</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Đang lưu...' : 'Đổi mật khẩu'}</button></footer></form>
  </dialog>
}
