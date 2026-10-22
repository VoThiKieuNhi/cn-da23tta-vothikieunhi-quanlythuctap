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
      <section className="lp-card" aria-labelledby="lp-title"><div className="lp-mobile-logo"><TvuLogo size={92} /></div><h1 id="lp-title">Đăng nhập hệ thống</h1><p className="lp-subtitle">Chào mừng bạn đến với hệ thống quản lý thực tập</p>
        <form onSubmit={submit} noValidate aria-busy={loading}>
          {message && <p className="lp-error" role="alert">{message}</p>}
          <div className="lp-field"><label htmlFor="lp-email">Email</label><div className={`lp-input ${errors.email ? 'invalid' : ''}`}><i className="bi bi-envelope" aria-hidden="true" /><input id="lp-email" type="email" autoComplete="username" placeholder={selectedAccount?.placeholder || 'Email'} value={email} onChange={e => setEmail(e.target.value)} disabled={loading} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'lp-email-error' : undefined} /></div>{errors.email && <p className="lp-field-error" id="lp-email-error" role="alert">{errors.email}</p>}</div>
          <div className="lp-field"><label htmlFor="lp-password">Mật khẩu</label><div className={`lp-input ${errors.password ? 'invalid' : ''}`}><i className="bi bi-lock" aria-hidden="true" /><input id="lp-password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'lp-password-error' : undefined} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible}><i className={`bi bi-eye${visible ? '-slash' : ''}`} /></button></div>{errors.password && <p className="lp-field-error" id="lp-password-error" role="alert">{errors.password}</p>}</div>
          <label className="lp-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} disabled={loading} />Ghi nhớ đăng nhập</label>
          <button className="lp-submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
          {errors.role && <p className="lp-field-error" id="lp-role-error" role="alert">{errors.role}</p>}
        </form>
        <div className="lp-divider">Hoặc đăng nhập với</div><div className="lp-roles" role="group" aria-label="Chọn loại tài khoản" aria-describedby={errors.role ? 'lp-role-error' : undefined}>{accountTypes.map(item => <button type="button" className={`lp-role ${item.style} ${selectedRole === item.role ? 'selected' : ''}`} key={item.role} disabled={loading} aria-pressed={selectedRole === item.role} onClick={() => selectRole(item.role)}><i className={`bi bi-${item.icon}`} aria-hidden="true" /><span>{item.label}</span></button>)}</div>
      </section>

  </main>
}
