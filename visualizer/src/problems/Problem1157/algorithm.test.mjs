import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1157 official-style examples', () => {
  const input = { arr: [1, 1, 2, 2, 1, 1], queries: [[0, 5, 4], [0, 3, 3], [2, 3, 2]] }
  assert.deepEqual(solve(parseInput(JSON.stringify(input))), [1, -1, 2])
})

test('1157 a single-position range is its own majority', () => {
  assert.deepEqual(solve({ arr: [7, 3], queries: [[1, 1, 1]] }), [3])
})

test('1157 rejects a threshold that does not make the majority unique', () => {
  assert.throws(() => parseInput('{"arr":[1,1,2,2],"queries":[[0,3,2]]}'))
  assert.throws(() => parseInput('{"arr":[1,2],"queries":[[0,1,3]]}'))
})

// Independent oracle: sort each subarray and measure the longest run of equal values.
function oracle({ arr, queries }) {
  return queries.map(([left, right, threshold]) => {
    const sorted = arr.slice(left, right + 1).sort((a, b) => a - b)
    let best = -1
    let run = 0
    for (let i = 0; i < sorted.length; i++) {
      run = i > 0 && sorted[i] === sorted[i - 1] ? run + 1 : 1
      if (run >= threshold) best = sorted[i]
    }
    return best
  })
}

test('1157 random cases match a sort-and-run oracle', () => {
  let seed = 1157
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => rnd(4))
    const queries = []
    for (let q = 0; q < 1 + rnd(6); q++) {
      const left = rnd(arr.length)
      const right = left + rnd(arr.length - left)
      const length = right - left + 1
      const threshold = Math.floor(length / 2) + 1 + rnd(length - Math.floor(length / 2))
      queries.push([left, right, threshold])
    }
    const input = { arr, queries }
    assert.deepEqual(solve(parseInput(JSON.stringify(input))), oracle(input), JSON.stringify(input))
  }
})
