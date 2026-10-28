import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3469 official examples', () => {
  assert.equal(solve([6, 2, 8, 4]), 12)
  assert.equal(solve([2, 1, 3, 3]), 5)
})

test('3469 fewer than three elements remove together at their maximum', () => {
  assert.equal(solve([4]), 4)
  assert.equal(solve([4, 9]), 9)
})

test('3469 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: plain brute force over lists, trying every removable pair among the first three.
function oracle(list) {
  if (list.length === 0) return 0
  if (list.length <= 2) return Math.max(...list)
  let best = Infinity
  for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) {
    const kept = list.filter((_, k) => k !== i && k !== j)
    best = Math.min(best, Math.max(list[i], list[j]) + oracle(kept))
  }
  return best
}

test('3469 random arrays match a brute-force oracle', () => {
  let seed = 3469
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(50))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
