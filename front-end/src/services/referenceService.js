import api from './api'
export const getMajors = async signal => (await api.get('/reference/majors', { signal })).data.data
export const getMajorClasses = async (majorId, cohort, signal) => (await api.get(`/reference/majors/${majorId}/classes`, { params: { cohort }, signal })).data.data
export const getLecturerFaculties = async signal => (await api.get('/reference/lecturer-faculties', { signal })).data.data
export const getReferenceLecturers = async (faculty, signal) => (await api.get('/reference/lecturers', { params: { faculty }, signal })).data.data
export const getReferenceLecturer = async (id, signal) => (await api.get(`/reference/lecturers/${id}`, { signal })).data.data
export const resolveStudentEmail = async (email, signal) => (await api.get('/admin/students/resolve-email', { params: { email }, signal })).data
