import { useState } from 'react'

export default function DashboardCalendar() {
  const today = new Date()
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const year = month.getFullYear(), index = month.getMonth()
  const offset = (new Date(year, index, 1).getDay() + 6) % 7
  const days = new Date(year, index + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, cell) => cell - offset + 1)
  function move(delta) { setMonth(value => new Date(value.getFullYear(), value.getMonth() + delta, 1)) }
  return <section className="dp2-calendar" aria-labelledby="dp2-calendar-title">
    <h2 id="dp2-calendar-title">Lịch quan trọng</h2>
    <div className="dp2-calendar-nav"><button type="button" aria-label="Tháng trước" onClick={() => move(-1)}><i className="bi bi-chevron-left" /></button><strong aria-live="polite">Tháng {index + 1}, {year}</strong><button type="button" aria-label="Tháng sau" onClick={() => move(1)}><i className="bi bi-chevron-right" /></button></div>
    <table aria-label={`Lịch tháng ${index + 1} năm ${year}`}><thead><tr>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <th key={day} scope="col">{day}</th>)}</tr></thead><tbody>{Array.from({ length: cells.length / 7 }, (_, week) => <tr key={week}>{cells.slice(week * 7, week * 7 + 7).map((day, column) => {
      const current = day === today.getDate() && index === today.getMonth() && year === today.getFullYear()
      return <td key={column}>{day > 0 && day <= days && <span className={current ? 'is-today' : ''} aria-current={current ? 'date' : undefined}>{day}</span>}</td>
    })}</tr>)}</tbody></table>
  </section>
}
