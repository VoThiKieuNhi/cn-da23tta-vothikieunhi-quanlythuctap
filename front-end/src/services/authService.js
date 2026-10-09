import api, { clearSession } from './api'

export const dashboardPaths = {
  ADMIN: '/admin/dashboard',
  SINH_VIEN: '/student/dashboard',
  GIANG_VIEN: '/lecturer/dashboard',
}

export async function login(email, password, remember, selectedRole) {
  const { data } = await api.post('/auth/login', { email: email.trim().toLowerCase(), password })
  if (!data.success || !data.token || !dashboardPaths[data.user?.vaiTro]) {
    throw new Error('Invalid authentication response')
  }
  if (data.user.vaiTro !== selectedRole) {
    const error = new Error('Account role mismatch')
    error.code = 'LOGIN_ROLE_MISMATCH'
    throw error
  }
  try {
    localStorage.setItem('accessToken', data.token)
    localStorage.setItem('currentUser', JSON.stringify(data.user))
    localStorage.setItem('rememberLogin', String(remember))
    sessionStorage.setItem('loginSession', 'active')
  } catch (error) {
    clearSession()
    throw error
  }
  return data.user
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  if (!data.success || !data.user?.dangHoatDong || !dashboardPaths[data.user.vaiTro]) {
    clearSession()
    throw new Error('Invalid account')
  }
  localStorage.setItem('currentUser', JSON.stringify(data.user))
  return data.user
}
