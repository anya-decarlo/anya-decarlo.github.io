-- Rule 12b-25 extension: 15 calendar days for an annual report (10-K),
-- 5 for a quarterly report (10-Q), counted from the date of the NT notice.
SELECT
  s.*,
  CASE s.form WHEN 'NT 10-K' THEN 15 WHEN 'NT 10-Q' THEN 5 END AS extension_days,
  date(s.filed, '+' || CASE s.form WHEN 'NT 10-K' THEN 15 WHEN 'NT 10-Q' THEN 5 END || ' days') AS deadline
FROM stg_nt_filings s
