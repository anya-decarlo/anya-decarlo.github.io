"""Weekly refresh for the SEC Late Filers report.

Pulls every NT 10-K and NT 10-Q (Form 12b-25) filed in the trailing two years from
EDGAR full-text search, then checks EDGAR's quarterly form indexes to see whether
each company followed through with its 10-K/10-Q inside the extension window.
Writes data.json next to this file. Standard library only.
"""
import datetime as dt
import gzip
import io
import json
import os
import re
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

UA = os.environ.get("SEC_USER_AGENT", "Anya DeCarlo portfolio decarloanya758@gmail.com")
OUT = Path(__file__).with_name("data.json")
YEARS = 2
EXTENSION_DAYS = {"NT 10-K": 15, "NT 10-Q": 5}
PERIODIC = {"NT 10-K": {"10-K", "10-KT", "10-K405"}, "NT 10-Q": {"10-Q", "10-QT"}}
US = set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR VI GU AS MP".split())


def get(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    body = gzip.decompress(body)
                time.sleep(0.15)  # stay well under SEC's 10 requests/second limit
                return body
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 ** i)


def division(sic):
    try:
        s = int(sic) // 100
    except (TypeError, ValueError):
        return "Unknown"
    for hi, name in [(9, "Agriculture"), (14, "Mining"), (17, "Construction"), (39, "Manufacturing"),
                     (49, "Transportation & Utilities"), (51, "Wholesale Trade"), (59, "Retail Trade"),
                     (67, "Finance, Insurance & Real Estate"), (89, "Services"), (99, "Public Admin & Nonclassifiable")]:
        if s <= hi:
            return name
    return "Unknown"


def nt_filings(start, end):
    rows = {}
    cur = start
    while cur <= end:
        stop = min(cur + dt.timedelta(days=30), end)
        offset = 0
        while True:
            url = ("https://efts.sec.gov/LATEST/search-index?forms=NT%2010-K,NT%2010-Q&dateRange=custom"
                   f"&startdt={cur}&enddt={stop}&from={offset}")
            hits = json.loads(get(url))["hits"]
            for h in hits["hits"]:
                s = h["_source"]
                if s["form"] not in EXTENSION_DAYS or s["adsh"] in rows:
                    continue
                m = re.match(r"(.*?)\s+(?:\(([^)]*)\)\s+)?\(CIK", s["display_names"][0])
                state = (s.get("biz_states") or s.get("inc_states") or [""])[0]
                rows[s["adsh"]] = {
                    "adsh": s["adsh"], "form": s["form"], "filed": s["file_date"],
                    "period": s.get("period_ending"), "cik": int(s["ciks"][0]),
                    "name": m.group(1).strip() if m else s["display_names"][0],
                    "ticker": (m.group(2) or "").split(",")[0].strip() if m else "",
                    "sic": (s.get("sics") or [""])[0], "state": state,
                    "location": (s.get("biz_locations") or [""])[0],
                    "us": state in US,
                }
            offset += len(hits["hits"])
            if not hits["hits"] or offset >= hits["total"]["value"]:
                break
        cur = stop + dt.timedelta(days=1)
    return list(rows.values())


def periodic_filings(start, end):
    """CIK -> list of (date, form) for 10-K/10-Q filings, from the quarterly form indexes."""
    by_cik = defaultdict(list)
    wanted = set().union(*PERIODIC.values())
    line_re = re.compile(r"^(\S+(?: \S+)*)\s{2,}.+?\s{2,}(\d+)\s{2,}(\d{4}-\d{2}-\d{2})\s{2,}\S+\s*$")
    y, q = start.year, (start.month - 1) // 3 + 1
    while (y, q) <= (end.year, (end.month - 1) // 3 + 1):
        text = get(f"https://www.sec.gov/Archives/edgar/full-index/{y}/QTR{q}/form.idx").decode("latin-1")
        for line in io.StringIO(text):
            if line[:6] not in ("10-K  ", "10-Q  ", "10-KT ", "10-QT ", "10-K40"):
                continue
            m = line_re.match(line)
            if m and m.group(1) in wanted:
                by_cik[int(m.group(2))].append((m.group(3), m.group(1)))
        q += 1
        if q == 5:
            y, q = y + 1, 1
    return by_cik


def main():
    t0 = time.time()
    today = dt.date.today()
    start = today - dt.timedelta(days=365 * YEARS)
    nts = nt_filings(start, today)
    periodic = periodic_filings(start, today)
    for r in nts:
        filed = dt.date.fromisoformat(r["filed"])
        deadline = filed + dt.timedelta(days=EXTENSION_DAYS[r["form"]])
        r["deadline"] = deadline.isoformat()
        follow = sorted(d for d, f in periodic.get(r["cik"], [])
                        if f in PERIODIC[r["form"]] and r["filed"] <= d <= (filed + dt.timedelta(days=365)).isoformat())
        r["followed"] = follow[0] if follow else None
        if r["followed"]:
            r["status"] = "Filed in extension" if r["followed"] <= r["deadline"] else "Filed after extension"
        else:
            r["status"] = "Window open" if today <= deadline else "Not filed"
        r["division"] = division(r["sic"])
    nts.sort(key=lambda r: (r["filed"], r["name"]), reverse=True)

    log = []
    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text())
            log = prev.get("refreshLog", [])
            seen = {r[0] for r in prev.get("rows", [])}
        except Exception:
            seen = set()
    else:
        seen = set()
    fields = ["adsh", "form", "filed", "period", "cik", "name", "ticker", "sic", "division",
              "state", "location", "us", "deadline", "followed", "status"]
    rows = [[r[k] for k in fields] for r in nts]
    log.insert(0, {"at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                   "rows": len(rows), "new": sum(r[0] not in seen for r in rows),
                   "seconds": round(time.time() - t0)})
    OUT.write_text(json.dumps({
        "generated": log[0]["at"], "windowStart": start.isoformat(), "windowEnd": today.isoformat(),
        "source": "SEC EDGAR full-text search (NT 10-K, NT 10-Q) and quarterly form indexes",
        "fields": fields, "rows": rows, "refreshLog": log[:12],
    }, separators=(",", ":")))
    print(f"{len(rows)} NT filings, {log[0]['new']} new, {log[0]['seconds']}s")


if __name__ == "__main__":
    main()
