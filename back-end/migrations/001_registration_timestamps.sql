-- Preserve old registration calendar days in Vietnam; safe to run again.
BEGIN;
SET LOCAL lock_timeout = '5s';
LOCK TABLE public.dot_thuc_tap IN ACCESS EXCLUSIVE MODE;
DO $$
DECLARE
  opening_type text;
  closing_type text;
BEGIN
  SELECT data_type INTO opening_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dot_thuc_tap' AND column_name='ngay_bat_dau_dang_ky';
  SELECT data_type INTO closing_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dot_thuc_tap' AND column_name='ngay_ket_thuc_dang_ky';
  IF opening_type='date' AND closing_type='date' THEN
    ALTER TABLE public.dot_thuc_tap
      ALTER COLUMN ngay_bat_dau_dang_ky TYPE timestamptz
        USING (ngay_bat_dau_dang_ky::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'),
      ALTER COLUMN ngay_ket_thuc_dang_ky TYPE timestamptz
        USING ((ngay_ket_thuc_dang_ky::timestamp + interval '1 day' - interval '1 millisecond') AT TIME ZONE 'Asia/Ho_Chi_Minh');
  ELSIF opening_type='timestamp with time zone' AND closing_type='timestamp with time zone' THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Unexpected registration column types; migration aborted';
  END IF;
END $$;
COMMIT;
