BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.bao_cao_thuc_tap
  ADD COLUMN IF NOT EXISTS nhan_xet_giang_vien TEXT;
COMMIT;
