"""Run the Late Filers transformation tests: unit tests on small fixtures, then data tests on the real data.

    python run_tests.py                       # test main
    python run_tests.py --pr review/pr-1.json # test a proposed change and show its output diff

Exits 1 if any test fails, so a GitHub Action fails with it.
"""
import argparse, json, sqlite3, sys, time
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
DEFAULT_AS_OF = "2026-01-01"


def create(db, name, rows):
    cols = list(dict.fromkeys(k for r in rows for k in r))
    db.execute(f'CREATE TABLE {name} ({", ".join(cols)})')
    db.executemany(f'INSERT INTO {name} VALUES ({", ".join("?" * len(cols))})',
                   [[r.get(c) for c in cols] for r in rows])


def query(db, sql):
    cur = db.execute(sql)
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def run_unit(sql, test):
    db = sqlite3.connect(":memory:")
    for name, rows in test["given"].items():
        create(db, name, rows)
    create(db, "params", [{"as_of": test.get("params", {}).get("as_of", DEFAULT_AS_OF)}])
    try:
        actual = query(db, sql)
    except sqlite3.Error as e:
        return False, f"SQL error: {e}"
    keys = list(dict.fromkeys(k for r in test["expect"] for k in r))
    got = Counter(json.dumps([r.get(k) for k in keys]) for r in actual)
    want = Counter(json.dumps([r.get(k) for k in keys]) for r in test["expect"])
    if got == want:
        return True, ""
    return False, f"expected {[dict(zip(keys, json.loads(x))) for x in want.elements()]}, got {[dict(zip(keys, json.loads(x))) for x in got.elements()]}"


def load_real(db, spec):
    d = json.loads((HERE / spec["source"]).read_text())
    rows = [dict(zip(d["fields"], r)) for r in d["rows"]]
    create(db, "raw_nt_filings", [{**{k: r[k] for k in ("adsh", "form", "filed", "period", "name", "sic", "state")},
                                  "cik": f'{r["cik"]:010d}'} for r in rows])  # EDGAR search returns zero-padded CIK text
    periodic = {(r["cik"], "10-K" if r["form"] == "NT 10-K" else "10-Q", r["followed"]) for r in rows if r["followed"]}
    create(db, "raw_periodic_filings", [{"cik": c, "form": f, "filed": x} for c, f, x in sorted(periodic)])
    db.execute("CREATE INDEX periodic_cik ON raw_periodic_filings (cik)")
    create(db, "production_status", [{k: r[k] for k in ("adsh", "status", "deadline", "followed")} for r in rows])
    create(db, "params", [{"as_of": d["windowEnd"]}])
    return len(rows)


def apply_pr(spec, pr):
    for s in spec["steps"]:
        if s["id"] == pr["step"]:
            s["file"] = pr["proposedFile"]
        for m in pr["modifiedTests"]:
            if m["step"] == s["id"]:
                next(t for t in s["unit"] if t["name"] == m["name"])["expect"] = m["expect"]
        s["unit"] += [a["test"] for a in pr["addedTests"] if a["step"] == s["id"]]
        s["data"] += [a["test"] for a in pr["addedDataTests"] if a["step"] == s["id"]]


def build(spec):
    db = sqlite3.connect(":memory:")
    load_real(db, spec)
    for s in spec["steps"]:
        db.execute(f'CREATE TABLE {s["id"]} AS {(HERE / s["file"]).read_text()}')
    return db


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pr")
    a = ap.parse_args()
    spec = json.loads((HERE / "tests.json").read_text())
    pr = json.loads((HERE / a.pr).read_text()) if a.pr else None
    if pr:
        apply_pr(spec, pr)
    t0, fails, n = time.time(), 0, 0
    print("UNIT TESTS (fixtures)")
    for s in spec["steps"]:
        sql = (HERE / s["file"]).read_text()
        for t in s["unit"]:
            ok, msg = run_unit(sql, t)
            n += 1; fails += not ok
            print(f'  {"PASS" if ok else "FAIL"}  {s["id"]}: {t["name"]}' + ("" if ok else f"\n        {msg}"))
    print("DATA TESTS (real EDGAR data)")
    db = build(spec)
    expected = set(pr["expectedDataFailures"]) if pr else set()
    for s in spec["steps"]:
        for t in s["data"]:
            bad = query(db, t["sql"])
            ok = not bad
            n += 1
            if not ok and t["name"] not in expected:
                fails += 1
            tag = "PASS" if ok else ("EXPECTED FAIL" if t["name"] in expected else "FAIL")
            print(f'  {tag}  {s["id"]}: {t["name"]}' + ("" if ok else f"  ({len(bad)} rows, e.g. {bad[0]})"))
    if pr:
        main_db = build(json.loads((HERE / "tests.json").read_text()))
        before = {r["adsh"]: r for r in query(main_db, "SELECT adsh, status, deadline FROM fct_late_filers")}
        after = {r["adsh"]: r for r in query(db, "SELECT adsh, status, deadline FROM fct_late_filers")}
        moved = Counter((before[k]["status"], after[k]["status"]) for k in after if before[k]["status"] != after[k]["status"])
        print(f'OUTPUT DIFF fct_late_filers: {sum(1 for k in after if before[k]["deadline"] != after[k]["deadline"])} deadlines moved')
        for (b, c), k in moved.most_common():
            print(f"  {b} -> {c}: {k}")
    print(f"{n - fails}/{n} passed in {time.time() - t0:.1f}s")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
