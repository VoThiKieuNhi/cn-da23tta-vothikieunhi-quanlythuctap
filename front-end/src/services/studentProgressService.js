import api from './api'
export const getProgress = async signal => (await api.get('/student/progress', { signal })).data
export const getProgressDetail = async id => (await api.get(`/student/progress/${id}`)).data.data
export const createProgress = async body => (await api.post('/student/progress', body)).data
export const updateProgress = async (id, body) => (await api.put(`/student/progress/${id}`, body)).data
export const deleteProgress = async id => (await api.delete(`/student/progress/${id}`)).data
