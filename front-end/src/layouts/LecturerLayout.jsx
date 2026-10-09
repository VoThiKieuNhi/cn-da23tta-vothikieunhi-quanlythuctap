import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import logoTvu from '../assets/images/logo-tvu.png'
import { clearSession } from '../services/api'
import '../assets/css/admin.css'
import '../assets/css/student-admin.css'
import '../assets/css/student-workspace.css'
import '../assets/css/progress.css'

export default function LecturerLayout() {
  const [sidebar, setSidebar] = useState(false), navigate = useNavigate()
  return <div className={`admin-app student-app ${sidebar ? 'sw-mobile-open' : ''}`}>
    {sidebar && <button className="sw-overlay" aria-label="Đóng menu" onClick={() => setSidebar(false)} />}
    <aside id="lecturer-sidebar" className="admin-sidebar sw-sidebar"><Link className="admin-brand" to="/lecturer/students"><img src={logoTvu} alt="Đại học Trà Vinh" /><div><strong>ĐẠI HỌC TRÀ VINH</strong><span>Hệ thống quản lý thực tập</span></div></Link><div className="admin-nav-caption">KHÔNG GIAN GIẢNG VIÊN</div><nav aria-label="Menu giảng viên"><NavLink to="/lecturer/students" onClick={() => setSidebar(false)} title="Sinh viên hướng dẫn"><i className="bi bi-people" /><span>Sinh viên hướng dẫn</span></NavLink><NavLink to="/lecturer/reports" onClick={() => setSidebar(false)} title="Báo cáo thực tập"><i className="bi bi-file-earmark-text" /><span>Báo cáo thực tập</span></NavLink><NavLink to="/lecturer/evaluations" onClick={() => setSidebar(false)} title="Đánh giá thực tập"><i className="bi bi-award" /><span>Đánh giá thực tập</span></NavLink></nav></aside>
    <div className="admin-main sw-main"><header className="admin-topbar sw-topbar"><button className="admin-icon-button sw-menu-toggle" aria-label="Đóng hoặc mở menu" aria-expanded={sidebar} aria-controls="lecturer-sidebar" onClick={() => setSidebar(!sidebar)}><i className="bi bi-list" /></button><span>Giảng viên · Theo dõi tiến độ</span><button className="btn btn-light btn-sm" onClick={() => { clearSession(); navigate('/login', { replace: true }) }}>Đăng xuất</button></header><main className="admin-content sw-content"><Outlet /></main></div>
  </div>
}
