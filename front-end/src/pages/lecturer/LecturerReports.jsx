import { useEffect, useState } from 'react'
import { StudentHeader, StudentCard, EmptyState } from '../../components/StudentWorkspace'
import { ReportBadge } from '../../components/ReportDetails'
import ReportDialog from '../../components/ReportDialog'
import { getReports, getReportById, downloadReport, requestRevision, approveReport } from '../../services/lecturerReportService'
import { reportLabels } from '../../utils/reportLabels'
import { formatTime } from '../../utils/studentWorkspace'
export default function LecturerReports() {
  const [state, setState] = useState({ loading: true }), [search, setSearch] = useState(''), [status, setStatus] = useState(''), [revision, setRevision] = useState(0), [modal, setModal] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { const c = new AbortController(); const timer = setTimeout(() => { getReports({ search, trangThai: status }, c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải danh sách báo cáo.' }) }) }, 250); return () => { clearTimeout(timer); c.abort() } }, [search, status, revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  async function action(mode, row) {
    if (busy) return
    setBusy(true); setError('')
    try { if (mode === 'download') await downloadReport(row.id, row.tenFile); else setModal({ mode, report: await getReportById(row.id) }) }
    catch (err) { setError(err.response?.data?.message || 'Không thể mở báo cáo.') } finally { setBusy(false) }
  }
  async function confirm(comment) { if (modal.mode === 'revision') await requestRevision(modal.report.id, comment); else await approveReport(modal.report.id); setNotice(modal.mode === 'revision' ? 'Đã gửi yêu cầu chỉnh sửa.' : 'Đã duyệt báo cáo.'); reload() }
  return <><StudentHeader title="Quản lý báo cáo thực tập" subtitle="Xem, yêu cầu chỉnh sửa và duyệt báo cáo của sinh viên được phân công." />{notice && <div className="alert alert-success" role="status">{notice}</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}
    <StudentCard title="Danh sách báo cáo" icon="file-earmark-text"><div className="report-filters"><input className="form-control" aria-label="Tìm báo cáo" placeholder="Tìm MSSV, họ tên, tên báo cáo..." maxLength={200} value={search} onChange={e => { setSearch(e.target.value); setState({ loading: true }) }} /><select className="form-select" aria-label="Trạng thái báo cáo" value={status} onChange={e => { setStatus(e.target.value); setState({ loading: true }) }}><option value="">Tất cả trạng thái</option>{Object.entries(reportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="btn btn-light" onClick={reload}>Làm mới</button></div>
      {state.loading ? <p role="status">Đang tải báo cáo...</p> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={reload}>Thử lại</button></div> : !state.data.length ? <EmptyState text="Chưa có báo cáo phù hợp." /> : <div className="table-responsive"><table className="table student-table align-middle"><thead><tr>{['STT', 'MSSV', 'Họ tên', 'Doanh nghiệp', 'Tên báo cáo', 'Ngày nộp', 'Trạng thái', 'Thao tác'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{state.data.map((row, index) => <tr key={row.id}><td>{index + 1}</td><td>{row.maSinhVien}</td><td>{row.hoTen}</td><td>{row.tenDoanhNghiep}</td><td>{row.tenBaoCao}</td><td>{formatTime(row.ngayNop)}</td><td><ReportBadge status={row.trangThai} /></td><td><div className="report-actions"><button className="btn btn-light btn-sm" disabled={busy} onClick={() => action('view', row)}>Xem</button><button className="btn btn-light btn-sm" disabled={busy} onClick={() => action('download', row)}>Tải xuống</button>{row.trangThai === 'DA_NOP' && <><button className="btn btn-light btn-sm" disabled={busy} onClick={() => action('revision', row)}>Yêu cầu chỉnh sửa</button><button className="btn btn-primary btn-sm" disabled={busy} onClick={() => action('approve', row)}>Duyệt</button></>}</div></td></tr>)}</tbody></table></div>}
    </StudentCard>{modal && <ReportDialog {...modal} onClose={() => setModal(null)} onConfirm={confirm} />}
  </>
}
