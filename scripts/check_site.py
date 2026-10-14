"""Dependency-free checks for Pages assets, anchors and HTML structure."""

import json
import struct
import xml.etree.ElementTree as ET
from datetime import date
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
        self.meta = {}
        self.properties = {}
        self.link_tags = []
        self.title_parts = []
        self.in_title = False
        self.in_jsonld = False
        self.jsonld_parts = []
        self.jsonld_documents = []
        self.h1_count = 0
        self.void = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            if "name" in attrs:
                key = attrs["name"]
                if key in self.meta:
                    self.errors.append(f"Duplicate meta name: {key}")
                self.meta[key] = attrs.get("content", "")
            if "property" in attrs:
                key = attrs["property"]
                if key in self.properties:
                    self.errors.append(f"Duplicate meta property: {key}")
                self.properties[key] = attrs.get("content", "")
        if tag == "link":
            self.link_tags.append(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_count += 1
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_jsonld = True
            self.jsonld_parts = []
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
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_jsonld:
            self.jsonld_documents.append("".join(self.jsonld_parts))
            self.in_jsonld = False
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f"Mismatched closing tag: {tag}")
        else:
            self.stack.pop()

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self.in_jsonld:
            self.jsonld_parts.append(data)


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

title = "".join(parser.title_parts).strip()
if not title or parser.h1_count != 1:
    parser.errors.append("The page needs a title and exactly one H1.")
for name in ("description", "author", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"):
    if not parser.meta.get(name):
        parser.errors.append(f"Missing metadata: {name}")
if "noindex" in parser.meta.get("robots", "").lower():
    parser.errors.append("The public landing page must not contain noindex.")
for name in ("og:title", "og:description", "og:url", "og:site_name", "og:image", "og:image:alt"):
    if not parser.properties.get(name):
        parser.errors.append(f"Missing Open Graph property: {name}")

canonicals = [tag.get("href", "") for tag in parser.link_tags if "canonical" in tag.get("rel", "").split()]
canonical = canonicals[0] if len(canonicals) == 1 else ""
url = urlsplit(canonical)
if not canonical or url.scheme != "https" or not url.netloc or url.query or url.fragment or not url.path.endswith("/"):
    parser.errors.append("Use one absolute HTTPS canonical URL without a query or fragment.")
if parser.properties.get("og:url") != canonical:
    parser.errors.append("Open Graph URL must match the canonical URL.")
if parser.properties.get("og:title") != title or parser.meta.get("twitter:title") != title:
    parser.errors.append("Page, Open Graph and Twitter titles must match.")

image_url = parser.properties.get("og:image", "")
if not canonical or not image_url.startswith(canonical):
    parser.errors.append("The sharing image must be hosted under the canonical site URL.")
else:
    image_path = ROOT / unquote(urlsplit(image_url[len(canonical):]).path)
    if not image_path.is_file():
        parser.errors.append(f"Missing sharing image: {image_path.name}")
    else:
        header = image_path.read_bytes()[:24]
        if not header.startswith(b"\x89PNG\r\n\x1a\n") or len(header) < 24:
            parser.errors.append("The sharing image must be a PNG.")
        else:
            width, height = struct.unpack(">II", header[16:24])
            if (str(width), str(height)) != (parser.properties.get("og:image:width"), parser.properties.get("og:image:height")):
                parser.errors.append("Sharing image dimensions must match the Open Graph metadata.")
if parser.meta.get("twitter:image") != image_url:
    parser.errors.append("Twitter and Open Graph images must match.")

if not parser.jsonld_documents:
    parser.errors.append("Missing JSON-LD site metadata.")
for raw in parser.jsonld_documents:
    try:
        data = json.loads(raw)
        graph = data.get("@graph", [])
        types = {item.get("@type") for item in graph}
        if data.get("@context") != "https://schema.org" or not {"WebSite", "WebPage", "Person"}.issubset(types):
            parser.errors.append("JSON-LD must describe the website, page and its author.")
        identifiers = [item.get("@id") for item in graph]
        if len(set(identifiers)) != len(identifiers):
            parser.errors.append("Duplicate JSON-LD identifiers.")
        for item in graph:
            if item.get("@type") in {"WebSite", "WebPage"} and item.get("url") != canonical:
                parser.errors.append("JSON-LD page URLs must match the canonical URL.")
            if item.get("@type") == "WebPage" and item.get("name") != title:
                parser.errors.append("JSON-LD page title must match the visible page title.")
    except (ValueError, TypeError, AttributeError):
        parser.errors.append("Invalid JSON-LD metadata.")

try:
    sitemap = ET.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = sitemap.findall("s:url", ns)
    locations = [item.findtext("s:loc", default="", namespaces=ns) for item in urls]
    if canonical not in locations or len(set(locations)) != len(locations):
        parser.errors.append("Sitemap must include the canonical page once.")
    for item, location in zip(urls, locations):
        parsed = urlsplit(location)
        if not canonical or not location.startswith(canonical) or parsed.query or parsed.fragment:
            parser.errors.append(f"Invalid sitemap URL: {location}")
        else:
            local = ROOT / unquote(location[len(canonical):])
            if local.is_dir():
                local = local / "index.html"
            if not local.is_file():
                parser.errors.append(f"Sitemap points to a missing page: {location}")
        modified = item.findtext("s:lastmod", namespaces=ns)
        if modified:
            date.fromisoformat(modified)
except (OSError, ET.ParseError, ValueError):
    parser.errors.append("Missing or invalid XML sitemap.")
if parser.errors:
    raise SystemExit("\n".join(parser.errors))
print(f"OK: {len(parser.ids)} IDs, {len(parser.links)} links; SEO metadata, JSON-LD, sharing image and sitemap checked.")
