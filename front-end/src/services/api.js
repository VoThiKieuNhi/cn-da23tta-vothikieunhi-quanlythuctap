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
    if (window.location.pathname !== '/login') window.location.replace('/login')
  }
  return Promise.reject(error)
})

export default api
