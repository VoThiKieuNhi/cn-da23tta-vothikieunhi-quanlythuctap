import api from './api'
export const getEvaluations = async (params, signal) => (await api.get('/lecturer/evaluations', { params, signal })).data
export const getEvaluationDetail = async registrationId => (await api.get(`/lecturer/evaluations/${registrationId}`)).data
export const createEvaluation = async (registrationId, body) => (await api.post(`/lecturer/evaluations/${registrationId}`, body)).data
export const updateEvaluation = async (registrationId, body) => (await api.put(`/lecturer/evaluations/${registrationId}`, body)).data
