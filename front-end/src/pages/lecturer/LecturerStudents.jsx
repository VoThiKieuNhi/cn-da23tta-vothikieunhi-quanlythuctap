import { periodLabel } from '../../utils/lecturerDisplay'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getStudents } from '../../services/lecturerProgressService'
import { getReports } from '../../services/lecturerReportService'
import { registrationLabels } from '../../utils/studentWorkspace'
import StatusBadge from '../../components/StatusBadge'
import { LecturerHeader, LecturerStats, LecturerBoundary, LecturerFilters, LecturerPagination } from '../../components/LecturerWorkspace'

export default function LecturerStudents() {
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0)
  const [params, setParams] = useSearchParams(), [status, setStatus] = useState(''), [period, setPeriod] = useState(''), [page, setPage] = useState(1)
  const search = params.get('search') || ''
  useEffect(() => {
    const c = new AbortController()
    Promise.all([getStudents(c.signal), getReports({}, c.signal)]).then(([data, reports]) => { if (!c.signal.aborted) setState({ data, reports }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải danh sách sinh viên.' }) })
    return () => c.abort()
  }, [revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  const all = state.data || [], submitted = new Set((state.reports || []).map(row => String(row.registrationId)))
  const count = rows => new Set(rows.map(row => row.maSinhVien)).size
  const rows = all.filter(row => `${row.maSinhVien} ${row.hoTen}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')) && (!status || row.trangThai === status) && (!period || periodLabel(row) === period))
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / 10)))
  return <>
    <LecturerHeader title="Sinh viên hướng dẫn" subtitle="Theo dõi danh sách sinh viên được phân công hướng dẫn." />
    <LecturerStats items={[
      { label: 'Tổng sinh viên', value: state.data ? count(all) : null, icon: 'people' },
      { label: 'Đang thực tập', value: state.data ? count(all.filter(row => row.trangThai === 'DANG_THUC_TAP')) : null, icon: 'briefcase', tone: 'green' },
      { label: 'Đã nộp báo cáo', value: state.data ? count(all.filter(row => submitted.has(String(row.registrationId)))) : null, icon: 'clipboard-check', tone: 'orange' },
      { label: 'Đã hoàn thành', value: state.data ? count(all.filter(row => row.trangThai === 'HOAN_THANH')) : null, icon: 'award', tone: 'purple' },
    ]} />
    <LecturerFilters search={search} onSearch={value => { setParams(value ? { search: value } : {}, { replace: true }); setPage(1) }} status={status} onStatus={value => { setStatus(value); setPage(1) }} statuses={registrationLabels} period={period} onPeriod={value => { setPeriod(value); setPage(1) }} rows={all} onSubmit={reload} placeholder="Tìm kiếm MSSV, họ tên..." />
    <section className="lec-table-card"><LecturerBoundary state={state} retry={reload} empty={!rows.length && (all.length ? 'Không có sinh viên phù hợp bộ lọc.' : 'Bạn chưa được phân công hướng dẫn sinh viên.')}>
      <div className="table-responsive"><table className="table align-middle"><thead><tr>{['MSSV', 'Họ và tên', 'Lớp', 'Doanh nghiệp', 'Đợt thực tập', 'Trạng thái', 'Tiến độ', 'Thao tác'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice((current - 1) * 10, current * 10).map(row => <tr key={row.registrationId}><td>{row.maSinhVien}</td><td>{row.hoTen}</td><td>{row.lop || '—'}</td><td>{row.tenDoanhNghiep}</td><td>{periodLabel(row) || <span className="lec-muted">Chưa có dữ liệu</span>}</td><td><StatusBadge status={row.trangThai} /></td><td>{typeof row.percent === 'number' && row.percent >= 0 && row.percent <= 100 ? <div className="lec-progress"><progress max="100" value={row.percent} />{row.percent}%</div> : <span className="lec-muted">Chưa có dữ liệu</span>}</td><td><Link className="btn btn-outline-primary btn-sm" to={`/lecturer/students/${row.registrationId}/progress`}>Xem tiến độ</Link></td></tr>)}</tbody></table></div><LecturerPagination total={rows.length} page={current} onPage={setPage} />
    </LecturerBoundary></section>
  </>
}
