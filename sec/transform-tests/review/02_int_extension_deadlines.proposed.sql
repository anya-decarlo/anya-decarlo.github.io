-- Rule 12b-25 extension: 15 calendar days for an annual report (10-K),
-- 5 for a quarterly report (10-Q), counted from the date of the NT notice.
-- Rule 0-3: a deadline that lands on a Saturday or Sunday moves to the next business day.
-- Federal holidays are not handled yet.
WITH calendar AS (
  SELECT
    s.*,
    CASE s.form WHEN 'NT 10-K' THEN 15 WHEN 'NT 10-Q' THEN 5 END AS extension_days,
    date(s.filed, '+' || CASE s.form WHEN 'NT 10-K' THEN 15 WHEN 'NT 10-Q' THEN 5 END || ' days') AS calendar_deadline
  FROM stg_nt_filings s
)
SELECT
  c.*,
  CASE strftime('%w', c.calendar_deadline)
    WHEN '6' THEN date(c.calendar_deadline, '+2 days')
    WHEN '0' THEN date(c.calendar_deadline, '+1 day')
    ELSE c.calendar_deadline
  END AS deadline
FROM calendar c
