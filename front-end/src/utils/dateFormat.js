export function formatDate(value, fallback = '—') {
  if (!value) return fallback
  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text.split('-').reverse().join('/')
  const date = new Date(text)
  if (!Number.isFinite(date.getTime())) return fallback
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}
export function formatTime(value, fallback = '—') {
  if (!value) return fallback
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return fallback
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(p => [p.type, p.value]))
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`
}
