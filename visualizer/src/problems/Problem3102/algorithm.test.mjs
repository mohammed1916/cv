import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = points => buildTrace(parseInput(JSON.stringify({ points }))).result

test('3102 example', () => {
  assert.equal(solve([[3, 10], [5, 15], [10, 2], [4, 4]]), 12)
})

test('3102 three points', () => {
  // Removing (5, 0) leaves (0, 0) and (1, 0), distance 1; the other removals leave distances 4 and 5.
  assert.equal(solve([[0, 0], [1, 0], [5, 0]]), 1)
})

test('3102 rejects bad input', () => {
  assert.throws(() => parseInput('{"points":[[0,0],[1,1]]}'))
  assert.throws(() => parseInput('{"points":[[0,0],[0,0],[1,1]]}'))
  assert.throws(() => parseInput('{"points":[[0,0],[1,1],[21,1]]}'))
})

// Independent oracle: for each removed point, compute every pairwise Manhattan distance among the rest directly.
function oracle(points) {
  let best = Infinity
  for (let skip = 0; skip < points.length; skip++) {
    const rest = points.filter((_, i) => i !== skip)
    let worst = 0
    for (let i = 0; i < rest.length; i++) {
      for (let j = i + 1; j < rest.length; j++) {
        worst = Math.max(worst, Math.abs(rest[i][0] - rest[j][0]) + Math.abs(rest[i][1] - rest[j][1]))
      }
    }
    best = Math.min(best, worst)
  }
  return best
}

test('3102 random point sets match pairwise oracle', () => {
  let seed = 3102
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const set = new Set()
    const size = 3 + rnd(6)
    while (set.size < size) set.add(`${rnd(41) - 20},${rnd(41) - 20}`)
    const points = [...set].map(s => s.split(',').map(Number))
    assert.equal(solve(points), oracle(points), JSON.stringify(points))
  }
})
