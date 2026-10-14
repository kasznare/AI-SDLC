import {calculateApiCost} from './cost-model.mjs';

document.documentElement.classList.add('js');
document.body.classList.add('enhanced');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Navigáció megnyitása');
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Navigáció bezárása' : 'Navigáció megnyitása');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {if (!event.target.closest('.site-header')) closeMenu();});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {closeMenu(); menu.focus();}
});

const form = document.querySelector('#cost-form');
const inputs = [...form.querySelectorAll('input')];
const number = new Intl.NumberFormat('hu-HU', {maximumFractionDigits: 1});
const money = new Intl.NumberFormat('hu-HU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
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
    put('cost-status', 'A becsléshez tölts ki minden mezőt a megadott tartományban.');
    return;
  }
  put('monthly-cost', money.format(result.total));
  put('monthly-tasks', number.format(result.tasks));
  put('monthly-runs', number.format(result.runs));
  put('monthly-input', `${number.format(result.input / 1e6)} M token`);
  put('monthly-output', `${number.format(result.output / 1e6)} M token`);
  put('task-cost', result.perTask === null ? '—' : `${money.format(result.perTask)} USD`);
  put('cost-status', 'A megadott fogyasztással és egységárakkal, kizárólag API-tokenekre.');
}
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('input', updateEstimate);
// Read restored defaults after the browser has completed the reset action.
form.addEventListener('reset', () => requestAnimationFrame(updateEstimate));
document.querySelector('#cost-fields').disabled = false;
updateEstimate();
