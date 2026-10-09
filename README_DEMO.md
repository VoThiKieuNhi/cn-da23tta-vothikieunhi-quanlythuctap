# Bộ dữ liệu demo thực tập

Đây là dữ liệu tổng hợp phục vụ phát triển/thuyết trình, không gắn với giảng viên tham chiếu TVU thật. Không có dữ liệu React hard-code hay Demo Mode trên UI. Hai script không được gọi khi server khởi động.

## Chuẩn bị và chạy

Ưu tiên database demo riêng được restore từ schema hiện tại, có migration 001–005 và danh mục TVU. Cấu hình kết nối trong `back-end/.env`. Không tạo lại hoặc xóa database thật.

Thêm `DEMO_PASSWORD` vào `.env` riêng, ít nhất 8 ký tự, tối đa 72 byte theo bcrypt. Không ghi mật khẩu vào tài liệu/Git/terminal. Mọi tài khoản bên dưới dùng **giá trị DEMO_PASSWORD trong .env**.

```powershell
cd D:\HTQL_ThucTap\back-end
npm.cmd run seed-demo
npm.cmd run dev
```

Terminal khác:
```powershell
cd D:\HTQL_ThucTap\front-end
npm.cmd run dev
```

Mở URL Vite. Frontend tự lấy dữ liệu qua API hiện có.

## Tài khoản và trạng thái

| Email | Vai trò / trạng thái |
|---|---|
| demo.admin@tvu.edu.vn | ADMIN |
| demo.gv01@tvu.edu.vn | GIANG_VIEN, phụ trách sinh viên 101 và 102 |
| demo.gv02@tvu.edu.vn | GIANG_VIEN, chưa được phân công |
| 110123101@st.tvu.edu.vn | DANG_THUC_TAP, tuần 1 và nhận xét GV |
| 110123102@st.tvu.edu.vn | HOAN_THANH, tuần 1/2, PDF tải được, báo cáo DA_DUYET, điểm 8.5/9/8; tổng tính bằng helper hiện tại |
| 110123103@st.tvu.edu.vn | CHO_DUYET, chưa phân công/tiến độ/báo cáo/đánh giá |

Ba sinh viên thuộc CNTT, khóa 2023; lớp chọn từ danh mục đã có. Script xác minh prefix 1101, không tạo lớp/ngành giả. Hai giảng viên là hồ sơ thủ công DEMO-GV01/02. Hai doanh nghiệp và địa chỉ ghi rõ demo, mỗi doanh nghiệp có một cán bộ.

Đợt Học kỳ 1, năm học 2026-2027: mở NOW()-20 ngày, đóng NOW()-10 ngày, bắt đầu CURRENT_DATE-5, kết thúc CURRENT_DATE+30, giờ Việt Nam. Dữ liệu tuần 2 và hoàn thành được dựng sẵn để minh họa các nhánh luồng, không phải lịch sử hoạt động thật. Cổng đăng ký đã đóng: dùng đăng ký CHO_DUYET đã seed để demo duyệt, không tạo đăng ký mới trong đợt này.

PDF nhỏ hợp lệ có tiêu đề metadata tiếng Việt; dòng chữ trên trang không dấu để không phụ thuộc font hệ điều hành. Chỉ dành cho sinh viên 102, không chứa thông tin thật.

## An toàn và chạy lại

- Toàn bộ INSERT trong một transaction; lỗi rollback. PDF mới được dọn nếu thất bại trước COMMIT. Không DROP/TRUNCATE/reset sequence; không ghi vào bốn bảng reference.
- File `back-end/.demo/manifest.json` lưu database fingerprint, ID, thời điểm tạo và khóa định danh của bản ghi mới; không lưu mật khẩu/hash. Giữ file này cùng database. Thư mục được gitignore.
- Có manifest → `Demo data already exists. Use npm run clear-demo before reseeding.` Không tự cập nhật tài khoản/mật khẩu/lịch cũ.
- Trùng bất kỳ email/MSSV/mã GV/doanh nghiệp hoặc Học kỳ 1 năm học 2026-2027 ngoài manifest → dừng, không nhận dữ liệu có sẵn là demo. Kể cả email Admin demo có sẵn cũng được giữ nguyên và seed dừng để tránh lấy nhầm tài khoản. Không đổi validation hoặc chọn năm khác để lách UNIQUE; dùng database demo riêng khi bị trùng.
- Sau lỗi kết nối trong lúc COMMIT hoặc mất điện, giữ manifest để đối chiếu với DB trước khi chạy lại; không tự xóa manifest. Transaction DB và filesystem không thể commit nguyên tử cùng nhau.

## Xóa demo (developer chủ động chạy)

```powershell
cd D:\HTQL_ThucTap\back-end
npm.cmd run clear-demo
```

Chỉ dùng đúng database và manifest của lần seed. Script kiểm tra định danh/thời điểm tạo trước khi xóa; không dò tên/email chứa “demo” để xóa hàng loạt. Các tiến độ/báo cáo/đánh giá/phân công phát sinh thêm trong ba đăng ký demo cũng thuộc phạm vi clear. Xóa theo FK, trong transaction; sau COMMIT mới dọn file báo cáo.

Nếu thay định danh gốc, thiếu bản ghi gốc, liên kết GV thật, hoặc có dữ liệu ngoài demo phụ thuộc vào các hồ sơ demo: dừng/rollback, cần kiểm tra thủ công. Không tự gỡ liên kết thật. Nếu DB đã clear nhưng dọn file lỗi, giữ manifest để đối chiếu và dọn đúng file, không chạy lại mù quáng.

## Kịch bản thuyết trình

1. Admin → Dashboard → Sinh viên → Doanh nghiệp → Đợt thực tập.
2. Sinh viên 103 xem CHO_DUYET → Admin duyệt → phân công GV01 hoặc GV02 → sinh viên thấy GVHD.
3. Sinh viên 101 xem GVHD, xem/cập nhật tiến độ → GV01 xem và nhận xét. GV02 không xem được sinh viên 101 nếu chưa được phân công.
4. Sinh viên 102 tải báo cáo đã duyệt, xem kết quả → Admin xem Báo cáo - Thống kê và xuất Excel.

## Kiểm tra code

```powershell
node --check scripts/seed-demo.js
node --check scripts/clear-demo.js
node --test tests/demo.test.js
```

Các test dùng DB/file mô phỏng, không chạy seed hoặc clear trên database hiện tại.
