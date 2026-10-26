import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(a) {
  let best = 0
  for (let l = 0; l < a.length; l++) for (let r = l + 2; r < a.length; r++) {
    for (let p = l + 1; p < r; p++) {
      let ok = true
      for (let i = l; i < p; i++) if (!(a[i] < a[i + 1])) ok = false
      for (let i = p; i < r; i++) if (!(a[i] > a[i + 1])) ok = false
      if (ok) best = Math.max(best, r - l + 1)
    }
  }
  return best
}
test('official examples', () => {
  assert.equal(buildTrace([2, 1, 4, 7, 3, 2, 5]).result, 5)
  assert.equal(buildTrace([2, 2, 2]).result, 0)
})
test('random arrays match brute force', () => {
  let seed = 9
  const rnd = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n }
  for (let t = 0; t < 800; t++) {
    const a = Array.from({ length: 1 + rnd(12) }, () => rnd(5))
    const tr = buildTrace(a)
    assert.equal(tr.result, brute(a), JSON.stringify(a))
    assert.equal(tr.frames[0].phase, 'start'); assert.equal(tr.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]')); assert.throws(() => parseInput('[1,-2]')); assert.throws(() => parseInput('"x"'))
})
