export default function ReportSteps({ current }) {
  return <ol className="report-stepper" aria-label="Các bước nộp báo cáo">{['Thông tin', 'Tải báo cáo', 'Xác nhận', 'Hoàn thành'].map((label, index) => <li key={label} className={index + 1 === current ? 'is-current' : index + 1 < current ? 'is-done' : ''} aria-current={index + 1 === current ? 'step' : undefined}><span>{index + 1 < current ? <i className="bi bi-check-lg" /> : index + 1}</span>{label}</li>)}</ol>
}
