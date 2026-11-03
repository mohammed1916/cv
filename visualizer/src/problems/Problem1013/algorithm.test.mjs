import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

test('1013 a zero total still needs two closed prefixes', () => {
  assert.equal(solve([0, 0, 0, 0, 0]), true)
  assert.equal(solve([0, 0, 0]), true)
})

test('1013 a total not divisible by three fails at once', () => {
  assert.equal(solve([1, 2, 4, 1]), false)
})

test('1013 divisible total without two cut points fails', () => {
  assert.equal(solve([2, 2, 2, 3]), false)
})

test('1013 rejects short arrays', () => {
  assert.throws(() => parseInput('{"arr":[1,2]}'), /arr is a list/)
})

// Independent oracle: try every pair of cuts directly.
function oracle(arr) {
  const n = arr.length
  const total = arr.reduce((a, b) => a + b, 0)
  if (total % 3 !== 0) return false
  const sum = (from, to) => arr.slice(from, to + 1).reduce((a, b) => a + b, 0)
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      if (sum(0, i) === sum(i + 1, j) && sum(i + 1, j) === sum(j + 1, n - 1)) return true
    }
  }
  return false
}

test('1013 random arrays match a cut-pair oracle', () => {
  let seed = 1013
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 3 + rnd(10)
    const arr = Array.from({ length: len }, () => rnd(21) - 10)
    const input = JSON.stringify({ arr })
    parseInput(input)
    assert.equal(solve(arr), oracle(arr), input)
  }
})
