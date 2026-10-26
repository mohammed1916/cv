import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMinimumDepth, parseMinimumDepth, routeTo } from './algorithm.js';

test('canonical tree and empty or single-root cases', () => {
  const run = buildMinimumDepth([3,9,20,null,null,15,7]);
  assert.equal(run.result, 2);
  assert.deepEqual(routeTo(run.nodes, run.frames.at(-1).bestLeaf).map(n => n.val), [3,9]);
  assert.equal(buildMinimumDepth([]).result, 0);
  assert.equal(buildMinimumDepth([null]).result, 0);
  assert.equal(buildMinimumDepth([7]).result, 1);
  assert.equal(buildMinimumDepth([7]).frames.at(-1).activeLine, 7);
});
test('sparse level-order chain follows the real child instead of missing branch', () => {
  const run = buildMinimumDepth([2,null,3,null,4,null,5,null,6]);
  assert.equal(run.result, 5);
  assert.equal(run.frames.filter(f => f.phase === 'missing_child').length, 4);
  assert.ok(run.frames.filter(f => f.phase === 'missing_child').every(f => f.activeLine === 9));
  assert.deepEqual(run.frames.filter(f => f.phase === 'return').map(f => f.returnedDepth), [2,3,4,5]);
});
test('duplicate node values remain distinct and ties retain a valid route', () => {
  const run = buildMinimumDepth([1,1,1]);
  assert.equal(run.result, 2);
  assert.deepEqual(routeTo(run.nodes, run.frames.at(-1).bestLeaf).map(n => n.id), [0,1]);
});
test('reject malformed input and orphan children', () => {
  for (const source of ['{}','[1,"2"]','[1.1]']) assert.throws(() => parseMinimumDepth(source));
  assert.throws(() => buildMinimumDepth([1,null,null,3]));
  assert.throws(() => buildMinimumDepth([null,2]));
});
test('exhaustive sparse trees agree with an independent BFS minimum-depth oracle', () => {
  for (let mask = 0; mask < 256; mask++) {
    const input = [0];
    const queue = [{ depth: 1 }];
    let head = 0, bit = 0, expected = Infinity;
    while (head < queue.length) {
      const { depth } = queue[head++];
      let children = 0;
      for (let side = 0; side < 2; side++) {
        const present = bit < 8 && ((mask >> bit) & 1);
        bit++;
        input.push(present ? -1 : null);
        if (present) { children++; queue.push({ depth: depth + 1 }); }
      }
      if (!children) expected = Math.min(expected, depth);
    }
    const run = buildMinimumDepth(input);
    assert.equal(run.result, expected, JSON.stringify(input));
    assert.equal(routeTo(run.nodes, run.frames.at(-1).bestLeaf).length, expected);
  }
});
test('deep chains do not depend on the JavaScript call stack', () => {
  const input = [0];
  for (let i = 1; i < 5000; i++) input.push(null, i);
  assert.equal(buildMinimumDepth(input).result, 5000);
});
