# Đổi mật khẩu và điều kiện đăng ký thực tập — 21/10/2026

## A. Đổi mật khẩu

- `PUT /api/auth/change-password`, bắt buộc JWT; chỉ dùng `req.user.id`, bỏ qua ID client gửi.
- Body: `currentPassword`, `newPassword`. Xác nhận mật khẩu chỉ kiểm tra tại frontend.
- So sánh bcrypt, mật khẩu mới tối thiểu 8 ký tự/tối đa 72 byte, không trùng mật khẩu hiện tại; hash bcrypt cost 12.
- Transaction và khóa tài khoản khi đọc/cập nhật. Không log hoặc trả password/hash. Giữ phiên hiện tại vì hệ thống chưa có cơ chế thu hồi toàn bộ JWT sau đổi mật khẩu.
- Hồ sơ Sinh viên có nút, modal ba field, show/hide từng field, lỗi dưới field, khóa submit khi đang gửi, reset/đóng modal và thông báo thành công.

## B. Điều kiện đăng ký

- Giữ `uq_sinh_vien_dot`: UNIQUE(sinh_vien_id, dot_thuc_tap_id), bao gồm bản ghi TU_CHOI. Không tự cho đăng ký lại cùng đợt.
- Transaction khóa hồ sơ Sinh viên trước khi kiểm tra/ghi, tuần tự hóa request đăng ký của cùng sinh viên.
- Chặn overlap khi `new_start <= existing_end AND new_end >= existing_start`, với CHO_DUYET/DA_DUYET/DANG_THUC_TAP; không tính TU_CHOI/HOAN_THANH.
- Cho phép đợt khác, kể cả cùng học kỳ, nếu không overlap và đáp ứng điều kiện còn lại.
- Ngành áp dụng theo bảng reference. Schema Sinh viên đang lưu tên ngành nên tra chính xác `sinh_vien.nganh = nganh_hoc.ten_nganh`; không đoán theo MSSV hoặc hard-code tên ngành.
- GET open chỉ trả đợt đang mở và phù hợp ngành; thêm `canRegister`, `blockedReason` cho duplicate/overlap.
- POST kiểm tra lại toàn bộ điều kiện, không tin trạng thái frontend. PUT loại bản ghi đang sửa khỏi phép kiểm tra overlap. DELETE giữ quy tắc chính chủ/CHO_DUYET/cổng mở.
- Admin không được thu hẹp ngành làm loại sinh viên đã đăng ký còn hiệu lực; cập nhật ngành và đợt trong cùng transaction.

## C. Database

Đã chạy `back-end/migrations/007_period_majors.sql` trên `quan_ly_thuc_tap`.

- Thêm `dot_thuc_tap_nganh`: id, dot_thuc_tap_id, nganh_hoc_id; FK đến đợt/ngành và UNIQUE(dot_thuc_tap_id, nganh_hoc_id).
- Không có dòng liên kết cho một đợt = tất cả ngành. Các đợt cũ không bị hạn chế sau migration.
- Không thêm flag dư thừa; không DROP/TRUNCATE/xóa dữ liệu; không sửa mật khẩu của tài khoản thật khi kiểm thử.
- UNIQUE Sinh viên/đợt đã tồn tại nên không tạo lại.

## D. File tạo/sửa

Backend:

- `src/controllers/authController.js`
- `src/routes/authRoutes.js`
- `src/controllers/studentInternshipController.js`
- `src/controllers/internshipPeriodAdminController.js`
- `src/services/registrationEligibility.js` (mới)
- `src/services/periodMajors.js` (mới)
- `migrations/007_period_majors.sql` (mới)

Frontend:

- `src/components/ChangePasswordDialog.jsx` (mới)
- `src/pages/student/StudentProfile.jsx`
- `src/pages/student/StudentInternshipRegistration.jsx`
- `src/components/StudentInternshipCard.jsx`
- `src/pages/admin/AdminInternshipPeriods.jsx`

Tests:

- `back-end/tests/changePassword.test.js` (mới)
- `back-end/tests/periodMajors.test.js` (mới)
- `back-end/tests/studentInternship.test.js`
- `back-end/tests/internshipPeriodAdmin.test.js`
- `back-end/tests/registrationAdmin.test.js`

Các mock cũ được bổ sung để hiểu query mới; giữ các kiểm tra nghiệp vụ cũ. Test kiểm tra INSERT được tìm theo SQL thay vì vị trí query đầu tiên vì POST nay có BEGIN.

## E. Kiểm thử

12 trường hợp yêu cầu đều pass trong phạm vi dưới đây:

| Case | Kết quả | Cách kiểm tra |
|---|---|---|
| 1 Đúng ngành, cổng mở | Pass | HTTP test database giả lập + SQL eligibility PostgreSQL |
| 2 Cùng đợt | Pass | HTTP test + UNIQUE PostgreSQL bảng tạm |
| 3 Overlap | Pass | HTTP test + SQL PostgreSQL, cả ngày biên |
| 4 Kỳ sau không overlap | Pass | SQL PostgreSQL |
| 5 Sai ngành | Pass | HTTP test + SQL PostgreSQL |
| 6 Tất cả ngành | Pass | SQL PostgreSQL |
| 7 Chưa mở | Pass | HTTP test |
| 8 Đã đóng | Pass | HTTP test |
| 9 Sai cán bộ/doanh nghiệp | Pass | HTTP test |
| 10 Sai mật khẩu hiện tại | Pass | HTTP test với bcrypt thực, DB giả lập |
| 11 Mật khẩu mới ngắn | Pass | HTTP test |
| 12 Đổi thành công, login mật khẩu mới | Pass | HTTP test với bcrypt/JWT thực, DB giả lập; mật khẩu cũ bị từ chối |

- SQL integration dùng TEMP TABLE trong transaction rồi ROLLBACK; không ghi test data vào bảng nghiệp vụ thật.
- Query open periods và Admin list đã thực thi đọc trên database thật, trả cấu trúc mới hợp lệ.
- Browser desktop 1366×768/mobile 390×844: modal ba password fields, lỗi bắt buộc, show/hide, vừa màn hình; multi-select tải API, disabled khi tất cả ngành và enable khi bỏ chọn. Browser dùng adapter giả lập, không đổi tài khoản thật.
- Backend đã khởi động lại trên 5000: health/database 200; change-password không JWT trả 401 (không còn 404).

## F. Kiểm tra cuối

- Frontend `npm run lint`: pass.
- Frontend `npm run build`: pass.
- Backend `node --test tests/*.test.js`: 202 pass, 0 fail.
- Không đổi thiết kế Login/Dashboard/font/màu; chỉ thêm UI cần thiết cho hai nghiệp vụ.
