import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = intervals => buildTrace({ intervals }).result

// Oracle: try every subset that has a member overlapping all the others, and keep the largest.
function oracle(intervals) {
  const n = intervals.length
  const share = (a, b) => Math.max(a[0], b[0]) <= Math.min(a[1], b[1])
  let best = 0
  for (let mask = 1; mask < 1 << n; mask += 1) {
    const members = intervals.filter((_, i) => mask & (1 << i))
    const ok = members.some(c => members.every(o => share(c, o)))
    if (ok) best = Math.max(best, members.length)
  }
  return best
}

test('3893 hand-checked presets', () => {
  assert.equal(solve([[1, 4], [2, 3], [4, 6], [7, 9], [5, 8]]), 3)
  assert.equal(solve([[0, 0], [0, 0], [1, 1]]), 2)
})

test('3893 endpoint contact counts as overlap', () => {
  assert.equal(solve([[0, 2], [2, 4]]), 2)
  assert.equal(solve([[0, 2], [3, 4]]), 1)
})

test('3893 members need not overlap each other', () => {
  assert.equal(solve([[0, 10], [0, 1], [9, 10]]), 3)
})

test('3893 parser rejects reversed intervals', () => {
  assert.throws(() => parseInput('{"intervals":[[5,2]]}'))
})

test('3893 matches a subset oracle on random small inputs', () => {
  let seed = 3893
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const intervals = Array.from({ length: 1 + rnd(8) }, () => { const a = rnd(10); return [a, a + rnd(5)] })
    assert.equal(solve(intervals), oracle(intervals), JSON.stringify(intervals))
  }
})
