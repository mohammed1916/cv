import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2895 official examples', () => {
  assert.equal(solve({ processorTime: [8, 10], tasks: [2, 2, 3, 1, 8, 7, 4, 5] }), 16)
  assert.equal(solve({ processorTime: [10, 20], tasks: [2, 3, 1, 2, 5, 8, 4, 3] }), 23)
})

test('2895 the earliest processor takes the largest four tasks', () => {
  assert.equal(solve({ processorTime: [0], tasks: [1, 9, 2, 3] }), 9)
})

test('2895 rejects a task count that is not four per processor', () => {
  assert.throws(() => parseInput(JSON.stringify({ processorTime: [1, 2], tasks: [1, 2, 3, 4] })))
})

// Independent oracle: try every way to split the tasks into groups of four.
function oracle({ processorTime, tasks }) {
  let best = Infinity
  const used = tasks.map(() => false)
  const rec = (p, worst) => {
    if (worst >= best) return
    if (p === processorTime.length) { best = Math.min(best, worst); return }
    const pick = (start, chosen, mx) => {
      if (chosen === 4) { rec(p + 1, Math.max(worst, processorTime[p] + mx)); return }
      for (let i = start; i < tasks.length; i++) {
        if (used[i]) continue
        used[i] = true
        pick(i + 1, chosen + 1, Math.max(mx, tasks[i]))
        used[i] = false
      }
    }
    pick(0, 0, 0)
  }
  rec(0, 0)
  return best
}

test('2895 random inputs match a subset-split oracle', () => {
  let seed = 2895
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(2)
    const input = {
      processorTime: Array.from({ length: n }, () => rnd(20)),
      tasks: Array.from({ length: 4 * n }, () => 1 + rnd(20)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
