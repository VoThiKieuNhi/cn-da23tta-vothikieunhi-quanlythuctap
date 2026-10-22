import { Link } from 'react-router-dom'
import { EmptyState } from './StudentWorkspace'
import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/dateFormat'
import { registrationText } from '../utils/periodTime'
import campusImage from '../assets/images/tvu-campus.jpg'

export default function DashboardFeaturedPeriods({ periods, loading, error }) {
  if (loading) return <div className="sw-empty" role="status"><span className="spinner-border spinner-border-sm" />Đang tải đợt thực tập...</div>
  if (error) return <EmptyState text="Chưa tải được danh sách đợt thực tập." detail="Vui lòng sử dụng nút Thử lại phía trên." />
  if (!periods?.length) return <EmptyState text="Chưa có đợt thực tập liên quan." detail="Đợt mở đăng ký và đợt bạn đã đăng ký sẽ xuất hiện tại đây." icon="calendar-event" />
  return <div className="dp2-featured-grid">{periods.slice(0, 3).map(period => <article className="dp2-period" key={period.id}>
    <img src={campusImage} alt="Khuôn viên Đại học Trà Vinh" loading="lazy" />
    <div className="dp2-period-body"><h3>{period.tenDot || `${period.hocKy} · ${period.namHoc}`}</h3>
      <p>{period.hocKy} · {period.namHoc}</p>
      {period.tenDoanhNghiep && <p className="dp2-period-company"><i className="bi bi-buildings" aria-hidden="true" /> {period.tenDoanhNghiep}</p>}
      {period.chiTieu != null && <p><i className="bi bi-people" aria-hidden="true" /> {period.chiTieu} chỉ tiêu</p>}
      <dl><div><dt><i className="bi bi-calendar3" /> Thực tập</dt><dd>{formatDate(period.ngayBatDauThucTap)} – {formatDate(period.ngayKetThucThucTap)}</dd></div>{(period.thoiGianMoDangKy || period.thoiGianDongDangKy) && <div><dt><i className="bi bi-clock" /> Đăng ký</dt><dd>{period.thoiGianMoDangKy ? registrationText(period.thoiGianMoDangKy) : 'Chưa có dữ liệu'} – {period.thoiGianDongDangKy ? registrationText(period.thoiGianDongDangKy) : 'Chưa có dữ liệu'}</dd></div>}</dl>
      {period.trangThai ? <StatusBadge status={period.trangThai} /> : <><small className="dp2-registration-label">Đăng ký của bạn</small><StatusBadge status={period.registrationStatus} /></>}
      <Link to="/student/internship-registration">Đến trang đăng ký <i className="bi bi-arrow-right" /></Link>
    </div>
  </article>)}</div>
}
