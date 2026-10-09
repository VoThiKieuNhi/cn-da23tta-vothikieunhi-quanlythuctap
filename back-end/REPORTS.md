# Báo cáo - Thống kê Admin

Route giao diện: `/admin/reports`. Tất cả `/api/admin/reports/*` yêu cầu JWT và ADMIN.

Các endpoint GET: `overview`, `by-major`, `by-company`, `by-lecturer`, `registration-status`, `report-status`, `evaluation`, `students`, `export`. `options` lấy bộ lọc; `summary` gom thống kê để frontend không gọi từng chart riêng.

Mọi endpoint dữ liệu và Excel dùng chung bộ lọc `dotThucTapId`, `hocKy`, `namHoc`, `nganhId`, `trangThai`, `search`. Bấm Áp dụng để cập nhật; xuất Excel dùng bộ lọc đã áp dụng, bỏ phân trang. Search áp dụng cho cả tổng quan và file xuất.

Quy ước:
- Tổng sinh viên: COUNT DISTINCT sinh_vien_id trong các đăng ký được lọc. Các card Chờ duyệt/Đang thực tập/Hoàn thành cũng đếm sinh viên duy nhất trong trạng thái tương ứng. Một sinh viên có nhiều đợt có thể xuất hiện trong nhiều trạng thái; tổng các card không nhất thiết bằng tổng sinh viên.
- Trạng thái đăng ký lấy trạng thái nghiệp vụ đã lưu; không tự đổi DA_DUYET thành DANG_THUC_TAP chỉ vì đến ngày. Trạng thái đợt trong options dùng utility periodStatus hiện có.
- Báo cáo đã duyệt: số đăng ký có báo cáo mới nhất DA_DUYET. Đã đánh giá: số đăng ký có đánh giá. Điểm trung bình tính trên điểm tổng của đánh giá mới nhất theo đăng ký; không có điểm trả null.
- Chưa phân công/chưa đánh giá: chỉ đăng ký đã duyệt, đang thực tập hoặc hoàn thành. Đã phân công: có phân công.
- Các biểu đồ trạng thái và bảng chi tiết đếm theo đăng ký, không nhân bản khi có nhiều báo cáo/tiến độ/phân công. Lấy bản ghi con mới nhất theo ngày và ID.
- Ngành đối chiếu tên danh mục, hoặc lớp tham chiếu cho hồ sơ cũ. Không suy đoán từ MSSV; không khớp thì giữ tên ngành cũ để tránh mất dữ liệu.
- Đang hướng dẫn: sinh viên duy nhất có trạng thái DA_DUYET hoặc DANG_THUC_TAP. Đã hoàn thành: HOAN_THANH.

ExcelJS tạo 5 sheet bằng cùng SQL trong transaction REPEATABLE READ READ ONLY. MSSV là chuỗi, nội dung người dùng không được chuyển thành công thức; chỉ xuất các cột hồ sơ cần thiết.

Kiểm tra: `node --test tests/adminReports.test.js`; `node scripts/checkAdminReports.js` kiểm tra API và Excel bằng database thật, chỉ đọc, không tạo dữ liệu mẫu.
