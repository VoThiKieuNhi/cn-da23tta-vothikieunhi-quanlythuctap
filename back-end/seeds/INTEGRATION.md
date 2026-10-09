# Tích hợp danh mục TVU

Chạy từ `back-end`: `npm run import-tvu-reference`.
Lệnh đọc kết nối từ `.env`, chỉ chấp nhận database `quan_ly_thuc_tap`, áp dụng seed và migration `004_lecturer_reference.sql` trong một transaction. Có thể chạy lại; không tạo tài khoản đăng nhập từ danh mục giảng viên.

Các file seed gốc được giữ nguyên. Số lượng sau import: 49 ngành, 159 lớp, 139 quy tắc prefix, 86 giảng viên tham chiếu thuộc 6 khoa/đơn vị.

Migration thêm liên kết nullable `giang_vien.danh_muc_giang_vien_id`; không tự gán liên kết hoặc sửa hồ sơ cũ. Hồ sơ cũ dùng tên ngành/khóa dạng viết tắt vẫn được giữ nguyên; khi Admin chỉnh sửa, chọn lại giá trị đúng trong danh mục.

Chỉ quy tắc `xac_minh=true` được dùng kiểm tra prefix. Không suy đoán ngành chưa có quy tắc đã xác minh và không tạo lớp còn thiếu. Tra email không tự tạo hồ sơ, không suy đoán họ tên/ngày sinh/SĐT và không tự chọn lớp. Hồ sơ đã tồn tại được trả nguyên trạng trong `student`, kèm kết quả tra cứu danh mục riêng.

API danh mục yêu cầu JWT; API resolve-email yêu cầu vai trò ADMIN. Bộ lọc giảng viên dùng `?faculty=...`, lớp dùng `?cohort=23` hoặc `?cohort=2023`.
