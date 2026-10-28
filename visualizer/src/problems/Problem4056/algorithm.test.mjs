import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = intervals => buildTrace({ intervals }).result

test('4056 official examples', () => {
  assert.equal(solve([[1, 2], [2, 3], [3, 4]]), 2)
  assert.equal(solve([[1, 5], [2, 4], [3, 6]]), 3)
  assert.equal(solve([[1, 2], [3, 4], [5, 6]]), 0)
})

test('4056 a shared endpoint counts as an intersection', () => {
  assert.equal(solve([[0, 4], [4, 9]]), 1)
})

test('4056 rejects start after end', () => {
  assert.throws(() => parseInput('{"intervals":[[5,2],[1,1]]}'))
})

// Independent oracle: represent each interval as the set of integer points it covers, then test for any shared point.
function oracle(intervals) {
  const sets = intervals.map(([s, e]) => {
    const out = new Set()
    for (let x = s; x <= e; x++) out.add(x)
    return out
  })
  let count = 0
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      if ([...sets[i]].some(x => sets[j].has(x))) count++
    }
  }
  return count
}

test('4056 random intervals match a shared-point oracle', () => {
  let seed = 4056
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const intervals = Array.from({ length: 2 + rnd(8) }, () => {
      const s = rnd(30)
      return [s, s + rnd(10)]
    })
    assert.equal(solve(intervals), oracle(intervals), JSON.stringify(intervals))
  }
})
