import {calculateApiCost} from './cost-model.mjs';

const language = document.documentElement.lang;
const copy = {
  hu: {locale: 'hu-HU', open: 'Navigáció megnyitása', close: 'Navigáció bezárása', invalid: 'A becsléshez tölts ki minden mezőt a megadott tartományban.', status: 'A megadott fogyasztással és egységárakkal, kizárólag API-tokenekre.', tokens: 'M token'},
  en: {locale: 'en-GB', open: 'Open navigation', close: 'Close navigation', invalid: 'Complete every field within the specified range to calculate an estimate.', status: 'Based on the usage and rates entered, for API tokens only.', tokens: 'M tokens'},
  de: {locale: 'de-DE', open: 'Navigation öffnen', close: 'Navigation schließen', invalid: 'Füllen Sie alle Felder innerhalb des angegebenen Bereichs aus.', status: 'Mit dem eingegebenen Verbrauch und den Preisen, nur für API-Token.', tokens: 'Mio. Token'}
}[language];
document.documentElement.classList.add('js');
document.body.classList.add('enhanced');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', copy.open);
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? copy.close : copy.open);
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {if (!event.target.closest('.site-header')) closeMenu();});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {closeMenu(); menu.focus();}
});

const form = document.querySelector('#cost-form');
const inputs = [...form.querySelectorAll('input')];
const number = new Intl.NumberFormat(copy.locale, {maximumFractionDigits: 1});
const money = new Intl.NumberFormat(copy.locale, {minimumFractionDigits: 2, maximumFractionDigits: 2});
function put(id, value) {document.getElementById(id).textContent = value;}
function updateEstimate() {
  const invalid = inputs.filter(input => !input.validity.valid || input.value.trim() === '');
  inputs.forEach(input => input.setAttribute('aria-invalid', String(invalid.includes(input))));
  let result;
  try {
    if (invalid.length) throw new RangeError('Incomplete inputs');
    result = calculateApiCost(Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber])));
  } catch {
    for (const id of ['monthly-cost','monthly-tasks','monthly-runs','monthly-input','monthly-output','task-cost']) put(id, '—');
    put('cost-status', copy.invalid);
    return;
  }
  put('monthly-cost', money.format(result.total));
  put('monthly-tasks', number.format(result.tasks));
  put('monthly-runs', number.format(result.runs));
  put('monthly-input', `${number.format(result.input / 1e6)} ${copy.tokens}`);
  put('monthly-output', `${number.format(result.output / 1e6)} ${copy.tokens}`);
  put('task-cost', result.perTask === null ? '—' : `${money.format(result.perTask)} USD`);
  put('cost-status', copy.status);
}
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('input', updateEstimate);
// Read restored defaults after the browser has completed the reset action.
form.addEventListener('reset', () => requestAnimationFrame(updateEstimate));
document.querySelector('#cost-fields').disabled = false;
updateEstimate();
