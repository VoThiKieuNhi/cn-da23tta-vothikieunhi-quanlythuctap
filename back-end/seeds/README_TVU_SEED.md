# TVU Reference Seed – Hệ thống quản lý thực tập

Bộ seed này được chuẩn hóa từ 3 file Excel người dùng cung cấp.

## File

- `tvu_reference_seed.sql`: tạo + seed bảng tham chiếu PostgreSQL.
- `tvu_reference_seed.json`: dữ liệu JSON để backend/Codex đọc hoặc dùng cho test.
- `PROMPT_CODEX_IMPORT_TVU.txt`: prompt copy-paste cho Codex.

## Thống kê

- Ngành: **49**
- Lớp: **159**
- Quy tắc prefix MSSV theo ngành/khóa: **139**
- Giảng viên tham chiếu: **86**
- Khoa/đơn vị có trong file giảng viên: **6**

### Khoa/đơn vị trong file giảng viên

- Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ: 24 giảng viên
- Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ: 19 giảng viên
- Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ: 8 giảng viên
- Khoa Môi trường – Trường Kỹ thuật và Công nghệ: 5 giảng viên
- Khoa Xây dựng – Trường Kỹ thuật và Công nghệ: 17 giảng viên
- Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ: 13 giảng viên

## Dữ liệu chưa đủ để khóa cứng

Ngành chưa có prefix MSSV xác minh:
- Tâm lý học
- Công nghệ nông nghiệp
- Kỹ thuật môi trường

Ngành chưa có mã lớp xác minh:
- Tâm lý học
- Công nghệ nông nghiệp

## Lưu ý về DA23TTA / DA23TTB / DA23TTC

Ba mã lớp này được bổ sung vì người dùng đã xác nhận đang thuộc lớp `DA23TTA`
và yêu cầu hệ thống hỗ trợ khóa 2023. Chúng được đánh dấu bằng ghi chú
`Bổ sung từ thông tin người dùng cung cấp` và không có URL nguồn trong bộ seed.

Nếu muốn dữ liệu chỉ gồm những gì có trong 3 file Excel, có thể xóa 3 record đó
khỏi `lop_hoc`.

## Cách import PostgreSQL

1. Mở **pgAdmin 4**.
2. Chọn database `quan_ly_thuc_tap`.
3. Mở **Query Tool**.
4. Mở file `tvu_reference_seed.sql`.
5. Execute.
6. Kiểm tra:
   - `SELECT COUNT(*) FROM nganh_hoc;`
   - `SELECT COUNT(*) FROM lop_hoc;`
   - `SELECT COUNT(*) FROM ma_mssv_nganh;`
   - `SELECT COUNT(*) FROM danh_muc_giang_vien_tvu;`

SQL dùng `CREATE TABLE IF NOT EXISTS` + `ON CONFLICT DO UPDATE`, nên có thể chạy
lại mà không tạo bản ghi trùng.

## Quy tắc tích hợp đề xuất

- Sinh viên: email `@st.tvu.edu.vn`.
- Giảng viên/Admin: email `@tvu.edu.vn`.
- MSSV: đúng 9 số.
- SĐT: đúng 10 số và bắt đầu bằng 0.
- Mật khẩu: ít nhất 8 ký tự.
- Khi email sinh viên có local-part là 9 số, có thể suy ra MSSV.
- Ngành xác định bằng bảng `ma_mssv_nganh` theo **prefix + khóa**, không chỉ bằng
  một prefix cứng ở bảng ngành.
- Lớp phải thuộc đúng ngành và đúng khóa.
- Danh mục giảng viên chỉ là dữ liệu tham chiếu; KHÔNG tự tạo 86 tài khoản login.

## Vì sao có bảng `ma_mssv_nganh` riêng?

File nguồn có trường hợp như **Hóa dược khóa 2023** xuất hiện dấu hiệu nhiều prefix.
Bảng riêng cho phép lưu nhiều prefix theo từng khóa và tránh ép sai dữ liệu.
