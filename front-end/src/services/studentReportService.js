import api from './api'
import { downloadFile } from '../utils/reportDownload'
function body(title, file) { const data = new FormData(); data.append('tenBaoCao', title); if (file) data.append('file', file); return data }
export const getReport = async signal => (await api.get('/student/reports', { signal })).data
export const submitReport = async (title, file) => (await api.post('/student/reports', body(title, file), { timeout: 60000 })).data
export const updateReport = async (id, title, file) => (await api.put(`/student/reports/${id}`, body(title, file), { timeout: 60000 })).data
export const deleteReport = async id => (await api.delete(`/student/reports/${id}`)).data
export const downloadReport = (id, filename) => downloadFile(`/student/reports/${id}/download`, filename)
