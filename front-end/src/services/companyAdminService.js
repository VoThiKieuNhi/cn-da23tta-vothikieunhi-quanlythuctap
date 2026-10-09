import api from './api'

export async function getCompanies(params, signal) { return (await api.get('/admin/companies', { params, signal })).data }
export async function getCompanyById(id, signal) { return (await api.get(`/admin/companies/${id}`, { signal })).data.data }
export async function createCompany(data) { return (await api.post('/admin/companies', data)).data }
export async function updateCompany(id, data) { return (await api.put(`/admin/companies/${id}`, data)).data }
export async function deleteCompany(id) { return (await api.delete(`/admin/companies/${id}`)).data }
export async function getSupervisors(companyId, signal) { return (await api.get(`/admin/companies/${companyId}/supervisors`, { signal })).data.data }
export async function createSupervisor(companyId, data) { return (await api.post(`/admin/companies/${companyId}/supervisors`, data)).data }
export async function updateSupervisor(companyId, id, data) { return (await api.put(`/admin/companies/${companyId}/supervisors/${id}`, data)).data }
export async function deleteSupervisor(companyId, id) { return (await api.delete(`/admin/companies/${companyId}/supervisors/${id}`)).data }
