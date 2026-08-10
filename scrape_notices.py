"""
Scrapes https://bubt.edu.bd/notice (a JS-rendered page) using a headless
browser and writes the result to notices.json in the repo root, in the
format the site's notices widget expects.

Design notes:
- The notice list is populated client-side via an AJAX call after the page
  loads, so a plain HTTP request (requests/urllib) returns an empty list.
  We use Playwright to actually run the page's JavaScript and wait for the
  notice table to fill in.
- If scraping fails or finds nothing (e.g. BUBT changed their markup), we
  DO NOT overwrite the existing notices.json — we exit non-zero instead,
  so the site keeps showing the last good data rather than going blank.
- If you need to adjust this after BUBT changes their site: run this
  script locally with HEADLESS=false to watch the browser and inspect the
  DOM (see bottom of file), or check the debug_page.html /
  debug_screenshot.png artifacts the workflow uploads on failure.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

NOTICE_URL = "https://bubt.edu.bd/notice"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "notices.json"
DEBUG_HTML_PATH = Path(__file__).resolve().parent.parent / "debug_page.html"
DEBUG_SHOT_PATH = Path(__file__).resolve().parent.parent / "debug_screenshot.png"
MAX_NOTICES = 15
HEADLESS = os.environ.get("HEADLESS", "true").lower() != "false"


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:80] or "notice"


def scrape():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=HEADLESS)
        page = browser.new_page(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
        ))
        page.goto(NOTICE_URL, wait_until="networkidle", timeout=45000)

        # Give the AJAX call time to populate the table even if
        # "networkidle" fired a bit early.
        try:
            page.wait_for_selector("table tbody tr", timeout=15000)
        except Exception:
            pass
        page.wait_for_timeout(2000)

        notices = []

        # Strategy: the notice list renders as table rows containing a
        # title (usually a link) and a published date. We scan all table
        # rows and keep ones that look like a notice row (have a link with
        # non-trivial text).
        rows = page.query_selector_all("table tbody tr")
        for row in rows:
            link_el = row.query_selector("a")
            cells = row.query_selector_all("td")
            if not link_el:
                continue
            title = (link_el.inner_text() or "").strip()
            if not title or len(title) < 5:
                continue
            href = link_el.get_attribute("href") or ""
            if href and href.startswith("/"):
                href = "https://bubt.edu.bd" + href
            elif href and not href.startswith("http"):
                href = "https://bubt.edu.bd/" + href.lstrip("/")

            date_text = ""
            for cell in cells:
                text = (cell.inner_text() or "").strip()
                if re.search(r"\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2}", text):
                    date_text = text
                    break

            notices.append({
                "id": slugify(title),
                "title": title,
                "date": date_text,
                "url": href or NOTICE_URL,
            })

        # Save debug artifacts always (cheap, and helpful if the count
        # looks wrong even when >0 rows were found).
        DEBUG_HTML_PATH.write_text(page.content(), encoding="utf-8")
        page.screenshot(path=str(DEBUG_SHOT_PATH), full_page=True)

        browser.close()
        return notices


def main():
    try:
        notices = scrape()
    except Exception as e:
        print(f"ERROR: scraping failed: {e}", file=sys.stderr)
        sys.exit(1)

    if not notices:
        print("ERROR: no notices found — leaving notices.json unchanged.", file=sys.stderr)
        sys.exit(1)

    # De-duplicate by id, preserve order, cap length.
    seen = set()
    deduped = []
    for n in notices:
        if n["id"] in seen:
            continue
        seen.add(n["id"])
        deduped.append(n)
    deduped = deduped[:MAX_NOTICES]

    payload = {
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "notices": deduped,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(deduped)} notices to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
