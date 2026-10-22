import StudentEvaluationView from '../../components/StudentEvaluationView'
import { useEffect, useState } from 'react'
import { StudentHeader } from '../../components/StudentWorkspace'
import { getEvaluation } from '../../services/studentEvaluationService'
export default function StudentEvaluation() {
  const [state, setState] = useState({ loading: true }), [revision, setRevision] = useState(0)
  useEffect(() => { const c = new AbortController(); getEvaluation(c.signal).then(data => { if (!c.signal.aborted) setState({ data }) }).catch(err => { if (!c.signal.aborted) setState({ error: err.response?.data?.message || 'Không thể tải kết quả đánh giá.' }) }); return () => c.abort() }, [revision])
  function reload() { setState({ loading: true }); setRevision(v => v + 1) }
  const data = state.data
  return <><StudentHeader title="Kết quả đánh giá thực tập" subtitle="Xem kết quả đánh giá của giảng viên sau khi hoàn thành thực tập."><button className="btn btn-light" onClick={reload}>Làm mới</button></StudentHeader>
    {state.loading ? <div className="admin-loading" role="status">Đang tải kết quả...</div> : state.error ? <div className="alert alert-danger" role="alert">{state.error}<button className="btn btn-link" onClick={reload}>Thử lại</button></div> : <>
      <StudentEvaluationView data={data} />
    </>}
  </>
}
