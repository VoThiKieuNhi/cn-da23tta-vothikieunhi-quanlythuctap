import api from './api'
export const getOpenInternshipPeriods = async signal => (await api.get('/student/internship-periods/open', { signal })).data.data
export const getCompanies = async (search = '', signal) => (await api.get('/student/companies', { params: { search }, signal })).data.data
export const getCompanySupervisors = async (companyId, signal) => (await api.get(`/student/companies/${companyId}/supervisors`, { signal })).data.data
export const getMyRegistration = async signal => (await api.get('/student/internship-registration', { signal })).data
export const createRegistration = async data => (await api.post('/student/internship-registration', data)).data
export const updateRegistration = async (id, data) => (await api.put(`/student/internship-registration/${id}`, data)).data
export const deleteRegistration = async id => (await api.delete(`/student/internship-registration/${id}`)).data
