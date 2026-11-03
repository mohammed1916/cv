import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = lanes => buildTrace({ lanes }).result

test('3466 worked presets', () => {
  assert.equal(solve([[3, -2, 4, -1], [1, 5, -3, 2]]), 12)
  assert.equal(solve([[-4, 6, 1], [2, -9, -5]]), 9)
  assert.equal(solve([[2, -3, 4, -1, 2], [-2, 5, -6, 3, -1]]), 12)
})

test('3466 edge cases', () => {
  assert.equal(solve([[5], [9]]), 9)
  assert.equal(solve([[-1], [-9]]), -1)
  assert.equal(solve([[-1, -1], [-9, -9]]), -1)
})

test('3466 rejects bad input', () => {
  assert.throws(() => parseInput('{"lanes":[[1,2],[1]]}'))
  assert.throws(() => parseInput('{"lanes":[[10],[1]]}'))
  assert.throws(() => parseInput('{"lanes":[[1]]}'))
})

// Oracle: try every entry, exit and lane sequence; count lane changes from lane one before the first mile.
function oracle(lanes) {
  const n = lanes[0].length
  let best = -Infinity
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const len = j - i
      for (let mask = 0; mask < 1 << len; mask++) {
        let prev = 0
        let changes = 0
        let total = 0
        for (let k = 0; k < len; k++) {
          const lane = (mask >> k) & 1
          if (lane !== prev) changes++
          prev = lane
          total += lanes[lane][i + k]
        }
        if (changes <= 2) best = Math.max(best, total)
      }
    }
  }
  return best
}

test('3466 random inputs match a route enumeration oracle', () => {
  let seed = 3466
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(6)
    const row = () => Array.from({ length: len }, () => rnd(19) - 9)
    const lanes = [row(), row()]
    assert.equal(solve(lanes), oracle(lanes), JSON.stringify(lanes))
  }
})

test('3466 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ lanes: [[3, -2, 4, -1], [1, 5, -3, 2]] })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
