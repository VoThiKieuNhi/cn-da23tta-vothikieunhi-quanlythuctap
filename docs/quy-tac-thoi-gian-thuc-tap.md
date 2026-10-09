# Quy tắc thời gian thực tập

## Đang áp dụng khi thêm/sửa đợt thực tập

- Thời gian mở đăng ký < thời gian đóng đăng ký, lưu dưới dạng TIMESTAMPTZ.
- Khi tạo mới, thời gian mở phải >= thời điểm hiện tại của server; không dùng giá trị "hiện tại" từ request.
- Khi sửa: đọc và khóa bản ghi hiện tại. Nếu đợt chưa đến giờ mở và thời gian mở thay đổi, thời gian mới phải >= thời điểm server. Không dựa vào trạng thái cũ đã lưu. Không ép giờ mở lịch sử không đổi hoặc đợt đã bắt đầu phải ở tương lai.
- Ngày bắt đầu thực tập (00:00 theo Asia/Ho_Chi_Minh) > thời gian đóng đăng ký. Không quy định khoảng cách tối thiểu 3 hay 5 ngày.
- Ngày bắt đầu thực tập < ngày kết thúc thực tập.
- Frontend và backend cùng kiểm tra; backend quyết định cuối cùng. Nhập/hiển thị theo giờ Việt Nam, API yêu cầu ISO 8601 có Z hoặc offset. Không phụ thuộc múi giờ máy người dùng.

## Trạng thái tự động và học kỳ

- Chỉ nhận đúng `Học kỳ 1` hoặc `Học kỳ 2`; không nhận học kỳ hè hay văn bản tùy ý.
- Backend bỏ qua `trangThai` trong POST/PUT, tự tính và lưu trạng thái. Form không gửi trường này.
- Hàm dùng chung `periodStatus.js` dùng cùng tập mốc thời gian cho tính toán khi lưu và SQL khi đọc/lọc/phân trang. GET luôn tính lại, không phụ thuộc giá trị trạng thái lưu cũ, không cần scheduler.
- Trước giờ mở: SAP_MO. Từ giờ mở đến đúng giờ đóng: DANG_MO_DANG_KY. Sau giờ đóng đến trước ngày thực tập: CHO_BAT_DAU.
- Ngày thực tập bắt đầu lúc 00:00 Việt Nam; đợt DANG_THUC_TAP đến hết ngày kết thúc (DATE), sau đó DA_KET_THUC.
- Migration `002_period_waiting_status.sql` thêm CHO_BAT_DAU vào CHECK và giữ đủ bốn trạng thái cũ, không thay đổi bản ghi.
- Dashboard vẫn đếm đăng ký sinh viên ở DANG_THUC_TAP, đồng thời yêu cầu đợt đang trong thời gian thực tập tự động. Không tự chuyển trạng thái đăng ký sinh viên hoặc bỏ qua quy trình duyệt/phân công.

## Migration giờ đăng ký

- `back-end/migrations/001_registration_timestamps.sql` chỉ đổi hai cột đăng ký DATE sang TIMESTAMPTZ trong transaction; giữ nguyên các cột khác, bản ghi và ràng buộc.
- Dữ liệu cũ: ngày mở thành 00:00:00.000, ngày đóng thành 23:59:59.999 của cùng ngày tại Asia/Ho_Chi_Minh, giữ trọn ngày đăng ký cũ (kể cả mở/đóng cùng ngày).
- Có thể chạy lại migration khi cả hai cột đã là TIMESTAMPTZ; không chuyển đổi lần nữa. Kiểu dữ liệu ngoài dự kiến hoặc không lấy được khóa trong 5 giây khiến migration dừng an toàn.
- Form hiển thị đến phút; khi không sửa phút đang hiển thị, giữ nguyên giây/millisecond cũ để không làm thay đổi dữ liệu lịch sử.

## Quy tắc cần triển khai ở module sau

- Ở module đăng ký/duyệt đăng ký, sinh viên chỉ được bắt đầu thực tập sau khi đăng ký được xác nhận/duyệt theo quy trình.
- Không cho chuyển đăng ký sinh viên sang `DANG_THUC_TAP` nếu chưa được duyệt hoặc chưa hoàn tất xác nhận/phân công giảng viên theo quy trình hệ thống. Đây là trạng thái của đăng ký sinh viên, không phải trạng thái đợt thực tập.
- Không đặt logic xác nhận giảng viên vào bảng `dot_thuc_tap`.
- Ngày kết thúc thực tập phải <= hạn kết thúc học phần/học kỳ. Hiện chưa có trường lưu hạn này nên chưa thể kiểm tra; bổ sung khi thiết kế dữ liệu học kỳ/học phần, không suy diễn hạn từ chuỗi năm học.

Các quy tắc ở phần này chỉ được ghi nhận, chưa triển khai chức năng hoặc thay đổi schema.
