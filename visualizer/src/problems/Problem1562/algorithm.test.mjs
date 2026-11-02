import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, m) => buildTrace({ arr, m }).result

test('1562 worked examples', () => {
  assert.equal(solve([3, 5, 1, 2, 4], 1), 4)
  assert.equal(solve([3, 1, 5, 4, 2], 2), -1)
  assert.equal(solve([1], 1), 1)
})

// Oracle: after each step, scan the bit string for a run of exactly m ones.
function oracle(arr, m) {
  const bits = Array(arr.length).fill(0)
  let answer = -1
  arr.forEach((pos, index) => {
    bits[pos - 1] = 1
    let run = 0
    for (let i = 0; i <= bits.length; i++) {
      if (i < bits.length && bits[i] === 1) run++
      else { if (run === m) { answer = index + 1 } run = 0 }
    }
  })
  return answer
}

test('1562 random permutations match a bit-string oracle', () => {
  let seed = 1562
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const arr = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [arr[i], arr[j]] = [arr[j], arr[i]] }
    const m = 1 + rnd(n)
    assert.equal(solve(arr, m), oracle(arr, m), JSON.stringify({ arr, m }))
  }
})
