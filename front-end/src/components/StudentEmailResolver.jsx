import { useEffect, useRef, useState } from 'react'
import { resolveStudentEmail } from '../services/referenceService'
import { emailError } from '../utils/validators'
export default function StudentEmailResolver({ form, setForm, busy }) {
  const [state, setState] = useState({}), controller = useRef(null)
  useEffect(() => () => controller.current?.abort(), [form.email])
  async function resolve() {
    const email = form.email.trim().toLowerCase(), message = emailError(email, 'SINH_VIEN')
    if (message) { setState({ email, error: message }); return }
    controller.current?.abort(); const c = new AbortController(); controller.current = c; setState({ email, loading: true })
    try {
      const data = await resolveStudentEmail(email, c.signal); if (c.signal.aborted) return
      setState({ email, data })
      if (!data.existingStudent && data.maSinhVien) setForm(v => v.email.trim().toLowerCase() !== email ? v : ({ ...v, maSinhVien: data.maSinhVien, khoaHoc: String(data.khoaHoc), nganh: data.majors.length === 1 ? data.majors[0].tenNganh : '', lop: '' }))
    } catch (err) { if (!c.signal.aborted) setState({ email, error: err.response?.data?.message || 'Không thể tra cứu email.' }) }
  }
  const current = state.email === form.email.trim().toLowerCase() ? state : {}, data = current.data
  return <div className="mb-3"><button className="btn btn-light border" type="button" disabled={busy || current.loading} onClick={resolve}>{current.loading ? 'Đang tra cứu...' : 'Tra MSSV / ngành / khóa từ email'}</button>{current.error && <p className="text-danger mt-2" role="alert">{current.error}</p>}{data && <div className="alert alert-info mt-2 mb-0" role="status">{data.existingStudent ? <>Email đã có hồ sơ: {data.student.hoTen} · MSSV {data.student.maSinhVien} · {data.student.lop || 'Chưa có lớp'}. Vui lòng sửa hồ sơ hiện có, không tạo trùng.</> : <>{data.maSinhVien && <>MSSV {data.maSinhVien} · Khóa {data.khoaHoc}. </>}{data.majors.length === 1 ? <>Ngành {data.majors[0].tenNganh}. Hãy chọn lớp phù hợp từ danh mục.</> : data.message} Họ tên, ngày sinh và SĐT do Admin nhập từ thông tin thực tế.</>}</div>}</div>
}
