BEGIN;
CREATE TABLE IF NOT EXISTS dot_thuc_tap_nganh (
  id BIGSERIAL PRIMARY KEY,
  dot_thuc_tap_id BIGINT NOT NULL REFERENCES dot_thuc_tap(id) ON DELETE CASCADE,
  nganh_hoc_id BIGINT NOT NULL REFERENCES nganh_hoc(id) ON DELETE RESTRICT,
  CONSTRAINT uq_dot_thuc_tap_nganh UNIQUE (dot_thuc_tap_id, nganh_hoc_id)
);
COMMENT ON TABLE dot_thuc_tap_nganh IS 'Không có dòng cho một đợt nghĩa là áp dụng tất cả ngành.';
COMMIT;
