"""Build the FY2023 -> FY2024 variance dataset from SEC XBRL frames.

Pulls revenue, operating income and net income for every filer from the XBRL frames API
(one fiscal-year value per company and year), adds each company's SEC review office and
SIC industry from its submissions record, and writes a compact data.json for the page.
"""
import concurrent.futures as cf, datetime as dt, json, os, threading, time, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
UA = os.environ.get("SEC_USER_AGENT", "Anya DeCarlo portfolio decarloanya758@gmail.com")
YEARS = [2023, 2024]
METRICS = {  # tag precedence, same as the Semantic Model
    "revenue": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "RevenueFromContractWithCustomerIncludingAssessedTax"],
    "operatingIncome": ["OperatingIncomeLoss"],
    "netIncome": ["NetIncomeLoss", "ProfitLoss"],
}
lock, last = threading.Lock(), [0.0]


def get(url, tries=5):
    for i in range(tries):
        with lock:  # stay under SEC's 10 requests/second
            wait = last[0] + 0.11 - time.time()
            if wait > 0:
                time.sleep(wait)
            last[0] = time.time()
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if i == tries - 1:
                raise
        except Exception:
            if i == tries - 1:
                raise
        time.sleep(2 ** i)


def main():
    t0 = time.time()
    cos, facts = {}, 0
    for y in YEARS:
        for m, tags in METRICS.items():
            for t in tags:
                for f in (get(f"https://data.sec.gov/api/xbrl/frames/us-gaap/{t}/USD/CY{y}.json") or {"data": []})["data"]:
                    facts += 1
                    c = cos.setdefault(f["cik"], {"name": f["entityName"], "y": {}})
                    c["y"].setdefault(y, {}).setdefault(m, {})[t] = f
    print(len(cos), "companies,", facts, "facts", round(time.time() - t0), "s")

    def meta(cik):
        d = get(f"https://data.sec.gov/submissions/CIK{cik:010d}.json") or {}
        return cik, {k: d.get(k) for k in ("sic", "sicDescription", "ownerOrg", "category", "exchanges", "tickers")}
    with cf.ThreadPoolExecutor(8) as ex:
        for i, (cik, m) in enumerate(ex.map(meta, list(cos))):
            cos[cik]["meta"] = m
            if i % 1000 == 0:
                print(i, round(time.time() - t0), "s", flush=True)

    orgs, inds, tags, dates, accns = [], {}, [t for ts in METRICS.values() for t in ts], set(), set()
    rows = []
    for cik, c in cos.items():
        m = c["meta"]
        org = (m.get("ownerOrg") or "").strip() or "Not assigned"
        if org not in orgs:
            orgs.append(org)
        sic = int(m["sic"]) if m.get("sic") else 0
        inds[sic] = m.get("sicDescription") or "Not classified"
        yrs = {}
        for y, ym in c["y"].items():
            rec = []
            for mid, tl in METRICS.items():
                t = next((t for t in tl if t in ym.get(mid, {})), None)
                f = ym[mid][t] if t else None
                rec += [f["val"], tags.index(t), f["start"], f["end"], f["accn"]] if f else [None, None, None, None, None]
                if f:
                    dates.update((f["start"], f["end"])); accns.add(f["accn"])
            yrs[y] = rec
        tick = (m.get("tickers") or [""])[0] if m.get("tickers") else ""
        rows.append([cik, c["name"], tick, orgs.index(org), sic, yrs])
    dates, accns = sorted(dates), sorted(accns)
    di, ai = {d: i for i, d in enumerate(dates)}, {a: i for i, a in enumerate(accns)}
    for r in rows:
        for y, rec in r[5].items():
            for k in range(len(METRICS)):
                b = k * 5
                if rec[b] is not None:
                    rec[b + 2], rec[b + 3], rec[b + 4] = di[rec[b + 2]], di[rec[b + 3]], ai[rec[b + 4]]
            r[5][y] = rec
    (HERE / "data.json").write_text(json.dumps({
        "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "years": YEARS, "metrics": METRICS, "tags": tags, "orgs": orgs, "industries": inds,
        "dates": dates, "accns": accns, "factsRead": facts, "companies": rows,
    }, separators=(",", ":")))
    print(len(rows), "companies written", round(time.time() - t0), "s")


if __name__ == "__main__":
    main()
