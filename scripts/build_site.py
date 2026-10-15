"""Build complete, crawlable language pages using only Python's standard library."""
import argparse
import hashlib
import json
from html import escape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
CONTENT = ROOT / "content"
BASE = "https://kasznare.github.io/AI-SDLC/"
LANGUAGES = {"hu": "Magyar", "en": "English", "de": "Deutsch"}
CONFIG = {
    "hu": {
        "name": "Kasznár András", "brand": "AI a fejlesztésben", "locale": "hu_HU",
        "title": "AI a fejlesztésben — vállalati bevezetés | Kasznár András",
        "description": "AI a meglévő fejlesztési folyamataidban. Integrációk, csapatok betanítása, mérés és tokenköltség-tervezés Kasznár Andrással.",
        "job": "Szoftverfejlesztő és vezető fejlesztő", "language": "Nyelv választása",
        "notice": 'A kezdőoldal az ország szerinti nyelvválasztáshoz a <a href="https://country.is/" rel="noreferrer">country.is</a> szolgáltatását hívja meg, amely így megkapja a látogató IP-címét. A kézi nyelvválasztást a böngésző tárolja. A nyelvi oldalakon nincs országfelismerési kérés.',
        "image": "AI a fejlesztésben. Integrációk, csapatok, mérhető eredmények. Kasznár András.",
    },
    "en": {
        "name": "András Kasznár", "brand": "AI in software development", "locale": "en_GB",
        "title": "AI in software development | András Kasznár",
        "description": "Bring AI into your existing software delivery workflow. Integrations, team training, measurement and token cost planning with András Kasznár.",
        "job": "Software developer and lead developer", "language": "Choose a language",
        "notice": 'The entry page calls <a href="https://country.is/" rel="noreferrer">country.is</a> to choose a language by country, sharing the visitor’s IP address with that service. Your manual language choice is stored in your browser. Language pages make no country lookup request.',
        "image": "AI in software development. Integrations, teams, measurable results. András Kasznár.",
    },
    "de": {
        "name": "András Kasznár", "brand": "KI in der Softwareentwicklung", "locale": "de_DE",
        "title": "KI in der Softwareentwicklung | András Kasznár",
        "description": "KI in bestehenden Entwicklungsabläufen: Integrationen, Teamschulung, Erfolgsmessung und Tokenkostenplanung mit András Kasznár.",
        "job": "Softwareentwickler und Lead Developer", "language": "Sprache wählen",
        "notice": 'Die Einstiegsseite ruft <a href="https://country.is/" rel="noreferrer">country.is</a> zur Sprachwahl nach Land auf. Dabei erhält der Dienst die IP-Adresse des Besuchers. Ihre manuelle Sprachwahl wird im Browser gespeichert. Auf den Sprachseiten erfolgt keine Länderabfrage.',
        "image": "KI in der Softwareentwicklung. Integrationen, Teams, messbare Ergebnisse. András Kasznár.",
    },
}


class Translator(HTMLParser):
    """Translate text and accessible labels, keeping structure and destinations shared."""
    def __init__(self, language):
        super().__init__(convert_charrefs=False)
        self.language = language
        self.catalog = json.loads((CONTENT / f"locales/{language}.json").read_text()) if language != "hu" else {}
        self.parts = []

    def translate(self, text):
        stripped = text.strip()
        if self.language == "hu" or not any(c.isalpha() for c in stripped):
            return text
        if stripped not in self.catalog:
            raise ValueError(f"Missing {self.language} translation: {stripped}")
        return text[:len(text)-len(text.lstrip())] + self.catalog[stripped] + text[len(text.rstrip()):]

    def handle_starttag(self, tag, attrs):
        self.parts.append("<" + tag)
        for key, value in attrs:
            if value is None:
                self.parts.append(" " + key)
            else:
                if key in {"alt", "aria-label", "title"}:
                    value = self.translate(value)
                self.parts.append(f' {key}="{escape(value, quote=True)}"')
        self.parts.append(">")

    def handle_endtag(self, tag):
        self.parts.append(f"</{tag}>")

    def handle_data(self, data):
        self.parts.append(escape(self.translate(data), quote=False))

    def handle_entityref(self, name):
        self.parts.append(f"&{name};")

    def handle_charref(self, name):
        self.parts.append(f"&#{name};")

    def handle_comment(self, data):
        self.parts.append(f"<!--{data}-->")


def version(filename):
    return hashlib.sha256((SITE / filename).read_bytes()).hexdigest()[:12]


def language_links(language=None):
    prefix = "../" if language else "./"
    label = CONFIG[language or "en"]["language"]
    links = []
    for code, name in LANGUAGES.items():
        current = ' aria-current="page"' if code == language else ""
        links.append(f'<a href="{prefix}{code}/" lang="{code}" hreflang="{code}" data-language="{code}" aria-label="{name}"{current}>{code.upper()}</a>')
    return f'<nav class="language-switch" aria-label="{label}">{"".join(links)}</nav>'


def head(language=None):
    cfg = CONFIG[language or "en"]
    canonical = BASE + (language + "/" if language else "")
    prefix = "../" if language else "./"
    title = cfg["title"] if language else "András Kasznár — AI / KI | Magyar · English · Deutsch"
    description = cfg["description"] if language else "AI in software development with András Kasznár. Choose Magyar, English or Deutsch for integrations, team adoption and cost planning."
    image = BASE + (language or "en") + "/social-preview.png"
    graph = [
        {"@type": "WebSite", "@id": BASE + "#website", "url": BASE, "name": "András Kasznár", "inLanguage": list(LANGUAGES)},
        {"@type": "WebPage", "@id": canonical + "#webpage", "url": canonical, "name": title, "description": description,
         "inLanguage": language or "en", "isPartOf": {"@id": BASE + "#website"}, "author": {"@id": BASE + "#andras"}},
        {"@type": "Person", "@id": BASE + "#andras", "name": cfg["name"], "jobTitle": cfg["job"], "url": BASE + (language or "en") + "/#rolam"},
    ]
    parts = ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="theme-color" content="#101d30">',
             '<meta name="robots" content="index,follow,max-image-preview:large">', f'<title>{escape(title)}</title>',
             f'<link rel="canonical" href="{canonical}">', f'<link rel="sitemap" type="application/xml" href="{prefix}sitemap.xml">']
    for key, value in {"description": description, "author": cfg["name"], "twitter:card": "summary_large_image", "twitter:title": title, "twitter:description": description, "twitter:image": image, "twitter:image:alt": cfg["image"]}.items():
        parts.append(f'<meta name="{key}" content="{escape(value, quote=True)}">')
    for key, value in {"title": title, "description": description, "type": "website", "url": canonical, "site_name": cfg["name"], "locale": cfg["locale"], "image": image, "image:width": "1200", "image:height": "630", "image:alt": cfg["image"]}.items():
        parts.append(f'<meta property="og:{key}" content="{escape(value, quote=True)}">')
    for code in LANGUAGES:
        parts.append(f'<link rel="alternate" hreflang="{code}" href="{BASE}{code}/">')
    parts.append(f'<link rel="alternate" hreflang="x-default" href="{BASE}">')
    parts += [f'<link rel="icon" type="image/svg+xml" href="{prefix}favicon.svg">', f'<link rel="stylesheet" href="{prefix}styles.css?v={version("styles.css")}">',
              f'<script type="module" src="{prefix}language.js?v={version("language.js")}"></script>']
    if language:
        parts.append(f'<script type="module" src="{prefix}app.js?v={version("app.js")}"></script>')
    parts.append('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False) + '</script>')
    return "\n  ".join(parts)


def build_pages():
    files = {}
    template = (CONTENT / "page.html").read_text()
    for language in LANGUAGES:
        translator = Translator(language)
        translator.feed(template)
        body = "".join(translator.parts).replace("<!-- LANGUAGE_SWITCH -->", language_links(language))
        body = body.replace("<!-- LANGUAGE_NOTICE -->", f'<p class="language-notice container">{CONFIG[language]["notice"]}</p>')
        files[f"{language}/index.html"] = f'<!doctype html>\n<html lang="{language}">\n<head>\n  {head(language)}\n</head>\n<body>{body}</body>\n</html>\n'
        files[f"{language}/pilot-plan.md"] = (CONTENT / f"pilot-plan.{language}.md").read_text()
    cards = "".join(f'<a class="locale-card" href="./{code}/" lang="{code}" hreflang="{code}" data-language="{code}"><span>{code.upper()}</span><h2>{name}</h2><p>{CONFIG[code]["brand"]}</p><b aria-hidden="true">↗</b></a>' for code, name in LANGUAGES.items())
    notices = "".join(f'<p lang="{code}">{cfg["notice"]}</p>' for code, cfg in CONFIG.items())
    files["index.html"] = f'''<!doctype html>
<html lang="en"><head>
  {head()}
</head><body data-language-entry>
<main class="locale-entry container">
  <a class="entry-name" href="./hu/" lang="hu" data-language="hu"><img src="./favicon.svg" width="38" height="38" alt=""> Kasznár András</a>
  <p class="eyebrow">AI / SOFTWARE DEVELOPMENT</p>
  <h1>Magyar. English. Deutsch.</h1>
  <p class="entry-lead">Válassz nyelvet. Choose your language. Wählen Sie Ihre Sprache.</p>
  <nav class="locale-cards" aria-label="Choose a language">{cards}</nav>
  <div class="entry-status" role="status"><p lang="hu">Az oldal automatikusan is választ nyelvet az országod alapján.</p><p>We also select a language automatically based on your country.</p><p lang="de">Die Seite wählt die Sprache auch automatisch anhand Ihres Landes.</p></div>
  <noscript><p>Please use one of the language links above.</p></noscript>
  <div class="entry-privacy">{notices}</div>
</main></body></html>
'''
    locations = [BASE] + [BASE + code + "/" for code in LANGUAGES]
    files["sitemap.xml"] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f'  <url><loc>{location}</loc><lastmod>2026-10-15</lastmod></url>\n' for location in locations) + '</urlset>\n'
    return files


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail when committed pages need rebuilding")
    args = parser.parse_args()
    stale = []
    for filename, content in build_pages().items():
        path = SITE / filename
        if args.check:
            if not path.exists() or path.read_text() != content:
                stale.append(filename)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    if stale:
        raise SystemExit("Run python3 scripts/build_site.py; outdated files: " + ", ".join(stale))
    print("OK: three complete language pages and entry page " + ("verified" if args.check else "built"))
