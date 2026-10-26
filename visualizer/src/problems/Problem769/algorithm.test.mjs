import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = a => buildTrace(parseInput(JSON.stringify(a)))
function brute(a) {
  let best = 0
  for (let mask = 0; mask < 1 << (a.length - 1); mask++) {
    const out = []
    let start = 0, count = 0
    for (let i = 0; i < a.length; i++) {
      if (i === a.length - 1 || mask & (1 << i)) { out.push(...a.slice(start, i + 1).sort((x, y) => x - y)); start = i + 1; count++ }
    }
    if (out.every((v, i) => v === i)) best = Math.max(best, count)
  }
  return best
}
function permutations(n) {
  const res = []
  const go = (cur, rest) => { if (!rest.length) res.push(cur); rest.forEach((v, i) => go([...cur, v], [...rest.slice(0, i), ...rest.slice(i + 1)])) }
  go([], Array.from({ length: n }, (_, i) => i))
  return res
}
test('official examples', () => {
  assert.equal(run([4, 3, 2, 1, 0]).result, 1)
  assert.equal(run([1, 0, 2, 3, 4]).result, 4)
})
test('exhaustive permutations up to n=6 match brute force', () => {
  for (let n = 1; n <= 6; n++) for (const p of permutations(n)) {
    const r = run(p)
    assert.equal(r.result, brute(p), JSON.stringify(p))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[1,1,0]'))
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[]'))
})
