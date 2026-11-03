import test from 'node:test';
import assert from 'node:assert/strict';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm.js';

const run = text => buildTrace(parseInput(text));
const oracle = arr => {
  let best = -1;
  for (const v of new Set(arr)) {
    if (arr.filter(x => x === v).length === v && v > best) best = v;
  }
  return best;
};

test('phases and code metadata are consistent', () => {
  assert.equal(new Set(phases.map(p => p.id)).size, phases.length);
  code.forEach((line, i) => assert.equal(line.line, i + 1));
  assert.ok(python.trim().length > 0);
  const pyLines = python.split('\n').length;
  Object.values(pythonLineMap).forEach(line => assert.ok(line >= 1 && line <= pyLines));
});

test('every example produces well-formed frames and the expected result', () => {
  for (const example of examples) {
    const trace = run(example.input);
    assert.ok(trace.frames.length > 1);
    trace.frames.forEach(frame => {
      assert.ok(phases.some(p => p.id === frame.phase));
      assert.ok(code.some(l => l.line === frame.activeLine));
      assert.ok(frame.message.length > 0);
      assert.equal(typeof frame.snapshot, 'object');
    });
    assert.equal(trace.result, oracle(trace.input.arr));
    assert.equal(trace.frames.at(-1).snapshot.best, trace.result);
  }
  assert.equal(run(examples[0].input).result, 2);
  assert.equal(run(examples[1].input).result, -1);
});

test('snapshots are independent of later frames', () => {
  const trace = run(examples[0].input);
  assert.equal(trace.frames[0].snapshot.best, -1);
  assert.equal(trace.frames.at(-1).snapshot.best, 2);
});

test('random small cases agree with the independent oracle', () => {
  let seed = 11;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let c = 0; c < 200; c++) {
    const arr = Array.from({ length: 1 + rand(12) }, () => 1 + rand(6));
    assert.equal(buildTrace({ arr }).result, oracle(arr));
  }
});

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"arr":[]}'));
  assert.throws(() => parseInput('{"arr":[0]}'));
  assert.throws(() => parseInput('{"arr":[501]}'));
  assert.throws(() => parseInput('{"arr":[1.5]}'));
});
