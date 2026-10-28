import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = tasks => buildTrace({ tasks }).result

test('2589 official examples', () => {
  assert.equal(solve([[2, 3, 1], [4, 5, 1], [1, 5, 2]]), 2)
  assert.equal(solve([[1, 3, 2], [2, 5, 3], [5, 6, 2]]), 4)
})

test('2589 a single task runs in its last seconds', () => {
  assert.equal(solve([[1, 5, 2]]), 2)
})

test('2589 rejects a duration longer than its window', () => {
  assert.throws(() => parseInput(JSON.stringify({ tasks: [[1, 2, 3]] })))
})

// Independent oracle: try every set of on-seconds, smallest first. While the computer is on it runs every due task,
// so a set works when each task's window holds at least its duration in on-seconds.
function feasible(tasks, on) {
  return tasks.every(([s, e, d]) => on.filter(t => t >= s && t <= e).length >= d)
}

function oracle(tasks) {
  const H = Math.max(...tasks.map(t => t[1]))
  for (let size = 0; size <= H; size++) {
    const pick = (from, chosen) => {
      if (chosen.length === size) return feasible(tasks, chosen)
      for (let t = from; t <= H; t++) if (pick(t + 1, [...chosen, t])) return true
      return false
    }
    if (pick(1, [])) return size
  }
  return -1
}

test('2589 random tasks match a subset-and-assignment oracle', () => {
  let seed = 2589
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const tasks = Array.from({ length: 1 + rnd(3) }, () => {
      const s = 1 + rnd(7)
      const e = s + rnd(8 - s)
      return [s, e, 1 + rnd(Math.min(3, e - s + 1))]
    })
    assert.equal(solve(tasks), oracle(tasks), JSON.stringify(tasks))
  }
})
