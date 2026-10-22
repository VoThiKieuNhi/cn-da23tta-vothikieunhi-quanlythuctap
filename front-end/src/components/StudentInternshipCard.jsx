import campus from '../assets/images/tvu-campus.jpg'
import { formatDate } from '../utils/studentWorkspace'
import StatusBadge from './StatusBadge'

export default function StudentInternshipCard({ period, open, registration, disabled, selected, onSelect }) {
  return <article className={`st-internship-card ${selected ? 'is-selected' : ''}`}>
    <img src={campus} alt="Khuôn viên Đại học Trà Vinh" loading="lazy" />
    <div><h3>{period.tenDot || `Thực tập ${period.hocKy}`}</h3><p>{period.hocKy} · {period.namHoc}</p>
      <StatusBadge status={registration?.trangThai || (open ? 'DANG_MO_DANG_KY' : period.trangThai)} label={!registration && !open && !period.trangThai ? 'Không mở đăng ký' : undefined} />
      <p className="st-period-date"><i className="bi bi-calendar3" aria-hidden="true" />{formatDate(period.ngayBatDauThucTap)} – {formatDate(period.ngayKetThucThucTap)}</p>
      {registration?.tenDoanhNghiep && <p><i className="bi bi-buildings" aria-hidden="true" /> {registration.tenDoanhNghiep}</p>}
      {!registration && period.blockedReason && <p className="small text-warning-emphasis">{period.blockedReason}</p>}
      <button className={`btn ${open && !registration ? 'btn-primary' : 'btn-outline-primary'}`} disabled={disabled || (!registration && period.canRegister === false)} onClick={onSelect}>{open && !registration ? 'Đăng ký ngay' : 'Xem chi tiết'}</button>
    </div>
  </article>
}
