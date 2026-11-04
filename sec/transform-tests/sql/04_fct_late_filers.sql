-- One row per notice, labelled by whether the report arrived inside the extension.
-- params.as_of is the report date: notices still inside their window aren't counted as missed.
SELECT
  f.adsh, f.form, f.filed, f.period, f.cik, f.name, f.sic, f.state, f.deadline, f.followed,
  CASE
    WHEN f.followed IS NOT NULL AND f.followed <= f.deadline THEN 'Filed in extension'
    WHEN f.followed IS NOT NULL                              THEN 'Filed after extension'
    WHEN (SELECT as_of FROM params) <= f.deadline            THEN 'Window open'
    ELSE 'Not filed'
  END AS status
FROM int_follow_through f
