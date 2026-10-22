import { Link } from 'react-router-dom'
import { EmptyState } from './StudentWorkspace'
import { periodLabel } from '../utils/lecturerDisplay'

export function LecturerHeader({ title, subtitle, progress = false }) {
  return <header className="lec-heading"><div><h1>{title}</h1><p>{subtitle}</p></div><nav aria-label="Đường dẫn"><Link to="/lecturer/students">Trang chủ</Link><i className="bi bi-chevron-right" aria-hidden="true" />{progress && <><Link to="/lecturer/students">Sinh viên hướng dẫn</Link><i className="bi bi-chevron-right" aria-hidden="true" /></>}<span aria-current="page">{progress ? 'Chi tiết tiến độ' : title}</span></nav></header>
}
export function LecturerStats({ items }) {
  return <div className="lec-stats">{items.map(({ label, value, icon, tone = 'blue' }, index) => <section className="lec-stat" key={label} style={{ animationDelay: `${index * 50}ms` }}><span className={`lec-icon ${tone}`}><i className={`bi bi-${icon}`} aria-hidden="true" /></span><div><strong>{value ?? '—'}</strong><p>{label}</p></div></section>)}</div>
}
export function LecturerBoundary({ state, retry, empty, children }) {
  if (state.loading) return <div className="lec-state" role="status"><span className="spinner-border spinner-border-sm" aria-hidden="true" /><p>Đang tải dữ liệu...</p></div>
  if (state.error) return <div className="lec-state" role="alert"><i className="bi bi-exclamation-circle" aria-hidden="true" /><p>{state.error}</p><button className="btn btn-outline-primary" onClick={retry}>Thử lại</button></div>
  if (empty) return <EmptyState text={empty} />
  return children
}
export function LecturerFilters({ search, onSearch, status, onStatus, statuses, period, onPeriod, rows, onSubmit, placeholder }) {
  const periods = [...new Set(rows.map(periodLabel).filter(Boolean))]
  return <form className="lec-filters" onSubmit={event => { event.preventDefault(); onSubmit() }}>
    <div className="lec-search"><i className="bi bi-search" aria-hidden="true" /><input className="form-control" aria-label="Tìm kiếm" placeholder={placeholder} maxLength={200} value={search} onChange={event => onSearch(event.target.value)} /></div>
    <select className="form-select" aria-label="Đợt thực tập" disabled={!periods.length} title={!periods.length ? 'API hiện chưa cung cấp thông tin đợt thực tập.' : undefined} value={period} onChange={event => onPeriod(event.target.value)}><option value="">{periods.length ? 'Tất cả đợt thực tập' : 'Chưa có dữ liệu đợt'}</option>{periods.map(value => <option key={value}>{value}</option>)}</select>
    <select className="form-select" aria-label="Trạng thái" value={status} onChange={event => onStatus(event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    <button className="btn btn-primary" type="submit"><i className="bi bi-search" aria-hidden="true" /> Tìm kiếm</button>
  </form>
}
export function LecturerPagination({ total, page, onPage, size = 10 }) {
  const pages = Math.max(1, Math.ceil(total / size)), current = Math.min(page, pages)
  return <footer className="lec-pagination"><span>Hiển thị {total ? (current - 1) * size + 1 : 0}–{Math.min(current * size, total)} trong {total} kết quả</span><div><button className="btn btn-light btn-sm" aria-label="Trang trước" disabled={current <= 1} onClick={() => onPage(current - 1)}><i className="bi bi-chevron-left" /></button><span aria-live="polite">{current} / {pages}</span><button className="btn btn-light btn-sm" aria-label="Trang sau" disabled={current >= pages} onClick={() => onPage(current + 1)}><i className="bi bi-chevron-right" /></button></div></footer>
}
