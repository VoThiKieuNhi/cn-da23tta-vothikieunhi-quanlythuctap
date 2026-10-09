import api from './api'
const params = values => Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''))
export async function getReportOptions(signal) { return (await api.get('/admin/reports/options', { signal })).data.data }
export async function getReportSummary(query, signal) { return (await api.get('/admin/reports/summary', { params: params(query), signal })).data.data }
export async function getReportStudents(query, signal) { return (await api.get('/admin/reports/students', { params: params(query), signal })).data }
export async function exportReports(query) {
  const response = await api.get('/admin/reports/export', { params: params(query), responseType: 'blob' })
  const url = URL.createObjectURL(response.data), anchor = document.createElement('a')
  anchor.href = url
  anchor.download = response.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] || 'bao_cao_thuc_tap.xlsx'
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
