import {chooseLanguage, languageURL, readPreference, rememberLanguage} from './language-routing.mjs';

// Resolve against this module so both project Pages and local hosting use the right base.
const base = new URL('./', import.meta.url);
let manuallySelected = false;
let storage;
try { storage = window.localStorage; } catch { /* Storage can be blocked by browser policy. */ }

const languageLinks = [...document.querySelectorAll('[data-language]')];
function refreshLinks() {
  languageLinks.forEach(link => { link.href = languageURL(base, link.dataset.language, window.location).href; });
}
refreshLinks();
window.addEventListener('hashchange', refreshLinks);
window.addEventListener('popstate', refreshLinks);
languageLinks.forEach(link => {
  const language = link.dataset.language;
  link.href = languageURL(base, language, window.location).href;
  link.addEventListener('click', () => {
    manuallySelected = true;
    refreshLinks();
    rememberLanguage(storage, language);
  });
});

// Explicit /hu/, /en/ and /de/ links always stay in the requested language.
if (document.body.hasAttribute('data-language-entry')) {
  const language = await chooseLanguage({
    preferred: readPreference(storage),
    languages: navigator.languages || [navigator.language],
    fetchCountry: async signal => {
      const response = await fetch('https://api.country.is/', {
        signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store'
      });
      if (!response.ok) throw new Error('Country lookup unavailable');
      const data = await response.json();
      return data.country;
    }
  });
  if (!manuallySelected) window.location.replace(languageURL(base, language, window.location));
}
