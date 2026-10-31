# Hoàn thiện nghiệp vụ — 30/10/2026

Không redesign, không đổi schema, không đổi mật khẩu hoặc tài khoản Admin.

## File đã sửa / tạo trong bước này

- `.gitignore`: bổ sung rõ `**/.env`; kiểm tra Git chỉ theo dõi `.env.example`.
- `back-end/package.json`: `npm test`, nối bước luồng vào `seed-demo`, thêm `seed:demo-workflow`.
- `back-end/src/controllers/assignmentAdminController.js`: lấy đợt của đăng ký, khóa giảng viên, đếm theo đợt, trả 409 khi đủ 10; trả `dotThucTapId` và `assignedCount` cho modal.
- `front-end/src/pages/admin/AdminAssignments.jsx`: tải số lượng theo đợt/đăng ký, hiển thị n/10, vô hiệu hóa lựa chọn đầy, giữ thông báo backend.
- `back-end/src/controllers/studentWorkspaceController.js`: trả đủ thông tin hồ sơ và cập nhật ba trường cho đúng tài khoản JWT.
- `back-end/src/routes/studentRoutes.js`: PUT `/api/student/profile`, sau xác thực và phân quyền SINH_VIEN.
- `back-end/src/utils/studentProfileInput.js`: whitelist trường, phone, ngày hợp lệ/không tương lai theo giờ Việt Nam, giới tính NAM/NU/KHAC đúng CHECK hiện có.
- `front-end/src/components/StudentProfileDialog.jsx`: modal dùng class hiện có, chỉ chỉnh SĐT/ngày sinh/giới tính.
- `front-end/src/pages/student/StudentProfile.jsx`: mở modal, refresh hồ sơ sau lưu, hiển thị tên giới tính.
- `back-end/tests/assignmentAdmin.test.js`: giới hạn, phân công lại, phạm vi đợt và thứ tự khóa/đếm.
- `back-end/tests/assignmentConcurrency.test.js`: mô hình hai request cùng tranh suất thứ 10, mô phỏng mutex của khóa PostgreSQL.
- `back-end/tests/studentProfile.test.js`: validation, trường cấm, role và ownership.
- `back-end/scripts/seed-demo-workflow.js`: bổ sung luồng trên đúng ID trong manifest, transaction, advisory lock, không ghi đè demo đã phát sinh nghiệp vụ; chạy lại không tạo trùng.
- `back-end/scripts/verify-final-workflow.js`: kiểm tra HTTP với PostgreSQL thật trong outer transaction; các transaction API dùng savepoint, rollback toàn bộ và xóa tệp thử sau kiểm tra.
- `docs/DEMO_ACCOUNTS.md`: cập nhật trạng thái bộ demo.
- Tài liệu này.

## Giới hạn phân công

Transaction khóa đăng ký `FOR UPDATE`, khóa giảng viên đích `FOR UPDATE OF gv`, sau đó mới COUNT JOIN đăng ký theo giảng viên + đợt. Loại trừ đăng ký đang sửa. Cùng giảng viên phải chờ nhau trước khi đếm; READ COMMITTED nhìn thấy kết quả commit của request trước. Đủ 10 trả HTTP 409 với thông báo yêu cầu. PUT cập nhật bản ghi cũ; POST trùng bị từ chối. Không đổi schema.

Trong modal, `assignedCount` là số chỗ đã dùng của đợt, loại trừ đăng ký đang thao tác để vẫn có thể chọn lại giảng viên hiện tại. Đây chỉ là hướng dẫn UI; backend luôn đếm lại dưới khóa.

## Demo đã áp dụng

| Dữ liệu | Số lượng |
|---|---:|
| Sinh viên demo | 20 |
| Giảng viên demo | 20 |
| Doanh nghiệp hiện có | 10 |
| Đăng ký demo | 20 |
| Phân công demo | 15 |
| Tiến độ demo | 20 |
| Báo cáo demo | 8 |
| Đánh giá demo | 4 |

Trạng thái: 5 CHO_DUYET, 5 DA_DUYET, 6 DANG_THUC_TAP, 4 HOAN_THANH. Ba giảng viên demo có 5 sinh viên mỗi người; tính theo đợt đều không vượt 10.

Giữ 10 đăng ký đầu ở đợt demo tương lai. Sáu đăng ký đang thực tập và bốn đăng ký hoàn thành dùng lịch đợt đang diễn ra/đã kết thúc có sẵn, chỉ đọc lịch và kiểm tra ngành/overlap. Không thay đổi bất kỳ lịch đợt hiện có nào. Chỉ cập nhật đăng ký thuộc manifest demo và cập nhật định danh trong manifest tương ứng. Các đợt có sẵn không trở thành dữ liệu sở hữu của clear-demo.

Tạo 8 PDF thật bằng dịch vụ lưu file hiện có: 2 DA_NOP, 2 CAN_CHINH_SUA, 4 DA_DUYET. Bốn đánh giá có báo cáo đã duyệt, dùng `evaluationInput` để tính trung bình và làm tròn. Giữ nguyên tài khoản/mật khẩu, ngành/lớp/reference và 10 doanh nghiệp. Manifest và bản sao trước cập nhật nằm trong `.demo/`, được Git bỏ qua; tệp PDF ở private uploads cũng không được commit.

Chạy lại `npm run seed-demo` đã xác nhận không tạo trùng, không đổi mật khẩu. Seed không cập nhật lịch theo mỗi lần chạy; trạng thái demo là dữ liệu minh họa tại ngày chạy này.

## Kiểm thử

- `npm test`: **208 pass, 0 fail**; giữ các test đăng ký, mật khẩu, quyền giảng viên, Excel, upload/download hiện có.
- `npm run lint`: pass.
- `npm run build`: pass.
- `node scripts/verify-final-workflow.js`: **23 kiểm tra HTTP trên PostgreSQL thật**: login SV/GV, đăng ký/trùng, duyệt, phân công/trùng, count theo đợt, sửa hồ sơ/chặn trường cấm, tiến độ/nhận xét, upload/duyệt báo cáo/đánh giá/xem kết quả, 9→10 và chặn 11, đổi lại cùng GV, đợt khác vẫn cho phân công. Admin dùng JWT ký cục bộ cho tài khoản Admin thật trong DB để không đọc/đổi mật khẩu Admin. Middleware vẫn thực thi đầy đủ.
- Kiểm tra hai kết nối PostgreSQL: kết nối thứ nhất giữ khóa giảng viên, kết nối thứ hai `FOR UPDATE NOWAIT` trả đúng `55P03`. Đây là kiểm tra khóa thật; test hai request 9→10→từ chối ở suite dùng mô phỏng mutex, không tuyên bố là HTTP concurrent trên DB thật.
- Kiểm tra cả 8 đường dẫn PDF thực sự tồn tại và hợp lệ qua `resolveFile`.
- Mọi mutation của integration audit đều rollback; tệp audit được dọn. Sequence PostgreSQL có thể tăng do INSERT thử (hành vi bình thường, không reset sequence).

## Giữ nguyên các rule và giới hạn

Đăng ký: duy nhất sinh viên/đợt, không overlap, đợt tiếp theo không overlap được phép, đúng ngành, cổng đang mở, đúng cán bộ/doanh nghiệp. Giảng viên được lọc quyền trong SQL theo JWT. Excel giữ năm sheet và LEFT JOIN để không mất sinh viên chưa có báo cáo/đánh giá. Upload PDF/DOC/DOCX tối đa 10 MiB; kiểm tra chữ ký file, đường dẫn an toàn và quyền tải xuống.

Đổi mật khẩu vẫn kiểm tra mật khẩu hiện tại bằng bcrypt, mật khẩu mới >=8 ký tự và <=72 byte, frontend kiểm tra xác nhận, lưu hash; test login mật khẩu cũ/mới được giữ nguyên.

Chưa bổ sung hạn nộp báo cáo hoặc hạn kết thúc học phần/học kỳ vì schema chưa có trường tương ứng; đây là giới hạn nghiệp vụ đã biết, ngoài phạm vi bước này. Cần restart backend đang chạy để nạp mã mới; không cần migration.
