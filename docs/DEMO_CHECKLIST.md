# Checklist demo E2E

Thực hiện trên database demo tách biệt hoặc dữ liệu được phép. Không có dữ liệu demo nào được tự tạo/chạy trong đợt rà soát.

1. ADMIN đăng nhập; refresh trang; tạo sinh viên bằng ngành/khóa/lớp API, MSSV và email khớp nhau.
2. Tạo giảng viên từ danh mục và nhập thủ công. Chuyển hai chế độ không giữ nhầm dữ liệu.
3. Tạo doanh nghiệp, cán bộ thuộc doanh nghiệp và đợt đang mở với lịch hợp lệ.
4. SINH_VIEN đăng nhập, chọn doanh nghiệp/cán bộ, gửi đăng ký. Đổi doanh nghiệp phải reset cán bộ; doanh nghiệp chưa có cán bộ không được gửi.
5. ADMIN duyệt CHO_DUYET → DA_DUYET. Từ chối phải có lý do; duyệt lần hai bị chặn.
6. Phân công GVHD; nếu đổi khi DA_DUYET phải UPDATE cùng bản ghi. Sinh viên thấy GVHD mới, giảng viên cũ mất quyền.
7. Trước ngày thực tập, cập nhật tiến độ bị chặn. Đến lịch, cập nhật tuần 1; trùng tuần phải lỗi.
8. GIANG_VIEN được phân công xem/nhận xét tuần 1; người khác bị chặn. Sinh viên xem nhận xét; không xóa tuần đã nhận xét.
9. Sinh viên nộp PDF/DOC/DOCX ≤10MB. File exe/js/zip, sai MIME, quá dung lượng hoặc rỗng phải bị chặn.
10. GV yêu cầu chỉnh sửa → sinh viên nộp lại → GV duyệt. Báo cáo DA_DUYET không được sửa/xóa.
11. GV đánh giá ba điểm 0–10. diemTong frontend giả mạo bị bỏ qua; đăng ký chuyển HOAN_THANH.
12. Sinh viên xem kết quả thật; trước khi chấm phải hiện “Chưa có kết quả đánh giá.”.
13. ADMIN xem thống kê; thử filter, search, phân trang và Excel 5 sheet khớp bộ lọc đã Áp dụng.

## Quyền và phiên

- Logout/login đổi role; nhập URL role khác phải redirect.
- Token của tài khoản bị khóa/xóa/đổi role →401, frontend trở về login.
- Database mất kết nối →503, không cho qua và không xóa phiên như token hết hạn.
- Không token →401; token hợp lệ sai role →403; sai ownership →403/404.
- ADMIN không có quyền chấm điểm của giảng viên.

## Trình duyệt (đánh dấu sau khi thử trực tiếp)

- [ ] 1366×768: sidebar, bảng cuộn ngang và modal cuộn được.
- [ ] 1920×1080: chart/card không vỡ.
- [ ] Tablet/mobile: sidebar và overlay đóng/mở đúng, nút gửi không bị che.
- [ ] Refresh từng route không 404 asset/API, không React warning.
- [ ] Double-click không tạo trùng; loading/error/empty rõ ràng.
- [ ] Ngày dd/MM/yyyy, giờ dd/MM/yyyy HH:mm đúng Việt Nam.

Chưa thực hiện chuỗi tạo dữ liệu thật hoặc kiểm tra trình duyệt bằng automation trong phiên này. Test tự động dùng mock DB cho thao tác ghi; SQL và Excel dùng database thật chỉ đọc. Không sửa đồng hồ/ngày database để ép demo.
