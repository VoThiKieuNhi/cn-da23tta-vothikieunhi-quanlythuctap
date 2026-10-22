import campus from '../../assets/images/tvu-campus.jpg'
import { registrationLabels, statusColors } from '../../utils/statusLabels'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { getAdminDashboard } from '../../services/adminService'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', Arial, sans-serif"
ChartJS.defaults.font.size = 13
ChartJS.defaults.font.lineHeight = 1.55
const statuses = Object.fromEntries(Object.entries(registrationLabels).map(([key, label]) => [key, [label, statusColors[key]]]))
const mainStats = [
  ['tongSinhVien', 'Tổng sinh viên', 'people-fill', 'blue'],
  ['tongGiangVien', 'Tổng giảng viên', 'person-video3', 'green'],
  ['tongDoanhNghiep', 'Tổng doanh nghiệp', 'buildings-fill', 'orange'],
  ['tongDotThucTap', 'Đợt thực tập', 'calendar-week', 'purple'],
]
const number = (value) => Number(value).toLocaleString('vi-VN')
const empty = <div className="admin-empty"><i className="bi bi-bar-chart" aria-hidden="true" /><p>Chưa có dữ liệu để thống kê.</p></div>

export default function AdminDashboard() {
  const [state, setState] = useState({ loading: true })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getAdminDashboard(controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ data })
    }).catch(() => { if (!controller.signal.aborted) setState({ error: true }) })
    return () => controller.abort()
  }, [attempt])

  const data = state.data
  return (
    <>
      <div className="admin-heading admin-campus-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(3,31,66,.93), rgba(6,43,88,.55) 45%, rgba(6,43,88,.04)), url(${campus})` }}><div><span className="admin-eyebrow">TỔNG QUAN HỆ THỐNG</span><h1>Xin chào, Quản trị viên 👋</h1><p>Chào mừng bạn đến với hệ thống quản lý thực tập.</p><blockquote>“ Tri thức - Sáng tạo - Phát triển ”</blockquote></div><span className="admin-heading-icon"><i className="bi bi-mortarboard" aria-hidden="true" /></span></div>
      {state.loading ? <div className="admin-panel admin-loading" role="status"><span className="spinner-border text-primary" /><p>Đang tải dữ liệu Dashboard...</p></div>
        : state.error ? <div className="admin-panel admin-empty" role="alert"><i className="bi bi-exclamation-circle" /><p>Không thể tải dữ liệu Dashboard. Vui lòng thử lại.</p><button className="btn btn-primary" onClick={() => { setState({ loading: true }); setAttempt(attempt + 1) }}>Thử lại</button></div>
          : data && <>
            <div className="admin-stat-grid">{mainStats.map(([key, label, icon, color]) => <section className="admin-stat admin-panel" key={key}><span className={`admin-stat-icon ${color}`}><i className={`bi bi-${icon}`} aria-hidden="true" /></span><div><h2>{label}</h2><strong>{number(data.tongQuan[key])}</strong></div></section>)}</div>
            <div className="admin-status-grid">{[['dangKyChoDuyet', 'Chờ duyệt', 'clock-history', 'orange'], ['dangThucTap', 'Đang thực tập', 'briefcase', 'blue'], ['hoanThanh', 'Hoàn thành', 'check-circle', 'green']].map(([key, label, icon, color]) => <div className="admin-status admin-panel" key={key}><span className={`admin-status-dot ${color}`}><i className={`bi bi-${icon}`} /></span><span>{label}</span><strong>{number(data.tongQuan[key])}</strong></div>)}</div>
            <div className="admin-chart-grid">
              <section className="admin-panel"><div className="admin-panel-heading"><h2>Số lượng sinh viên theo ngành</h2><i className="bi bi-bar-chart-line" aria-hidden="true" /></div>{data.sinhVienTheoNganh.length ? <div className="admin-bar-scroll"><div className="admin-chart" style={{ height: Math.max(270, data.sinhVienTheoNganh.length * 38) }}><Bar aria-label="Số lượng sinh viên theo ngành" role="img" data={{ labels: data.sinhVienTheoNganh.map(x => x.nganh), datasets: [{ label: 'Sinh viên', data: data.sinhVienTheoNganh.map(x => x.soLuong), backgroundColor: '#4596fa', borderRadius: 5, maxBarThickness: 23 }] }} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef2f8' } }, y: { grid: { display: false } } } }} /></div></div> : empty}</section>
              <section className="admin-panel"><div className="admin-panel-heading"><h2>Trạng thái đăng ký thực tập</h2><i className="bi bi-pie-chart" aria-hidden="true" /></div>{data.trangThaiDangKy.some(x => x.soLuong > 0) ? <><div className="admin-chart admin-doughnut"><Doughnut aria-label="Trạng thái đăng ký thực tập" role="img" data={{ labels: data.trangThaiDangKy.map(x => statuses[x.trangThai]?.[0] || x.trangThai || 'Chưa cập nhật'), datasets: [{ data: data.trangThaiDangKy.map(x => x.soLuong), backgroundColor: data.trangThaiDangKy.map(x => statuses[x.trangThai]?.[1] || '#9ba7ba'), borderWidth: 3, borderColor: '#fff' }] }} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }} /></div><div className="admin-chart-legend">{data.trangThaiDangKy.map(x => <div key={x.trangThai ?? 'unknown'}><span style={{ backgroundColor: statuses[x.trangThai]?.[1] || '#9ba7ba' }} /><span>{statuses[x.trangThai]?.[0] || x.trangThai || 'Chưa cập nhật'}</span><strong>{number(x.soLuong)}</strong></div>)}</div></> : empty}</section>
            </div>
            <section className="admin-panel admin-pending"><div className="admin-panel-heading"><div><h2>Đăng ký thực tập chờ duyệt</h2><p>Tối đa 5 đăng ký mới nhất</p></div><Link to="/admin/registrations">Xem tất cả <i className="bi bi-arrow-right" /></Link></div><div className="table-responsive"><table className="table align-middle mb-0"><thead><tr>{['STT', 'MSSV', 'Họ tên', 'Lớp', 'Doanh nghiệp', 'Vị trí', 'Đợt thực tập', 'Thao tác'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{data.dangKyChoDuyet.length ? data.dangKyChoDuyet.map((row, index) => <tr key={row.id}><td>{index + 1}</td><td>{row.maSinhVien || '—'}</td><td className="admin-student-name">{row.hoTen || '—'}</td><td>{row.lop || '—'}</td><td>{row.doanhNghiep || '—'}</td><td>{row.viTriThucTap || '—'}</td><td>{[row.hocKy, row.namHoc].filter(Boolean).join(' · ') || '—'}</td><td><Link className="btn btn-sm admin-view-button" to="/admin/registrations" aria-label={`Xem đăng ký của ${row.hoTen || row.maSinhVien || 'sinh viên'}`}>Xem</Link></td></tr>) : <tr><td colSpan={8} className="admin-table-empty"><i className="bi bi-inbox" aria-hidden="true" /><p>Hiện không có đăng ký nào đang chờ duyệt.</p></td></tr>}</tbody></table></div></section>
          </>}
    </>
  )
}
