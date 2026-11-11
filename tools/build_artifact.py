"""Builds the artifact (demo) version of the app into dist/artifact/.

Run from the project folder:
    python3 tools/build_artifact.py

What it changes compared with the normal app:
- Every page also loads demo/config.js (switches on demo mode) and demo/bars.js (bundled bar list).
- index.html loses its <!doctype>, <html>, <head> and <body> tags, because the artifact
  viewer adds those itself. The other pages keep them.
Everything else is copied as it is.
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "artifact"

COPY = ["styles.css", "js", "data", "vendor", "demo", "icons"]
PAGES = ["index.html", "route.html", "create.html", "crawl.html"]
DEMO_SCRIPTS = '<script src="demo/config.js"></script>\n  <script src="demo/bars.js"></script>\n  '


def add_demo_scripts(html):
    marker = '<script src="js/common.js"></script>'
    assert marker in html, "page is missing js/common.js"
    return html.replace(marker, DEMO_SCRIPTS + marker)


def strip_document_tags(html):
    # The viewer supplies the document skeleton, charset and viewport.
    html = re.sub(r"<!doctype html>\s*", "", html, flags=re.I)
    html = re.sub(r"</?html[^>]*>\s*", "", html, flags=re.I)
    html = re.sub(r"</?head>\s*", "", html, flags=re.I)
    html = re.sub(r"</?body[^>]*>\s*", "", html, flags=re.I)
    html = re.sub(r'<meta charset="utf-8">\s*', "", html, flags=re.I)
    html = re.sub(r'<meta name="viewport"[^>]*>\s*', "", html, flags=re.I)
    return html.strip() + "\n"


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for name in COPY:
        src = ROOT / name
        if src.is_dir():
            shutil.copytree(src, OUT / name)
        else:
            shutil.copy2(src, OUT / name)
    for page in PAGES:
        html = add_demo_scripts((ROOT / page).read_text(encoding="utf-8"))
        if page == "index.html":
            html = strip_document_tags(html)
        (OUT / page).write_text(html, encoding="utf-8")
    files = sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file() and p.name != ".DS_Store")
    size = sum((OUT / f).stat().st_size for f in files)
    print(f"Built {len(files)} files ({size / 1e6:.1f} MB) in {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
