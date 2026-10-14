import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateApiCost} from '../site/cost-model.mjs';
const base = {developers:10,tasks:5,days:20,runs:1.3,input:500000,output:50000,inputRate:2,outputRate:10,cachedRate:0.5,cache:30};
test('monthly estimate counts retries and splits cached input without double billing', () => {
  const value = calculateApiCost(base);
  assert.equal(value.tasks, 1000);
  assert.equal(value.runs, 1300);
  assert.equal(value.input, 650000000);
  assert.equal(value.cachedInput, 195000000);
  assert.equal(value.inputCost, 1007.5);
  assert.equal(value.outputCost, 650);
  assert.equal(value.total, 1657.5);
  assert.equal(value.perTask, 1.6575);
});
test('cache endpoints price every input token exactly once', () => {
  assert.equal(calculateApiCost({...base, cache:0}).total, 1950);
  assert.equal(calculateApiCost({...base, cache:100}).total, 975);
});
test('zero activity produces no usage or undefined per-task amount', () => {
  for (const change of [{developers:0},{tasks:0}]) {
    const value=calculateApiCost({...base,...change});
    assert.equal(value.total, 0);
    assert.equal(value.perTask, null);
  }
});
test('usage scales with team size and repeat attempts', () => {
  assert.equal(calculateApiCost({...base, developers:20}).total, 3315);
  assert.equal(calculateApiCost({...base, runs:2.6}).total, 3315);
});
test('invalid or missing inputs do not become plausible estimates', () => {
  for (const change of [{cache:101},{cache:-1},{developers:0.5},{days:32},{runs:0},{input:-1},{inputRate:NaN},{outputRate:Infinity},{tasks:undefined},{days:''}]) {
    assert.throws(() => calculateApiCost({...base,...change}), RangeError);
  }
});
