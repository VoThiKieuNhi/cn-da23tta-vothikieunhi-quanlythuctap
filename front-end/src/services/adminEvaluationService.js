import api from './api'
export const getEvaluations = async (params, signal) => (await api.get('/admin/evaluations', { params, signal })).data
export const getEvaluationDetail = async registrationId => (await api.get(`/admin/evaluations/${registrationId}`)).data
