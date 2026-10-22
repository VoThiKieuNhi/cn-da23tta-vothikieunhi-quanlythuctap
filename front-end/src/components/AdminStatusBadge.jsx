import StatusBadge from './StatusBadge'

export default function AdminStatusBadge({ status, active, label }) {
  if (typeof active === 'boolean') return <StatusBadge status={active ? 'DA_DUYET' : 'TU_CHOI'} label={active ? 'Đang hoạt động' : 'Ngừng hoạt động'} />
  return <StatusBadge status={status} label={label} />
}
