import { registrationLabels, reportLabels, periodLabels } from '../utils/statusLabels'

const tones = { CHO_DUYET: 'orange', DA_DUYET: 'green', TU_CHOI: 'red', DANG_THUC_TAP: 'blue', HOAN_THANH: 'purple', DA_NOP: 'blue', CAN_CHINH_SUA: 'orange', SAP_MO: 'orange', DANG_MO_DANG_KY: 'green', CHO_BAT_DAU: 'purple', DA_KET_THUC: 'gray' }
const labels = { ...periodLabels, ...reportLabels, ...registrationLabels }
export default function StatusBadge({ status, label }) {
  return <span className={`st-status st-status-${tones[status] || 'gray'}`}>{label || labels[status] || 'Chưa có dữ liệu'}</span>
}
