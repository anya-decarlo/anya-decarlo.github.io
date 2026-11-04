-- Stage the raw NT notices: trim and upper-case form codes, keep only NT 10-K and NT 10-Q
-- (amendments such as NT 10-K/A are left out), drop repeated accession numbers, and type the columns.
WITH cleaned AS (
  SELECT
    trim(adsh)                         AS adsh,
    upper(trim(form))                  AS form,
    date(filed)                        AS filed,
    date(nullif(trim(period), ''))     AS period,
    CAST(cik AS INTEGER)               AS cik,
    trim(name)                         AS name,
    sic,
    upper(trim(state))                 AS state,
    ROW_NUMBER() OVER (PARTITION BY trim(adsh) ORDER BY filed) AS copy_number
  FROM raw_nt_filings
  WHERE adsh IS NOT NULL
)
SELECT adsh, form, filed, period, cik, name, sic, state
FROM cleaned
WHERE copy_number = 1
  AND form IN ('NT 10-K', 'NT 10-Q')
