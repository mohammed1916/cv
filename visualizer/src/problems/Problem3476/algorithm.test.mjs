import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (workers, tasks) => buildTrace({ workers, tasks }).result

test('3476 worked presets', () => {
  assert.equal(solve([1, 2], [[1, 4], [2, 3], [3, 9]]), 16)
  assert.equal(solve([1, 1, 2], [[1, 5], [1, 2], [2, 6]]), 13)
  assert.equal(solve([3, 3], [[1, 8], [3, 7], [3, 2]]), 17)
})

test('3476 edge cases', () => {
  assert.equal(solve([1], [[2, 9]]), 9)
  assert.equal(solve([1], [[2, 9], [2, 4]]), 9)
  assert.equal(solve([2, 2], [[2, 1]]), 1)
})

test('3476 rejects bad input', () => {
  assert.throws(() => parseInput('{"workers":[6],"tasks":[[1,1]]}'))
  assert.throws(() => parseInput('{"workers":[1],"tasks":[[1]]}'))
  assert.throws(() => parseInput('{"workers":[1],"tasks":[[1,10]]}'))
})

// Oracle: enumerate every assignment of workers (plus one extra) to tasks, respecting skills.
function oracle(workers, tasks) {
  const used = Array(tasks.length).fill(false)
  let best = 0
  const pick = (w, total) => {
    if (w === workers.length) {
      for (let t = 0; t < tasks.length; t++) {
        if (used[t]) continue
        used[t] = true
        best = Math.max(best, total + tasks[t][1])
        used[t] = false
      }
      best = Math.max(best, total)
      return
    }
    pick(w + 1, total)
    for (let t = 0; t < tasks.length; t++) {
      if (!used[t] && tasks[t][0] === workers[w]) {
        used[t] = true
        pick(w + 1, total + tasks[t][1])
        used[t] = false
      }
    }
  }
  pick(0, 0)
  return best
}

test('3476 random inputs match an assignment enumeration oracle', () => {
  let seed = 3476
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const workers = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(3))
    const tasks = Array.from({ length: 1 + rnd(5) }, () => [1 + rnd(3), 1 + rnd(9)])
    assert.equal(solve(workers, tasks), oracle(workers, tasks), JSON.stringify({ workers, tasks }))
  }
})

test('3476 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ workers: [1, 2], tasks: [[1, 4], [2, 3], [3, 9]] })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
