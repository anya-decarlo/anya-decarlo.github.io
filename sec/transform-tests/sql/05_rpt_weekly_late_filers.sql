-- The weekly report: one row per Monday-to-Sunday week, with notice counts by form and outcome.
SELECT
  date(filed, '-' || ((CAST(strftime('%w', filed) AS INTEGER) + 6) % 7) || ' days') AS week_start,
  count(*)                              AS nt_filings,
  sum(form = 'NT 10-K')                 AS nt_10k,
  sum(form = 'NT 10-Q')                 AS nt_10q,
  sum(status = 'Filed in extension')    AS filed_in_extension,
  sum(status = 'Filed after extension') AS filed_after_extension,
  sum(status = 'Not filed')             AS not_filed,
  sum(status = 'Window open')           AS window_open
FROM fct_late_filers
GROUP BY week_start
ORDER BY week_start
