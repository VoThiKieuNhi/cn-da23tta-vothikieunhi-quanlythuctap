import { useEffect, useState } from 'react'
import { StudentHeader, StudentCard, StudentStats, EmptyState } from '../../components/StudentWorkspace'
import ReportDetails from '../../components/ReportDetails'
import ReportUploadForm from '../../components/ReportUploadForm'
import ReportDialog from '../../components/ReportDialog'
import { getReport, submitReport, updateReport, deleteReport, downloadReport } from '../../services/studentReportService'
import { reportLabels } from '../../utils/reportLabels'
import { formatTime } from '../../utils/studentWorkspace'
export default function StudentReports() {
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0), [editing, setEditing] = useState(false), [deleting, setDeleting] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState(''), [downloading, setDownloading] = useState(false)
  useEffect(() => { const c = new AbortController(); getReport(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải báo cáo.' }) }); return () => c.abort() }, [revision])
  function reload() { setEditing(false); setState({ loading: true }); setRevision(v => v + 1) }
  const data = state.data, report = data?.report
  async function save(title, file) { if (report) await updateReport(report.id, title, file); else await submitReport(title, file); setNotice('Đã nộp báo cáo thực tập.'); reload() }
  async function remove() { await deleteReport(report.id); setNotice('Đã xóa báo cáo.'); reload() }
  async function download() { setError(''); setDownloading(true); try { await downloadReport(report.id, report.tenFile) } catch (err) { setError(err.response?.data?.message || 'Không thể tải tệp báo cáo.') } finally { setDownloading(false) } }
  return <><StudentHeader title="Báo cáo thực tập" subtitle="Nộp báo cáo và theo dõi trạng thái báo cáo thực tập của bạn." />
    {notice && <div className="alert alert-success" role="status">{notice}</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}
    {state.loading ? <div className="admin-loading" role="status">Đang tải báo cáo...</div> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={reload}>Thử lại</button></div> : <>
      <StudentStats items={[{ label: 'Trạng thái báo cáo', value: reportLabels[report?.trangThai] || 'Chưa nộp', icon: 'clipboard-check' }, { label: 'Ngày nộp', value: report ? formatTime(report.ngayNop) : 'Chưa nộp', icon: 'calendar-event', tone: 'green' }, { label: 'Tên báo cáo', value: report?.tenBaoCao || 'Chưa nộp', icon: 'file-earmark-text', tone: 'orange' }, { label: 'Giảng viên hướng dẫn', value: data.registration?.giangVienHuongDan || 'Chưa phân công', icon: 'person-badge', tone: 'purple' }]} />
      <div className="sw-main-aside"><div>{data.message && <div className="alert alert-warning" role="status">{data.message}</div>}
        {report && <StudentCard title="Báo cáo đã nộp" icon="file-earmark-check">{report.trangThai === 'CAN_CHINH_SUA' && <div className="alert alert-warning">Giảng viên yêu cầu chỉnh sửa báo cáo.</div>}<ReportDetails report={report} /><div className="report-actions mt-3"><button className="btn btn-primary" onClick={download} disabled={downloading}>{downloading ? 'Đang tải...' : 'Xem/Tải xuống'}</button>{report.canEdit && !editing && <button className="btn btn-light" onClick={() => setEditing(true)}>{report.trangThai === 'CAN_CHINH_SUA' ? 'Nộp lại báo cáo' : 'Cập nhật báo cáo'}</button>}{report.canDelete && !editing && <button className="btn btn-outline-danger" onClick={() => setDeleting(true)}>Xóa báo cáo</button>}</div></StudentCard>}
        {(!report || editing) && <StudentCard title={report ? 'Cập nhật báo cáo thực tập' : 'Nộp báo cáo thực tập'} icon="cloud-arrow-up"><ReportUploadForm key={report?.id || 'new'} report={report} disabled={report ? !report.canEdit : !data.canSubmit} onSave={save} onCancel={report ? () => setEditing(false) : undefined} /></StudentCard>}
      </div><aside><StudentCard title="Lưu ý nộp báo cáo" icon="info-circle"><ol className="sw-tips"><li>Hỗ trợ PDF, DOC, DOCX, dung lượng tối đa 10MB.</li><li>Mỗi đăng ký thực tập có một báo cáo chính.</li><li>Theo dõi nhận xét và nộp lại khi giảng viên yêu cầu chỉnh sửa.</li><li>Báo cáo đã duyệt không được chỉnh sửa.</li></ol></StudentCard><StudentCard title="Tài liệu biểu mẫu" icon="folder2-open"><EmptyState text="Chưa có tài liệu biểu mẫu." icon="file-earmark" /></StudentCard></aside></div>
    </>}
    {deleting && report && <ReportDialog mode="delete" report={report} onClose={() => setDeleting(false)} onConfirm={remove} />}
  </>
}
