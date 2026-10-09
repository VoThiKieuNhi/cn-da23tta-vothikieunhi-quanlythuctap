import api from './api'

export async function getAdminDashboard(signal) {
  const { data } = await api.get('/admin/dashboard', { signal })
  if (!data.success || !data.data) throw new Error('Invalid dashboard response')
  return data.data
}
