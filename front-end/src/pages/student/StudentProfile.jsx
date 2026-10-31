import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useStudentWorkspace, formatDate } from '../../utils/studentWorkspace'
import ChangePasswordDialog from '../../components/ChangePasswordDialog'
import StudentProfileDialog from '../../components/StudentProfileDialog'
import StatusBadge from '../../components/StatusBadge'
import '../../assets/css/student-profile.css'

const display = value => value === undefined || value === null || value === '' ? 'Chưa cập nhật' : value

function Field({ label, value, icon, tone = 'blue' }) {
  return <div className="profile-field">{icon && <span className={`profile-icon ${tone}`}><i className={`bi bi-${icon}`} aria-hidden="true" /></span>}<div><dt>{label}</dt><dd>{display(value)}</dd></div></div>
}

export default function StudentProfile() {
  const { state, refresh } = useStudentWorkspace()
  const [account, setAccount] = useState({ loading: true })
  const [passwordOpen, setPasswordOpen] = useState(false), [notice, setNotice] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    api.get('/auth/me', { signal: controller.signal }).then(({ data }) => {
      if (!data.success || !data.user) throw new Error('Invalid account response')
      if (!controller.signal.aborted) setAccount({ data: data.user })
    }).catch(() => { if (!controller.signal.aborted) setAccount({ error: true }) })
    return () => controller.abort()
  }, [revision])
  function retry() { setAccount({ loading: true }); setRevision(value => value + 1); refresh() }
  const student = state.data?.student || {}
  const registration = state.data?.registration
  const user = account.data || {}
  const initials = student.hoTen?.trim().split(/\s+/).slice(-2).map(word => word[0]).join('').toLocaleUpperCase('vi')
  const fields = [
    ['Họ và tên', student.hoTen, 'person', 'blue'],
    ['Mã số sinh viên', student.maSinhVien, 'person-vcard', 'pink'],
    ['Email', user.email, 'envelope', 'green'],
    ['Số điện thoại', student.soDienThoai, 'telephone', 'purple'],
    ['Ngày sinh', student.ngaySinh ? formatDate(student.ngaySinh) : null, 'calendar3', 'orange'],
    ['Giới tính', { NAM: 'Nam', NU: 'Nữ', KHAC: 'Khác' }[student.gioiTinh], 'gender-ambiguous', 'blue'],
    ['Lớp', student.lop, 'people', 'purple'],
    ['Ngành học', student.nganh, 'mortarboard', 'green'],
    ['Khóa học', student.khoaHoc, 'bookmark', 'pink'],
  ]
  return <div className="student-profile-page">
    <header className="profile-heading"><div><h1>Hồ sơ sinh viên</h1><p>Xem và quản lý thông tin cá nhân của bạn.</p></div><nav aria-label="Đường dẫn"><Link to="/student/dashboard">Trang chủ</Link><i className="bi bi-chevron-right" aria-hidden="true" /><span aria-current="page">Hồ sơ cá nhân</span></nav></header>
    {notice && <div className="toast show border-0 mb-3" role="status" aria-live="polite"><div className="toast-body text-success">{notice}</div></div>}
    {profileOpen && <StudentProfileDialog student={student} onClose={() => setProfileOpen(false)} onSaved={message => { setProfileOpen(false); setNotice(message); refresh() }} />}
    {passwordOpen && <ChangePasswordDialog onClose={() => setPasswordOpen(false)} onSuccess={message => { setPasswordOpen(false); setNotice(message) }} />}
    {state.error || account.error ? <section className="profile-card profile-message" role="alert"><p>Không thể tải thông tin hồ sơ.</p><button className="btn btn-outline-primary" onClick={retry}>Thử lại</button></section> : state.loading || account.loading ? <section className="profile-card profile-message" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Đang tải hồ sơ...</section> : <>
      <section className="profile-card profile-hero"><div className="profile-avatar" aria-label="Ảnh đại diện bằng chữ cái">{initials || <i className="bi bi-person" aria-hidden="true" />}</div><div className="profile-identity"><div className="profile-name"><h2>{display(student.hoTen)}</h2><span className="profile-role"><i className="bi bi-mortarboard-fill" aria-hidden="true" /> Sinh viên</span></div><p>MSSV: <strong>{display(student.maSinhVien)}</strong></p><p>Lớp: <strong>{display(student.lop)}</strong></p><p>Ngành: <strong>{display(student.nganh)}</strong></p></div><blockquote>Tri thức - Sáng tạo - Phát triển</blockquote></section>
      <div className="profile-grid"><div><section className="profile-card"><h2><i className="bi bi-person" aria-hidden="true" /> Thông tin cá nhân</h2><button className="btn btn-outline-primary mb-3" onClick={() => setProfileOpen(true)}>Chỉnh sửa thông tin</button><dl className="profile-fields">{fields.map(([label, value, icon, tone]) => <Field key={label} {...{ label, value, icon, tone }} />)}</dl></section><section className="profile-card profile-note"><h2><i className="bi bi-info-circle" aria-hidden="true" /> Thông tin bổ sung</h2><p>Thông tin học vụ như lớp, ngành và khóa học được quản lý theo dữ liệu của hệ thống.</p></section></div>
      <aside><section className="profile-card"><h2><i className="bi bi-gear" aria-hidden="true" /> Tài khoản</h2><dl><Field label="Email đăng nhập" value={user.email} /><Field label="Vai trò" value={user.vaiTro === 'SINH_VIEN' ? 'Sinh viên' : null} /><Field label="Trạng thái tài khoản" value={typeof user.dangHoatDong === 'boolean' ? <span className={`profile-account-status ${user.dangHoatDong ? 'active' : 'inactive'}`}>{user.dangHoatDong ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span> : null} /></dl><button className="btn btn-outline-primary" onClick={() => { setNotice(''); setPasswordOpen(true) }}><i className="bi bi-lock me-2" />Đổi mật khẩu</button></section>
      <section className="profile-card"><h2><i className="bi bi-briefcase" aria-hidden="true" /> Thông tin thực tập</h2>{registration ? <><dl><Field label="Tên đợt" value={registration.tenDotThucTap} /><Field label="Học kỳ / năm học" value={[registration.hocKy, registration.namHoc].filter(Boolean).join(' / ')} /><Field label="Doanh nghiệp" value={registration.tenDoanhNghiep} /><Field label="Giảng viên hướng dẫn" value={state.data.lecturers?.map(item => item.hoTen).filter(Boolean).join(', ')} /><Field label="Thời gian" value={registration.ngayBatDau && registration.ngayKetThuc ? `${formatDate(registration.ngayBatDau)} – ${formatDate(registration.ngayKetThuc)}` : null} /><Field label="Trạng thái" value={<StatusBadge status={registration.trangThai} />} /></dl><Link className="btn btn-outline-primary" to="/student/internship-registration">Xem chi tiết</Link></> : <div className="profile-empty"><i className="bi bi-briefcase" aria-hidden="true" /><p>Bạn chưa có thông tin thực tập.</p><Link className="btn btn-outline-primary" to="/student/internship-registration">Xem các đợt thực tập</Link></div>}</section></aside></div>
    </>}
  </div>
}
