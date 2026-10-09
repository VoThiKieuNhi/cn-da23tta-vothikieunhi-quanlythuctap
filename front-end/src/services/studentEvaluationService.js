import api from './api'
export const getEvaluation = async signal => (await api.get('/student/evaluation', { signal })).data
