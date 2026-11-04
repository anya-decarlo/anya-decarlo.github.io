-- Match each notice to the company's first periodic report of the right type filed on or after
-- the notice and within 365 days. NT 10-K is answered by a 10-K, 10-KT or 10-K405; NT 10-Q by a 10-Q or 10-QT.
SELECT
  d.*,
  (SELECT min(date(p.filed))
     FROM raw_periodic_filings p
    WHERE p.cik = d.cik
      AND ((d.form = 'NT 10-K' AND upper(trim(p.form)) IN ('10-K', '10-KT', '10-K405'))
        OR (d.form = 'NT 10-Q' AND upper(trim(p.form)) IN ('10-Q', '10-QT')))
      AND date(p.filed) BETWEEN d.filed AND date(d.filed, '+365 days')
  ) AS followed
FROM int_extension_deadlines d
