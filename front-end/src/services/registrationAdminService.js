import api from './api'
const path = '/admin/registrations'
export const getRegistrations = async (params, signal) => (await api.get(path, { params, signal })).data
export const getRegistrationById = async (id, signal) => (await api.get(`${path}/${id}`, { signal })).data.data
export const approveRegistration = async id => (await api.put(`${path}/${id}/approve`)).data
export const rejectRegistration = async (id, lyDo) => (await api.put(`${path}/${id}/reject`, { lyDo })).data
