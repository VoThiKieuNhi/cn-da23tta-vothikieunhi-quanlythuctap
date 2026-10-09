import api from './api'
export const getStudentWorkspace = async signal => (await api.get('/student/workspace', { signal })).data.data
