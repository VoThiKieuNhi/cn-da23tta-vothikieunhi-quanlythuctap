import { registrationLabels, reportLabels } from '../../utils/statusLabels'
import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { exportReports, getReportOptions, getReportStudents, getReportSummary } from '../../services/adminReportService'
import '../../assets/css/admin-reports.css'
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', sans-serif"
ChartJS.defaults.font.size = 13
const initial = { dotThucTapId: '', hocKy: '', namHoc: '', nganhId: '', trangThai: '', search: '' }
const labels = { ...registrationLabels, ...reportLabels }
const colors = ['#1677ff', '#ffbd4a', '#27bb91', '#8b78ed', '#ef7183']
const empty = <div className="admin-empty"><i className="bi bi-inbox" /><p>Không có dữ liệu phù hợp với bộ lọc hiện tại.</p></div>
const metrics = [['tongSinhVien', 'Tổng sinh viên thực tập', 'people', 'blue'], ['choDuyet', 'Chờ duyệt', 'clock', 'orange'], ['dangThucTap', 'Đang thực tập', 'briefcase', 'purple'], ['hoanThanh', 'Hoàn thành', 'check-circle', 'green'], ['baoCaoDaDuyet', 'Báo cáo đã duyệt', 'file-check', 'blue'], ['daDanhGia', 'Đã đánh giá', 'award', 'green']]
function Table({ columns, rows, offset = 0 }) {
  return <div className="table-responsive"><table className="table align-middle"><thead><tr><th>STT</th>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => <tr key={row.id || i}><td>{offset + i + 1}</td>{columns.map(([key, , format]) => <td key={key}>{format ? format(row[key]) : row[key] ?? '-'}</td>)}</tr>) : <tr><td colSpan={columns.length + 1}>{empty}</td></tr>}</tbody></table></div>
}
function Panel({ title, children }) { return <section className="admin-panel"><div className="admin-panel-heading"><h2>{title}</h2></div>{children}</section> }
function Donut({ rows }) {
  if (!rows.some(r => r.soLuong > 0)) return empty
  return <div className="admin-chart admin-doughnut"><Doughnut data={{ labels: rows.map(r => labels[r.trangThai] || r.trangThai), datasets: [{ data: rows.map(r => r.soLuong), backgroundColor: colors, borderWidth: 3 }] }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} /></div>
}
export default function AdminReports() {
  const [draft, setDraft] = useState(initial), [query, setQuery] = useState(initial), [page, setPage] = useState(1)
  const [options, setOptions] = useState({}), [summary, setSummary] = useState({ loading: true }), [students, setStudents] = useState({ loading: true }), [revision, setRevision] = useState(0)
  const [exporting, setExporting] = useState(false), [exportError, setExportError] = useState('')
  useEffect(() => { const c = new AbortController(); getReportOptions(c.signal).then(data => { if (!c.signal.aborted) setOptions({ data }) }).catch(() => { if (!c.signal.aborted) setOptions({ error: true }) }); return () => c.abort() }, [revision])
  useEffect(() => { const c = new AbortController(); getReportSummary(query, c.signal).then(data => { if (!c.signal.aborted) setSummary({ data }) }).catch(() => { if (!c.signal.aborted) setSummary({ error: true }) }); return () => c.abort() }, [query, revision])
  useEffect(() => { const c = new AbortController(); getReportStudents({ ...query, page, limit: 20 }, c.signal).then(data => { if (!c.signal.aborted) setStudents({ data }) }).catch(() => { if (!c.signal.aborted) setStudents({ error: true }) }); return () => c.abort() }, [query, page, revision])
  function apply(e) { e.preventDefault(); setSummary({ loading: true }); setStudents({ loading: true }); setPage(1); setQuery({ ...draft }); setExportError('') }
  function reset() { setDraft(initial); setQuery({ ...initial }); setPage(1); setSummary({ loading: true }); setStudents({ loading: true }); setRevision(v => v + 1); setExportError('') }
  async function download() { setExporting(true); setExportError(''); try { await exportReports(query) } catch { setExportError('Không thể xuất Excel. Vui lòng thử lại.') } finally { setExporting(false) } }
  const o = options.data, data = summary.data, table = students.data
  const filterOptions = o ? { dotThucTapId: o.periods.map(r => [r.id, `${r.hocKy} · ${r.namHoc} (#${r.id})`]), hocKy: o.hocKy.map(r => [r, r]), namHoc: o.namHoc.map(r => [r, r]), nganhId: o.majors.map(r => [r.id, r.tenNganh]), trangThai: o.statuses.map(r => [r.value, r.label]) } : {}
  return <div className="admin-reports">
    <div className="admin-heading"><div><h1>Báo cáo - Thống kê</h1><p>Tổng hợp tình hình đăng ký, thực tập, báo cáo và kết quả đánh giá sinh viên.</p></div><button className="btn btn-primary" disabled={exporting || summary.loading || !!summary.error} onClick={download}><i className="bi bi-file-earmark-excel me-2" />{exporting ? 'Đang xuất...' : 'Xuất Excel'}</button></div>
    <form className="admin-panel mb-3" onSubmit={apply}><div className="row g-3">{[['dotThucTapId', 'Đợt thực tập'], ['hocKy', 'Học kỳ'], ['namHoc', 'Năm học'], ['nganhId', 'Ngành'], ['trangThai', 'Trạng thái thực tập']].map(([key, label]) => <div className="col-12 col-md-6 col-xl" key={key}><label className="form-label" htmlFor={`report-${key}`}>{label}</label><select className="form-select" id={`report-${key}`} value={draft[key]} disabled={!o} onChange={e => setDraft(v => ({ ...v, [key]: e.target.value }))}><option value="">Tất cả</option>{filterOptions[key]?.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></div>)}</div><div className="d-flex gap-2 flex-wrap mt-3"><input className="form-control report-search" aria-label="Tìm kiếm sinh viên thực tập" placeholder="MSSV, họ tên, lớp, doanh nghiệp, GVHD..." maxLength={200} value={draft.search} onChange={e => setDraft(v => ({ ...v, search: e.target.value }))} /><button className="btn btn-primary" disabled={!o}>Áp dụng</button><button type="button" className="btn btn-light border" onClick={reset}>Làm mới</button></div>{options.error && <p className="text-danger mt-2" role="alert">Không thể tải bộ lọc. Bấm Làm mới để thử lại.</p>}</form>
    {exportError && <p className="alert alert-danger" role="alert">{exportError}</p>}
    {summary.loading ? <div className="admin-panel admin-loading" role="status">Đang tải thống kê...</div> : summary.error ? <div className="alert alert-danger" role="alert">Không thể tải thống kê. <button className="btn btn-link" onClick={reset}>Thử lại</button></div> : data && <>
      <div className="admin-stat-grid report-stats">{metrics.map(([key, label, icon, color]) => <section className="admin-stat admin-panel" key={key}><span className={`admin-stat-icon ${color}`}><i className={`bi bi-${icon}`} /></span><div><h2>{label}</h2><strong>{data.overview[key]}</strong></div></section>)}</div>
      <p className="text-secondary small">Tổng sinh viên đếm duy nhất trong bộ lọc; bảng chi tiết và trạng thái đếm theo đăng ký từng đợt. Báo cáo lấy lần nộp mới nhất.</p>
      <div className="admin-chart-grid">
        <Panel title="Số lượng sinh viên theo ngành">{data['by-major'].length ? <><div className="admin-chart" style={{ height: 320 }}><Bar data={{ labels: data['by-major'].slice(0, 10).map(r => r.tenNganh || 'Chưa cập nhật'), datasets: [{ label: 'Sinh viên', data: data['by-major'].slice(0, 10).map(r => r.tongSinhVien), backgroundColor: '#4596fa', borderRadius: 5 }] }} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }} /></div><details><summary>Xem bảng đầy đủ theo ngành</summary><Table columns={[["tenNganh", 'Ngành'], ['tongSinhVien', 'Số sinh viên'], ['dangThucTap', 'Đang thực tập'], ['hoanThanh', 'Hoàn thành']]} rows={data['by-major']} /></details></> : empty}</Panel>
        <Panel title="Trạng thái thực tập"><Donut rows={data['registration-status']} /></Panel>
        <Panel title="Doanh nghiệp tiếp nhận sinh viên"><Table columns={[["tenDoanhNghiep", 'Doanh nghiệp'], ['tongSinhVien', 'Số sinh viên'], ['dangThucTap', 'Đang thực tập'], ['hoanThanh', 'Hoàn thành']]} rows={data['by-company']} /></Panel>
        <Panel title="Tình trạng báo cáo thực tập"><Donut rows={data['report-status']} /></Panel>
      </div>
      <Panel title="Giảng viên hướng dẫn"><Table columns={[["maGiangVien", 'Mã GV'], ['hoTen', 'Họ tên'], ['khoaDonVi', 'Khoa / đơn vị'], ['soSinhVienHuongDan', 'Đang hướng dẫn'], ['soDaHoanThanh', 'Đã hoàn thành']]} rows={data['by-lecturer']} /></Panel>
      <Panel title="Kết quả đánh giá">{data.evaluation.soDaDanhGia ? <><p>Đã đánh giá: <strong>{data.evaluation.soDaDanhGia}</strong> · Trung bình: <strong>{data.evaluation.diemTrungBinh ?? '-'}</strong> · Cao nhất: {data.evaluation.caoNhat ?? '-'} · Thấp nhất: {data.evaluation.thapNhat ?? '-'}</p><Table columns={[["nhom", 'Nhóm điểm'], ['soLuong', 'Số lượng']]} rows={data.evaluation.phanBo} /></> : <div className="admin-empty">Chưa có dữ liệu đánh giá.</div>}</Panel>
    </>}
    <Panel title="Danh sách sinh viên thực tập">{students.loading ? <p role="status">Đang tải danh sách...</p> : students.error ? <p className="text-danger" role="alert">Không thể tải danh sách. Bấm Làm mới để thử lại.</p> : table && <><Table offset={(page - 1) * 20} columns={[["maSinhVien", 'MSSV'], ['hoTen', 'Họ tên'], ['lop', 'Lớp'], ['nganh', 'Ngành'], ['tenDoanhNghiep', 'Doanh nghiệp'], ['giangVienHuongDan', 'GVHD', v => v || 'Chưa phân công'], ['trangThai', 'Trạng thái', v => labels[v] || v], ['trangThaiBaoCao', 'Báo cáo', v => labels[v] || v], ['diemTong', 'Điểm']]} rows={table.data} /><div className="d-flex justify-content-between align-items-center gap-2"><span>{table.pagination.total} đăng ký · Trang {page}/{Math.max(1, table.pagination.totalPages)}</span><div><button className="btn btn-light border me-2" disabled={page <= 1} onClick={() => { setStudents({ loading: true }); setPage(p => p - 1) }}>Trước</button><button className="btn btn-light border" disabled={page >= table.pagination.totalPages} onClick={() => { setStudents({ loading: true }); setPage(p => p + 1) }}>Sau</button></div></div></>}</Panel>
  </div>
}
