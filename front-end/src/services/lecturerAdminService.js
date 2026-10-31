import api from './api'

export async function getLecturers(params, signal) {
  return (await api.get('/admin/lecturers', { params, signal })).data
}
export async function getLecturerById(id, signal) {
  return (await api.get(`/admin/lecturers/${id}`, { signal })).data.data
}
export async function createLecturer(data) {
  return (await api.post('/admin/lecturers', data)).data
}
export async function updateLecturer(id, data) {
  return (await api.put(`/admin/lecturers/${id}`, data)).data
}
export async function deleteLecturer(id) {
  return (await api.delete(`/admin/lecturers/${id}`)).data
}

export async function deactivateLecturer(id) { return (await api.patch(`/admin/lecturers/${id}/deactivate`)).data }
