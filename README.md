# Hệ thống quản lý thực tập – Đại học Trà Vinh

React/Vite, Bootstrap 5, Inter/Poppins; Express, PostgreSQL 17, JWT, bcryptjs, Multer. Ba role: ADMIN, SINH_VIEN, GIANG_VIEN. Có danh mục, đăng ký, duyệt, phân công, tiến độ, báo cáo, đánh giá và thống kê Excel.

## Môi trường và database

- Node.js 22.12+; đã kiểm tra bằng Node 24. PostgreSQL 17.
- Database hiện tại: `quan_ly_thuc_tap`. Không tạo lại database đang có.
- Máy mới: tạo database bằng pgAdmin **chỉ khi chưa tồn tại**, restore backup schema nghiệp vụ đã kiểm tra. Repository hiện có migration tăng dần, chưa có baseline đầy đủ thay cho backup.
- Backup trước khi áp dụng migration. Kiểm tra schema trước khi chạy 001–005. File `006_proposed_audit_constraints.sql` chỉ là đề xuất, **chưa chạy**; cần xử lý dữ liệu lịch sử trước khi VALIDATE.

## Cấu hình

Chỉ sao chép `.env.example` sang `.env` khi chưa tồn tại, không ghi đè cấu hình đang dùng.

Backend: `PORT=5000`, `DB_HOST`, `DB_PORT=5432`, `DB_NAME=quan_ly_thuc_tap`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` ngẫu nhiên ít nhất 32 ký tự. `JWT_EXPIRES_IN` mặc định 8h. `CLIENT_ORIGIN` là origin frontend. Không đưa secret thật vào Git.

Frontend `.env`: `VITE_API_URL=http://localhost:5000/api`. Restart Vite sau khi đổi env. Development cho phép localhost/127.0.0.1 tại 5173 và 5174.

## Chạy

Terminal backend:
```powershell
cd D:\HTQL_ThucTap\back-end
npm.cmd ci
npm.cmd run dev
```

Terminal frontend:
```powershell
cd D:\HTQL_ThucTap\front-end
npm.cmd ci
npm.cmd run dev
```

Mở URL Vite in ra. API health: `http://localhost:5000/api/health` và `/api/health/database`.

## Danh mục và tài khoản

Trong `back-end`, `npm.cmd run import-tvu-reference` import danh mục xác minh, có thể chạy lại, không tạo tài khoản giảng viên hàng loạt. Xem `seeds/INTEGRATION.md`.

Đặt `ADMIN_EMAIL` miền `@tvu.edu.vn`, `ADMIN_PASSWORD` ít nhất 8 ký tự trong `.env` riêng; chạy `npm.cmd run tao-admin`. Không sửa tài khoản đã tồn tại. Chỉ khi chủ động cần reset mật khẩu mới chạy `npm.cmd run dat-lai-mat-khau-admin`.

Không có seed demo tự động; không ghi mật khẩu demo trong UI.

## Kiểm tra

```powershell
cd D:\HTQL_ThucTap\back-end
node --test
node scripts/checkAdminReports.js
cd ..\front-end
npm.cmd run lint
npm.cmd run build
```

Unit/API tests dùng DB mô phỏng; không ghi dữ liệu nghiệp vụ thật. Script checkAdminReports đọc DB thật để kiểm tra quyền, bộ lọc và Excel; cần Admin hoạt động. Không in secret/token.

## Demo và triển khai

- Admin: `/admin/dashboard`, `/admin/students`, `/admin/lecturers`, `/admin/companies`, `/admin/internship-periods`, `/admin/registrations`, `/admin/assignments`, `/admin/reports`.
- Sinh viên: `/student/dashboard`, `/student/internship-registration`, `/student/progress`, `/student/reports`, `/student/evaluation`.
- Giảng viên: `/lecturer/students`, `/lecturer/students/:registrationId/progress`, `/lecturer/reports`, `/lecturer/evaluations`; dashboard redirect về students.
- Vite dev/preview hỗ trợ SPA fallback. Khi đưa dist lên server khác, rewrite URL frontend về index.html, không rewrite `/api` hoặc asset thiếu. Nếu không cấu hình, refresh đường dẫn sâu có thể 404.
- Backup `uploads/reports` cùng database. Không public thư mục uploads; tải báo cáo qua API có xác thực.
- Giờ nghiệp vụ Asia/Ho_Chi_Minh. Không sửa đồng hồ hoặc dữ liệu để ép luồng demo.

Checklist: [docs/DEMO_CHECKLIST.md](docs/DEMO_CHECKLIST.md). Báo cáo rà soát: [docs/AUDIT_2026-10-05.md](docs/AUDIT_2026-10-05.md).
