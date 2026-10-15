export const supportedLanguages = ['hu', 'en', 'de'];
export const preferenceKey = 'andras-kasznar-language';

export function countryLanguage(country) {
  if (typeof country !== 'string' || !/^[A-Z]{2}$/i.test(country)) return null;
  const code = country.toUpperCase();
  if (code === 'HU') return 'hu';
  return ['AT', 'DE', 'CH'].includes(code) ? 'de' : 'en';
}

export function browserLanguage(languages = []) {
  for (const language of languages) {
    const code = language.toLowerCase().split('-')[0];
    if (supportedLanguages.includes(code)) return code;
  }
  return 'en';
}

export function readPreference(storage) {
  try {
    const language = storage.getItem(preferenceKey);
    return supportedLanguages.includes(language) ? language : null;
  } catch { return null; }
}

export function rememberLanguage(storage, language) {
  if (!supportedLanguages.includes(language)) return;
  try { storage.setItem(preferenceKey, language); } catch { /* Navigation still works without storage. */ }
}

export function languageURL(base, language, current) {
  if (!supportedLanguages.includes(language)) throw new RangeError('Unsupported language');
  const destination = new URL(`${language}/`, base);
  destination.search = current.search;
  destination.hash = current.hash;
  return destination;
}

export async function chooseLanguage({preferred, languages, fetchCountry, timeoutMs = 1500}) {
  if (supportedLanguages.includes(preferred)) return preferred;
  const controller = new AbortController();
  let timer;
  try {
    const timeout = new Promise(resolve => {
      timer = setTimeout(() => { controller.abort(); resolve(null); }, timeoutMs);
    });
    // Race the full response body too: the timeout must cover a stalled JSON download.
    const lookup = Promise.resolve().then(() => fetchCountry(controller.signal)).then(countryLanguage).catch(() => null);
    const language = await Promise.race([lookup, timeout]);
    return language || browserLanguage(languages);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
