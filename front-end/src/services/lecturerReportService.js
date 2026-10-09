import api from './api'
import { downloadFile } from '../utils/reportDownload'
export const getReports = async (params, signal) => (await api.get('/lecturer/reports', { params, signal })).data.data
export const getReportById = async id => (await api.get(`/lecturer/reports/${id}`)).data.data
export const downloadReport = (id, filename) => downloadFile(`/lecturer/reports/${id}/download`, filename)
export const requestRevision = async (id, nhanXet) => (await api.put(`/lecturer/reports/${id}/request-revision`, { nhanXet })).data
export const approveReport = async id => (await api.put(`/lecturer/reports/${id}/approve`)).data
