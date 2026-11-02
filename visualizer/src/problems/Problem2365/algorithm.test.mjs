import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (tasks, space) => buildTrace({ tasks, space }).result

test('2365 worked examples', () => {
  assert.equal(solve([1, 2, 1, 2, 3, 1], 3), 9)
  assert.equal(solve([5, 5, 5], 1), 5)
})

test('2365 edge cases', () => {
  assert.equal(solve([7], 4), 1)
  assert.equal(solve([1, 2, 3], 10), 3)
})

test('2365 rejects a zero space', () => {
  assert.throws(() => parseInput('{"tasks":[1],"space":0}'))
})

// Oracle: day-by-day simulation that tries each day until the task is allowed.
function oracle(tasks, space) {
  const last = new Map()
  let day = 0
  for (const task of tasks) {
    day += 1
    while (last.has(task) && day - last.get(task) <= space) day += 1
    last.set(task, day)
  }
  return day
}

test('2365 random inputs match a day-by-day oracle', () => {
  let seed = 2365
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const tasks = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(4))
    const space = 1 + rnd(6)
    assert.equal(solve(tasks, space), oracle(tasks, space), JSON.stringify({ tasks, space }))
  }
})
