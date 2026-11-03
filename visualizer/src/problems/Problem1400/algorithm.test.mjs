import test from 'node:test';
import assert from 'node:assert/strict';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm.js';

const run = text => buildTrace(parseInput(text));
const oracle = (s, k) => {
  if (k > s.length) return false;
  let odd = 0;
  for (const c of new Set(s)) if (s.split(c).length % 2 === 0) odd++;
  return odd <= k;
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
    assert.ok(trace.frames.length >= 2);
    trace.frames.forEach(frame => {
      assert.ok(phases.some(p => p.id === frame.phase));
      assert.ok(code.some(l => l.line === frame.activeLine));
      assert.ok(frame.message.length > 0);
      assert.equal(typeof frame.snapshot, 'object');
    });
    assert.equal(trace.result, oracle(trace.input.s, trace.input.k));
    assert.equal(trace.frames.at(-1).snapshot.result, trace.result);
  }
  assert.equal(run(examples[0].input).result, true);
  assert.equal(run(examples[1].input).result, false);
  assert.equal(run(examples[2].input).result, true);
});

test('impossible k above the length stops at the length check', () => {
  const trace = run('{"s":"ab","k":3}');
  assert.equal(trace.result, false);
  assert.equal(trace.frames.length, 2);
  assert.equal(trace.frames[1].phase, 'decide');
});

test('random small cases agree with the independent oracle', () => {
  let seed = 3;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let c = 0; c < 300; c++) {
    const s = Array.from({ length: 1 + rand(10) }, () => 'abcd'[rand(4)]).join('');
    const k = 1 + rand(12);
    assert.equal(buildTrace({ s, k }).result, oracle(s, k), `${s} ${k}`);
  }
});

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"s":"","k":1}'));
  assert.throws(() => parseInput('{"s":"Ab","k":1}'));
  assert.throws(() => parseInput('{"s":"ab","k":0}'));
  assert.throws(() => parseInput('{"s":"ab","k":201}'));
});
