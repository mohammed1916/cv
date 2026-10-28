import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3538 official examples', () => {
  assert.equal(solve({ l: 10, n: 4, k: 1, position: [0, 3, 8, 10], time: [5, 8, 3, 6] }), 62)
  assert.equal(solve({ l: 5, n: 5, k: 1, position: [0, 1, 2, 3, 5], time: [8, 3, 9, 3, 3] }), 34)
})

test('3538 with no merges the plain travel time is returned', () => {
  assert.equal(solve({ l: 10, n: 4, k: 0, position: [0, 3, 8, 10], time: [5, 8, 3, 6] }), 61)
})

test('3538 rejects a position list that does not end at l', () => {
  assert.throws(() => parseInput(JSON.stringify({ l: 10, n: 2, k: 0, position: [0, 9], time: [1, 1] })))
})

// Independent oracle: apply every sequence of k merges literally and price the final roads.
function oracle(input) {
  let best = Infinity
  const rec = (pos, t, left) => {
    if (left === 0) {
      let total = 0
      for (let i = 0; i + 1 < pos.length; i++) total += (pos[i + 1] - pos[i]) * t[i]
      best = Math.min(best, total)
      return
    }
    for (let i = 1; i + 1 < pos.length; i++) {
      const nextPos = pos.filter((_, j) => j !== i)
      const nextTime = t.map((x, j) => (j === i + 1 ? t[i] + t[i + 1] : x)).filter((_, j) => j !== i)
      rec(nextPos, nextTime, left - 1)
    }
  }
  rec(input.position, input.time, input.k)
  return best
}

test('3538 random inputs match a literal merge-by-merge oracle', () => {
  let seed = 3538
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(6)
    const position = [0]
    for (let i = 1; i < n; i++) position.push(position[i - 1] + 1 + rnd(5))
    const time = Array.from({ length: n }, () => 1 + rnd(9))
    const input = { l: position[n - 1], n, k: rnd(n - 1), position, time }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
