import api from './api'
export const getAssignments = async (params, signal) => (await api.get('/admin/assignments', { params, signal })).data
export const assignLecturer = async (id, data) => (await api.post(`/admin/assignments/${id}`, data)).data
export const updateAssignment = async (id, data) => (await api.put(`/admin/assignments/${id}`, data)).data
