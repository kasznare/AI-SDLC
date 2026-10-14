"use strict";

document.documentElement.classList.add("js");

// The static HTML remains readable when JavaScript is unavailable.
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Navigáció megnyitása");
  navigation.classList.remove("is-open");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Navigáció bezárása" : "Navigáció megnyitása");
  navigation.classList.toggle("is-open", open);
});
navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", event => {
  if (!event.target.closest(".site-header")) closeMenu();
});

const stepTabs = [...document.querySelectorAll("[data-step]")];
const stepPanels = [...document.querySelectorAll(".step-panel")];
let currentStep = 0;
function selectStep(index, focus = false) {
  currentStep = (index + stepTabs.length) % stepTabs.length;
  stepTabs.forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(i === currentStep));
    tab.tabIndex = i === currentStep ? 0 : -1;
    stepPanels[i].hidden = i !== currentStep;
  });
  document.querySelector("#step-count").textContent = String(currentStep + 1).padStart(2, "0");
  if (focus) stepTabs[currentStep].focus();
}
stepTabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectStep(i));
  tab.addEventListener("keydown", event => {
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: stepTabs.length - 1 };
    if (Object.hasOwn(keys, event.key)) {
      event.preventDefault();
      selectStep(keys[event.key], true);
    }
  });
});
document.querySelector("#prev-step").addEventListener("click", () => selectStep(currentStep - 1, true));
document.querySelector("#next-step").addEventListener("click", () => selectStep(currentStep + 1, true));
selectStep(0);

const scenarios = {
  feature: {
    file: "feature-brief.md", name: "Rendelések exportálása CSV-be",
    description: "Az ügyfélszolgálat a szűrt rendeléslistát táblázatban szeretné feldolgozni.",
    criteria: ["Csak a jogosult felhasználó exportálhat.", "A fájl a szűrt listát, helyes ékezetekkel tartalmazza.", "Az üres lista és a képletként értelmezhető mező is kezelt."],
    plan: "Meglévő jogosultságkezelés, rendelés API és exportformátum feltérképezése.",
    build: "Kis PR: export végpont, felületi gomb és a kapcsolódó tesztek.",
    proof: "Jogosultsági és CSV-tesztek, böngészős letöltéspróba, áttekinthető diff.",
    decision: "A formátum és az adatvédelmi hatókör review-ja; utána engedélyezett kiadás.",
    result: "A cél a használható, biztonságos export. A kód ennek az egyik eszköze."
  },
  bug: {
    file: "bug-brief.md", name: "Dupla rendelés beküldésének javítása",
    description: "Lassú hálózatnál az ismételt kattintás két rendelést hozhat létre.",
    criteria: ["Azonos kérés ismétlése egyetlen rendelést eredményez.", "Hálózati hiba után a felhasználó biztonságosan újrapróbálkozhat.", "A párhuzamos kérések és a lejárt kulcs kezelése is tesztelt."],
    plan: "Reprodukció, kéréskezelés és az adatbázis egyediségvédelmének feltárása.",
    build: "Idempotenciakulcs, szerveroldali védelem és a hiba reprodukciós tesztje.",
    proof: "A teszt a javítás előtt hibázik, utána sikeres; párhuzamos beküldés is ellenőrzött.",
    decision: "Az adatkonzisztencia és a visszafelé kompatibilitás review-ja; rollout megfigyeléssel.",
    result: "A cél a rendelés egyszeri létrehozása, még hálózati bizonytalanság esetén is."
  },
  refactor: {
    file: "refactor-brief.md", name: "Árkalkuláció közös modulba szervezése",
    description: "Három eltérő kódrészlet számítja ugyanazt az árat; az új szabályok nehezen vezethetők be.",
    criteria: ["A meglévő üzleti viselkedés és API változatlan.", "A kerekítés, kedvezmények és szélső esetek teszteltek.", "A megállapodott teljesítménykeret nem sérül."],
    plan: "Hívási helyek és árképzési szabályok feltárása; a jelenlegi viselkedés rögzítése tesztekkel.",
    build: "Közös árkalkulációs modul; a hívási helyek fokozatos átállítása kis diffekkel.",
    proof: "Viselkedésmegőrző és regressziós tesztek, API-ellenőrzés és összehasonlító teljesítménymérés.",
    decision: "A szabályok és a diff review-ja; kiadás a meglévő monitorozás mellett.",
    result: "A cél az egyszerűbb karbantartás, megőrzött üzleti viselkedéssel."
  }
};
const scenarioButtons = [...document.querySelectorAll("[data-scenario]")];
scenarioButtons.forEach(button => button.addEventListener("click", () => {
  const scenario = scenarios[button.dataset.scenario];
  scenarioButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  for (const field of ["file", "name", "description", "plan", "build", "proof", "decision", "result"]) {
    document.querySelector(`#example-${field}`).textContent = scenario[field];
  }
  document.querySelector("#example-criteria").replaceChildren(...scenario.criteria.map(text => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }));
}));

const storageKey = "ai-sdlc-pilot-v1";
const checks = [...document.querySelectorAll("[data-check]")];
const storageNote = document.querySelector("#storage-note");
function updateChecklist() {
  const completed = checks.filter(check => check.checked).length;
  document.querySelector("#checklist-count").textContent = `${completed} / ${checks.length}`;
  document.querySelector("#checklist-message").textContent = completed === checks.length
    ? "A pilot előkészítve. Indulhat az első kör."
    : completed === 0 ? "Haladj lépésről lépésre." : `Még ${checks.length - completed} lépés a pilot előkészítéséhez.`;
}
function saveChecklist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(checks.filter(check => check.checked).map(check => check.dataset.check)));
  } catch {
    storageNote.textContent = "A böngésző nem engedi a mentést; a jelölések most csak az oldal bezárásáig élnek.";
  }
}
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(saved)) checks.forEach(check => { check.checked = saved.includes(check.dataset.check); });
} catch {
  storageNote.textContent = "A mentett jelölések nem tölthetők be; az ellenőrzőlista most mentés nélkül használható.";
}
checks.forEach(check => check.addEventListener("change", () => { updateChecklist(); saveChecklist(); }));
document.querySelector("#reset-checklist").addEventListener("click", () => {
  checks.forEach(check => { check.checked = false; });
  updateChecklist();
  saveChecklist();
});
updateChecklist();

document.querySelector("#copy-brief").addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    const response = await fetch("./brief-sablon.md");
    if (!response.ok) throw new Error("Template unavailable");
    const template = await response.text();
    await navigator.clipboard.writeText(template);
    status.textContent = "A briefsablon a vágólapra került.";
  } catch {
    status.textContent = "A másolás nem sikerült. A letöltés gombbal elérheted a sablont.";
  }
});
