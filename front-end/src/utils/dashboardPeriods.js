// Merge only data available to this student. Registration status is not period status.
export function dashboardPeriods(periods = [], registrations = []) {
  const priority = { DANG_MO_DANG_KY: 0, SAP_MO: 1, CHO_BAT_DAU: 2, DANG_THUC_TAP: 3 }
  const merged = new Map(periods.map(period => [String(period.id), { ...period }]))
  for (const registration of registrations) {
    const key = String(registration.dotThucTapId)
    if (!registration.dotThucTapId || merged.has(key)) continue
    merged.set(key, {
      id: registration.dotThucTapId,
      hocKy: registration.hocKy,
      namHoc: registration.namHoc,
      ngayBatDauThucTap: registration.ngayBatDau,
      ngayKetThucThucTap: registration.ngayKetThuc,
      registrationStatus: registration.trangThai,
    })
  }
  return [...merged.values()].sort((a, b) => (priority[a.trangThai] ?? 4) - (priority[b.trangThai] ?? 4)).slice(0, 3)
}
