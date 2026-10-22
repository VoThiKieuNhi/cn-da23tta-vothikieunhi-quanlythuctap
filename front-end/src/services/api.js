import axios from 'axios'

export function clearSession() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('rememberLogin')
  sessionStorage.removeItem('loginSession')
}

// Non-remembered credentials remain usable only in the current browser session.
if (localStorage.getItem('rememberLogin') === 'false' && !sessionStorage.getItem('loginSession')) {
  clearSession()
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token && config.url !== '/auth/login') config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
    clearSession()
    const loginPath = /^\/admin(?:\/|$)/.test(window.location.pathname) ? '/admin/login' : '/login'
    if (window.location.pathname !== loginPath) window.location.replace(loginPath)
  }
  return Promise.reject(error)
})

export default api
