import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1298 worked examples', () => {
  assert.equal(solve({ status: [1, 0, 1, 0], candies: [7, 5, 4, 100], keys: [[], [], [1], []], containedBoxes: [[1, 2], [3], [], []], initialBoxes: [0] }), 16)
  assert.equal(solve({ status: [1, 0, 0, 0, 0, 0], candies: [1, 1, 1, 1, 1, 1], keys: [[1, 2, 3, 4, 5], [], [], [], [], []], containedBoxes: [[1, 2, 3, 4, 5], [], [], [], [], []], initialBoxes: [0] }), 6)
  assert.equal(solve({ status: [1, 1, 1], candies: [100, 1, 100], keys: [[], [0, 2], []], containedBoxes: [[], [], []], initialBoxes: [1] }), 1)
})

// Independent oracle: repeat full passes over the boxes until nothing new opens.
function oracle({ status, candies, keys, containedBoxes, initialBoxes }) {
  const n = status.length
  const have = Array(n).fill(false), opened = Array(n).fill(false), hasKey = Array(n).fill(false)
  for (const b of initialBoxes) have[b] = true
  let total = 0, changed = true
  while (changed) {
    changed = false
    for (let b = 0; b < n; b++) {
      if (have[b] && !opened[b] && (status[b] === 1 || hasKey[b])) {
        opened[b] = true; changed = true; total += candies[b]
        for (const k of keys[b]) hasKey[k] = true
        for (const c of containedBoxes[b]) have[c] = true
      }
    }
  }
  return total
}

test('1298 random inputs match a fixed-point oracle', () => {
  let seed = 1298
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const subset = n => Array.from({ length: n }, (_, i) => i).filter(() => rnd(3) === 0)
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const input = {
      status: Array.from({ length: n }, () => rnd(2)),
      candies: Array.from({ length: n }, () => 1 + rnd(10)),
      keys: Array.from({ length: n }, () => subset(n)),
      containedBoxes: Array.from({ length: n }, () => subset(n)),
      initialBoxes: subset(n),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
