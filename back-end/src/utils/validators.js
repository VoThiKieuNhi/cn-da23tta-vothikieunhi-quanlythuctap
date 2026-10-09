const messages = {
  email: 'Email không đúng định dạng.',
  tvu: 'Email phải sử dụng tên miền @tvu.edu.vn.',
  student: 'Email sinh viên phải sử dụng tên miền @st.tvu.edu.vn.',
  phone: 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.',
  password: 'Mật khẩu phải có ít nhất 8 ký tự.',
  passwordBytes: 'Mật khẩu không được vượt quá 72 byte.'
};
function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  if (email.length > 254) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && local.length <= 64 &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) &&
    !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') &&
    domain.includes('.') && domain.split('.').every(label => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)) &&
    /^[a-zA-Z]{2,63}$/.test(domain.split('.').at(-1));
}
function isValidTvuEmail(email) { return isValidEmail(email) && email.trim().toLowerCase().endsWith('@tvu.edu.vn'); }
function isValidStudentEmail(email) { return isValidEmail(email) && email.trim().toLowerCase().endsWith('@st.tvu.edu.vn'); }
function isValidPhone(phone) { return typeof phone === 'string' && /^0\d{9}$/.test(phone.trim()); }
function emailError(email, role) {
  if (!isValidEmail(email)) return messages.email;
  if (['ADMIN', 'GIANG_VIEN'].includes(role) && !isValidTvuEmail(email)) return messages.tvu;
  if (role === 'SINH_VIEN' && !isValidStudentEmail(email)) return messages.student;
  return '';
}
function passwordError(password) {
  if (typeof password !== 'string' || Array.from(password).length < 8) return messages.password;
  if (new TextEncoder().encode(password).length > 72) return messages.passwordBytes;
  return '';
}
function isValidPassword(password) { return !passwordError(password); }
module.exports = { messages, isValidEmail, isValidTvuEmail, isValidStudentEmail, isValidPhone, emailError, passwordError, isValidPassword };
