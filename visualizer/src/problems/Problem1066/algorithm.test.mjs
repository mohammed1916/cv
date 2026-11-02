import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (workers, bikes) => buildTrace({ workers, bikes }).result
const pyLines = python.split('\n').length

test('1066 worked examples', () => {
  assert.equal(solve([[0, 0], [2, 1]], [[1, 2], [3, 3]]), 6)
  assert.equal(solve([[0, 0], [1, 1], [2, 0]], [[1, 0], [2, 2], [2, 1]]), 4)
})

test('1066 global optimum can beat the nearest-pair greedy', () => {
  // Nearest-pair greedy takes W0-B0 (1) then W1-B1 (4) = 5; the global best is W0-B1 (2) + W1-B0 (1) = 3.
  assert.equal(solve([[2, 0], [3, 1]], [[3, 0], [0, 0]]), 3)
  assert.equal(solve([[0, 0], [2, 0]], [[1, 0], [9, 0]]), 8)
})

test('1066 frames carry valid pseudocode and python lines', () => {
  for (const frame of buildTrace({ workers: [[0, 0], [2, 1]], bikes: [[1, 2], [3, 3]] }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1066 rejects too few bikes', () => {
  assert.throws(() => parseInput('{"workers":[[0,0],[1,1]],"bikes":[[2,2]]}'))
})

// Oracle: try every injective assignment of workers to bikes.
function oracle(workers, bikes) {
  let best = Infinity
  const used = new Array(bikes.length).fill(false)
  function place(w, total) {
    if (total >= best) return
    if (w === workers.length) { best = total; return }
    for (let b = 0; b < bikes.length; b++) {
      if (used[b]) continue
      used[b] = true
      place(w + 1, total + Math.abs(workers[w][0] - bikes[b][0]) + Math.abs(workers[w][1] - bikes[b][1]))
      used[b] = false
    }
  }
  place(0, 0)
  return best
}

test('1066 random instances match a permutation oracle', () => {
  let seed = 1066
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  const point = () => [rnd(10), rnd(10)]
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5)
    const k = m + rnd(4)
    const workers = Array.from({ length: m }, point)
    const bikes = Array.from({ length: k }, point)
    assert.equal(solve(workers, bikes), oracle(workers, bikes), JSON.stringify({ workers, bikes }))
  }
})
