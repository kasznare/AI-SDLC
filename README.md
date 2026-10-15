# Kasznár András — AI a fejlesztésben

Háromnyelvű bemutatkozó oldal vállalati AI-bevezetésről: meglévő termékek, eszközök és folyamatok, integrációk, csapatok betanítása, mérés és költségtervezés. A platformnevek példák; a megközelítés a csapat meglévő eszköztárához illeszkedik.

- Magyar: https://kasznare.github.io/AI-SDLC/hu/
- English: https://kasznare.github.io/AI-SDLC/en/
- Deutsch: https://kasznare.github.io/AI-SDLC/de/
- Automatikus nyelvválasztás: https://kasznare.github.io/AI-SDLC/

A repository neve és a Pages alapcíme megmaradt. A látható név a magyar oldalon **Kasznár András — AI a fejlesztésben**, az angol és német oldalon **András Kasznár** helyi nyelvű alcímmel.

## Nyelvválasztás

Minden változat teljes, statikus HTML, saját metaadatokkal, megosztási képpel és letölthető pilottervvel. A kalkulátor feliratai, hibaüzenetei és számformátuma is a nyelvet követik.

Csak a nyelv nélküli kezdőcím választ automatikusan:

1. A korábban kézzel kiválasztott nyelv az elsődleges, ha elérhető a böngésző tárolójából.
2. Egyébként a böngésző meghívja a `https://api.country.is/` végpontot. HU → magyar; AT/DE/CH → német; minden más ország → angol.
3. Hálózati hiba, hibás válasz vagy legfeljebb 1,5 másodperc várakozás után a böngésző első támogatott nyelve dönt. Ha nincs magyar, angol vagy német nyelv a listában, angolra vált.

A közvetlen `/hu/`, `/en/`, `/de/` címek mindig az adott nyelven maradnak, országfelismerést sem indítanak. A fejléc nyelvváltója mobilon is látható. A kézi választás `localStorage`-ba kerül (`andras-kasznar-language`), az automatikus döntés nem. Tiltott tároló mellett is működnek a linkek. Az URL paraméterei és szakaszhivatkozásai megmaradnak. JavaScript nélkül a kezdőoldalon három valódi nyelvi link használható.

Az IP-alapú országfelismerés közelítő: VPN, vállalati hálózat vagy mobilhálózat más országot jelezhet. A böngésző nyelve nyelvi preferencia, nem tartózkodási hely. A kézi választás ezért mindig elérhető.

### Külső szolgáltatás és adatok

A [country.is](https://country.is/) kulcs nélkül használható országfelismerő API. A kérés során a szolgáltató megkapja a látogató IP-címét; erről az oldal tájékoztatást tartalmaz. A kérés nem küld referrert vagy hitelesítő adatokat, nem kér GPS-hozzáférést, a válaszból csak az országkódot használjuk. Az alkalmazás nem tárolja az IP-címet vagy az országot. A szolgáltatás kiesése nem akadályozza az oldal megnyitását.

Nincs analitika, külső betűkészlet, naptárwidget vagy AI API-hívás. A kalkulátor adatai kizárólag a böngésző memóriájában maradnak, nem kerülnek hálózatra vagy tartós tárolóba. Az egyetlen mentett beállítás a kézzel választott nyelv. A korábbi checklist adatait nem olvassuk.

## Tartalom és fordítások szerkesztése

- `content/page.html`: közös szerkezet és magyar forrásszöveg; stabil szakaszazonosítók mindhárom nyelven.
- `content/locales/en.json`, `de.json`: fordítások, magyar forrásszöveggel kulcsként. Hiányzó fordításnál a build hibával leáll.
- `content/pilot-plan.hu.md`, `.en.md`, `.de.md`: a három letölthető munkalap.
- `scripts/build_site.py`: nyelvi metaadatok, márkanév, nyelvváltó, kezdőlap, sitemap és generálás.
- `site/app.js`: a kalkulátor és a mobilmenü nyelvi feliratai.
- `site/styles.css`: közös reszponzív megjelenés és nyomtatási nézet.

A `site/index.html`, a három `site/<nyelv>/index.html`, a `pilot-plan.md` fájlok és a sitemap generált fájlok. A forrást módosítsd, majd futtasd:

```sh
python3 scripts/build_site.py
```

A generált fájlokat is commitoljuk, így a `site/` közvetlenül kiszolgálható. A CI ellenőrzi, hogy a forrás és a generált kimenet egyezik. Nincs npm-függőség; a generálás Python standard libraryvel működik. A megosztási képek nyelvenként `site/<nyelv>/social-preview.png` alatt vannak, 1200 × 630 pixeles PNG-ként.

## Helyi futtatás és ellenőrzés

```sh
python3 scripts/build_site.py
python3 -m http.server 8000 --directory site
```

Például http://localhost:8000/hu/ közvetlenül a magyar változatot nyitja meg. Az ES-modulok miatt HTTP-szerver kell.

```sh
python3 scripts/build_site.py --check
python3 scripts/check_site.py
node --check site/app.js
node --check site/language.js
node --test scripts/*.test.mjs
```

Az ellenőrzések a teljes HTML-t, helyi fájlokat, szakaszhivatkozásokat, canonical és hreflang kapcsolatokat, JSON-LD-t, megosztási képeket és sitemapet vizsgálják. A Node-tesztek a költségszámítás és a nyelvválasztás logikáját ellenőrzik, valós külső API nélkül.

Böngészős ellenőrzéskor vizsgálandó: három nyelv asztali és mobil elrendezése, nyelvváltó és menü, kalkulátor és visszaállítás, hibás/üres mezők, közvetlen nyelvi URL, megjegyzett választás, országfelismerés kiesése, szakaszhivatkozások és JavaScript nélküli tartalom. A country.is válaszait ehhez mockolni lehet.

## API-tokenköltség-becslő

A `site/cost-model.mjs` tiszta függvénye számol, a `site/app.js` kezeli a felületet. A három fordítás ugyanazt a számítást használja.

- Havi feladat = fejlesztők × napi feladat × munkanap.
- Havi futás = havi feladat × átlagos futás/feladat, ismétlésekkel együtt.
- A teljes futás inputja az összes modellhívás összesített inputja. A cache-elt input ennek része, nem plusz tétel.
- Output = minden számlázott output, reasoning tokenekkel együtt.
- Havi díj = futások × [input × ((1 − cache-arány) × inputdíj + cache-arány × cachedíj) + output × outputdíj] / 1 000 000.

Az alapértékek szemléltető példák, nem aktuális modellárak. Az eredmény **1657,50 USD/hó**, 1000 tervezett feladat és 1300 futás mellett, adók nélkül. Nem váltunk pénznemet a választott nyelv alapján.

A becslő nem számolja a licenceket, az előfizetésben foglalt használatot, eszközhívásokat, külön cache-írási díjat, CI/cloud vagy munkaidő költségét. Több modellnél modellenként kell számolni. Hibás mezőknél az eredmény eltűnik, nulla aktivitásnál nincs nullával osztás. JavaScript nélkül a módszertan olvasható, a mezők letiltottak.

## Calendly

Mindhárom nyelven a meglévő eseményeket használjuk:

| Alkalom | Időtartam | URL |
| --- | --- | --- |
| Intro / vezetői egyeztetés | 30 perc | https://calendly.com/andraskasznar/30min |
| Fejlesztési működés elemzése | 1 óra | https://calendly.com/andraskasznar/elemzes |
| Gyakorlati tréning | 2 óra | https://calendly.com/andraskasznar/gyakorlati-ai-nativ-fejlesztesi-trening |

A nyitórész és az intro kártyája az első linkre mutat. Minden foglalás új lapon nyílik. A nagyobb bevezetés terjedelmét külön kell egyeztetni. A szabad időpontokat, az események nyelvét és leírását a Calendly kezeli; ez a weboldal-fordítás nem változtatja meg a Calendly-fiók beállításait.

## SEO

- Saját title, description, canonical és nyelvi jelölés minden változatnak.
- Kölcsönös `hreflang="hu"`, `"en"`, `"de"`, valamint `x-default` a kezdőcímre.
- Minden nyelv teljes tartalma közvetlenül a HTML-ben, JavaScript nélkül is olvasható.
- WebSite, WebPage és Person JSON-LD, nyelvenkénti Open Graph és Twitter képek.
- A sitemap tartalmazza a kezdőcímet és a három nyelvi oldalt: https://kasznare.github.io/AI-SDLC/sitemap.xml.
- A közvetlen nyelvi oldalak nem irányítják át a keresőt vagy a látogatót.

A Google Search Console bekötése a tulajdonos kérésére későbbre marad. Hitelesítés vagy indexelés nincs igazolva. A repo alatti robots.txt nem lenne hostszintű, ezért nem használjuk. Tartalomváltozáskor a build scriptben a sitemap dátumát is frissíteni kell. A CSS és JavaScript verzióparaméterét a build tartalmi hash alapján kezeli.

## GitHub Pages és kiadás

A `.github/workflows/pages.yml` minden `master` push után ellenőrzi és publikálja a `site/` tartalmát. Kézi futtatás: **Actions → Deploy GitHub Pages → Run workflow**.

Szükséges meglévő beállítások:

1. **Settings → Pages → Source: GitHub Actions**.
2. A `github-pages` environment engedje a `master` ágat.
3. A workflow és a használt GitHub Actions műveletek legyenek engedélyezve.

A három nyelvhez nem kell külön repository, deploy secret vagy hosting. A relatív assetlinkek és a script helyéből számolt alapcím támogatják a `/AI-SDLC/` alatti kiszolgálást. Más domainre/repositoryra költözéskor a `scripts/build_site.py` `BASE` beállítását és a statikus ellenőrzőben a várt alapcímet is módosítani kell.

A régi `site/bevezetesi-terv.md` és `site/brief-sablon.md` közvetlen linkje továbbra is elérhető. Az integrációs ábra tervezési minta. Az oldal nem állít valótlan ügyfélreferenciát vagy garantált megtérülést.
