import { StudentCard, EmptyState } from './StudentWorkspace'
import { formatScore } from '../utils/evaluationScores'
import { formatDate, formatTime } from '../utils/studentWorkspace'

export default function StudentEvaluationView({ data }) {
  const { evaluation: e, student: s, internship: r } = data
  return <>
    {!e ? <StudentCard title="Kết quả thực tập" icon="award"><EmptyState text="Chưa có kết quả đánh giá." detail="Kết quả sẽ hiển thị sau khi giảng viên hoàn thành đánh giá." icon="award" /></StudentCard> : <StudentCard title="Kết quả thực tập" icon="award">
      <div className="st-scores">{[['diemChuyenMon', 'Chuyên môn', 'briefcase', 'blue'], ['diemThaiDo', 'Thái độ', 'person-check', 'green'], ['diemBaoCao', 'Báo cáo', 'file-earmark-text', 'purple']].map(([key, label, icon, tone]) => <div className={`st-score ${tone}`} key={key}><span className={`sw-stat-icon ${tone}`}><i className={`bi bi-${icon}`} /></span><div><span>{label}</span><strong>{formatScore(e[key])} <small>/ 10</small></strong>{e[key] != null && <div className="st-score-track" role="progressbar" aria-label={label} aria-valuenow={Number(e[key])} aria-valuemin={0} aria-valuemax={10}><span style={{ width: `${Math.min(100, Math.max(0, Number(e[key]) * 10))}%` }} /></div>}</div></div>)}</div>
      <div className="st-evaluation-summary"><div className="st-total"><span>Điểm tổng kết</span><strong>{formatScore(e.diemTong)} <small>/ 10</small></strong></div><blockquote><h3>Nhận xét của giảng viên</h3><p className="st-preserve-text">{e.nhanXet || 'Chưa có nhận xét.'}</p></blockquote><div><span className="sw-stat-icon blue"><i className="bi bi-calendar3" /></span><small>Ngày đánh giá</small><strong>{formatTime(e.ngayDanhGia)}</strong></div></div>
    </StudentCard>}
    <StudentCard title="Thông tin đánh giá" icon="person-vcard"><dl className="sw-profile-grid">{[['Sinh viên', s.hoTen], ['MSSV', s.maSinhVien], ['Lớp', s.lop], ['Ngành', s.nganh], ['Doanh nghiệp', r?.tenDoanhNghiep], ['Giảng viên hướng dẫn', r?.giangVienHuongDan], ['Thời gian thực tập', r ? `${formatDate(r.ngayBatDau)} – ${formatDate(r.ngayKetThuc)}` : null]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa có dữ liệu'}</dd></div>)}</dl></StudentCard>
  </>
}
