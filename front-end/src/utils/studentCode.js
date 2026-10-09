export function updateStudentCode(previous, code) {
  const generated = previous.email === `${previous.maSinhVien}@st.tvu.edu.vn` && !previous.emailManual
  const email = !previous.email || generated ? (/^\d{9}$/.test(code) ? `${code}@st.tvu.edu.vn` : '') : previous.email
  return { ...previous, maSinhVien: code, email, ...(!previous.email || generated ? { emailManual: false } : {}) }
}

export function validSequence(value) {
  return /^\d{3}$/.test(value)
}
