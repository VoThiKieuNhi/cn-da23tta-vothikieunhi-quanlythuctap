import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import StudentLayout from './layouts/StudentLayout'
import LecturerLayout from './layouts/LecturerLayout'
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const LecturerStudents = lazy(() => import('./pages/lecturer/LecturerStudents'))
const LecturerReports = lazy(() => import('./pages/lecturer/LecturerReports'))
const LecturerEvaluations = lazy(() => import('./pages/lecturer/LecturerEvaluations'))
const LecturerStudentProgress = lazy(() => import('./pages/lecturer/LecturerStudentProgress'))
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentInternshipRegistration = lazy(() => import('./pages/student/StudentInternshipRegistration'))
const StudentProgress = lazy(() => import('./pages/student/StudentProgress'))
const StudentReports = lazy(() => import('./pages/student/StudentReports'))
const StudentEvaluation = lazy(() => import('./pages/student/StudentEvaluation'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'))
const AdminLecturers = lazy(() => import('./pages/admin/AdminLecturers'))
const AdminCompanies = lazy(() => import('./pages/admin/AdminCompanies'))
const AdminInternshipPeriods = lazy(() => import('./pages/admin/AdminInternshipPeriods'))
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'))
const AdminAssignments = lazy(() => import('./pages/admin/AdminAssignments'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login key="main-login" />} />
        <Route path="/admin/login" element={<Login key="admin-login" admin />} />
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<div className="admin-panel admin-loading" role="status">Đang tải Dashboard...</div>}><AdminDashboard /></Suspense>} />
          <Route path="students" element={<Suspense fallback={<div className="admin-loading" role="status">Đang tải trang sinh viên...</div>}><AdminStudents /></Suspense>} />
          <Route path="lecturers" element={<Suspense fallback={<div className="admin-loading" role="status">Đang tải trang giảng viên...</div>}><AdminLecturers /></Suspense>} />
          <Route path="companies" element={<Suspense fallback={<div className="admin-loading" role="status">Đang tải trang doanh nghiệp...</div>}><AdminCompanies /></Suspense>} />
          <Route path="internship-periods" element={<Suspense fallback={<div className="admin-loading" role="status">Đang tải trang đợt thực tập...</div>}><AdminInternshipPeriods /></Suspense>} />
          <Route path="registrations" element={<Suspense fallback={<div className="admin-loading" role="status">Đang tải đăng ký...</div>}><AdminRegistrations /></Suspense>} />
          <Route path="assignments" element={<Suspense fallback={<div className="admin-loading">Đang tải phân công...</div>}><AdminAssignments /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><AdminReports /></Suspense>} />
        </Route>
        <Route path="/student" element={<ProtectedRoute role="SINH_VIEN"><StudentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><StudentDashboard /></Suspense>} />
          <Route path="internship-registration" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><StudentInternshipRegistration /></Suspense>} />
          <Route path="progress" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><StudentProgress /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><StudentReports /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<div role="status">Loading...</div>}><StudentProfile /></Suspense>} />
          <Route path="evaluation" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><StudentEvaluation /></Suspense>} />
        </Route>
        <Route path="/lecturer" element={<ProtectedRoute role="GIANG_VIEN"><LecturerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="students" replace />} />
          <Route path="dashboard" element={<Navigate to="/lecturer/students" replace />} />
          <Route path="students" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><LecturerStudents /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><LecturerReports /></Suspense>} />
          <Route path="evaluations" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><LecturerEvaluations /></Suspense>} />
          <Route path="students/:registrationId/progress" element={<Suspense fallback={<div className="admin-loading">Đang tải...</div>}><LecturerStudentProgress /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
import { lazy, Suspense } from 'react'
