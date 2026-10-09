-- TVU REFERENCE SEED
-- Database target: quan_ly_thuc_tap
-- Safe/idempotent: creates reference tables only if absent and uses UPSERT.
-- Generated from 3 Excel files supplied in the conversation.
-- IMPORTANT: do not use this script to replace existing sinh_vien/giang_vien account data.
BEGIN;


CREATE TABLE IF NOT EXISTS nganh_hoc (
    id BIGSERIAL PRIMARY KEY,
    ma_nganh VARCHAR(20) UNIQUE NOT NULL,
    ten_nganh VARCHAR(255) NOT NULL,
    nhom_nganh VARCHAR(255),
    ma_viet_tat_lop VARCHAR(50),
    prefix_mssv_mac_dinh VARCHAR(4),
    ghi_chu_lop TEXT,
    ghi_chu_mssv TEXT,
    nguon_lop TEXT,
    nguon_mssv TEXT,
    dang_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lop_hoc (
    id BIGSERIAL PRIMARY KEY,
    ma_lop VARCHAR(50) UNIQUE NOT NULL,
    nganh_id BIGINT NOT NULL REFERENCES nganh_hoc(id) ON DELETE RESTRICT,
    khoa_nhap_hoc SMALLINT,
    dang_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
    ghi_chu TEXT,
    nguon TEXT,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ma_mssv_nganh (
    id BIGSERIAL PRIMARY KEY,
    nganh_id BIGINT NOT NULL REFERENCES nganh_hoc(id) ON DELETE CASCADE,
    khoa_nhap_hoc SMALLINT NOT NULL,
    prefix_mssv VARCHAR(4) NOT NULL,
    xac_minh BOOLEAN NOT NULL DEFAULT FALSE,
    ghi_chu TEXT,
    nguon TEXT,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ma_mssv_nganh UNIQUE (nganh_id, khoa_nhap_hoc, prefix_mssv),
    CONSTRAINT ck_prefix_mssv_4_so CHECK (prefix_mssv ~ '^\d{4}$')
);

CREATE TABLE IF NOT EXISTS danh_muc_giang_vien_tvu (
    id BIGSERIAL PRIMARY KEY,
    khoa_don_vi VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    hoc_vi VARCHAR(50),
    chuc_vu VARCHAR(120),
    linh_vuc TEXT,
    nguon_url TEXT,
    dang_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dm_giang_vien_tvu UNIQUE (ho_ten, khoa_don_vi)
);

CREATE INDEX IF NOT EXISTS idx_nganh_hoc_ten ON nganh_hoc(ten_nganh);
CREATE INDEX IF NOT EXISTS idx_nganh_hoc_nhom ON nganh_hoc(nhom_nganh);
CREATE INDEX IF NOT EXISTS idx_lop_hoc_nganh ON lop_hoc(nganh_id);
CREATE INDEX IF NOT EXISTS idx_lop_hoc_khoa ON lop_hoc(khoa_nhap_hoc);
CREATE INDEX IF NOT EXISTS idx_mssv_prefix ON ma_mssv_nganh(prefix_mssv, khoa_nhap_hoc);
CREATE INDEX IF NOT EXISTS idx_dm_gv_khoa ON danh_muc_giang_vien_tvu(khoa_don_vi);
CREATE INDEX IF NOT EXISTS idx_dm_gv_ten ON danh_muc_giang_vien_tvu(ho_ten);


-- 1) NGÀNH HỌC

INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7810301', 'Quản lý thể dục thể thao', 'Xã hội – Tâm lý – Thể thao', 'QLTD', '1178', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7760101', 'Công tác xã hội', 'Xã hội – Tâm lý – Thể thao', 'CXH', '1151', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7310401', 'Tâm lý học', 'Xã hội – Tâm lý – Thể thao', NULL, NULL, 'Ngành mới 2026; chưa xác minh mã lớp DA26', 'Ngành mới 2026', NULL, 'https://tuyensinh.tvu.edu.vn/', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510102', 'Công nghệ kỹ thuật công trình xây dựng', 'Kỹ thuật – Công nghệ', 'XD', '1117', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7580205', 'Kỹ thuật xây dựng công trình giao thông', 'Kỹ thuật – Công nghệ', 'XDGT', '1168', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510303', 'Công nghệ kỹ thuật điều khiển và tự động hóa', 'Kỹ thuật – Công nghệ', 'DT', '1152', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-kinh-doanh-tvu-onschool/phu-luc-1-nguyen-kien-trung/115165162', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510301', 'Công nghệ kỹ thuật điện, điện tử', 'Kỹ thuật – Công nghệ', 'KD', '1121', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510201', 'Công nghệ kỹ thuật cơ khí', 'Kỹ thuật – Công nghệ', 'CK', '1118', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510203', 'Công nghệ kỹ thuật cơ điện tử', 'Kỹ thuật – Công nghệ', 'CDT', '1196', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510205', 'Công nghệ kỹ thuật ô tô', 'Kỹ thuật – Công nghệ', 'CNOT', '1180', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510401', 'Công nghệ kỹ thuật hóa học', 'Kỹ thuật – Công nghệ', 'HH', '1126', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1071301957/2026-05-27-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7480107', 'Trí tuệ nhân tạo', 'Kỹ thuật – Công nghệ', 'TTNT', '1195', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7480201', 'Công nghệ thông tin', 'Kỹ thuật – Công nghệ', 'TT', '1101', 'Có chương trình tích hợp tiếng Anh: DA25TT_EIP', 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-quan-he-kh/bao-cao-tuan-2-thiet-ke-co-so-du-lieu-he-thong-dat-phong-da23ttd/164106797', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7310201', 'Chính trị học', 'Lý luận chính trị', 'CTH', '1165', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7540101', 'Công nghệ thực phẩm', 'Nông nghiệp – Sinh học – Thủy sản', 'CNTP', '1162', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7420201', 'Công nghệ sinh học', 'Nông nghiệp – Sinh học – Thủy sản', 'CNSH', '1177', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7620112', 'Bảo vệ thực vật', 'Nông nghiệp – Sinh học – Thủy sản', 'BVTV', '1115', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7620101', 'Nông nghiệp', 'Nông nghiệp – Sinh học – Thủy sản', 'NN', '1147', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7620301', 'Nuôi trồng thủy sản', 'Nông nghiệp – Sinh học – Thủy sản', 'TS', '1103', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7640101', 'Thú y', 'Nông nghiệp – Sinh học – Thủy sản', 'TY', '1113', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7519002', 'Công nghệ nông nghiệp', 'Nông nghiệp – Sinh học – Thủy sản', NULL, NULL, 'Ngành mới 2026; chưa xác minh mã lớp DA26', 'Ngành mới 2026', NULL, 'https://tuyensinh.tvu.edu.vn/nganh-cong-nghe-nong-nghiep/', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7510605', 'Logistics và Quản lý chuỗi cung ứng', 'Kinh tế – Luật – Logistics – Quản trị', 'LQLC', '1192', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7380101', 'Luật', 'Kinh tế – Luật – Logistics – Quản trị', 'L', '1141', NULL, 'Đã đối chiếu; mã lớp có nhiều nhánh', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1071301957/2026-05-27-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7340101', 'Quản trị kinh doanh', 'Kinh tế – Luật – Logistics – Quản trị', 'QKD', '1122', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7340301', 'Kế toán', 'Kinh tế – Luật – Logistics – Quản trị', 'KT', '1119', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7310101', 'Kinh tế', 'Kinh tế – Luật – Logistics – Quản trị', 'K', '1146', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7340201', 'Tài chính – Ngân hàng', 'Kinh tế – Luật – Logistics – Quản trị', 'TCNH', '1145', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7340406', 'Quản trị văn phòng', 'Kinh tế – Luật – Logistics – Quản trị', 'QV', '1109', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7310205', 'Quản lý nhà nước', 'Kinh tế – Luật – Logistics – Quản trị', 'QLNN', '1174', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7340122', 'Thương mại điện tử', 'Kinh tế – Luật – Logistics – Quản trị', 'TMDT', '1176', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7210201', 'Âm nhạc học', 'Ngôn ngữ – Văn hóa – Nghệ thuật – Du lịch', 'ANH', '1171', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7210210', 'Biểu diễn nhạc cụ truyền thống', 'Ngôn ngữ – Văn hóa – Nghệ thuật – Du lịch', 'NCT', '1155', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7220201', 'Ngôn ngữ Anh', 'Ngôn ngữ – Văn hóa – Nghệ thuật – Du lịch', 'NNA', '1104', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7220106', 'Ngôn ngữ Khmer', 'Ngôn ngữ – Văn hóa – Nghệ thuật – Du lịch', 'NNK', '1148', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7220204', 'Ngôn ngữ Trung Quốc', 'Ngôn ngữ – Văn hóa – Nghệ thuật – Du lịch', 'NNTQ', '1187', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7810103', 'Quản trị dịch vụ du lịch và lữ hành', 'Ngôn ngữ – Văn hóa – Nghệ thuật – Du lịch', 'QDL', '1166', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7229040', 'Văn hóa học', 'Ngôn ngữ – Văn hóa – Nghệ thuật – Du lịch', 'VH', '1125', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720101', 'Y khoa', 'Khoa học sức khỏe – Y Dược', 'YK', '1160', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/971926940/Da23yka-n1-1-1-t%E1%BB%95-3-%C6%B0u-Nh%C6%B0%E1%BB%A3c-%C4%90i%E1%BB%83m-C%E1%BB%A7a-%C4%90%C6%B0%E1%BB%9Dng-Tiem-B%E1%BA%AFp', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720501', 'Răng – Hàm – Mặt', 'Khoa học sức khỏe – Y Dược', 'RHM', '1164', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1023168829/Danh-Sach-%C4%90a-K%C3%BD-12-Mar-2026-14-23-40-1-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720301', 'Điều dưỡng', 'Khoa học sức khỏe – Y Dược', 'DD', '1154', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720110', 'Y học dự phòng', 'Khoa học sức khỏe – Y Dược', 'YHDP', '1183', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720602', 'Kỹ thuật hình ảnh y học', 'Khoa học sức khỏe – Y Dược', 'KTHY', '1184', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720603', 'Kỹ thuật phục hồi chức năng', 'Khoa học sức khỏe – Y Dược', 'PHCN', '1173', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720601', 'Kỹ thuật xét nghiệm y học', 'Khoa học sức khỏe – Y Dược', 'XYH', '1153', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720701', 'Y tế công cộng', 'Khoa học sức khỏe – Y Dược', 'YTC', '1161', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1071301957/2026-05-27-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720201', 'Dược học', 'Khoa học sức khỏe – Y Dược', 'D', '1156', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7720203', 'Hóa dược', 'Khoa học sức khỏe – Y Dược', 'HD', '1188', NULL, 'Đã đối chiếu; khóa 23 có tài liệu xuất hiện thêm 112623xxx', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1070700988/SHGK-Truong-Y-Duoc', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7520320', 'Kỹ thuật môi trường', 'Môi trường – Tài nguyên', 'KTMT', NULL, NULL, 'Chưa đủ dữ liệu công khai để kết luận prefix', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://cet.tvu.edu.vn/index.php/tuyen-sinh/thongbao-tuyensinh/xac-nhan-nhap-hoc-va-lam-thu-tuc-nhap-hoc-doi-voi-thi-sinh-trung-tuyen-dh-he-cq-dot-1-nam-2026', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO nganh_hoc (ma_nganh, ten_nganh, nhom_nganh, ma_viet_tat_lop, prefix_mssv_mac_dinh, ghi_chu_lop, ghi_chu_mssv, nguon_lop, nguon_mssv, dang_hoat_dong) VALUES ('7850101', 'Quản lý tài nguyên và môi trường', 'Môi trường – Tài nguyên', 'QLTN', '1191', NULL, 'Đã đối chiếu', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1', TRUE) ON CONFLICT (ma_nganh) DO UPDATE SET ten_nganh=EXCLUDED.ten_nganh, nhom_nganh=EXCLUDED.nhom_nganh, ma_viet_tat_lop=EXCLUDED.ma_viet_tat_lop, prefix_mssv_mac_dinh=EXCLUDED.prefix_mssv_mac_dinh, ghi_chu_lop=EXCLUDED.ghi_chu_lop, ghi_chu_mssv=EXCLUDED.ghi_chu_mssv, nguon_lop=EXCLUDED.nguon_lop, nguon_mssv=EXCLUDED.nguon_mssv, dang_hoat_dong=EXCLUDED.dang_hoat_dong, ngay_cap_nhat=CURRENT_TIMESTAMP;

-- 2) LỚP HỌC

INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24QLTD', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7810301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QLTDA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7810301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QLTDB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7810301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24CXH', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7760101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CXH', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7760101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24XD', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510102'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25XD', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510102'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24XDGT', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7580205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25XDGT', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7580205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DT', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510303'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25DT', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510303'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24KDA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24KDB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24KDC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25KDA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25KDB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25KDC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24CK', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CK', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CDT', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510203'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24CNOTA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24CNOTB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CNOTA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CNOTB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24HH', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510401'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25HH', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510401'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TTNT', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480107'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TTA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TTB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TTC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TTD', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TTA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TTB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TTC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TTD', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TT_EIP', n.id, 2025, TRUE, 'Có chương trình tích hợp tiếng Anh: DA25TT_EIP', 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24CTH', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CTH', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24CNTP', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7540101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CNTP', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7540101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24CNSH', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7420201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25CNSH', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7420201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24BVTV', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7620112'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25BVTV', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7620112'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NN', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7620101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NN', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7620101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TS', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7620301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TS', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7620301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TYA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TYB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TYC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TYA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TYB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TYC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24LQLC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510605'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25LQLC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510605'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24LA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24LB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24LC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25LA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25LB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25LC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24QKDA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24QKDB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QKDA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QKDB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QKDC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24KTA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24KTB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25KTA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25KTB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24K', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25K', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TCNHA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TCNHB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TCNHA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TCNHB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24QV', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340406'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QVA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340406'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QVB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340406'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QVC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340406'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24QLNN', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QLNNA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QLNNB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310205'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24TMDT', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340122'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25TMDT', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340122'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24ANH', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7210201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25ANH', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7210201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NCT', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7210210'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NCT', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7210210'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NNAA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NNAB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NNAC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NNAD', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NNAE', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNAA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNAB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNAC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNAD', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNAE', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NNK', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220106'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNKA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220106'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNKB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220106'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24NNTQ', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220204'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25NNTQ', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220204'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24QDL', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7810103'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QDLA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7810103'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QDLB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7810103'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24VH', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7229040'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25VH', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7229040'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24YKA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24YKB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24YKC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24YKD', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24YKE', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25YKA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25YKB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25YKC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25YKD', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25YKE', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24RHMA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720501'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24RHMB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720501'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25RHMA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720501'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25RHMB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720501'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DDA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DDB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DDC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DDD', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25DDA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25DDB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25DDC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25DDD', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25DDE', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24YHDP', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720110'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25YHDP', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720110'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24KTHY', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720602'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25KTHY', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720602'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24PHCNA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720603'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24PHCNB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720603'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25PHCNA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720603'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25PHCNB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720603'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24XYHA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720601'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24XYHB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720601'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25XYHA', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720601'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25XYHB', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720601'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24YTC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720701'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25YTC', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720701'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DA', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DB', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24DC', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25D', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24HD', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720203'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25HD', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7720203'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25KTMT', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7520320'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA24QLTN', n.id, 2024, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7850101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA25QLTN', n.id, 2025, TRUE, NULL, 'https://daotao.tvu.edu.vn/images/thongbao/2025/12.THONG_BAO_SO_15_VE_VIEC_DANG_KY_HOC_PHAN_HOC_KY_2_NAM_HOC_2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7850101'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA23TTA', n.id, 2023, TRUE, 'Bổ sung từ thông tin người dùng cung cấp; cần đối chiếu nguồn TVU nếu dùng làm dữ liệu chính thức.', NULL
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA23TTB', n.id, 2023, TRUE, 'Bổ sung từ thông tin người dùng cung cấp; cần đối chiếu nguồn TVU nếu dùng làm dữ liệu chính thức.', NULL
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO lop_hoc (ma_lop, nganh_id, khoa_nhap_hoc, dang_hoat_dong, ghi_chu, nguon)
SELECT 'DA23TTC', n.id, 2023, TRUE, 'Bổ sung từ thông tin người dùng cung cấp; cần đối chiếu nguồn TVU nếu dùng làm dữ liệu chính thức.', NULL
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (ma_lop) DO UPDATE SET
  nganh_id=EXCLUDED.nganh_id,
  khoa_nhap_hoc=EXCLUDED.khoa_nhap_hoc,
  dang_hoat_dong=EXCLUDED.dang_hoat_dong,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;

-- 3) QUY TẮC PREFIX MSSV THEO NGÀNH + KHÓA

INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1178', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c'
FROM nganh_hoc n WHERE n.ma_nganh = '7810301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1178', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c'
FROM nganh_hoc n WHERE n.ma_nganh = '7810301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1178', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c'
FROM nganh_hoc n WHERE n.ma_nganh = '7810301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1151', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7760101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1151', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7760101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1151', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7760101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1117', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029'
FROM nganh_hoc n WHERE n.ma_nganh = '7510102'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1117', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029'
FROM nganh_hoc n WHERE n.ma_nganh = '7510102'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1117', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029'
FROM nganh_hoc n WHERE n.ma_nganh = '7510102'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1168', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7580205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1168', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7580205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1168', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7580205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1152', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-kinh-doanh-tvu-onschool/phu-luc-1-nguyen-kien-trung/115165162'
FROM nganh_hoc n WHERE n.ma_nganh = '7510303'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1152', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-kinh-doanh-tvu-onschool/phu-luc-1-nguyen-kien-trung/115165162'
FROM nganh_hoc n WHERE n.ma_nganh = '7510303'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1152', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-kinh-doanh-tvu-onschool/phu-luc-1-nguyen-kien-trung/115165162'
FROM nganh_hoc n WHERE n.ma_nganh = '7510303'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1121', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1121', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1121', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1118', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1118', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1118', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1196', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510203'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1196', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510203'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1196', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7510203'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1180', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1180', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1180', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1126', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510401'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1126', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510401'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1126', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7510401'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1195', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c'
FROM nganh_hoc n WHERE n.ma_nganh = '7480107'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1195', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c'
FROM nganh_hoc n WHERE n.ma_nganh = '7480107'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1195', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301782/GKYT-2-7-%C4%90%E1%BA%A1i-H%E1%BB%99i-Th%E1%BB%83-D%E1%BB%A5c-Th%E1%BB%83-Thao-Ph%C6%B0%E1%BB%9Dng-Long-%C4%90%E1%BB%A9c'
FROM nganh_hoc n WHERE n.ma_nganh = '7480107'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1101', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-quan-he-kh/bao-cao-tuan-2-thiet-ke-co-so-du-lieu-he-thong-dat-phong-da23ttd/164106797'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1101', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-quan-he-kh/bao-cao-tuan-2-thiet-ke-co-so-du-lieu-he-thong-dat-phong-da23ttd/164106797'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1101', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/quan-tri-quan-he-kh/bao-cao-tuan-2-thiet-ke-co-so-du-lieu-he-thong-dat-phong-da23ttd/164106797'
FROM nganh_hoc n WHERE n.ma_nganh = '7480201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1165', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7310201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1165', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7310201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1165', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7310201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1162', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7540101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1162', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7540101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1162', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7540101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1177', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7420201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1177', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7420201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1177', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914540/Dssv-Tham-Du-Cong-Bo-Dhtv-pdf-145928-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7420201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1115', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7620112'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1115', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7620112'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1115', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7620112'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1147', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7620101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1147', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7620101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1147', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7620101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1103', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029'
FROM nganh_hoc n WHERE n.ma_nganh = '7620301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1103', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029'
FROM nganh_hoc n WHERE n.ma_nganh = '7620301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1103', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/truong-dai-hoc-tra-vinh/truong-dai-hoc-tra-vinh/danh-sach-tham-gia-ra-quan-ve-sinh-ntvt-21/140618029'
FROM nganh_hoc n WHERE n.ma_nganh = '7620301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1113', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1113', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1113', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7640101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1192', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7510605'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1192', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7510605'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1192', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7510605'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1141', TRUE, 'Đã đối chiếu; mã lớp có nhiều nhánh', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1141', TRUE, 'Đã đối chiếu; mã lớp có nhiều nhánh', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1141', TRUE, 'Đã đối chiếu; mã lớp có nhiều nhánh', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7380101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1122', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1122', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1122', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7340101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1119', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1119', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1119', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1146', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7310101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1146', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7310101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1146', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7310101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1145', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1145', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1145', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7340201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1109', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340406'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1109', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340406'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1109', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340406'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1174', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1174', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1174', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7310205'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1176', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340122'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1176', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340122'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1176', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7340122'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1171', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7210201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1171', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7210201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1171', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7210201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1155', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7210210'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1155', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7210210'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1155', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7210210'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1104', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1104', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1104', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/10/Thong-bao-Trung-tuyen-Hoc-bong-tai-tro-Fondation-Dela-Cheneliere-2025-2026.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1148', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7220106'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1148', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7220106'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1148', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7220106'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1187', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220204'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1187', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220204'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1187', TRUE, 'Đã đối chiếu', 'https://ctsv.tvu.edu.vn/wp-content/uploads/2025/11/Tms.-Thong-bao-KQ-trung-tuyen-HB-HKH-Thuong-gia-Dai-Loan-tai-Viet-Nam-2025.pdf'
FROM nganh_hoc n WHERE n.ma_nganh = '7220204'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1166', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7810103'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1166', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7810103'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1166', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914535/shgk-truong-claska-pdf-15434-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7810103'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1125', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7229040'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1125', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7229040'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1125', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7229040'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1160', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/971926940/Da23yka-n1-1-1-t%E1%BB%95-3-%C6%B0u-Nh%C6%B0%E1%BB%A3c-%C4%90i%E1%BB%83m-C%E1%BB%A7a-%C4%90%C6%B0%E1%BB%9Dng-Tiem-B%E1%BA%AFp'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1160', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/971926940/Da23yka-n1-1-1-t%E1%BB%95-3-%C6%B0u-Nh%C6%B0%E1%BB%A3c-%C4%90i%E1%BB%83m-C%E1%BB%A7a-%C4%90%C6%B0%E1%BB%9Dng-Tiem-B%E1%BA%AFp'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1160', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/971926940/Da23yka-n1-1-1-t%E1%BB%95-3-%C6%B0u-Nh%C6%B0%E1%BB%A3c-%C4%90i%E1%BB%83m-C%E1%BB%A7a-%C4%90%C6%B0%E1%BB%9Dng-Tiem-B%E1%BA%AFp'
FROM nganh_hoc n WHERE n.ma_nganh = '7720101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1164', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1023168829/Danh-Sach-%C4%90a-K%C3%BD-12-Mar-2026-14-23-40-1-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720501'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1164', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1023168829/Danh-Sach-%C4%90a-K%C3%BD-12-Mar-2026-14-23-40-1-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720501'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1164', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1023168829/Danh-Sach-%C4%90a-K%C3%BD-12-Mar-2026-14-23-40-1-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720501'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1154', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1154', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1154', TRUE, 'Đã đối chiếu', 'https://www.studocu.vn/vn/document/tra-vinh-university/ngon-ngu-hoc/danh-sach-sinh-vien-tham-gia-hoat-dong-truyen-phong-chong-ma-tuy-dh-tra-vinh/155712409'
FROM nganh_hoc n WHERE n.ma_nganh = '7720301'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1183', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025'
FROM nganh_hoc n WHERE n.ma_nganh = '7720110'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1183', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025'
FROM nganh_hoc n WHERE n.ma_nganh = '7720110'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1183', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025'
FROM nganh_hoc n WHERE n.ma_nganh = '7720110'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1184', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7720602'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1184', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7720602'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1184', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7720602'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1173', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025'
FROM nganh_hoc n WHERE n.ma_nganh = '7720603'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1173', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025'
FROM nganh_hoc n WHERE n.ma_nganh = '7720603'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1173', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/872525853/Danh-Sach-C%E1%BB%95-V%C5%A9-Bong-%C4%90a-02032025'
FROM nganh_hoc n WHERE n.ma_nganh = '7720603'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1153', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7720601'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1153', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7720601'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1153', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/802308532/DS-A-ia-n-form9-16-2024-DS-Tham-gia-chuong-trinh-van-nghe-chao-doan-tan-SV'
FROM nganh_hoc n WHERE n.ma_nganh = '7720601'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1161', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720701'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1161', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720701'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1161', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071301957/2026-05-27-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720701'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1156', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1156', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1156', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1077914533/Dssv-Tham-Du-Le-Phat-Dong-Sh-Chinh-Tri-pdf-15147-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7720201'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1188', TRUE, 'Đã đối chiếu; khóa 23 có tài liệu xuất hiện thêm 112623xxx', 'https://www.scribd.com/document/1070700988/SHGK-Truong-Y-Duoc'
FROM nganh_hoc n WHERE n.ma_nganh = '7720203'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1126', TRUE, 'Đã đối chiếu; khóa 23 có tài liệu xuất hiện thêm 112623xxx', 'https://www.scribd.com/document/1070700988/SHGK-Truong-Y-Duoc'
FROM nganh_hoc n WHERE n.ma_nganh = '7720203'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1188', TRUE, 'Đã đối chiếu; khóa 23 có tài liệu xuất hiện thêm 112623xxx', 'https://www.scribd.com/document/1070700988/SHGK-Truong-Y-Duoc'
FROM nganh_hoc n WHERE n.ma_nganh = '7720203'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1188', TRUE, 'Đã đối chiếu; khóa 23 có tài liệu xuất hiện thêm 112623xxx', 'https://www.scribd.com/document/1070700988/SHGK-Truong-Y-Duoc'
FROM nganh_hoc n WHERE n.ma_nganh = '7720203'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2023, '1191', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7850101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2024, '1191', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7850101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO ma_mssv_nganh (nganh_id, khoa_nhap_hoc, prefix_mssv, xac_minh, ghi_chu, nguon)
SELECT n.id, 2025, '1191', TRUE, 'Đã đối chiếu', 'https://www.scribd.com/document/1071302050/DA24LDS-114124024-Le-Qui-Xuan-Dang-1'
FROM nganh_hoc n WHERE n.ma_nganh = '7850101'
ON CONFLICT (nganh_id, khoa_nhap_hoc, prefix_mssv) DO UPDATE SET
  xac_minh=EXCLUDED.xac_minh,
  ghi_chu=EXCLUDED.ghi_chu,
  nguon=EXCLUDED.nguon,
  ngay_cap_nhat=CURRENT_TIMESTAMP;

-- 4) DANH MỤC GIẢNG VIÊN TVU THAM CHIẾU

INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Nhứt Lam', 'TS.', 'Trưởng khoa', 'Graph neural network; Social network analysis; Deep learning for smart city; AI', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Thạch Kọng Saoane', 'TS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Trần Diễm Hạnh', 'TS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Bá Nhiệm', 'ThS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Lê Phong Dũ', 'ThS.', 'Phó Trưởng khoa', 'Điều khiển tắc nghẽn mạng; Mạng hướng nội dung; Mạng xã hội', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Đoàn Phước Miền', 'TS.', 'Giảng viên', 'Thị giác máy tính; xử lý ảnh', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Võ Thành C', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Trịnh Quốc Việt', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Trần Văn Nam', 'ThS.', 'Giảng viên', 'Xử lý ngôn ngữ tự nhiên', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Trầm Hoàng Nam', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Phan Thị Phương Nam', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Phạm Thị Trúc Mai', 'ThS.', 'Giảng viên', 'Phát triển ứng dụng web mã nguồn mở; Hệ chuyên gia; Khai phá dữ liệu; Phân tích dữ liệu; Phân tích mạng xã hội', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Phạm Minh Đương', 'ThS.', 'Giảng viên', 'Công nghệ thông tin và ứng dụng', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thừa Phát Tài', 'ThS.', 'Giảng viên', 'Hệ thống thông tin', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Ngọc Đan Thanh', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Mộng Hiền', 'ThS.', 'Giảng viên', 'Thị giác máy tính; xử lý ảnh', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Khắc Quốc', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Nguyễn Hoàng Duy Thiện', 'ThS.', 'Giảng viên', 'Lập trình di động; Điện toán đám mây; E-learning', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Ngô Thanh Huy', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Lê Minh Tự', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Khấu Văn Nhựt', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Huỳnh Văn Thanh', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Hà Thị Thúy Vi', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Công nghệ thông tin – Trường Kỹ thuật và Công nghệ', 'Dương Ngọc Vân Khanh', 'ThS.', 'Giảng viên', 'Data hiding', 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-cong-nghe-thong-tin', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Cao Phương Thảo', 'TS.', 'Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Trần Song Toàn', 'TS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Lê Minh Hải', 'TS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thanh Hiền', 'ThS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Nguyễn Đức Hiệu', 'ThS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Triệu Quốc Huy', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Thạch Thị Via Sa Na', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Phan Thế Hiếu', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thanh Tần', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Nguyễn Ngọc Tiền', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Nguyễn Hoàng Vũ', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Lê Thanh Tùng', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Lê Thành Nam', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Kim Anh Tuấn', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Đặng Hữu Phúc', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Đặng Hoàng Minh', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Phạm Tấn Hưng', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Phạm Minh Triết', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Điện – Điện tử – Trường Kỹ thuật và Công nghệ', 'Bùi Thị Thu Thủy', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-dien-dientu', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Huỳnh Tấn Thành', 'TS.', 'Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Lê Ngọc Long', 'TS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thiện Thảo', 'TS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thị Thu Hà', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thị Anh Thư', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Mai Thị Thùy Lam', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Mã Thái Hòa', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Kỹ thuật hóa học – Trường Kỹ thuật và Công nghệ', 'Huỳnh Thị Hồng Hoa', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-ky-thuat-hoa-hoc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Môi trường – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thành Tựu', 'TS.', 'Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-moi-truong', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Môi trường – Trường Kỹ thuật và Công nghệ', 'Phạm Kim Long', 'TS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-moi-truong', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Môi trường – Trường Kỹ thuật và Công nghệ', 'Vương Tuấn Phong', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-moi-truong', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Môi trường – Trường Kỹ thuật và Công nghệ', 'Nguyễn Hoàng Lâm', 'TS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-moi-truong', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Môi trường – Trường Kỹ thuật và Công nghệ', 'Lê Ngọc Phương Khanh', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-moi-truong', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Huỳnh Văn Hiệp', 'TS.', 'Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Nguyễn Vy Thanh', 'TS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Đoàn Công Chánh', 'ThS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thanh Tâm', 'TS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Võ Minh Huy', 'TS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Từ Hồng Nhung', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Trần Văn Khánh', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Trần Thanh Vũ', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Thạch Vũ Đình Vi', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Nguyễn Thành Công', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Nguyễn Phú Nhuận', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Ngô Gia Truyền', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Kỷ Minh Hưng', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Huỳnh Thị Mỹ Dung', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Huỳnh Hữu Trí', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Cao Hữu Lợi', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Xây dựng – Trường Kỹ thuật và Công nghệ', 'Bùi Phước Hảo', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-xay-dung', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Trương Văn Mến', 'TS.', 'Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Trần Văn Điền', 'ThS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Nguyễn Vũ Lực', 'ThS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Nguyễn Khắc Bằng', 'ThS.', 'Phó Trưởng khoa', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Thạch Ngọc Phúc', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Phan Văn Tuân', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Ngô Thanh Hà', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Dương Minh Hùng', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Huỳnh Thanh Bảnh', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Phạm Vũ Phong', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Thạch Mỹ Thuật', 'ThS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Cao Thanh Duy', 'KS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;
INSERT INTO danh_muc_giang_vien_tvu
(khoa_don_vi, ho_ten, hoc_vi, chuc_vu, linh_vuc, nguon_url, dang_hoat_dong)
VALUES ('Khoa Cơ khí – Động lực – Trường Kỹ thuật và Công nghệ', 'Trần Huyền Trân', 'KS.', 'Giảng viên', NULL, 'https://cet.tvu.edu.vn/index.php/giang-vien/thong-tin-giang-vien/khoa-co-khi-dong-luc', TRUE)
ON CONFLICT (ho_ten, khoa_don_vi) DO UPDATE SET
  hoc_vi=EXCLUDED.hoc_vi,
  chuc_vu=EXCLUDED.chuc_vu,
  linh_vuc=EXCLUDED.linh_vuc,
  nguon_url=EXCLUDED.nguon_url,
  dang_hoat_dong=TRUE,
  ngay_cap_nhat=CURRENT_TIMESTAMP;

COMMIT;

-- Kiểm tra nhanh sau khi import:
-- SELECT COUNT(*) AS so_nganh FROM nganh_hoc;
-- SELECT COUNT(*) AS so_lop FROM lop_hoc;
-- SELECT COUNT(*) AS so_prefix FROM ma_mssv_nganh;
-- SELECT COUNT(*) AS so_giang_vien FROM danh_muc_giang_vien_tvu;
-- SELECT n.ten_nganh, l.ma_lop, l.khoa_nhap_hoc
-- FROM lop_hoc l JOIN nganh_hoc n ON n.id=l.nganh_id
-- WHERE n.ma_nganh='7480201'
-- ORDER BY l.khoa_nhap_hoc, l.ma_lop;
