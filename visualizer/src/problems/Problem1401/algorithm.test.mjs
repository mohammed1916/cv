import test from 'node:test';
import assert from 'node:assert/strict';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm.js';

const run = text => buildTrace(parseInput(text));
// Oracle: sample the rectangle densely and test whether any point lies within the circle.
const oracle = ({ radius, cx, cy, left, bottom, right, top }) => {
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const x = left + ((right - left) * i) / steps, y = bottom + ((top - bottom) * j) / steps;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius * radius + 1e-9) return true;
    }
  }
  return false;
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
    assert.equal(trace.frames.length, 3);
    trace.frames.forEach(frame => {
      assert.ok(phases.some(p => p.id === frame.phase));
      assert.ok(code.some(l => l.line === frame.activeLine));
      assert.ok(frame.message.length > 0);
      assert.equal(typeof frame.snapshot, 'object');
    });
    assert.equal(trace.result, oracle(trace.input));
    assert.equal(trace.frames.at(-1).snapshot.result, trace.result);
  }
  assert.equal(run(examples[0].input).result, true);
  assert.equal(run(examples[1].input).result, false);
  assert.equal(run(examples[2].input).result, true);
});

test('touching exactly at distance equal to the radius counts as overlap', () => {
  assert.equal(run(examples[2].input).frames[1].snapshot.dist2, 1);
});

test('random small cases agree with the sampled oracle', () => {
  let seed = 5;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let c = 0; c < 150; c++) {
    const left = rand(7) - 3, bottom = rand(7) - 3;
    const input = {
      radius: 1 + rand(4), cx: rand(13) - 6, cy: rand(13) - 6,
      left, bottom, right: left + rand(4), top: bottom + rand(4),
    };
    assert.equal(buildTrace(input).result, oracle(input), JSON.stringify(input));
  }
});

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"radius":0,"cx":0,"cy":0,"left":0,"bottom":0,"right":1,"top":1}'));
  assert.throws(() => parseInput('{"radius":1,"cx":0,"cy":0,"left":2,"bottom":0,"right":1,"top":1}'));
  assert.throws(() => parseInput('{"radius":1,"cx":0.5,"cy":0,"left":0,"bottom":0,"right":1,"top":1}'));
});
