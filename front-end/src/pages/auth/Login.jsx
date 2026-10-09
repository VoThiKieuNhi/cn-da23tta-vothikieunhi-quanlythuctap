import { emailError } from '../../utils/validators'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardPaths, login } from '../../services/authService'
import '../../assets/css/login.css'
import loginStudents from '../../assets/images/login-students.png'
import logoTvu from "../../assets/images/logo-tvu.png";

const accountTypes = [
  { role: 'SINH_VIEN', label: 'Sinh viên', style: 'student', icon: 'people-fill', placeholder: 'MSSV@st.tvu.edu.vn' },
  { role: 'GIANG_VIEN', label: 'Giảng viên', style: 'lecturer', icon: 'mortarboard-fill', placeholder: 'ten@tvu.edu.vn' },
  { role: 'ADMIN', label: 'Quản trị viên', style: 'admin', icon: 'bank2', placeholder: 'admin@tvu.edu.vn' },
]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const selectedAccount = accountTypes.find((item) => item.role === selectedRole)
  const submitting = useRef(false)

  function selectRole(role) {
    if (submitting.current) return
    setSelectedRole(role)
    setErrors((current) => ({ ...current, role: '', email: '' }))
    setMessage('')
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const next = {}
    if (!selectedRole) next.role = 'Vui lòng chọn loại tài khoản.'
    if (!email.trim()) next.email = 'Vui lòng nhập email.'
    else if (emailError(email)) next.email = emailError(email)
    else if (selectedRole) {
      const domain = email.trim().toLowerCase().split('@')[1]
      if (selectedRole === 'SINH_VIEN' && domain !== 'st.tvu.edu.vn') {
        next.email = 'Vui lòng sử dụng email sinh viên @st.tvu.edu.vn.'
      } else if (selectedRole !== 'SINH_VIEN' && domain !== 'tvu.edu.vn') {
        next.email = domain === 'st.tvu.edu.vn'
          ? `Email sinh viên không thể đăng nhập với loại tài khoản ${selectedAccount.label}.`
          : 'Vui lòng sử dụng email @tvu.edu.vn.'
      }
    }
    if (!password) next.password = 'Vui lòng nhập mật khẩu.'
    setErrors(next)
    setMessage('')
    if (Object.keys(next).length) return
    submitting.current = true
    setLoading(true)
    try {
      const user = await login(email, password, remember, selectedRole)
      navigate(dashboardPaths[user.vaiTro], { replace: true })
    } catch (error) {
      if (error.code === 'LOGIN_ROLE_MISMATCH') {
        setMessage(`Tài khoản không thuộc loại ${selectedAccount.label}.`)
        return
      }
      const status = error.response?.status
      setMessage(status === 401 ? 'Email hoặc mật khẩu không chính xác.'
        : status === 403 ? 'Tài khoản hiện đang bị khóa.'
          : status === 400 ? 'Email hoặc mật khẩu không hợp lệ. Vui lòng kiểm tra lại.'
            : 'Không thể kết nối đến hệ thống. Vui lòng thử lại.')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <header className="university-brand">
          <img
            src={logoTvu}
            alt="Đại học Trà Vinh"
            className="tvu-logo"
          />
          <div><strong>ĐẠI HỌC TRÀ VINH</strong><span>Hệ thống quản lý thực tập</span></div>
        </header>
        <section className="login-intro" aria-label="Giới thiệu hệ thống">
          <div className="intro-content">
            <h1>Chào mừng đến với<br />Hệ thống quản lý thực tập</h1>
            <p>Kết nối sinh viên – giảng viên – doanh nghiệp<br />Quản lý toàn diện quá trình thực tập</p>
          </div>
          <div className="login-artwork">
            <img src={loginStudents} className="login-students-illustration" alt="Sinh viên" />
          </div>
        </section>
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-card">
            <h2 id="login-title">Đăng nhập</h2>
            <p className="login-subtitle">Vui lòng đăng nhập để tiếp tục sử dụng hệ thống</p>
            <form onSubmit={submit} noValidate aria-busy={loading}>
              {message && <div className="alert alert-danger login-alert" role="alert"><i className="bi bi-exclamation-circle me-2" aria-hidden="true" />{message}</div>}
              <div className="mb-4">
                <label className="form-label" htmlFor="email">Email</label>
                <div className={`login-input ${errors.email ? 'has-error' : ''}`}><i className="bi bi-envelope" aria-hidden="true" /><input id="email" type="email" autoComplete="username" placeholder={selectedAccount?.placeholder || 'Email hoặc tên đăng nhập'} value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} /></div>
                {errors.email && <div id="email-error" className="field-error" role="alert">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">Mật khẩu</label>
                <div className={`login-input ${errors.password ? 'has-error' : ''}`}><i className="bi bi-lock" aria-hidden="true" /><input id="password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible}><i className={`bi bi-eye${visible ? '-slash' : ''}`} aria-hidden="true" /></button></div>
                {errors.password && <div id="password-error" className="field-error" role="alert">{errors.password}</div>}
              </div>
              <div className="login-options"><div className="form-check login-remember"><input className="form-check-input" type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={loading} /><label className="form-check-label" htmlFor="remember">Ghi nhớ đăng nhập</label></div><span className="login-forgot" role="link" aria-disabled="true" title="Chức năng sẽ được bổ sung sau">Quên mật khẩu?</span></div>
              <button type="submit" className="btn btn-primary login-submit" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Đang đăng nhập...</> : <>Đăng nhập</>}</button>
              {errors.role && <div id="role-error" className="field-error" role="alert">{errors.role}</div>}
            </form>
            <div className="login-divider"><span>hoặc đăng nhập bằng</span></div>
            <div className="login-roles" role="group" aria-label="Chọn loại tài khoản" aria-describedby={errors.role ? 'role-error' : undefined}>
              {accountTypes.map((item) => (
                <div key={item.role} className={`login-role role-${item.style}${selectedRole === item.role ? ' is-selected' : ''}`}
                  role="button" tabIndex={0} aria-pressed={selectedRole === item.role} aria-disabled={loading}
                  onClick={() => selectRole(item.role)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectRole(item.role)
                    }
                  }}>
                  <i className={`bi bi-${item.icon}`} aria-hidden="true" /><span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>
    </main>
  )
}
