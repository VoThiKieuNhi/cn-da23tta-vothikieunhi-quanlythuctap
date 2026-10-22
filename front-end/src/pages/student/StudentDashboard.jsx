import { useEffect, useState } from 'react'
import { WorkspaceBoundary } from '../../components/StudentWorkspace'
import { getOpenInternshipPeriods, getMyRegistration } from '../../services/studentInternshipService'
import StudentDashboardView from './StudentDashboardView'
import '../../assets/css/student-dashboard-v2.css'

export default function StudentDashboard() {
  const [summary, setSummary] = useState({ loading: true }), [revision, setRevision] = useState(0)
  useEffect(() => {
    const c = new AbortController()
    Promise.all([getOpenInternshipPeriods(c.signal), getMyRegistration(c.signal)]).then(([periods, mine]) => {
      if (!c.signal.aborted) setSummary({ periods, registrations: mine.data })
    }).catch(() => { if (!c.signal.aborted) setSummary({ error: true }) })
    return () => c.abort()
  }, [revision])
  const count = status => summary.registrations?.filter(item => item.trangThai === status).length
  return <WorkspaceBoundary>{data => <StudentDashboardView data={data} summary={summary} count={count} onRetry={() => { setSummary({ loading: true }); setRevision(v => v + 1) }} />}</WorkspaceBoundary>
}
