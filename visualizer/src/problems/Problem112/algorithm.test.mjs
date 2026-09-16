import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPathSum, getRoute, parsePathSum } from './algorithm.js';

test('finds the route and short-circuits unexplored siblings', () => {
  const run = buildPathSum([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22);
  assert.equal(run.result, true);
  assert.deepEqual(getRoute(run.nodes, run.frames.at(-1).nodeId).map(n => n.value), [5, 4, 11, 2]);
  assert.equal(run.nodes.find(n => n.value === 8).visitAt, Infinity);
  assert.ok(run.frames.some(f => f.phase === 'backtrack'));
});
test('only leaves qualify, and negative values must not be pruned', () => {
  assert.equal(buildPathSum([1, 2], 1).result, false);
  assert.equal(buildPathSum([5, -3], 2).result, true);
  assert.equal(buildPathSum([], 0).result, false);
  assert.equal(buildPathSum([null], 0).result, false);
  assert.equal(buildPathSum([0], 0).result, true);
});
test('duplicate values keep separate identities and correct routes', () => {
  const run = buildPathSum([1, 1, 1, null, null, 2], 4);
  assert.deepEqual(getRoute(run.nodes, run.frames.at(-1).nodeId).map(n => n.id), [0, 2, 3]);
});
test('validates input and orphan nodes', () => {
  for (const value of ['{}', '[1,"2"]', '[1.5]']) assert.throws(() => parsePathSum(value, '3'));
  assert.throws(() => parsePathSum('[1]', ''));
  assert.throws(() => buildPathSum([null, 2], 2));
  assert.throws(() => buildPathSum([1, null, null, 2], 2));
});
test('matches independent exhaustive root-to-leaf oracle on small trees', () => {
  for (let seed = 0; seed < 128; seed++) {
    const values = Array.from({ length: 7 }, (_, i) => ((seed >> i) & 1) ? 1 : -1);
    const sums = [values[0]+values[1]+values[3], values[0]+values[1]+values[4], values[0]+values[2]+values[5], values[0]+values[2]+values[6]];
    for (let target = -4; target <= 4; target++) assert.equal(buildPathSum(values, target).result, sums.includes(target));
  }
});
