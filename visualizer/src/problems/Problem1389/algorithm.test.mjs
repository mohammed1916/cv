import test from 'node:test';
import assert from 'node:assert/strict';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm.js';

const run = text => buildTrace(parseInput(text));
const oracle = ({ nums, index }) => nums.reduce((t, v, i) => [...t.slice(0, index[i]), v, ...t.slice(index[i])], []);

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
    assert.deepEqual(trace.result, oracle(trace.input));
    assert.deepEqual(trace.frames.at(-1).snapshot.target, trace.result);
  }
  assert.deepEqual(run(examples[0].input).result, [9, 2, 7, 4]);
});

test('snapshots are independent copies', () => {
  const trace = run(examples[0].input);
  trace.result.push('mutated');
  assert.equal(trace.frames.at(-1).snapshot.target.includes('mutated'), false);
  assert.notEqual(trace.frames[1].snapshot.target, trace.frames[2].snapshot.target);
});

test('random small cases agree with the independent oracle', () => {
  let seed = 7;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let c = 0; c < 200; c++) {
    const n = 1 + rand(8);
    const nums = Array.from({ length: n }, () => rand(11) - 5);
    const index = nums.map((_, i) => rand(i + 1));
    assert.deepEqual(buildTrace({ nums, index }).result, oracle({ nums, index }));
  }
});

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"nums":[],"index":[]}'));
  assert.throws(() => parseInput('{"nums":[1,2],"index":[0]}'));
  assert.throws(() => parseInput('{"nums":[1],"index":[1]}'), /index\[0\]/);
  assert.throws(() => parseInput('{"nums":[1,2],"index":[0,0.5]}'));
});
