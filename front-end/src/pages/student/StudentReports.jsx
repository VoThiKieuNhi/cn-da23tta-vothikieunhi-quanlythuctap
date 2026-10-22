import StudentReportView from '../../components/StudentReportView'
import { useEffect, useState } from 'react'
import { StudentHeader } from '../../components/StudentWorkspace'
import ReportDialog from '../../components/ReportDialog'
import { getReport, submitReport, updateReport, deleteReport, downloadReport } from '../../services/studentReportService'
export default function StudentReports() {
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0), [editing, setEditing] = useState(false), [deleting, setDeleting] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState(''), [downloading, setDownloading] = useState(false)
  useEffect(() => { const c = new AbortController(); getReport(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải báo cáo.' }) }); return () => c.abort() }, [revision])
  function reload() { setEditing(false); setState({ loading: true }); setRevision(v => v + 1) }
  const data = state.data, report = data?.report
  async function save(title, file) { if (report) await updateReport(report.id, title, file); else await submitReport(title, file); setNotice('Đã nộp báo cáo thực tập.'); reload() }
  async function remove() { await deleteReport(report.id); setNotice('Đã xóa báo cáo.'); reload() }
  async function download() { setError(''); setDownloading(true); try { await downloadReport(report.id, report.tenFile) } catch (err) { setError(err.response?.data?.message || 'Không thể tải tệp báo cáo.') } finally { setDownloading(false) } }
  return <><StudentHeader title="Báo cáo thực tập" subtitle="Nộp và theo dõi các báo cáo thực tập." />
    {notice && <div className="alert alert-success" role="status">{notice}</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}
    {state.loading ? <div className="admin-loading" role="status">Đang tải báo cáo...</div> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={reload}>Thử lại</button></div> : <>
      <StudentReportView data={data} editing={editing} setEditing={setEditing} setDeleting={setDeleting} downloading={downloading} download={download} save={save} />
    </>}
    {deleting && report && <ReportDialog mode="delete" report={report} onClose={() => setDeleting(false)} onConfirm={remove} />}
  </>
}
