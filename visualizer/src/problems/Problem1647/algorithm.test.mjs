import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

// Independent oracle: choose a kept count (0..count) for every letter, require distinct positive values, minimise deletions.
function oracle(s) {
  const counts = [...s].reduce((map, ch) => map.set(ch, (map.get(ch) || 0) + 1), new Map())
  const list = [...counts.values()]
  let best = Infinity
  const walk = (index, used, cost) => {
    if (index === list.length) { best = Math.min(best, cost); return }
    for (let keep = 0; keep <= list[index]; keep++) {
      if (keep > 0 && used.has(keep)) continue
      const nextUsed = new Set(used)
      if (keep > 0) nextUsed.add(keep)
      walk(index + 1, nextUsed, cost + list[index] - keep)
    }
  }
  walk(0, new Set(), 0)
  return best
}

test('1647 hand-checked strings', () => {
  assert.equal(solve('aab'), 0)
  assert.equal(solve('aaabbbcc'), 2)
  assert.equal(solve('aaabbc'), 0)
  assert.equal(solve('a'), 0)
  assert.equal(solve('abcdefghijklmnopqrstuvwxyz'), 25)
})

test('1647 small random strings match the brute-force oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(12)
    const s = Array.from({ length: len }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('1647 trace ends with the answer and keeps kept values distinct', () => {
  const { frames, result } = buildTrace({ s: 'aaabbbccccdd' })
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-1).snapshot.deletions, result)
  for (const frame of frames) {
    const kept = frame.snapshot.kept
    assert.equal(new Set(kept).size, kept.length)
  }
})

test('1647 rejects invalid input', () => {
  assert.throws(() => parseInput('"aab"'), /object/)
  assert.throws(() => parseInput('{"s":"AB"}'), /lowercase/)
  assert.throws(() => parseInput('{"s":""}'), /1 to 60/)
})
