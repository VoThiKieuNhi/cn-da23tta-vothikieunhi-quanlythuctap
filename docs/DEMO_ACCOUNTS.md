# Tài khoản demo 20 sinh viên / 20 giảng viên

Đã áp dụng trên `quan_ly_thuc_tap`: 20 sinh viên thuộc 20 ngành, 20 giảng viên thuộc 6 đơn vị. Đã xác minh 40/40 tài khoản đăng nhập và gọi `/api/auth/me` thành công. Chạy seed lần hai không tạo trùng hoặc đổi mật khẩu. Toàn bộ 203 test backend pass.

File cập nhật cho bộ seed: `back-end/scripts/seed-demo.js`, `back-end/scripts/clear-demo.js`, `back-end/tests/demo.test.js`, `back-end/.env.example` và tài liệu này. Không dùng `DEMO_PASSWORD`; không sửa giá trị trong `.env` thực tế. Không chạy clear-demo trên dữ liệu thật trong bước này.

Sinh viên: mật khẩu = MSSV. Giảng viên demo: mật khẩu `12345678`. Database lưu bcrypt cost 12; không có mật khẩu/hash trong manifest. Không tạo hoặc thay đổi Admin.

Tên sinh viên là dữ liệu demo. Tên và đơn vị giảng viên lấy từ danh mục reference; các email demo không phải email liên hệ thật của giảng viên.

## Sinh viên

| MSSV | Họ tên | Email | Ngành | Lớp | Khóa |
|---|---|---|---|---|---|
| 115524101 | Võ Quỳnh Như | 115524101@st.tvu.edu.vn | Biểu diễn nhạc cụ truyền thống | DA24NCT | 2024 |
| 119625101 | Lê Hoàng Minh | 119625101@st.tvu.edu.vn | Công nghệ kỹ thuật cơ điện tử | DA25CDT | 2025 |
| 115224101 | Trần Hoàng Nam | 115224101@st.tvu.edu.vn | Công nghệ kỹ thuật điều khiển và tự động hóa | DA24DT | 2024 |
| 112624101 | Đặng Minh Phúc | 112624101@st.tvu.edu.vn | Công nghệ kỹ thuật hóa học | DA24HH | 2024 |
| 118824101 | Bùi Anh Quân | 118824101@st.tvu.edu.vn | Hóa dược | DA24HD | 2024 |
| 114624101 | Phạm Bảo Ngọc | 114624101@st.tvu.edu.vn | Kinh tế | DA24K | 2024 |
| 117324101 | Lê Ngọc Mai | 117324101@st.tvu.edu.vn | Kỹ thuật phục hồi chức năng | DA24PHCNA | 2024 |
| 114124101 | Trần Đức Long | 114124101@st.tvu.edu.vn | Luật | DA24LA | 2024 |
| 110424101 | Phạm Thanh Bình | 110424101@st.tvu.edu.vn | Ngôn ngữ Anh | DA24NNAA | 2024 |
| 118724101 | Đặng Hải Đăng | 118724101@st.tvu.edu.vn | Ngôn ngữ Trung Quốc | DA24NNTQ | 2024 |
| 114724101 | Dương Quốc Việt | 114724101@st.tvu.edu.vn | Nông nghiệp | DA24NN | 2024 |
| 110324101 | Bùi Thu Hà | 110324101@st.tvu.edu.vn | Nuôi trồng thủy sản | DA24TS | 2024 |
| 117424101 | Hồ Phương Thảo | 117424101@st.tvu.edu.vn | Quản lý nhà nước | DA24QLNN | 2024 |
| 116624101 | Võ Minh Châu | 116624101@st.tvu.edu.vn | Quản trị dịch vụ du lịch và lữ hành | DA24QDL | 2024 |
| 112224101 | Đỗ Gia Huy | 112224101@st.tvu.edu.vn | Quản trị kinh doanh | DA24QKDA | 2024 |
| 110924101 | Hồ Ngọc Lan | 110924101@st.tvu.edu.vn | Quản trị văn phòng | DA24QV | 2024 |
| 114524101 | Nguyễn Minh Anh | 114524101@st.tvu.edu.vn | Tài chính – Ngân hàng | DA24TCNHA | 2024 |
| 117624101 | Nguyễn Thảo Linh | 117624101@st.tvu.edu.vn | Thương mại điện tử | DA24TMDT | 2024 |
| 118324101 | Dương Tuấn Kiệt | 118324101@st.tvu.edu.vn | Y học dự phòng | DA24YHDP | 2024 |
| 116124101 | Đỗ Thanh Tâm | 116124101@st.tvu.edu.vn | Y tế công cộng | DA24YTC | 2024 |

## Giảng viên

| Mã GV | Họ tên | Email | Đơn vị |
|---|---|---|---|
| DEMO-GV01 | Trương Văn Mến | demo.gv01@tvu.edu.vn | Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ |
| DEMO-GV02 | Nguyễn Nhứt Lam | demo.gv02@tvu.edu.vn | Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ |
| DEMO-GV03 | Cao Phương Thảo | demo.gv03@tvu.edu.vn | Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ |
| DEMO-GV04 | Huỳnh Tấn Thành | demo.gv04@tvu.edu.vn | Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ |
| DEMO-GV05 | Nguyễn Thành Tựu | demo.gv05@tvu.edu.vn | Khoa Môi trường – Trường Kỹ thuật và Công nghệ |
| DEMO-GV06 | Huỳnh Văn Hiệp | demo.gv06@tvu.edu.vn | Khoa Xây dựng – Trường Kỹ thuật và Công nghệ |
| DEMO-GV07 | Trần Văn Điền | demo.gv07@tvu.edu.vn | Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ |
| DEMO-GV08 | Thạch Kọng Saoane | demo.gv08@tvu.edu.vn | Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ |
| DEMO-GV09 | Trần Song Toàn | demo.gv09@tvu.edu.vn | Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ |
| DEMO-GV10 | Lê Ngọc Long | demo.gv10@tvu.edu.vn | Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ |
| DEMO-GV11 | Phạm Kim Long | demo.gv11@tvu.edu.vn | Khoa Môi trường – Trường Kỹ thuật và Công nghệ |
| DEMO-GV12 | Nguyễn Vy Thanh | demo.gv12@tvu.edu.vn | Khoa Xây dựng – Trường Kỹ thuật và Công nghệ |
| DEMO-GV13 | Nguyễn Vũ Lực | demo.gv13@tvu.edu.vn | Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ |
| DEMO-GV14 | Nguyễn Trần Diễm Hạnh | demo.gv14@tvu.edu.vn | Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ |
| DEMO-GV15 | Lê Minh Hải | demo.gv15@tvu.edu.vn | Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ |
| DEMO-GV16 | Nguyễn Thiện Thảo | demo.gv16@tvu.edu.vn | Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ |
| DEMO-GV17 | Vương Tuấn Phong | demo.gv17@tvu.edu.vn | Khoa Môi trường – Trường Kỹ thuật và Công nghệ |
| DEMO-GV18 | Đoàn Công Chánh | demo.gv18@tvu.edu.vn | Khoa Xây dựng – Trường Kỹ thuật và Công nghệ |
| DEMO-GV19 | Nguyễn Khắc Bằng | demo.gv19@tvu.edu.vn | Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ |
| DEMO-GV20 | Nguyễn Bá Nhiệm | demo.gv20@tvu.edu.vn | Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ |

## Đăng ký demo

20 đăng ký CHO_DUYET trong Học kỳ 1 năm 2027-2028, thực tập từ 2027-10-01 đến 2027-11-30. Đợt áp dụng tất cả ngành, cổng đăng ký đang mở. Không tạo tiến độ/đánh giá giả trước ngày thực tập.

Chạy lại `npm run seed-demo` không tạo trùng hoặc reset mật khẩu. Giữ `back-end/.demo/manifest.json` để nhận diện dữ liệu demo. `npm run clear-demo` chỉ dành cho khi muốn xóa bộ demo; không chạy trong bước này.
