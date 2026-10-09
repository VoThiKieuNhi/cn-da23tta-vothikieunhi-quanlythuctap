BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.giang_vien ADD COLUMN IF NOT EXISTS danh_muc_giang_vien_id BIGINT
  REFERENCES public.danh_muc_giang_vien_tvu(id) ON DELETE RESTRICT;
COMMIT;
