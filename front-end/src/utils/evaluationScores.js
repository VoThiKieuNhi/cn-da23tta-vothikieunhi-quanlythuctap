export const scoreFields = [['diemChuyenMon', 'Điểm chuyên môn'], ['diemThaiDo', 'Điểm thái độ'], ['diemBaoCao', 'Điểm báo cáo']]
export const formatScore = value => value == null ? 'Chưa có kết quả' : Number(value).toFixed(2)
export function parseScore(value) {
  if (value === '' || value == null || typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 && number <= 10 && Math.abs(number * 100 - Math.round(number * 100)) < 1e-8 ? number : null
}
export function totalScore(form) {
  const scores = scoreFields.map(([key]) => parseScore(form[key]))
  return scores.includes(null) ? null : Math.round(scores.reduce((sum, score) => sum + Math.round(score * 100), 0) / 3) / 100
}
