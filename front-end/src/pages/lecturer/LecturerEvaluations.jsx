import { periodLabel } from '../../utils/lecturerDisplay'
import { useEffect, useState } from 'react'
import EvaluationDialog from '../../components/EvaluationDialog'
import StatusBadge from '../../components/StatusBadge'
import { getEvaluations, getEvaluationDetail, createEvaluation, updateEvaluation } from '../../services/lecturerEvaluationService'
import { formatScore } from '../../utils/evaluationScores'
import * as adminEvaluation from '../../services/adminEvaluationService'
import { LecturerHeader, LecturerStats, LecturerBoundary, LecturerFilters, LecturerPagination } from '../../components/LecturerWorkspace'

export default function LecturerEvaluations({ readOnly = false }) {
  const [state, setState] = useState({ loading: true }), [search, setSearch] = useState(''), [status, setStatus] = useState(''), [period, setPeriod] = useState(''), [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0), [modal, setModal] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { const c = new AbortController(); (readOnly ? adminEvaluation.getEvaluations : getEvaluations)({}, c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải danh sách đánh giá.' }) }); return () => c.abort() }, [revision, readOnly])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  async function open(mode, row) { if (busy || readOnly && mode !== 'view') return; setBusy(true); setError(''); try { const data = await (readOnly ? adminEvaluation.getEvaluationDetail : getEvaluationDetail)(row.registrationId); setModal({ mode, data, registrationId: row.registrationId }) } catch (err) { setError(err.response?.data?.message || 'Không thể mở đánh giá.') } finally { setBusy(false) } }
  async function save(body) { if (readOnly) return; if (modal.mode === 'edit') await updateEvaluation(modal.registrationId, body); else await createEvaluation(modal.registrationId, body); setNotice('Đã lưu kết quả đánh giá.'); reload() }
  const all = state.data?.data || [], stats = state.data?.stats
  const rowStatus = row => row.evaluation ? 'DA_DANH_GIA' : row.eligibleForEvaluation ? 'CHUA_DANH_GIA' : 'CHO_DIEU_KIEN'
  const statuses = { CHUA_DANH_GIA: 'Chưa đánh giá', DA_DANH_GIA: 'Đã đánh giá', CHO_DIEU_KIEN: 'Chờ đủ điều kiện' }
  const rows = all.filter(row => `${row.maSinhVien} ${row.hoTen} ${row.tenDoanhNghiep}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')) && (!status || rowStatus(row) === status) && (!period || periodLabel(row) === period))
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / 10)))
  return <><LecturerHeader title="Đánh giá thực tập" subtitle="Đánh giá kết quả thực tập của sinh viên." />
    <LecturerStats items={[
      { label: 'Tổng sinh viên', value: stats?.tongSinhVien, icon: 'people' },
      { label: 'Chưa đánh giá', value: state.data ? all.filter(row => !row.evaluation && row.eligibleForEvaluation).length : null, icon: 'shield-check', tone: 'green' },
      { label: 'Đã đánh giá', value: stats?.daDanhGia, icon: 'clipboard-check', tone: 'orange' },
      { label: 'Chờ đủ điều kiện', value: state.data ? all.filter(row => !row.evaluation && !row.eligibleForEvaluation).length : null, icon: 'hourglass', tone: 'purple' },
    ]} />
    {notice && <div className="alert alert-success" role="status">{notice}</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}
    <LecturerFilters search={search} onSearch={value => { setSearch(value); setPage(1) }} status={status} onStatus={value => { setStatus(value); setPage(1) }} statuses={statuses} period={period} onPeriod={value => { setPeriod(value); setPage(1) }} rows={all} onSubmit={reload} placeholder="Tìm kiếm MSSV, họ tên..." />
    <section className="lec-table-card"><LecturerBoundary state={state} retry={reload} empty={!rows.length && (all.length ? 'Không có sinh viên phù hợp bộ lọc.' : 'Chưa có sinh viên đủ điều kiện đánh giá.')}>
      <div className="table-responsive"><table className="table align-middle"><thead><tr>{['MSSV', 'Sinh viên', 'Doanh nghiệp', 'Báo cáo', 'Trạng thái', 'Điểm tổng', 'Thao tác'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice((current - 1) * 10, current * 10).map(row => <tr key={row.registrationId}><td>{row.maSinhVien}</td><td>{row.hoTen}</td><td>{row.tenDoanhNghiep}</td><td><StatusBadge status={row.baoCao?.trangThai} /></td><td><StatusBadge status={row.evaluation ? 'DA_DUYET' : row.eligibleForEvaluation ? 'CAN_CHINH_SUA' : 'CHO_BAT_DAU'} label={statuses[rowStatus(row)]} /></td><td className="lec-score">{row.evaluation ? formatScore(row.evaluation.diemTong) : '—'}</td><td>{row.evaluation ? <button className="btn btn-outline-primary btn-sm" disabled={busy} onClick={() => open(!readOnly && row.canEvaluate ? 'edit' : 'view', row)}>{!readOnly && row.canEvaluate ? 'Xem / Cập nhật' : 'Xem'}</button> : <button className="btn btn-outline-primary btn-sm" disabled={busy || readOnly || !row.canEvaluate} onClick={() => open('create', row)}>{row.canEvaluate && !readOnly ? 'Đánh giá' : 'Chưa đủ điều kiện'}</button>}</td></tr>)}</tbody></table></div><LecturerPagination total={rows.length} page={current} onPage={setPage} />
    </LecturerBoundary></section>{modal && <EvaluationDialog {...modal} scoreStep="0.1" onClose={() => setModal(null)} onSave={save} />}
  </>
}
