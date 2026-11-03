import test from 'node:test';
import assert from 'node:assert/strict';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm.js';

const run = text => buildTrace(parseInput(text));
const oracle = words => {
  let p = words[0];
  for (const w of words) {
    let end = 0;
    while (end < p.length && end < w.length && p[end] === w[end]) end++;
    p = p.slice(0, end);
  }
  return p;
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
    trace.frames.forEach(frame => {
      assert.ok(phases.some(p => p.id === frame.phase));
      assert.ok(code.some(l => l.line === frame.activeLine));
      assert.ok(frame.message.length > 0);
      assert.equal(typeof frame.snapshot, 'object');
    });
    assert.equal(trace.result, oracle(trace.input.words));
    assert.equal(trace.frames.at(-1).snapshot.prefix, trace.result);
  }
  assert.equal(run(examples[0].input).result, 'la');
  assert.equal(run(examples[1].input).result, '');
  assert.equal(run(examples[2].input).result, 'flower');
});

test('the prefix only ever shrinks across frames', () => {
  const trace = run(examples[0].input);
  for (let i = 1; i < trace.frames.length; i++) {
    assert.ok(trace.frames[i - 1].snapshot.prefix.startsWith(trace.frames[i].snapshot.prefix));
  }
});

test('random small cases agree with the independent oracle', () => {
  let seed = 9;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let c = 0; c < 200; c++) {
    const words = Array.from({ length: 1 + rand(5) }, () =>
      Array.from({ length: rand(6) }, () => 'ab'[rand(2)]).join(''));
    assert.equal(buildTrace({ words }).result, oracle(words), JSON.stringify(words));
  }
});

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"words":[]}'));
  assert.throws(() => parseInput('{"words":["Ab"]}'));
  assert.throws(() => parseInput('{"words":[3]}'));
});
