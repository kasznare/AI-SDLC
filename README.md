# AI SDLC

Magyar nyelvű oldal az AI-val végzett fejlesztésről. Az ajánlott indulás: ChatGPT Plus, a hozzá tartozó Codex és a meglévő projekt.

**Élő oldal:** https://kasznare.github.io/AI-SDLC/

## Tartalom

- Konkrét beállítások ChatGPT-fiókhoz, projekthez, modellhez és jogosultságokhoz.
- Álláspont a prompt engineering hype-járól, feladatleírási példával.
- Hatlépéses, billentyűzettel is használható fejlesztési ciklus.
- Új funkció, hibajavítás és refaktorálás szemléltető példái.
- Felelősségek, minőségi kapuk, jogosultságok és mérés.
- Letölthető és másolható rövid Markdown feladatsablon.
- Az első feladat előtti ellenőrzőlista, helyi böngészős mentéssel.
- Három Calendly alkalom: 30 perces intro, egyórás elemzés és kétórás gyakorlati tréning.
- Gyakori kérdések a meglévő kódról, az AGENTS.md-ről és az AI által írt kód ellenőrzéséről.
- Kasznár András bemutatkozása a megadott szakmai tapasztalat alapján.

A példák nem valódi agentfuttatások eredményei. Az oldal nem hív AI API-t, és nem igényel API-kulcsot. Az előfizetésről és indulásról szóló állítások mellett hivatalos OpenAI-források találhatók; a prompt engineeringről szóló értékelés az oldal álláspontja.

## Calendly

A fejléc és a nyitórész az intróra mutat. A kapcsolatfelvételi részben mindhárom alkalom külön foglalható, új lapon. Nincs widget, külső script vagy naptárbetöltés az oldal megnyitásakor; API-kulcs sem szükséges.

| Alkalom | Időtartam | URL |
| --- | --- | --- |
| Intro | 30 perc | `https://calendly.com/andraskasznar/30min` |
| Elemzés | 1 óra | `https://calendly.com/andraskasznar/elemzes` |
| Gyakorlati tréning | 2 óra | `https://calendly.com/andraskasznar/gyakorlati-ai-nativ-fejlesztesi-trening` |

Átnevezéskor a `site/index.html` megfelelő `data-booking="intro"`, `data-booking="analysis"` vagy `data-booking="training"` linkjeinek `href` értékét kell frissíteni. Az intrónak három, a másik két alkalomnak egy-egy linkje van. A Calendly **Settings → My link** alatt a saját URL, az esemény **More options → Booking page options** részében az esemény végződése módosítható. A régi link nem irányít át automatikusan az újra.

A foglalható napokat és órákat csak a Calendly tartalmazza. Az oldalon nincs rögzített időbeosztás; a naptár módosításához nem kell új deploy.

## Helyi futtatás

Python 3 elegendő; nincs csomagtelepítés vagy buildlépés.

```sh
python3 -m http.server 8000 --directory site
```

Ezután nyisd meg a http://localhost:8000 címet. A vágólap HTTP localhoston vagy HTTPS-en használható, a böngésző engedélyei szerint.

```sh
python3 scripts/check_site.py
node --check site/app.js
```

Az első ellenőrzés a HTML struktúráját, az egyedi azonosítókat, a helyi fájlokat, az anchorokat és az ARIA-hivatkozásokat ellenőrzi. A cím, a canonical URL, a megosztási metaadatok, a PNG mérete, a JSON-LD és a sitemap is ellenőrzött. A workflow ezt deploy előtt is futtatja. A vizuális és interakciós ellenőrzést valódi böngészőben kell végezni.

## SEO és Google Search Console

- Magyar, témát leíró oldalcím és meta description.
- Canonical URL: `https://kasznare.github.io/AI-SDLC/`, paraméterek és anchor nélkül.
- Open Graph és Twitter megosztási adatok, 1200 × 630 pixeles helyi PNG-vel.
- WebSite, WebPage és Person JSON-LD, a látható tartalomhoz igazítva.
- A kérdés–válasz rész teljes szövege a HTML-ben van, JavaScript nélkül is olvasható.
- Sitemap: `https://kasznare.github.io/AI-SDLC/sitemap.xml`. A szakaszok anchorjai nem külön oldalak, ezért nem kerülnek bele.

Kézi beállítás a tulajdonos Google-fiókjában:

1. A [Google Search Console-ban](https://search.google.com/search-console) adj hozzá **URL-prefix** tulajdont a canonical címmel. A `github.io` DNS-éhez nincs szükség hozzáférésre.
2. Válaszd a **HTML tag** ellenőrzési módszert. A kapott `google-site-verification` meta tag kerülhet a `site/index.html` fejléce alá, majd deploy után elvégezhető az ellenőrzés.
3. Küldd be a `sitemap.xml` fájlt a **Sitemaps** menüben.
4. Az **URL Inspection** alatt ellenőrizd a főoldalt, és kérj indexelést. A hitelesítés, a beküldés és az indexelés állapota jelenleg nincs a repositoryból igazolva.

A `/AI-SDLC/robots.txt` nem a host gyökerében lenne, ezért a Google nem ezt használná. Itt a sitemap Search Console-beküldése a megfelelő út; a hostszintű robots.txt-t külön, a `kasznare.github.io` root webhelyén lehet kezelni.

Új tartalmi oldalnál frissítsd a sitemapet. A `lastmod` a tartalom érdemi frissítésének dátuma legyen. CSS-változtatásnál a stylesheet URL `v` paraméterét, új megosztási képnél az image URL-t érdemes verziózni, hogy a korábbi gyorsítótár ne mutasson régi változatot.

## Következő tartalmi témák

Ezek szerkesztési javaslatok, nem mért keresési volumenek:

| Sorrend | Javasolt útmutató | Mit mutasson meg? |
| --- | --- | --- |
| 1 | Codex használata meglévő projektben | Egy kis hibajavítás a projekt megnyitásától a teszteredményig. |
| 2 | Mit írj az AGENTS.md-be? | Rövid szabályfájl, tesztparancsok, jóváhagyások, gyakori hibák. |
| 3 | AI által írt kód ellenőrzése | Diff, tesztek, kézi próba, és a nem ellenőrzött részek átadása. |
| 4 | AI bevezetése fejlesztőcsapatban | Review, közös sztenderdek, felelősség és egy kisebb próba értékelése. |
| 5 | Prompt engineering: mi segít ténylegesen? | Konkrét feladatleírások és projektkontextus, példákkal. |

Valós esettanulmányhoz saját, megosztható projekt és ellenőrizhető eredmény kell. A meglévő szemléltető példákból nem lesz automatikusan ügyfélreferencia.

## GitHub Pages automatikus deploy

A `.github/workflows/pages.yml` minden `master` push után ellenőrzi és publikálja a `site/` tartalmát. Kézzel is indítható az **Actions → Deploy GitHub Pages → Run workflow** menüpontból, a `master` ágat kiválasztva.

Szükséges repository-beállítások:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Environments → github-pages → Deployment branches and tags** engedje a `master` ágat.
3. **Settings → Actions → General** alatt legyenek engedélyezve a workflow-k és a használt GitHub Actions műveletek.

Nincs szükség külön deploy secretre, PAT-ra vagy külső hostingra. A workflow a beépített `GITHUB_TOKEN` és OIDC segítségével kapja meg a Pages kiadáshoz szükséges jogosultságokat. A kiadások sorban futnak; a már folyamatban lévő deployt az új push nem szakítja félbe.

Minden helyi asset relatív URL-t használ, ezért az oldal a repository `/AI-SDLC/` útvonala alatt is működik. Más repositoryra költözésnél az élő URL-t és a forráskód linkjét frissíteni kell.

## Szerkesztés

| Fájl | Szerep |
| --- | --- |
| `site/index.html` | Tartalom, szemantikus szerkezet, kezdeti állapot |
| `site/styles.css` | Reszponzív megjelenés és nyomtatási nézet |
| `site/app.js` | Navigáció, lépések, példák, checklist és másolás |
| `site/brief-sablon.md` | Letölthető, másolható feladatbrief |
| `scripts/check_site.py` | Függőségek nélküli deploy előtti ellenőrzés |

Külső betűkészlet, analitika és CDN-függőség nincs. A checklist adatai csak a felhasználó böngészőjének `localStorage` tárában maradnak; az oldal nem küldi el őket. JavaScript nélkül a fő tartalom és a hat fejlesztési lépés is olvasható, a sablon letölthető.
