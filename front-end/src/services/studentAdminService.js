import api from './api'

export async function getStudents(params, signal) {
  return (await api.get('/admin/students', { params, signal })).data
}
export async function getStudentById(id, signal) {
  return (await api.get(`/admin/students/${id}`, { signal })).data.data
}
export async function createStudent(data) {
  return (await api.post('/admin/students', data)).data
}
export async function updateStudent(id, data) {
  return (await api.put(`/admin/students/${id}`, data)).data
}
export async function deleteStudent(id) {
  return (await api.delete(`/admin/students/${id}`)).data
}
