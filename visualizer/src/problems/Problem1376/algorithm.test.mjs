import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1376 official examples', () => {
  assert.equal(solve({ n: 1, headID: 0, manager: [-1], informTime: [0] }), 0)
  assert.equal(solve({ n: 6, headID: 2, manager: [2, 2, -1, 2, 2, 2], informTime: [0, 0, 1, 0, 0, 0] }), 1)
  assert.equal(solve({ n: 7, headID: 6, manager: [1, 2, 3, 4, 5, 6, -1], informTime: [0, 6, 5, 4, 3, 2, 1] }), 21)
})

test('1376 rejects a cycle and a head with a manager', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 3, headID: 0, manager: [-1, 2, 1], informTime: [0, 0, 0] })), /tree/)
  assert.throws(() => parseInput(JSON.stringify({ n: 2, headID: 0, manager: [1, -1], informTime: [0, 0] })))
})

// Independent oracle: for each employee, add up the inform times of every manager above them and keep the largest total.
function oracle({ n, headID, manager, informTime }) {
  let best = 0
  for (let e = 0; e < n; e++) {
    let cur = e, t = 0
    while (cur !== headID) {
      const m = manager[cur]
      t += informTime[m]
      cur = m
    }
    best = Math.max(best, t)
  }
  return best
}

test('1376 random manager trees match an upward-sum oracle', () => {
  let seed = 1376
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [order[i], order[j]] = [order[j], order[i]] }
    const headID = order[0]
    const manager = Array(n).fill(-1)
    for (let k = 1; k < n; k++) manager[order[k]] = order[rnd(k)]
    const informTime = Array.from({ length: n }, () => rnd(10))
    const input = { n, headID, manager, informTime }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
