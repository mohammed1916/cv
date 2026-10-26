import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = a => buildTrace(parseInput(JSON.stringify(a))).result
// Oracle: scan clock times from 23:59 backwards and compare digit multisets.
function oracle(a) {
  const want = [...a].sort().join('')
  for (let h = 23; h >= 0; h--) for (let m = 59; m >= 0; m--) {
    const s = `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`
    if ([...s].sort().join('') === want) return `${s.slice(0, 2)}:${s.slice(2)}`
  }
  return ''
}
test('official examples', () => {
  assert.equal(solve([1, 2, 3, 4]), '23:41')
  assert.equal(solve([5, 5, 5, 5]), '')
})
test('all 10^4 digit multisets match the clock-scan oracle', () => {
  for (let v = 0; v < 10000; v++) {
    const a = String(v).padStart(4, '0').split('').map(Number)
    assert.equal(solve(a), oracle(a), JSON.stringify(a))
  }
})
test('trace has 24 permutations between start and done', () => {
  const t = buildTrace([1, 2, 3, 4])
  assert.equal(t.frames.length, 26)
  assert.equal(t.frames.at(-1).phase, 'done')
})
test('rejects bad input', () => {
  for (const bad of ['[1,2,3]', '[1,2,3,10]', '[1,2,3,-1]', '"1234"', '[1,2,3,1.5]']) assert.throws(() => parseInput(bad))
})
