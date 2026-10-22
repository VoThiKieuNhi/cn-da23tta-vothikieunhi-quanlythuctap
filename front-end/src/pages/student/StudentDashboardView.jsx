import StatusBadge from '../../components/StatusBadge'
import { Link } from 'react-router-dom'
import campus from '../../assets/images/tvu-campus.jpg'
import { formatDate, internshipSteps } from '../../utils/studentWorkspace'
import { dashboardPeriods } from '../../utils/dashboardPeriods'
import DashboardFeaturedPeriods from '../../components/DashboardFeaturedPeriods'
import DashboardNotices from '../../components/DashboardNotices'

function Panel({ title, icon, tone = 'blue', children, className = '' }) {
  return <section className={`dp2-panel ${className}`}><header><h2>{title}</h2><span className={`dp2-heading-icon ${tone}`}><i className={`bi bi-${icon}`} aria-hidden="true" /></span></header>{children}</section>
}

export default function StudentDashboardView({ data, summary, count, onRetry }) {
  const registration = data.registration
  const current = summary.registrations?.find(item => String(item.id) === String(registration?.id))
  const stats = [
    ['Đợt thực tập đang mở', summary.periods?.length, 'calendar-event', 'blue'],
    ['Đã đăng ký', summary.registrations?.length, 'people-fill', 'green'],
    ['Đang thực tập', count('DANG_THUC_TAP'), 'briefcase-fill', 'orange'],
    ['Đã hoàn thành', count('HOAN_THANH'), 'check-circle-fill', 'purple'],
  ]
  return <div className="dp2">
    <div className="dp2-top"><section className="dp2-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(3,31,66,.90),rgba(3,31,66,.55) 48%,rgba(3,31,66,.06)),url(${campus})` }}><h1>Xin chào, {data.student.hoTen} 👋</h1><p>Chúc bạn một ngày học tập và thực tập hiệu quả!</p></section></div>
    {summary.error && <div className="dp2-warning" role="alert">Chưa tải được thống kê. <button onClick={onRetry}>Thử lại</button></div>}
    <div className="dp2-stats">{stats.map(([label, value, icon, tone]) => <section className="dp2-stat" key={label}><span className={`dp2-icon ${tone}`}><i className={`bi bi-${icon}`} aria-hidden="true" /></span><div><h2>{label}</h2><strong>{summary.loading ? '…' : value ?? '—'}</strong></div></section>)}</div>
    <div className="dp2-columns"><div className="dp2-primary">
      <Panel title="Đợt thực tập nổi bật" icon="calendar-event"><DashboardFeaturedPeriods periods={dashboardPeriods(summary.periods, summary.registrations)} loading={summary.loading} error={summary.error} /></Panel>
      {registration && <Panel title="Thông tin thực tập của tôi" icon="briefcase" tone="orange"><dl className="dp2-information">{[
        ['Doanh nghiệp', registration.tenDoanhNghiep, 'buildings', 'blue'],
        ['Vị trí', registration.viTriThucTap, 'briefcase', 'orange'],
        ['Thời gian', `${formatDate(registration.ngayBatDau)} – ${formatDate(registration.ngayKetThuc)}`, 'calendar3', 'blue'],
        ['Giảng viên hướng dẫn', data.lecturers.map(item => item.hoTen).join(', ') || 'Chưa phân công', 'person-check', 'green'],
        ['Cán bộ doanh nghiệp', current?.canBoHuongDan || (summary.loading ? 'Đang tải...' : 'Chưa có dữ liệu'), 'people', 'purple'],
      ].map(([label, value, icon, tone]) => <div key={label}><dt><i className={`bi bi-${icon} dp2-text-${tone}`} />{label}</dt><dd>{value || 'Chưa có dữ liệu'}</dd></div>)}<div><dt><i className="bi bi-check2-circle dp2-text-green" />Trạng thái</dt><dd><StatusBadge status={registration.trangThai} /></dd></div></dl><Link className="dp2-detail-link" to="/student/internship-registration">Xem đăng ký <i className="bi bi-arrow-right" /></Link></Panel>}
      {registration && <Panel title="Tiến trình thực tập" icon="signpost-split"><ol className="dp2-timeline">{internshipSteps(data).map(step => <li key={step.label} className={step.done ? 'done' : ''}><i className={`bi bi-${step.done ? 'check-circle-fill' : 'circle'}`} /><span>{step.label}</span></li>)}</ol></Panel>}
    </div><aside className="dp2-secondary">
      <Panel title="Thông báo mới" icon="bell"><DashboardNotices data={data} /></Panel>
      <Panel title="Thao tác nhanh" icon="lightning-charge" tone="purple"><div className="dp2-actions">{[['internship-registration', 'Đăng ký thực tập', 'clipboard-check', 'blue'], ['progress', 'Cập nhật tiến độ', 'graph-up', 'green'], ['reports', 'Nộp báo cáo', 'file-earmark-text', 'orange'], ['evaluation', 'Xem kết quả', 'award', 'purple']].map(([path, label, icon, tone]) => <Link key={path} to={`/student/${path}`}><span className={`dp2-icon ${tone}`}><i className={`bi bi-${icon}`} /></span><span>{label}</span></Link>)}</div></Panel>
    </aside></div>
  </div>
}
