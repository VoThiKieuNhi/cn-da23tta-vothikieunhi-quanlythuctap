import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { dashboardPaths, getCurrentUser } from '../services/authService'
import { clearSession } from '../services/api'

export default function ProtectedRoute({ role, children }) {
  const [state, setState] = useState(() => ({ loading: !!localStorage.getItem('accessToken') }))
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    if (!localStorage.getItem('accessToken')) {
      return
    }
    getCurrentUser().then((user) => {
      if (active) setState({ loading: false, user })
    }).catch((error) => {
      if (!active) return
      if ([401, 403].includes(error.response?.status) || !localStorage.getItem('accessToken')) {
        clearSession()
        setState({ loading: false })
      } else setState({ loading: false, error: true })
    })
    return () => { active = false }
  }, [attempt])

  if (state.loading) return <div className="container py-5" role="status"><span className="spinner-border spinner-border-sm me-2" />Đang xác thực...</div>
  if (state.error) return <div className="container py-5"><p role="alert">Không thể kết nối đến hệ thống. Vui lòng thử lại.</p><button className="btn btn-primary" onClick={() => { setState({ loading: true }); setAttempt(attempt + 1) }}>Thử lại</button></div>
  if (!state.user) return <Navigate to="/login" replace />
  if (state.user.vaiTro !== role) return <Navigate to={dashboardPaths[state.user.vaiTro]} replace />
  return children
}
