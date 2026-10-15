import test from 'node:test';
import assert from 'node:assert/strict';
import {browserLanguage, chooseLanguage, countryLanguage, languageURL, preferenceKey, readPreference, rememberLanguage} from '../site/language-routing.mjs';

test('country mapping matches HU, DACH and worldwide requirements', () => {
  for (const [country, language] of Object.entries({HU:'hu',AT:'de',DE:'de',CH:'de',US:'en',FR:'en',GB:'en',CN:'en'})) {
    assert.equal(countryLanguage(country), language);
  }
  assert.equal(countryLanguage('hu'), 'hu');
  for (const invalid of [null, '', 'Hungary', {}, 1]) assert.equal(countryLanguage(invalid), null);
});

test('browser fallback respects language preference order and defaults to English', () => {
  assert.equal(browserLanguage(['fr-FR','de-CH','hu-HU']), 'de');
  assert.equal(browserLanguage(['en-US','hu-HU']), 'en');
  assert.equal(browserLanguage(['hu-HU']), 'hu');
  assert.equal(browserLanguage(['fr-FR']), 'en');
});

test('explicit stored choice avoids lookup and wins over browser preferences', async () => {
  const result = await chooseLanguage({preferred:'de', languages:['hu-HU'], fetchCountry: () => {throw Error('Must not call');}});
  assert.equal(result, 'de');
});

test('country takes priority over browser language', async () => {
  assert.equal(await chooseLanguage({languages:['de'], fetchCountry:async () => 'HU'}), 'hu');
  assert.equal(await chooseLanguage({languages:['hu'], fetchCountry:async () => 'US'}), 'en');
});

test('errors, invalid responses and timeouts fall back without trapping visitors', async () => {
  for (const lookup of [async () => {throw Error('offline');}, async () => null, async () => undefined]) {
    assert.equal(await chooseLanguage({languages:['hu'],fetchCountry:lookup}), 'hu');
  }
  let signal;
  assert.equal(await chooseLanguage({languages:['de'],timeoutMs:10,fetchCountry:s => {signal=s;return new Promise(() => {});}}), 'de');
  assert.equal(signal.aborted,true);
});

test('blocked or corrupt storage never prevents language selection', () => {
  const blocked = {getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.equal(readPreference(blocked),null);
  assert.equal(readPreference(undefined),null);
  assert.doesNotThrow(() => rememberLanguage(blocked,'en'));
  let saved;
  const storage = {setItem(key,value){assert.equal(key,preferenceKey);saved=value;},getItem(){return saved;}};
  rememberLanguage(storage,'hu');
  assert.equal(readPreference(storage),'hu');
  saved='not-a-language';
  assert.equal(readPreference(storage),null);
});

test('language URL preserves project base, campaign query and old section links', () => {
  const current = new URL('https://kasznare.github.io/AI-SDLC/?v=old&utm_source=mail#beszeljunk');
  assert.equal(languageURL('https://kasznare.github.io/AI-SDLC/','de',current).href,'https://kasznare.github.io/AI-SDLC/de/?v=old&utm_source=mail#beszeljunk');
  assert.equal(languageURL('http://localhost:8000/','hu',new URL('http://localhost:8000/en/#koltsegek')).href,'http://localhost:8000/hu/#koltsegek');
  assert.throws(() => languageURL(current,'../../',current),RangeError);
});
