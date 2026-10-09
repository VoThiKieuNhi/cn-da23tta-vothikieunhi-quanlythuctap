BEGIN;
SET LOCAL lock_timeout = '5s';
LOCK TABLE public.dot_thuc_tap IN ACCESS EXCLUSIVE MODE;
DO $$
DECLARE constraint_row record;
BEGIN
  -- Replace only CHECK constraints referencing the status column alone.
  FOR constraint_row IN
    SELECT c.conname FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attname='trang_thai'
    WHERE c.conrelid='public.dot_thuc_tap'::regclass AND c.contype='c'
      AND c.conkey=ARRAY[a.attnum]::smallint[]
  LOOP
    EXECUTE format('ALTER TABLE public.dot_thuc_tap DROP CONSTRAINT %I',constraint_row.conname);
  END LOOP;
  ALTER TABLE public.dot_thuc_tap ADD CONSTRAINT dot_thuc_tap_trang_thai_check
    CHECK (trang_thai IN ('SAP_MO','DANG_MO_DANG_KY','CHO_BAT_DAU','DANG_THUC_TAP','DA_KET_THUC'));
END $$;
COMMIT;
