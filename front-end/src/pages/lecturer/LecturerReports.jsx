import { periodLabel } from '../../utils/lecturerDisplay'
import { useEffect, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import ReportDialog from '../../components/ReportDialog'
import { getReports, getReportById, downloadReport, requestRevision, approveReport } from '../../services/lecturerReportService'
import { reportLabels } from '../../utils/reportLabels'
import { formatTime } from '../../utils/studentWorkspace'
import { LecturerHeader, LecturerStats, LecturerBoundary, LecturerFilters, LecturerPagination } from '../../components/LecturerWorkspace'

export default function LecturerReports() {
  const [state, setState] = useState({ loading: true }), [search, setSearch] = useState(''), [status, setStatus] = useState(''), [period, setPeriod] = useState(''), [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0), [modal, setModal] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { const c = new AbortController(); getReports({}, c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải danh sách báo cáo.' }) }); return () => c.abort() }, [revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  async function action(mode, row) {
    if (busy) return
    setBusy(true); setError('')
    try { if (mode === 'download') await downloadReport(row.id, row.tenFile); else setModal({ mode, report: await getReportById(row.id) }) }
    catch (err) { setError(err.response?.data?.message || 'Không thể mở báo cáo.') } finally { setBusy(false) }
  }
  async function confirm(comment) { if (modal.mode === 'revision') await requestRevision(modal.report.id, comment); else await approveReport(modal.report.id); setNotice(modal.mode === 'revision' ? 'Đã gửi yêu cầu chỉnh sửa.' : 'Đã duyệt báo cáo.'); reload() }
  const all = state.data || [], rows = all.filter(row => `${row.maSinhVien} ${row.hoTen} ${row.tenBaoCao}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')) && (!status || row.trangThai === status) && (!period || periodLabel(row) === period))
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / 10)))
  return <><LecturerHeader title="Báo cáo thực tập" subtitle="Xem và xử lý báo cáo của sinh viên được phân công." />
    <LecturerStats items={[
      { label: 'Tổng báo cáo', value: state.data ? all.length : null, icon: 'files' },
      { label: 'Chờ xem', value: state.data ? all.filter(row => row.trangThai === 'DA_NOP').length : null, icon: 'file-earmark-check', tone: 'green' },
      { label: 'Cần chỉnh sửa', value: state.data ? all.filter(row => row.trangThai === 'CAN_CHINH_SUA').length : null, icon: 'clipboard', tone: 'orange' },
      { label: 'Đã duyệt', value: state.data ? all.filter(row => row.trangThai === 'DA_DUYET').length : null, icon: 'clipboard-check', tone: 'purple' },
    ]} />
    {notice && <div className="alert alert-success" role="status">{notice}</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}
    <LecturerFilters search={search} onSearch={value => { setSearch(value); setPage(1) }} status={status} onStatus={value => { setStatus(value); setPage(1) }} statuses={reportLabels} period={period} onPeriod={value => { setPeriod(value); setPage(1) }} rows={all} onSubmit={reload} placeholder="Tìm MSSV, họ tên, tên báo cáo..." />
    <section className="lec-table-card"><LecturerBoundary state={state} retry={reload} empty={!rows.length && (all.length ? 'Không có báo cáo phù hợp bộ lọc.' : 'Chưa có báo cáo thực tập cần xử lý.')}>
      <div className="table-responsive"><table className="table align-middle"><thead><tr>{['MSSV', 'Sinh viên', 'Tên báo cáo', 'Ngày nộp', 'Dung lượng', 'Trạng thái', 'Thao tác'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice((current - 1) * 10, current * 10).map(row => <tr key={row.id}><td>{row.maSinhVien}</td><td>{row.hoTen}</td><td>{row.tenBaoCao}</td><td>{formatTime(row.ngayNop)}</td><td><span className="lec-muted">Chưa có dữ liệu</span></td><td><StatusBadge status={row.trangThai} /></td><td><div className="report-actions"><button className="btn btn-outline-primary btn-sm" disabled={busy} onClick={() => action('view', row)}>Xem</button><button className="btn btn-light btn-sm" disabled={busy} onClick={() => action('download', row)} aria-label={`Tải ${row.tenBaoCao}`} title="Tải xuống"><i className="bi bi-download" /></button>{row.trangThai === 'DA_NOP' && <><button className="btn btn-outline-danger btn-sm" disabled={busy} onClick={() => action('revision', row)}>Yêu cầu chỉnh sửa</button><button className="btn btn-success btn-sm" disabled={busy} onClick={() => action('approve', row)}>Duyệt</button></>}</div></td></tr>)}</tbody></table></div><LecturerPagination total={rows.length} page={current} onPage={setPage} />
    </LecturerBoundary></section>{modal && <ReportDialog {...modal} title={modal.mode === 'revision' ? 'Yêu cầu chỉnh sửa báo cáo' : undefined} confirmMessage={modal.mode === 'approve' ? 'Xác nhận duyệt báo cáo thực tập này?' : undefined} onClose={() => setModal(null)} onConfirm={confirm} />}
  </>
}
