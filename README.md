# AI SDLC

Magyar nyelvű bemutatkozó oldal vállalati AI-natív fejlesztésről, Kasznár András szakmai tapasztalatára és tanácsadási munkájára építve.

**Élő oldal:** https://kasznare.github.io/AI-SDLC/

## Kinek szól és mit mutat be?

CTO-knak, engineering leadeknek és fejlesztési vezetőknek. A bevezetés tárgya a meglévő termék és a csapat teljes fejlesztési folyamata.

- Backlog, kód, CI/CD, cloud és vállalati hozzáférések kapcsolódási pontjai.
- Azure DevOps, Azure Pipelines, repositoryk és API/MCP kapcsolatok tervezése.
- Felmérés, mérhető pilot, bevezetés több csapatban és rendszeres értékelés.
- Saját feladatokon végzett oktatás, páros munka, gyakorlás és heti esetmegbeszélés.
- Átfutás, minőség, napi használat és elfogadott változtatásra jutó teljes költség.
- API-tokenköltség-becslő, külön tárgyalt előfizetési és nem tokenalapú költségekkel.
- Letölthető pilottervezési munkalap, vezetői kérdések, bemutatkozás és három foglalható alkalom.

Az integrációs ábra tervezési minta, nem működő vállalati rendszer vagy ügyfélreferencia. Az oldal nem csatlakozik Azure DevOpshoz vagy AI API-hoz. Nem tartalmaz kitalált ügyféleredményt, ügyféllogót vagy megtérülési ígéretet. A műszaki háttérhez hivatalos Microsoft- és OpenAI-források kapcsolódnak.

## API-tokenköltség-becslő

A `site/cost-model.mjs` tiszta függvénye számol. A `site/app.js` kezeli a mezőket és a megjelenítést. Minden adat a böngészőben marad, nincs hálózati elküldés vagy tartós mentés.

- Havi feladat = fejlesztők × napi feladat × munkanap.
- Havi futás = havi feladat × átlagos futás/feladat, az ismétlésekkel együtt.
- A teljes futás inputja magában foglalja az összes modellhívás inputját; a cache-elt input ennek része, nem plusz tétel.
- Output alatt az összes számlázott output értendő, a reasoning tokenekkel együtt.
- Havi díj = futások × [input × ((1 − cache-arány) × inputdíj + cache-arány × cachedíj) + output × outputdíj] / 1 000 000.

Az alapértékek szemléltető példák. Nincs előre kiválasztott szolgáltató vagy modell, a díjak nem aktuális listaárak. Az összegek USD-ben, adók nélkül értendők. Az alapértékek eredménye 1657,50 USD/hó, 1000 tervezett feladat és 1300 futás mellett.

A becslő nem számolja a licenceket, az előfizetésben foglalt használatot, az eszközhívásokat, külön cache-írási díjat, a CI/cloud vagy a munkaidő költségét. Több modellnél modellenként kell számolni. Hiányos vagy hibás mezőknél az eredmény eltűnik; nulla aktivitásnál nincs nullával osztás. JavaScript nélkül a módszertan olvasható, a mezők letiltottak.

## Calendly

| Alkalom | Időtartam | URL |
| --- | --- | --- |
| Vezetői egyeztetés / intro | 30 perc | `https://calendly.com/andraskasznar/30min` |
| Fejlesztési működés elemzése | 1 óra | `https://calendly.com/andraskasznar/elemzes` |
| Gyakorlati tréning a saját kódon | 2 óra | `https://calendly.com/andraskasznar/gyakorlati-ai-nativ-fejlesztesi-trening` |

A nyitórész és az intro kártyája az első linkre mutat, az elemzés és a tréning külön foglalható. A fejléc a kapcsolatfelvételi szakaszra visz. A foglalási linkek `data-booking` attribútummal jelöltek. Minden foglalás új lapon nyílik; nincs widget, külső naptárscript vagy API-kulcs.

A foglalható napok és órák a Calendlyben állíthatók, ezek nincsenek az oldalba írva. A naptáresemények leírását és a nagyobb bevezetések kereteit külön lehet egyeztetni. Az oldal az alkalmakat belépő találkozóként mutatja be, teljes vállalati bevezetést nem ígér egy órában.

## Helyi futtatás és ellenőrzés

Nincs telepítendő függőség vagy buildlépés. A statikus szerverhez Python 3, a számítás ellenőrzéséhez modern Node.js kell.

```sh
python3 -m http.server 8000 --directory site
```

A helyi cím: http://localhost:8000. Az ES-modulok miatt HTTP-szervert használj.

```sh
python3 scripts/check_site.py
node --check site/app.js
node --test scripts/cost-model.test.mjs
```

A Python-ellenőrzés a HTML szerkezetét, azonosítókat, helyi asseteket, anchorokat, SEO-metaadatokat, JSON-LD-t, a megosztási képet és a sitemapet ellenőrzi. A Node-tesztek a költségmodell cache-kezelését, ismétléseit, nulla használatát, skálázását és hibás bemeneteit vizsgálják. A workflow deploy előtt futtatja a statikus és költségmodell-ellenőrzést.

Böngészős ellenőrzés: asztali és mobil elrendezés, mobilmenü, billentyűzettel használható kérdések, becslő módosítása és visszaállítása, hibás bemenet, JavaScript nélküli tartalom és foglalási linkek.

## SEO és Google Search Console

- Magyar, vállalati keresési szándékhoz igazított cím és meta description.
- Canonical URL: `https://kasznare.github.io/AI-SDLC/`, paraméterek és anchor nélkül.
- Open Graph és Twitter megosztási adatok, 1200 × 630 pixeles helyi PNG-vel.
- WebSite, WebPage és Person JSON-LD a látható tartalomhoz igazítva.
- A tartalom és a kérdések a HTML-ben olvashatók, nem JavaScriptből töltődnek be.
- Sitemap: `https://kasznare.github.io/AI-SDLC/sitemap.xml`.

A Search Console beállítása a tulajdonos kérésére későbbre marad. Amikor aktuális:

1. A [Google Search Console-ban](https://search.google.com/search-console) adj hozzá **URL-prefix** tulajdont a canonical címmel.
2. A **HTML tag** ellenőrzésből kapott `google-site-verification` tag kerüljön az oldal fejlécébe, majd deploy után ellenőrizhető a tulajdon.
3. Küldd be a `sitemap.xml` fájlt, és az **URL Inspection** alatt kérj indexelést.

A hitelesítés és az indexelés nincs elvégezve vagy igazolva. A `/AI-SDLC/robots.txt` nem a host gyökerében lenne, ezért nem itt kezeljük. A hostszintű robots.txt külön, a `kasznare.github.io` root webhelyéhez tartozik.

Érdemi tartalomváltozáskor frissítsd a sitemap `lastmod` mezőjét. CSS, JavaScript és megosztási kép cseréjekor frissítsd az URL verzióparaméterét is.

## További szakmai tartalom

A következő anyagokhoz saját, megosztható projekt és ellenőrizhető adatok kellenek:

1. Egy változtatás útja Azure Boards work itemtől a PR-on és pipeline-on át a kiadásig.
2. Pilot értékelése: átfutás, review-terhelés, minőség és teljes ráfordítás.
3. Több csapat bevezetési tapasztalatai: közös alapok, helyi szabályok, betanulás és elakadások.
4. Egy valós agentfutás költségbontása: modellhívások, kontextus, reasoning, cache és ismétlések.

Ezek szerkesztési javaslatok, nem kész ügyfélreferenciák vagy mért keresési volumenek.

## GitHub Pages

A `.github/workflows/pages.yml` minden `master` push után ellenőrzi és publikálja a `site/` tartalmát. Kézzel az **Actions → Deploy GitHub Pages → Run workflow** alatt indítható.

Repository-beállítások:

1. **Settings → Pages → Source: GitHub Actions**.
2. A `github-pages` environment engedje a `master` ágat.
3. A workflow és a hivatkozott GitHub Actions műveletek legyenek engedélyezve.

Külön deploy secret vagy hosting nem kell. A kiadások sorban futnak. A helyi assetek relatív URL-t használnak, így a `/AI-SDLC/` alatti Pages-hosting működik.

## Fájlok

| Fájl | Szerep |
| --- | --- |
| `site/index.html` | Teljes tartalom, metaadatok, szemantikus szerkezet |
| `site/styles.css` | Reszponzív megjelenés és nyomtatási nézet |
| `site/app.js` | Mobil navigáció és költségbecslő felülete |
| `site/cost-model.mjs` | Ellenőrzött, külön tesztelhető számítás |
| `site/bevezetesi-terv.md` | Letölthető vállalati pilottervezési munkalap |
| `site/brief-sablon.md` | Korábbi feladatsablon, közvetlen linken továbbra is elérhető |
| `scripts/check_site.py` | Statikus oldal és SEO ellenőrzése |
| `scripts/cost-model.test.mjs` | A költségszámítás automatizált ellenőrzése |

Nincs külső betűkészlet, analitika, cookie vagy CDN-függőség. A korábbi checklist tárolt adatait az új oldal nem olvassa és nem használja.
