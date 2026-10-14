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

Az első ellenőrzés a HTML struktúráját, az egyedi azonosítókat, a helyi fájlokat, az anchorokat és az ARIA-hivatkozásokat ellenőrzi. A workflow ezt deploy előtt is futtatja. A vizuális és interakciós ellenőrzést valódi böngészőben kell végezni.

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
