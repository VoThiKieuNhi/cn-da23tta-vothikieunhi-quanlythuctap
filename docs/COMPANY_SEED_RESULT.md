# Cập nhật doanh nghiệp — 22/10/2026

Dữ liệu tên/địa chỉ/điện thoại/email/lĩnh vực/đầu mối được nhập theo danh sách người dùng cung cấp, không hard-code vào frontend. Chưa xác minh độc lập tính cập nhật của các thông tin liên hệ.

## Kết quả PostgreSQL

- Tổng doanh nghiệp: **10**.
- Update 3 bản ghi demo, giữ nguyên ID: **4 → FPT**, **5 → TMA**, **3 → Axon Active**.
- Insert 7 bản ghi còn lại.
- Tổng cán bộ hướng dẫn: **13**; giữ 3 cán bộ cũ và thêm 10 cán bộ giả lập, mỗi doanh nghiệp một người.
- Cán bộ mới có chức vụ ghi rõ DEMO, tên Việt Nam giả lập, email `example.com`, điện thoại 10 số; không nhầm với đầu mối liên hệ doanh nghiệp.
- Không DELETE/TRUNCATE; không đổi schema; giữ liên kết FK cũ.
- Chạy lần hai: 0 insert doanh nghiệp, 0 thêm cán bộ, tổng vẫn 10/13.

## Script

Trong `back-end`, chạy `npm run seed:companies`.

Script riêng tránh tác động tài khoản và đợt thực tập trong `seed-demo`. Script nhận diện theo tên/email, transaction và khóa bảng khi upsert; dừng nếu bản ghi trùng không rõ ràng.

Snapshot trước cập nhật được lưu tại `back-end/.demo/companies-before.json`. Manifest demo được bỏ các root doanh nghiệp/cán bộ đã chuyển đổi, để `clear-demo` không xóa danh mục này. Registration vẫn giữ ID/FK và manifest còn hợp lệ. Không chạy clear-demo trong bước này.

## File tạo/sửa

- `back-end/scripts/seed-companies.js` (mới)
- `back-end/seeds/companies.json` (mới, đúng bộ dữ liệu được cung cấp)
- `back-end/package.json` (thêm `seed:companies`)
- `back-end/src/controllers/companyAdminController.js`
- `back-end/src/utils/validators.js`
- `front-end/src/utils/validators.js`
- `front-end/src/pages/admin/AdminCompanies.jsx`
- `back-end/tests/companyAdmin.test.js`
- Tài liệu này; snapshot và manifest cục bộ trong `.demo` được Git ignore.

Validation điện thoại doanh nghiệp cho phép số bàn/hotline, dấu +, khoảng trắng, ngoặc, chấm, gạch nối, tối đa 20 ký tự theo schema; giữ nguyên chuỗi nhập. Cán bộ/Sinh viên/Giảng viên vẫn áp dụng rule điện thoại cá nhân. Modal chi tiết đã có người đại diện; table đã có email/số cán bộ nên không cần đổi bố cục.

## Kiểm thử

- API Sinh viên thật: đăng nhập tài khoản demo, lấy đủ 10 doanh nghiệp, kiểm tra 10 endpoint cán bộ khớp doanh nghiệp trong DB.
- SQL kiểm tra ID cũ, duplicate email và FK đăng ký/cán bộ: pass.
- Admin controller trên PostgreSQL thật: search FPT, lọc lĩnh vực, chi tiết; chỉnh sửa số bàn hợp lệ trong transaction rồi rollback: pass.
- HTTP tests: create/edit chấp nhận số bàn/hotline; cán bộ không chấp nhận số bàn: pass.
- Seed lần hai và chạy lại seed-demo: không tạo trùng, không đổi tài khoản.
- Frontend lint/build: pass.
- Backend: **204 pass, 0 fail**.
- Backend đã khởi động lại trên cổng 5000 để nạp validation mới.
