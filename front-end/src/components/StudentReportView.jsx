import { StudentCard, EmptyState } from './StudentWorkspace'
import ReportUploadForm from './ReportUploadForm'
import StatusBadge from './StatusBadge'
import { formatTime } from '../utils/studentWorkspace'

export default function StudentReportView({ data, editing, setEditing, setDeleting, downloading, download, save }) {
  const report = data.report
  return <>
    {data.message && <div className="alert alert-warning" role="status">{data.message}</div>}
    <div className="st-report-grid">
      <StudentCard title={editing ? 'Cập nhật báo cáo thực tập' : 'Nộp báo cáo thực tập'} icon="cloud-arrow-up">
        {(!report || editing) ? <ReportUploadForm key={report?.id || 'new'} report={report} registration={data.registration} disabled={report ? !report.canEdit : !data.canSubmit} onSave={save} onCancel={report ? () => setEditing(false) : undefined} /> : <div className="st-upload-complete"><span className="sw-stat-icon green"><i className="bi bi-file-earmark-check" /></span><h3>Bạn đã nộp báo cáo</h3><p>Theo dõi trạng thái và nhận xét của giảng viên ở danh sách bên cạnh.</p>{report.canEdit && <button className="btn btn-primary" onClick={() => setEditing(true)}>{report.trangThai === 'CAN_CHINH_SUA' ? 'Nộp lại báo cáo' : 'Cập nhật báo cáo'}</button>}</div>}
        <p className="sw-muted mt-3">Hỗ trợ PDF, DOC, DOCX, tối đa 10MB. Mỗi đăng ký có một báo cáo chính.</p>
      </StudentCard>
      <StudentCard title="Danh sách báo cáo đã nộp" icon="file-earmark-text">
        {report ? <article className="st-report-item"><span className="sw-stat-icon blue"><i className="bi bi-file-earmark-text" /></span><div><h3>{report.tenBaoCao}</h3><p>Nộp ngày: {formatTime(report.ngayNop)}</p><p className="st-file-name">{report.tenFile}</p><StatusBadge status={report.trangThai} /><p className="st-preserve-text mt-3"><strong>Nhận xét giảng viên:</strong> {report.nhanXetGiangVien || 'Chưa có nhận xét.'}</p><div className="report-actions"><button className="btn btn-outline-primary btn-sm" disabled={downloading} onClick={download}><i className="bi bi-download" /> {downloading ? 'Đang tải...' : 'Tải xuống'}</button>{report.canEdit && !editing && <button className="btn btn-light btn-sm" onClick={() => setEditing(true)}>Chỉnh sửa</button>}{report.canDelete && !editing && <button className="btn btn-outline-danger btn-sm" onClick={() => setDeleting(true)}>Xóa</button>}</div></div></article> : <EmptyState text="Bạn chưa nộp báo cáo thực tập." icon="file-earmark" />}
      </StudentCard>
    </div>
    <StudentCard title="Lưu ý nộp báo cáo" icon="info-circle"><p className="sw-muted">Kiểm tra tệp trước khi gửi. Theo dõi nhận xét và nộp lại khi giảng viên yêu cầu chỉnh sửa. Báo cáo đã duyệt không được chỉnh sửa.</p></StudentCard>
  </>
}
