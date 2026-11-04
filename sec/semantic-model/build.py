"""Build the reconciled FY2024 financial statements dataset from SEC XBRL frames.

Reads model.json (concepts, tag precedence, derivations, metrics, checks) and writes
data.json for the page plus fy2024-clean.csv, the clean analytical dataset.
"""
import csv, datetime as dt, json, os, time, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
UA = os.environ.get("SEC_USER_AGENT", "Anya DeCarlo portfolio decarloanya758@gmail.com")
MODEL = json.loads((HERE / "model.json").read_text())


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120) as r:
                time.sleep(0.15)
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return {"data": []}
            if i == tries - 1:
                raise
        except Exception:
            if i == tries - 1:
                raise
        time.sleep(2 ** i)


def days(a, b):
    return abs((dt.date.fromisoformat(a) - dt.date.fromisoformat(b)).days)


def main():
    t0 = time.time()
    concepts = {c["id"]: c for c in MODEL["concepts"]}
    tags = [t for c in MODEL["concepts"] for t in c["tags"]]
    period_of = {t: c["period"] for c in MODEL["concepts"] for t in c["tags"]}
    companies, facts_read = {}, 0

    # Duration facts: one fiscal-year value per company and tag.
    for t in [t for t in tags if period_of[t] == "duration"]:
        for f in get(f"https://data.sec.gov/api/xbrl/frames/us-gaap/{t}/USD/{MODEL['fiscalFrame']}.json")["data"]:
            facts_read += 1
            c = companies.setdefault(f["cik"], {"cik": f["cik"], "name": f["entityName"], "loc": f["loc"], "raw": {}, "ends": []})
            c["raw"][t] = {"val": f["val"], "accn": f["accn"], "start": f["start"], "end": f["end"]}
            c["ends"].append(f["end"])

    for c in companies.values():
        c["fyEnd"] = max(set(c["ends"]), key=c["ends"].count)
        c["fyStart"] = next((r["start"] for r in c["raw"].values() if r["end"] == c["fyEnd"]), None)

    # Instant facts: keep the balance sheet dated closest to each company's fiscal year-end.
    for t in [t for t in tags if period_of[t] == "instant"]:
        for frame in MODEL["instantFrames"]:
            for f in get(f"https://data.sec.gov/api/xbrl/frames/us-gaap/{t}/USD/{frame}.json")["data"]:
                facts_read += 1
                c = companies.get(f["cik"])
                if not c:
                    continue
                old = c["raw"].get(t)
                if not old or days(f["end"], c["fyEnd"]) < days(old["end"], c["fyEnd"]):
                    c["raw"][t] = {"val": f["val"], "accn": f["accn"], "end": f["end"]}

    tickers = {}
    for v in get("https://www.sec.gov/files/company_tickers.json").values():
        tickers.setdefault(v["cik_str"], v["ticker"])

    out = []
    for c in companies.values():
        raw = c["raw"]
        if "Assets" not in raw and "LiabilitiesAndStockholdersEquity" not in raw:
            continue
        val, src = {}, {}
        for cid, con in concepts.items():
            tag = next((t for t in con["tags"] if t in raw), None)
            if tag:
                val[cid], src[cid] = raw[tag]["val"], tag
        # Derivations run after direct tags so each can use any reported concept.
        for _ in range(2):
            for cid, con in concepts.items():
                d = con.get("derive")
                if cid in val or not d:
                    continue
                op, a, *b = d
                if a in val and (op == "copy" or b[0] in val):
                    val[cid] = val[a] if op == "copy" else val[a] + val[b[0]] if op == "add" else val[a] - val[b[0]]
                    src[cid] = f"derived:{op}:{a}" + (f":{b[0]}" if b else "")

        metrics = {}
        for m in MODEL["metrics"]:
            n, d = val.get(m["num"]), val.get(m["den"])
            if n is not None and d and d > 0:
                metrics[m["id"]] = round(n / d, 4)

        def tie(a, b, base, tol):
            return None if None in (a, b) or not base else abs(a - b) <= tol * abs(base)

        bs_end = next((raw[t]["end"] for t in ("Assets", "LiabilitiesAndStockholdersEquity") if t in raw), None)
        rev_tags = [raw[t]["val"] for t in concepts["revenue"]["tags"] if t in raw]
        direct = lambda cid: val.get(cid) if not str(src.get(cid, "")).startswith("derived") else None
        teq = val.get("totalEquity")
        checks = {
            "balance": tie(val.get("assets"), (val["liabilities"] + teq + val.get("temporaryEquity", 0)) if "liabilities" in val and teq is not None and not src["liabilities"].startswith("derived") else None, val.get("assets"), 0.005),
            "rightSide": tie(raw.get("Assets", {}).get("val"), raw.get("LiabilitiesAndStockholdersEquity", {}).get("val"), raw.get("Assets", {}).get("val"), 0.005),
            "grossTie": tie(direct("revenue") - direct("costOfRevenue") if None not in (direct("revenue"), direct("costOfRevenue")) else None, direct("grossProfit"), direct("revenue"), 0.01),
            "revenueTags": (max(rev_tags) - min(rev_tags) <= 0.01 * max(abs(x) for x in rev_tags)) if len(rev_tags) > 1 else None,
            "period": None if not bs_end else days(bs_end, c["fyEnd"]) <= 7,
            "signs": not (val.get("revenue", 0) < 0 or val.get("assets", 0) < 0 or val.get("currentAssets", 0) < 0
                          or ("currentAssets" in val and "assets" in val and val["currentAssets"] > val["assets"] * 1.001)),
        }
        flags = []
        if src.get("netIncome") == "ProfitLoss":
            flags.append("Net income falls back to ProfitLoss, which includes noncontrolling interests")
        out.append({**{k: c[k] for k in ("cik", "name", "loc", "fyStart", "fyEnd")}, "ticker": tickers.get(c["cik"]),
                    "raw": raw, "val": val, "src": src, "metrics": metrics, "checks": checks, "flags": flags})

    out.sort(key=lambda r: -(r["val"].get("revenue") or 0))
    accns = sorted({f["accn"] for r in out for f in r["raw"].values()})
    dates = sorted({f["end"] for r in out for f in r["raw"].values()} | {r["fyStart"] for r in out if r["fyStart"]} | {r["fyEnd"] for r in out})
    ai, di = {a: i for i, a in enumerate(accns)}, {d: i for i, d in enumerate(dates)}
    ti = {t: i for i, t in enumerate(tags)}
    cids = [c["id"] for c in MODEL["concepts"]]
    code = lambda v: "-" if v is None else "p" if v else "f"
    rows = [[r["cik"], r["name"], r["ticker"] or "", r["loc"], di.get(r["fyStart"], -1), di[r["fyEnd"]],
             [x for t, f in r["raw"].items() for x in (ti[t], f["val"], ai[f["accn"]], di[f["end"]])],
             [None if not s else -1 if s.startswith("derived") else ti[s] for s in (r["src"].get(c) for c in cids)],
             {i: r["val"][c] for i, c in enumerate(cids) if r["src"].get(c, "").startswith("derived")},
             "".join(code(r["checks"][k["id"]]) for k in MODEL["checks"])] for r in out]
    generated = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    (HERE / "data.json").write_text(json.dumps({
        "generated": generated, "factsRead": facts_read, "tags": tags, "accns": accns, "dates": dates,
        "model": MODEL, "companies": rows, "seconds": round(time.time() - t0),
    }, separators=(",", ":")))

    cols = [c["id"] for c in MODEL["concepts"]]
    with open(HERE / "fy2024-clean.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["cik", "ticker", "name", "fiscal_year_start", "fiscal_year_end"] + cols
                   + [f"{c}_source" for c in cols] + [m["id"] for m in MODEL["metrics"]] + [f"check_{k['id']}" for k in MODEL["checks"]])
        for r in out:
            w.writerow([r["cik"], r["ticker"] or "", r["name"], r["fyStart"], r["fyEnd"]]
                       + [r["val"].get(c, "") for c in cols] + [r["src"].get(c, "") for c in cols]
                       + [r["metrics"].get(m["id"], "") for m in MODEL["metrics"]]
                       + ["" if r["checks"][k["id"]] is None else ("pass" if r["checks"][k["id"]] else "fail") for k in MODEL["checks"]])
    print(f"{len(out)} companies, {facts_read} facts, {round(time.time() - t0)}s")


if __name__ == "__main__":
    main()
