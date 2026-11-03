import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = heights => buildTrace({ heights }).result

test('4007 small hand cases', () => {
  assert.equal(solve([5]), 1)
  assert.equal(solve([1, 1, 1]), 3)
  assert.equal(solve([1, 2, 3]), 2)
  assert.equal(solve([2, 2, 2, 2]), 4)
  assert.equal(solve([1, 1, 2, 2]), 3)
})

test('4007 rejects bad heights', () => {
  assert.throws(() => parseInput('{"heights":[]}'))
  assert.throws(() => parseInput('{"heights":[0]}'))
})

// Brute oracle: for every target height h, search all ways to use originals as singles or pairs summing to h.
function brute(heights) {
  let best = 0
  const maxSum = Math.max(...heights) * 2
  for (let h = 1; h <= maxSum; h++) {
    const rec = (used, index) => {
      if (index === heights.length) return 0
      let option = rec(used, index + 1)
      if (used[index]) return option
      if (heights[index] === h) option = Math.max(option, 1 + rec(withUsed(used, index), index + 1))
      for (let j = index + 1; j < heights.length; j++) {
        if (!used[j] && heights[index] + heights[j] === h) {
          option = Math.max(option, 1 + rec(withUsed(withUsed(used, index), j), index + 1))
        }
      }
      return option
    }
    best = Math.max(best, rec(Array(heights.length).fill(false), 0))
  }
  return best
}
const withUsed = (used, i) => used.map((v, k) => v || k === i)

test('4007 matches exhaustive matching on small random inputs', () => {
  let seed = 4007
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const heights = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(5))
    assert.equal(solve(heights), brute(heights), JSON.stringify(heights))
  }
})

test('4007 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ heights: [1, 2, 3, 3, 4] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.best <= 5)
  }
})
