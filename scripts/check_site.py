"""Dependency-free checks for Pages assets, anchors and HTML structure."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / "site"


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.links = []
        self.errors = []
        self.stack = []
        self.void = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                self.errors.append(f"Duplicate ID: {attrs['id']}")
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if key in attrs:
                self.links.append(attrs[key])
        for target in attrs.get("aria-controls", "").split():
            self.links.append(f"#{target}")
        if tag not in self.void:
            self.stack.append(tag)
        if tag == "html" and attrs.get("lang") != "hu":
            self.errors.append("The page must declare Hungarian as its language.")
        if tag == "img" and "alt" not in attrs:
            self.errors.append("Image without alt attribute")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.void:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f"Mismatched closing tag: {tag}")
        else:
            self.stack.pop()


parser = SiteParser()
parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
if parser.stack:
    parser.errors.append(f"Unclosed tags: {parser.stack}")
for link in parser.links:
    url = urlsplit(link)
    if url.scheme or url.netloc:
        continue
    if url.path.startswith("/"):
        parser.errors.append(f"Root-relative URL breaks project Pages: {link}")
    elif url.path and not (ROOT / unquote(url.path)).is_file():
        parser.errors.append(f"Missing local file: {link}")
    if not url.path and url.fragment and url.fragment not in parser.ids:
        parser.errors.append(f"Missing anchor target: {link}")
if parser.errors:
    raise SystemExit("\n".join(parser.errors))
print(f"OK: {len(parser.ids)} unique IDs; {len(parser.links)} asset, anchor and ARIA references checked.")
