# Final audit — 21/10/2026

## A. Đã sửa

- `front-end/src/utils/statusLabels.js`: thống nhất `CHO_BAT_DAU = Chờ bắt đầu`.
- `front-end/src/components/AdminStatusBadge.jsx`: bỏ bản dịch riêng của Admin; dùng mapping trạng thái chung.
- `front-end/src/components/ProtectedRoute.jsx`: người chưa đăng nhập vào route Admin được chuyển đến `/admin/login`.
- `front-end/src/services/api.js`: phiên Admin hết hạn (401) chuyển đến `/admin/login`; Student/Lecturer vẫn về `/login`.
- `front-end/src/layouts/AdminLayout.jsx`: đăng xuất Admin về trang đăng nhập Admin.
- `back-end/tests/finalAudit.test.js`: thêm kiểm thử ba vai trò đăng nhập, chống role giả từ request, `/me` không lộ hash; tạo và đọc lại workbook Excel, kiểm tra bộ lọc, xuất toàn bộ kết quả phù hợp, sheet, dữ liệu thiếu GVHD và điểm 0.

## B. Phát hiện

- Nhãn đợt đang mở của Admin khác mapping dùng ở các vai trò khác — đã sửa.
- Admin đăng xuất/hết phiên bị chuyển về trang chỉ hỗ trợ Sinh viên/Giảng viên — đã sửa.
- Backend ban đầu chưa chạy cổng 5000. Đã khởi động, hai health check trả 200 và xác nhận database `quan_ly_thuc_tap`.
- Hồ sơ Sinh viên có UI cho điện thoại/ngày sinh/giới tính/khóa nhưng `/student/workspace` chưa trả các trường này. UI hiện dùng trạng thái thiếu dữ liệu; không thể coi đó là bằng chứng các trường tương ứng trong DB trống. Chưa mở rộng API ở đợt audit này.

## C. Phạm vi kiểm tra

- Auth: bcrypt/JWT, role từ DB, kiểm tra tài khoản còn hoạt động, quyền và ownership, không dùng role client để cấp quyền.
- Student: đăng ký/sửa/hủy đúng chủ và cửa sổ đăng ký; cán bộ thuộc doanh nghiệp; tiến độ đúng thời gian và tuần duy nhất; upload/download và review; điểm 0 khác chưa đánh giá.
- Lecturer: dữ liệu theo phân công, nhận xét tiến độ, yêu cầu chỉnh sửa/duyệt báo cáo, tạo/cập nhật đánh giá có điều kiện.
- Admin: validation sinh viên/giảng viên/doanh nghiệp, danh mục TVU, đợt tự xác định trạng thái, duyệt/từ chối, phân công/reassign, báo cáo và Excel.
- Upload: extension/MIME/signature, giới hạn 10 MiB, tên lưu phía server, ngăn traversal/symlink, download có quyền. Test thao tác file thật với file thử, database giả lập.
- Date/time: utility dùng Asia/Ho_Chi_Minh và kiểm thử chuyển đổi frontend/backend, ranh giới thời gian.
- `.env` của frontend/backend được ignore, không được Git theo dõi; không sửa hoặc in secret.
- Rà route/sidebar và handler; không tìm thấy link `href="#"`, handler rỗng hay nút đổi mật khẩu giả. Các modal dùng native dialog có nhãn và xử lý đóng.
- Browser smoke test: 18 route (6 Student, 4 Lecturer, 8 Admin), ở 1366×768, 1920×1080, 820×1180, 390×844; dùng API fixture rỗng trong bộ nhớ trình duyệt. Kiểm tra route, heading, lỗi render và overflow ngang. Đây không phải kiểm thử CRUD trên dữ liệu thật hoặc toàn bộ tổ hợp modal/dữ liệu dài.
- Browser kiểm tra Admin logout, Admin chưa có phiên và redirect khi truy cập sai vai trò.

## D. Chưa có backend

- Backend chưa có API đổi mật khẩu.
- Chưa có API tự cập nhật hồ sơ Sinh viên.
- Chưa có API hồ sơ cá nhân Giảng viên/cài đặt hệ thống; không thêm menu chức năng giả.
- Thông báo Sinh viên suy ra từ nghiệp vụ hiện có, chưa phải dịch vụ thông báo riêng.

## E. Route/API lưu ý

- `/login`: Sinh viên/Giảng viên. `/admin/login`: Admin.
- API gốc `http://localhost:5000/api`.
- Live smoke: `/api/health` và `/api/health/database` trả 200; `/api/auth/me`, `/api/admin/students`, `/api/student/workspace`, `/api/lecturer/students` trả 401 khi không có token.
- API workspace hiện biểu diễn đăng ký gần nhất; không thêm cơ chế chọn lịch sử trong bước này.
- Excel hiện có 5 sheet: Tổng quan, Sinh viên thực tập, Theo doanh nghiệp, Theo giảng viên, Kết quả đánh giá. Query dùng LEFT JOIN/LATERAL để không nhân bản bởi báo cáo/đánh giá/tuần tiến độ.

## F. Kết quả lệnh

- `front-end`: `npm run lint` — pass.
- `front-end`: `npm run build` — pass (có thông tin timing plugin Vite, không lỗi build).
- `back-end`: `node --test tests/*.test.js` — 193 pass, 0 fail.
- Backend chưa khai báo script npm test/lint; chạy bộ test có sẵn trực tiếp, không thêm script.
- Bộ test nghiệp vụ dùng DB giả lập. Chưa chạy chu trình CRUD end-to-end bằng tài khoản thật trên PostgreSQL thật; không tuyên bố đã kiểm chứng mọi mutation production.

## G. Không thay đổi

- Database schema, dữ liệu nghiệp vụ, seed/demo, danh mục TVU.
- API contract, quy tắc nghiệp vụ chính, mật khẩu và secrets.
- Thiết kế giao diện, font, màu, bố cục, danh sách ba vai trò.
- Các thay đổi giao diện có sẵn trước audit được giữ nguyên.
