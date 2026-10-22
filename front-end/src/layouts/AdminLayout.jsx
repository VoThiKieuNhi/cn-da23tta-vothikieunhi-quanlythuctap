import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logoTvu from '../assets/images/logo-tvu.png'
import { clearSession } from '../services/api'
import '../assets/css/admin.css'
import PortalSearch from '../components/PortalSearch'
import '../assets/css/admin-design.css'

const adminMenu = [
  ['dashboard', 'Tổng quan', 'grid-1x2'],
  ['internship-periods', 'Quản lý đợt thực tập', 'calendar3'],
  ['students', 'Quản lý sinh viên', 'people'],
  ['lecturers', 'Quản lý giảng viên', 'person-video3'],
  ['companies', 'Quản lý doanh nghiệp', 'buildings'],
  ['registrations', 'Duyệt đăng ký', 'clipboard-check'],
  ['assignments', 'Phân công giảng viên', 'person-lines-fill'],
  ['reports', 'Báo cáo thống kê', 'bar-chart-line'],
]

export default function AdminLayout() {
  const [sidebar, setSidebar] = useState(() => window.innerWidth >= 1051)
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  const [accountInfo, setAccountInfo] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef(null)
  let user = {}
  try { user = JSON.parse(localStorage.getItem('currentUser') || '{}') || {} } catch { /* verified by ProtectedRoute */ }

  useEffect(() => {
    const resize = () => { setMobile(window.innerWidth < 768); setSidebar(window.innerWidth >= 1051) }
    window.addEventListener('resize', resize)
    const close = (e) => { if (e.key === 'Escape') { setSidebar(false); if (menuRef.current) menuRef.current.open = false } }
    window.addEventListener('keydown', close)
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('resize', resize) }
  }, [])

  function logout() { clearSession(); navigate('/admin/login', { replace: true }) }

  return (
    <div className={`admin-app tvu-admin-portal ${sidebar ? 'sidebar-open' : ''}`}>
      {sidebar && <button className="admin-overlay" aria-label="Đóng menu" onClick={() => setSidebar(false)} />}
      <aside id="admin-sidebar" className="admin-sidebar" inert={mobile && !sidebar}>
        <div className="admin-brand"><img src={logoTvu} alt="Đại học Trà Vinh" /><div><strong>ĐẠI HỌC TRÀ VINH</strong><span>Hệ thống quản lý thực tập</span></div></div>
        <div className="admin-nav-caption">KHÔNG GIAN QUẢN TRỊ</div>
        <nav aria-label="Menu quản trị">{adminMenu.map(([path, label, icon]) => <NavLink key={path} to={`/admin/${path}`} title={label} onClick={() => { if (window.innerWidth < 768) setSidebar(false) }}><i className={`bi bi-${icon}`} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
        <div className="admin-sidebar-footer"><i className="bi bi-shield-check" aria-hidden="true" /><span>Hệ thống quản lý thực tập<br /><small>Dành cho quản trị viên</small></span></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left"><button className="admin-icon-button" onClick={() => setSidebar(!sidebar)} aria-label="Đóng hoặc mở menu" aria-expanded={sidebar} aria-controls="admin-sidebar"><i className="bi bi-list" /></button><PortalSearch placeholder="Tìm kiếm thông tin..." links={adminMenu.map(([path, label]) => ({ to: `/admin/${path}`, label }))} /></div>
          <div className="admin-topbar-right"><span className="admin-notification" title="Thông báo"><i className="bi bi-bell" aria-label="Thông báo" /></span><details className="admin-account" ref={menuRef}><summary><span className="admin-avatar">{user.email?.[0]?.toUpperCase() || 'A'}</span><span className="admin-user-label"><strong>{user.hoTen || user.email || 'Admin'}</strong><small>Quản trị hệ thống</small></span><i className="bi bi-chevron-down" /></summary><div className="admin-dropdown"><button onClick={() => { setAccountInfo(true); menuRef.current.open = false }}><i className="bi bi-person-circle" />Thông tin tài khoản</button><button onClick={logout}><i className="bi bi-box-arrow-right" />Đăng xuất</button></div></details></div>
        </header>
        <main className="admin-content">
          {accountInfo && <section className="admin-panel admin-account-info"><div><h2>Thông tin tài khoản</h2><p>{user.email} · Quản trị viên</p></div><button className="admin-icon-button" aria-label="Đóng thông tin tài khoản" onClick={() => setAccountInfo(false)}><i className="bi bi-x-lg" /></button></section>}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
