import TvuLogo from '../../components/TvuLogo'
import campus from '../../assets/images/tvu-campus.jpg'
import '@fontsource/dancing-script/400.css'
import '../../assets/css/login-premium.css'

export default function LoginV2({ email, setEmail, password, setPassword, visible, setVisible, remember, setRemember, loading, errors, message, selectedRole, selectedAccount, accountTypes, selectRole, submit }) {
  return <main className="login-premium">
    <img className="lp-background" src={campus} alt="" aria-hidden="true" />
    <svg className="lp-separator" viewBox="0 0 160 768" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="lp-navy" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#062B58"/><stop offset="1" stopColor="#073B73"/></linearGradient></defs><path d="M40 0 C110 100 130 210 95 330 C70 415 78 500 118 590 C140 645 120 710 70 768 L0 768 L0 0 Z" fill="url(#lp-navy)"/><path d="M22 0 C92 100 112 210 77 330 C52 415 60 500 100 590 C122 645 102 710 52 768" fill="none" stroke="rgba(3,31,66,.20)" strokeWidth="22"/><path d="M40 0 C110 100 130 210 95 330 C70 415 78 500 118 590 C140 645 120 710 70 768" fill="none" stroke="#EACB73" strokeWidth="10"/><path d="M40 0 C110 100 130 210 95 330 C70 415 78 500 118 590 C140 645 120 710 70 768" fill="none" stroke="rgba(255,235,160,.7)" strokeWidth="2"/></svg>
    <aside className="lp-brand-panel"><header className="lp-brand"><TvuLogo size={106} /><strong>Đại học Trà Vinh</strong><span>HỆ THỐNG QUẢN LÝ THỰC TẬP</span><div className="lp-brand-gold" aria-hidden="true" /><small>Tri thức - Sáng tạo - Phát triển</small><svg className="lp-swash" viewBox="0 0 280 30" aria-hidden="true"><path d="M4 25 Q198 -12 276 22" fill="none" stroke="#EACB73" strokeWidth="2" /></svg></header>
      <svg className="lp-lotus" viewBox="0 0 240 180" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.5"><path pathLength="1000" d="M120 170 C60 135 70 62 120 10 C170 62 180 135 120 170Z M120 170 C65 165 20 105 22 48 C82 55 122 106 120 170Z M120 170 C175 165 220 105 218 48 C158 55 118 106 120 170Z M120 170 C55 185 15 153 4 110 C61 98 102 121 120 170Z M120 170 C185 185 225 153 236 110 C179 98 138 121 120 170Z M120 10 V170 M22 48 L120 170 L218 48 M4 110 L120 170 L236 110" /></g></svg>
    </aside>
      <section className="lp-card" aria-labelledby="lp-title">
        <div className="lp-mobile-logo"><TvuLogo size={92} /></div>
        <header className="lp-welcome"><h1 id="lp-title">Chào mừng đến với<span>Hệ thống quản lý thực tập</span></h1><p className="lp-university">Đại học Trà Vinh</p><p className="lp-tagline">“Hành trình vững bước từ tri thức đến thực tiễn”</p></header>
        <form onSubmit={submit} noValidate aria-busy={loading}>
          <fieldset className="lp-role-picker" disabled={loading} aria-describedby={errors.role ? 'lp-role-error' : undefined}>
            <legend>Chọn vai trò đăng nhập</legend>
            <div className="lp-roles">{accountTypes.map(item => <label className={`lp-role ${item.style} ${selectedRole === item.role ? 'selected' : ''}`} key={item.role}>
              <input type="radio" name="login-role" value={item.role} checked={selectedRole === item.role} onChange={() => selectRole(item.role)} />
              <span className="lp-role-avatar"><i className={`bi bi-${item.role === 'SINH_VIEN' ? 'mortarboard-fill' : 'person-workspace'}`} aria-hidden="true" /></span>
              <strong>{item.label}</strong><span className="lp-role-description">{item.role === 'SINH_VIEN' ? 'Đăng ký, theo dõi và báo cáo quá trình thực tập' : 'Quản lý, hướng dẫn và đánh giá thực tập sinh viên'}</span>
            </label>)}</div>
            <p className="lp-field-error lp-role-error" id="lp-role-error" role={errors.role ? 'alert' : undefined}>{errors.role ? 'Vui lòng chọn vai trò đăng nhập.' : '\u00a0'}</p>
          </fieldset>
          <h2 className="lp-form-title">Đăng nhập tài khoản</h2>
          {message && <p className="lp-error" role="alert">{message}</p>}
          <div className="lp-field"><label htmlFor="lp-email">Email</label><div className={`lp-input ${errors.email ? 'invalid' : ''}`}><i className="bi bi-envelope" aria-hidden="true" /><input id="lp-email" type="email" autoComplete="username" placeholder={selectedRole === 'GIANG_VIEN' ? 'email@tvu.edu.vn' : selectedAccount?.placeholder || 'Email'} value={email} onChange={e => setEmail(e.target.value)} disabled={loading} aria-invalid={!!errors.email} aria-describedby="lp-email-error" /></div><p className="lp-field-error" id="lp-email-error" role={errors.email ? 'alert' : undefined}>{errors.email || '\u00a0'}</p></div>
          <div className="lp-field"><label htmlFor="lp-password">Mật khẩu</label><div className={`lp-input ${errors.password ? 'invalid' : ''}`}><i className="bi bi-lock" aria-hidden="true" /><input id="lp-password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} aria-invalid={!!errors.password} aria-describedby="lp-password-error" /><button type="button" disabled={loading} onClick={() => setVisible(!visible)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible}><i className={`bi bi-eye${visible ? '-slash' : ''}`} aria-hidden="true" /></button></div><p className="lp-field-error" id="lp-password-error" role={errors.password ? 'alert' : undefined}>{errors.password || '\u00a0'}</p></div>
          <label className="lp-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} disabled={loading} />Ghi nhớ đăng nhập</label>
          <button className="lp-submit" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm" aria-hidden="true" /> Đang đăng nhập...</> : <><i className="bi bi-box-arrow-in-right" aria-hidden="true" /> Đăng nhập <i className="bi bi-arrow-right" aria-hidden="true" /></>}</button>
        </form>
      </section>

  </main>
}
