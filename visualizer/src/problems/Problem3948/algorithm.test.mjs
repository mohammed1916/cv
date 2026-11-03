import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace(values).result

// Independent oracle: every way to cut the array, compared lexicographically.
function mexOf(values) { const s = new Set(values); let m = 0; while (s.has(m)) m++; return m }
function cmp(x, y) {
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i]
  return x.length - y.length
}
function oracle(a) {
  let best = null
  const n = a.length
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const out = []
    let start = 0
    for (let i = 0; i < n; i++) {
      if (i === n - 1 || (mask >> i) & 1) { out.push(mexOf(a.slice(start, i + 1))); start = i + 1 }
    }
    if (best === null || cmp(out, best) > 0) best = out
  }
  return best
}

test('3948 authored presets', () => {
  assert.deepEqual(solve([1, 0, 2, 0]), [3, 1])
  assert.deepEqual(solve([0, 1, 0, 0]), [2, 1, 1])
  assert.deepEqual(solve([2, 3, 0]), [1])
})

test('3948 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('[1.5]'))
})

test('3948 random arrays match the all-cuts oracle', () => {
  let seed = 3948
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const a = Array.from({ length: 1 + rnd(9) }, () => rnd(5))
    assert.deepEqual(solve(a), oracle(a), JSON.stringify(a))
  }
})

test('3948 frames stay consistent', () => {
  const run = buildTrace([1, 0, 2, 0])
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 11)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.answer))
  }
})
