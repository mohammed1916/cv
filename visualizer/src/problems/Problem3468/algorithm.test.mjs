import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const solve = (original, bounds) => buildTrace(parseInput(JSON.stringify({ original, bounds }))).result

test('3468 official examples', () => {
  assert.equal(solve([1, 2, 3, 4], [[1, 2], [2, 3], [3, 4], [4, 5]]), 2)
  assert.equal(solve([1, 2, 3, 4], [[1, 10], [2, 9], [3, 8], [4, 7]]), 4)
})

test('3468 single element and impossible cases', () => {
  assert.equal(solve([5], [[2, 6]]), 5)
  assert.equal(solve([1, 2], [[1, 1], [5, 5]]), 0)
})

test('3468 rejects bad input', () => {
  assert.throws(() => parseInput('{"original":[1,2],"bounds":[[3,1],[1,2]]}'))
  assert.throws(() => parseInput('{"original":[1],"bounds":[]}'))
  assert.throws(() => parseInput('{"original":[1.5],"bounds":[[1,2]]}'))
})

test('3468 every frame points at a real pseudocode line', () => {
  for (const frame of buildTrace(parseInput('{"original":[1,2,3],"bounds":[[1,5],[2,5],[3,4]]}')).frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
})

// Independent oracle: enumerate every copy array position by position and check the differences directly.
function oracle(original, bounds) {
  let count = 0
  const pick = (i, copy) => {
    if (i === original.length) {
      count += 1
      return
    }
    for (let v = bounds[i][0]; v <= bounds[i][1]; v++) {
      if (i > 0 && v - copy[i - 1] !== original[i] - original[i - 1]) continue
      copy.push(v)
      pick(i + 1, copy)
      copy.pop()
    }
  }
  pick(0, [])
  return count
}

test('3468 random inputs match the enumeration oracle', () => {
  let seed = 3468
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let k = 0; k < 150; k++) {
    const length = 1 + rnd(5)
    const original = Array.from({ length }, () => rnd(7) - 3)
    const bounds = original.map(() => {
      const low = rnd(8) - 2
      return [low, low + rnd(6)]
    })
    assert.equal(solve(original, bounds), oracle(original, bounds), JSON.stringify({ original, bounds }))
  }
})
