import api from './api'
const path = '/admin/internship-periods'
export const getInternshipPeriods = async (params, signal) => (await api.get(path, { params, signal })).data
export const getInternshipPeriodById = async (id, signal) => (await api.get(`${path}/${id}`, { signal })).data.data
export const createInternshipPeriod = async data => (await api.post(path, data)).data
export const updateInternshipPeriod = async (id, data) => (await api.put(`${path}/${id}`, data)).data
export const deleteInternshipPeriod = async id => (await api.delete(`${path}/${id}`)).data
