import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, logs) => buildTrace({ n, logs }).result

test('2432 official examples', () => {
  assert.equal(solve(10, [[0, 3], [2, 5], [0, 9], [1, 15]]), 1)
  assert.equal(solve(26, [[1, 1], [3, 7], [2, 12], [7, 17]]), 3)
})

test('2432 a tie in duration goes to the smaller id', () => {
  assert.equal(solve(2, [[0, 5], [1, 10]]), 0)
  assert.equal(solve(3, [[2, 4], [1, 8], [0, 12]]), 0)
})

test('2432 rejects leave times that do not strictly increase', () => {
  assert.throws(() => parseInput('{"n":2,"logs":[[0,5],[1,5]]}'), /strictly increase/)
})

// Independent oracle: list every task as (duration, id), sort by longest duration then smallest id.
function oracle(logs) {
  const tasks = logs.map(([id, leave], i) => ({ id, duration: leave - (i === 0 ? 0 : logs[i - 1][1]) }))
  tasks.sort((a, b) => b.duration - a.duration || a.id - b.id)
  return tasks[0].id
}

test('2432 random logs match a sort-based oracle', () => {
  let seed = 2432
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const logs = []
    let leave = 0
    for (let k = 1 + rnd(8); logs.length < k;) {
      leave += 1 + rnd(5)
      logs.push([rnd(n), leave])
    }
    assert.equal(solve(n, logs), oracle(logs), JSON.stringify({ n, logs }))
  }
})
