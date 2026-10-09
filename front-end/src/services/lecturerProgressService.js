import api from './api'
export const getStudents = async signal => (await api.get('/lecturer/students', { signal })).data.data
export const getStudentProgress = async (registrationId, signal) => (await api.get(`/lecturer/students/${registrationId}/progress`, { signal })).data
export const commentProgress = async (registrationId, progressId, nhanXet) => (await api.put(`/lecturer/students/${registrationId}/progress/${progressId}/comment`, { nhanXet })).data
