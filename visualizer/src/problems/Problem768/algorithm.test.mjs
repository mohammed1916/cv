import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = a => buildTrace(parseInput(JSON.stringify(a)))
// Oracle: try every subset of cut points; chunks sorted and concatenated must equal the sorted array.
function brute(a) {
  const sorted = [...a].sort((x, y) => x - y)
  let best = 0
  for (let mask = 0; mask < 1 << (a.length - 1); mask++) {
    const out = []
    let start = 0, count = 0
    for (let i = 0; i < a.length; i++) {
      if (i === a.length - 1 || mask & (1 << i)) { out.push(...a.slice(start, i + 1).sort((x, y) => x - y)); start = i + 1; count++ }
    }
    if (out.every((v, i) => v === sorted[i])) best = Math.max(best, count)
  }
  return best
}
test('official examples', () => {
  assert.equal(run([5, 4, 3, 2, 1]).result, 1)
  assert.equal(run([2, 1, 3, 4, 4]).result, 4)
})
test('matches brute force on random arrays', () => {
  let seed = 3
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 400; t++) {
    const a = Array.from({ length: 1 + rnd(9) }, () => rnd(6))
    const r = run(a)
    assert.equal(r.result, brute(a), JSON.stringify(a))
    assert.equal(r.frames[0].phase, 'start')
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1,-2]'))
  assert.throws(() => parseInput('"x"'))
})
