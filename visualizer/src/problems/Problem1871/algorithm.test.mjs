import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';
import examples from '../../config/examples/collection--1871.js';
import { jumpWindowTutorial } from './tutorial.js';
import { jumpWindowDefinition, JUMP_RETURN_LINE } from './trace.js';

const wrapped = jumpWindowDefinition(definitions[1871], examples);

// Brute force: position i is reachable if it is '0' and some j in [i-maxJump, i-minJump] is reachable.
function brute(s, minJump, maxJump) {
  const r = Array(s.length).fill(false); r[0] = true;
  for (let i = 1; i < s.length; i++) {
    for (let j = Math.max(0, i - maxJump); j <= i - minJump; j++) if (r[j]) { r[i] = s[i] === '0'; break; }
  }
  return r.at(-1);
}

function generated(count = 400) {
  let seed = 7;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const cases = [];
  for (let t = 0; t < count; t++) {
    const len = 2 + rand(14);
    let s = '0'; for (let i = 1; i < len; i++) s += rand(3) === 0 ? '1' : '0';
    const minJump = 1 + rand(len - 1), maxJump = minJump + rand(len - minJump);
    cases.push({ s, minJump, maxJump });
  }
  return cases;
}

test('1871 solver matches a brute-force reference on generated binary strings', () => {
  for (const input of generated()) {
    const { result } = definitions[1871].build(input);
    assert.equal(result, brute(input.s, input.minJump, input.maxJump), JSON.stringify(input));
  }
});

test('1871 window frames show the legal predecessor window and a decision', () => {
  // Invented: destination 3 sees window [0..1]; position 0 is reachable, position 1 is not.
  const { frames, result } = definitions[1871].build({ s: '0010', minJump: 2, maxJump: 3 });
  assert.equal(result, brute('0010', 2, 3));
  const at3 = frames.filter(f => f.jumpWindow?.destination === 3);
  const inspect = at3.find(f => f.phase === 'inspect').jumpWindow;
  assert.deepEqual([inspect.earliest, inspect.latest], [0, 1]);
  assert.deepEqual(inspect.contributors, [0]);
  const decide = at3.find(f => f.phase === 'update').jumpWindow;
  assert.equal(decide.decided, true);
  const blocked = frames.find(f => f.jumpWindow?.destination === 2 && f.phase === 'update').jumpWindow;
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.decided, false);
});

test('1871 frames map each operation to its own displayed line', () => {
  const { frames } = wrapped.build({ s: '00100', minJump: 2, maxJump: 3 });
  const lineOf = codeStage => frames.find(f => f.codeStage === codeStage)?.activeLine;
  assert.equal(lineOf('init'), 3);
  assert.equal(lineOf('loop'), 5);
  assert.equal(lineOf('enter_check'), 6);
  assert.equal(lineOf('enter'), 7);
  assert.equal(lineOf('leave_check'), 8);
  assert.equal(lineOf('leave'), 9);
  assert.equal(lineOf('update'), 10);
  assert.equal(frames.at(-1).activeLine, JUMP_RETURN_LINE);
  assert.equal(frames.at(-1).phase, 'done');
  const codeLines = definitions[1871].code.map(line => line.line);
  assert.deepEqual(codeLines, Array.from({ length: 11 }, (_, i) => i + 1));
});

test('1871 frames include condition-only checks, count updates and a final result', () => {
  // minJump 3 means positions 1 and 2 have no entering launch; maxJump 2 means no leaving launch at 1 or 2.
  const { frames, result } = definitions[1871].build({ s: '00000', minJump: 3, maxJump: 4 });
  const emptyChecks = frames.filter(f => f.codeStage === 'enter_check' && f.jumpWindow.entering === null);
  assert.ok(emptyChecks.length >= 2, 'expected condition-only enter checks while the window is empty');
  assert.ok(frames.some(f => f.codeStage === 'loop' && f.jumpWindow.earliest === null));
  assert.equal(frames.at(-1).phase, 'done');
  assert.equal(frames.at(-1).jumpWindow.decided, result);
});

test('1871 running count equals the reachable contributors at every decision', () => {
  for (const input of generated(120)) {
    const { frames } = definitions[1871].build(input);
    for (const frame of frames.filter(f => f.codeStage === 'update')) {
      assert.equal(frame.jumpWindow.count, frame.jumpWindow.contributors.length, JSON.stringify(input));
    }
  }
});

test('1871 frames are immutable snapshots and every frame has valid trace lines', () => {
  const { frames } = definitions[1871].build({ s: '00001', minJump: 1, maxJump: 3 });
  const pythonLines = definitions[1871].python.split('\n').length;
  for (const f of frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= pythonLines, `activeLine ${f.activeLine}`);
    assert.ok(typeof f.message === 'string' && f.message.length > 0);
  }
  const first = frames.find(f => f.jumpWindow);
  assert.deepEqual(first.jumpWindow.reachable.slice(0, 2), [true, false]);
});

test('1871 tutorial authors a problem-specific reason for each operation', () => {
  const { frames } = definitions[1871].build({ s: '00100', minJump: 2, maxJump: 3 });
  const scenes = frames.map((step, frameIndex) => jumpWindowTutorial({ run: { frames }, step, previousStep: frames[frameIndex - 1] }));
  for (const scene of scenes) {
    assert.ok(scene.title && scene.reason && scene.action, JSON.stringify(scene));
    assert.ok(Array.isArray(scene.focus) && scene.focus.length > 0);
    assert.doesNotMatch(scene.reason, /frequency|Two Sum|complement/i);
  }
  assert.ok(new Set(scenes.map(scene => scene.title)).size >= 6);
});

test('1871 displayed Python agrees with brute force on generated and preset inputs', () => {
  const cases = [...generated(80), ...examples.map(example => JSON.parse(example.input))];
  const source = definitions[1871].python;
  const result = spawnSync(process.env.PYTHON || 'python3', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([solve(c["s"], c["minJump"], c["maxJump"]) for c in p["cases"]]))'], {
    input: JSON.stringify({ source, cases }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), cases.map(c => brute(c.s, c.minJump, c.maxJump)));
});

for (const example of examples) {
  test(`1871 authored preset: ${example.label}`, () => {
    const input = JSON.parse(example.input);
    const { result, frames } = definitions[1871].build(input);
    assert.equal(result, brute(input.s, input.minJump, input.maxJump));
    assert.ok(frames.some(f => f.jumpWindow));
  });
}
