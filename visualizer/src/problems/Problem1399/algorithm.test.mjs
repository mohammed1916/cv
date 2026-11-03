import test from 'node:test';
import assert from 'node:assert/strict';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm.js';

const run = text => buildTrace(parseInput(text));
const oracle = n => {
  const sizes = new Map();
  for (let v = 1; v <= n; v++) {
    const s = String(v).split('').reduce((t, d) => t + Number(d), 0);
    sizes.set(s, (sizes.get(s) ?? 0) + 1);
  }
  const largest = Math.max(...sizes.values());
  return [...sizes.values()].filter(x => x === largest).length;
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
    assert.equal(trace.result, oracle(trace.input.n));
  }
  assert.equal(run(examples[0].input).result, 1);
  assert.equal(run(examples[1].input).result, 1);
});

test('group snapshots are copies, not shared mutable objects', () => {
  const trace = run('{"n":12}');
  const groupFrames = trace.frames.filter(f => f.phase === 'group');
  assert.notEqual(groupFrames[0].snapshot.sizes, groupFrames[1].snapshot.sizes);
  assert.equal(groupFrames[0].snapshot.sizes[1], 1);
});

test('a range of n agrees with the independent oracle', () => {
  for (let n = 1; n <= 120; n++) assert.equal(buildTrace({ n }).result, oracle(n));
  assert.equal(buildTrace({ n: 10000 }).result, oracle(10000));
});

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"n":0}'));
  assert.throws(() => parseInput('{"n":10001}'));
  assert.throws(() => parseInput('{"n":2.5}'));
});
