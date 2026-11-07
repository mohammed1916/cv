import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';
import examples from '../../config/examples/collection--1871.js';

// Brute force: position i is reachable if it is '0' and some j in [i-maxJump, i-minJump] is reachable.
function brute(s, minJump, maxJump) {
  const r = Array(s.length).fill(false); r[0] = true;
  for (let i = 1; i < s.length; i++) {
    for (let j = Math.max(0, i - maxJump); j <= i - minJump; j++) if (r[j]) { r[i] = s[i] === '0'; break; }
  }
  return r.at(-1);
}

test('1871 solver matches a brute-force reference on generated binary strings', () => {
  let seed = 7;
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let t = 0; t < 400; t++) {
    const len = 2 + rand(14);
    let s = '0'; for (let i = 1; i < len; i++) s += rand(3) === 0 ? '1' : '0';
    const minJump = 1 + rand(len - 1), maxJump = minJump + rand(len - minJump);
    const { result } = definitions[1871].build({ s, minJump, maxJump });
    assert.equal(result, brute(s, minJump, maxJump), JSON.stringify({ s, minJump, maxJump }));
  }
});

test('1871 window frames show the legal predecessor window and a decision', () => {
  // Invented: destination 4 sees window [1..2]; position 1 is reachable, position 2 is blocked.
  const { frames, result } = definitions[1871].build({ s: '0010', minJump: 2, maxJump: 3 });
  assert.equal(result, brute('0010', 2, 3));
  const at4 = frames.filter(f => f.jumpWindow?.destination === 3);
  const inspect = at4.find(f => f.phase === 'inspect').jumpWindow;
  assert.deepEqual([inspect.earliest, inspect.latest], [0, 1]);
  assert.deepEqual(inspect.contributors, [0]);
  const decide = at4.find(f => f.phase === 'update').jumpWindow;
  assert.equal(decide.decided, true);
  const blocked = frames.find(f => f.jumpWindow?.destination === 2 && f.phase === 'update').jumpWindow;
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.decided, false);
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

for (const example of examples) {
  test(`1871 authored preset: ${example.label}`, () => {
    const input = JSON.parse(example.input);
    const { result, frames } = definitions[1871].build(input);
    assert.equal(result, brute(input.s, input.minJump, input.maxJump));
    assert.ok(frames.some(f => f.jumpWindow));
  });
}
