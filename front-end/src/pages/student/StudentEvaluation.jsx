import { useEffect, useState } from 'react'
import { StudentHeader, StudentCard, StudentStats, EmptyState } from '../../components/StudentWorkspace'
import { formatTime, formatDate } from '../../utils/studentWorkspace'
import { formatScore, scoreFields } from '../../utils/evaluationScores'
import { getEvaluation } from '../../services/studentEvaluationService'
export default function StudentEvaluation() {
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0)
  useEffect(() => { const c = new AbortController(); getEvaluation(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải kết quả đánh giá.' }) }); return () => c.abort() }, [revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  const data = state.data, evaluation = data?.evaluation, s = data?.student, r = data?.internship
  return <><StudentHeader title="Kết quả đánh giá" subtitle="Xem kết quả và nhận xét sau quá trình thực tập."><button className="btn btn-light" onClick={reload}>Làm mới</button></StudentHeader>
    {state.loading ? <div className="admin-loading" role="status">Đang tải kết quả...</div> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={reload}>Thử lại</button></div> : <>
      <StudentStats items={[['diemTong', 'Điểm tổng', 'award', 'blue'], ['diemChuyenMon', 'Chuyên môn', 'briefcase', 'green'], ['diemThaiDo', 'Thái độ', 'person-check', 'orange'], ['diemBaoCao', 'Báo cáo', 'file-earmark-check', 'purple']].map(([key, label, icon, tone]) => ({ label, icon, tone, value: formatScore(evaluation?.[key]) }))} />
      {!evaluation && <StudentCard title="Kết quả đánh giá" icon="award"><EmptyState text="Chưa có kết quả đánh giá." detail="Kết quả sẽ được hiển thị sau khi giảng viên hoàn thành đánh giá thực tập." icon="award" /></StudentCard>}
      <div className="sw-two-column"><StudentCard title="Thông tin đánh giá" icon="person-vcard"><dl className="sw-profile-grid">{[['Sinh viên', s.hoTen], ['MSSV', s.maSinhVien], ['Lớp', s.lop], ['Ngành', s.nganh], ['Doanh nghiệp', r?.tenDoanhNghiep], ['Vị trí thực tập', r?.viTriThucTap], ['Giảng viên hướng dẫn', r?.giangVienHuongDan], ['Thời gian thực tập', r ? `${formatDate(r.ngayBatDau)} – ${formatDate(r.ngayKetThuc)}` : null], ['Ngày đánh giá', evaluation ? formatTime(evaluation.ngayDanhGia) : null]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa có dữ liệu'}</dd></div>)}</dl></StudentCard>
        <StudentCard title="Kết quả chung" icon="trophy"><div className="sw-score-circle"><span>Điểm tổng</span><strong>{evaluation ? formatScore(evaluation.diemTong) : '—'}</strong><small>{evaluation ? '/ 10' : 'Chưa có kết quả'}</small></div>{evaluation && <p className="sw-score-caption">Trung bình cộng 3 điểm thành phần<br />{formatTime(evaluation.ngayDanhGia)}</p>}</StudentCard></div>
      <StudentCard title="Nhận xét của giảng viên" icon="chat-square-quote">{evaluation ? <article className="sw-journal-entry"><p>{evaluation.nhanXet}</p></article> : <EmptyState text="Chưa có nhận xét giảng viên." icon="chat-left-text" />}</StudentCard>
      <StudentCard title="Chi tiết điểm số" icon="list-check"><div className="table-responsive"><table className="table student-table align-middle"><thead><tr><th scope="col">Nội dung</th><th scope="col">Điểm</th></tr></thead><tbody>{[...scoreFields, ['diemTong', 'Điểm tổng']].map(([key, label]) => <tr key={key}><th scope="row">{label}</th><td>{formatScore(evaluation?.[key])}</td></tr>)}</tbody></table></div></StudentCard>
    </>}
  </>
}
