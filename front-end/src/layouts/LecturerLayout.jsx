import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import logoTvu from '../assets/images/logo-tvu.png'
import { clearSession } from '../services/api'
import '../assets/css/admin.css'
import '../assets/css/student-admin.css'
import '../assets/css/student-workspace.css'
import '../assets/css/progress.css'
import '../assets/css/student-portal.css'
import '../assets/css/lecturer-design.css'

const menu = [['students', 'Sinh viên hướng dẫn', 'people'], ['reports', 'Báo cáo thực tập', 'file-earmark-text'], ['evaluations', 'Đánh giá thực tập', 'award']]
export default function LecturerLayout() {
  const [sidebar, setSidebar] = useState(false), [search, setSearch] = useState(''), navigate = useNavigate()
  let user = {}
  try { user = JSON.parse(localStorage.getItem('currentUser') || '{}') || {} } catch { /* ProtectedRoute verifies the session. */ }
  useEffect(() => { const close = e => { if (e.key === 'Escape') setSidebar(false) }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [])
  return <div className={`admin-app student-app lecturer-app ${sidebar ? 'sw-mobile-open lec-collapsed' : ''}`}>
    {sidebar && <button className="sw-overlay" aria-label="Đóng menu" onClick={() => setSidebar(false)} />}
    <aside id="lecturer-sidebar" className="admin-sidebar sw-sidebar"><Link className="admin-brand" to="/lecturer/students"><img src={logoTvu} alt="Đại học Trà Vinh" /><div><strong>ĐẠI HỌC TRÀ VINH</strong><span>Hệ thống quản lý thực tập</span></div></Link><div className="admin-nav-caption">KHÔNG GIAN GIẢNG VIÊN</div><nav aria-label="Menu giảng viên">{menu.map(([path, label, icon]) => <NavLink key={path} to={`/lecturer/${path}`} title={label} onClick={() => setSidebar(false)}><i className={`bi bi-${icon}`} /><span>{label}</span></NavLink>)}</nav><div className="admin-sidebar-footer"><i className="bi bi-mortarboard" /><span>Đồng hành cùng sinh viên<br /><small>Theo dõi · Hướng dẫn · Đánh giá</small></span></div></aside>
    <div className="admin-main sw-main"><header className="admin-topbar sw-topbar"><button className="admin-icon-button sw-menu-toggle" aria-label="Đóng hoặc mở menu" aria-expanded={sidebar} aria-controls="lecturer-sidebar" onClick={() => setSidebar(!sidebar)}><i className="bi bi-list" /></button>
      <form className="portal-search" onSubmit={e => { e.preventDefault(); navigate(`/lecturer/students?search=${encodeURIComponent(search.trim())}`) }}><i className="bi bi-search" aria-hidden="true" /><input aria-label="Tìm kiếm sinh viên, nhấn Enter để tìm" placeholder="Tìm kiếm sinh viên..." value={search} maxLength={200} onChange={e => setSearch(e.target.value)} /></form>
      <div className="admin-topbar-right"><details className="portal-notification"><summary aria-label="Thông báo"><i className="bi bi-bell" /></summary><div className="admin-dropdown">Chưa có thông báo.</div></details><details className="admin-account"><summary><span className="admin-avatar">{(user.hoTen || user.email || 'G')[0].toUpperCase()}</span><span className="admin-user-label"><strong>{user.hoTen || user.email || 'Giảng viên'}</strong><small>Giảng viên</small></span><i className="bi bi-chevron-down" /></summary><div className="admin-dropdown"><button onClick={() => { clearSession(); navigate('/login', { replace: true }) }}><i className="bi bi-box-arrow-right" />Đăng xuất</button></div></details></div>
    </header><main className="admin-content sw-content"><Outlet /></main></div>
  </div>
}
