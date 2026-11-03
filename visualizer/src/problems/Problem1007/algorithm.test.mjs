import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (tops, bottoms) => buildTrace({ tops, bottoms }).result

test('1007 sample rows give the expected rotation counts', () => {
  assert.equal(solve([2, 1, 2, 4, 2, 2], [5, 2, 6, 2, 3, 2]), 2)
  assert.equal(solve([3, 5, 1, 2, 3], [3, 6, 3, 3, 4]), -1)
})

test('1007 a later domino can block the first candidate', () => {
  assert.equal(solve([2, 3, 6], [5, 4, 1]), -1)
  assert.equal(solve([6, 6, 6, 6], [1, 2, 3, 4]), 0)
})

test('1007 rejects mismatched rows and out-of-range values', () => {
  assert.throws(() => parseInput('{"tops":[1,2],"bottoms":[1]}'), /same length/)
  assert.throws(() => parseInput('{"tops":[7],"bottoms":[1]}'), /integers from 1 to 6/)
})

// Independent oracle: try every value from 1 to 6, and every row choice per domino.
function oracle(tops, bottoms) {
  let best = Infinity
  for (let t = 1; t <= 6; t++) {
    let a = 0
    let b = 0
    let ok = true
    tops.forEach((x, i) => {
      const y = bottoms[i]
      if (x !== t && y !== t) ok = false
      if (x !== t) a++
      if (y !== t) b++
    })
    if (ok) best = Math.min(best, a, b)
  }
  return best === Infinity ? -1 : best
}

test('1007 random rows match a brute-force oracle', () => {
  let seed = 1007
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(12)
    const tops = Array.from({ length: n }, () => 1 + rnd(6))
    const bottoms = Array.from({ length: n }, () => 1 + rnd(6))
    const input = JSON.stringify({ tops, bottoms })
    parseInput(input)
    assert.equal(solve(tops, bottoms), oracle(tops, bottoms), input)
  }
})
