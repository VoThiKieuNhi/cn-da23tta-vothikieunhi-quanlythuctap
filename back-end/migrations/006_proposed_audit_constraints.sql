-- PROPOSAL ONLY. Not automatically applied. Back up and review historical data first.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE dot_thuc_tap ADD CONSTRAINT ck_period_strict_dates
CHECK (ngay_bat_dau_dang_ky < ngay_ket_thuc_dang_ky
 AND ngay_ket_thuc_dang_ky < (ngay_bat_dau_thuc_tap::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
 AND ngay_bat_dau_thuc_tap < ngay_ket_thuc_thuc_tap) NOT VALID;
CREATE UNIQUE INDEX IF NOT EXISTS uq_nguoi_dung_email_lower ON nguoi_dung (lower(email));
COMMIT;
-- After fixing historical dates: ALTER TABLE dot_thuc_tap VALIDATE CONSTRAINT ck_period_strict_dates;
