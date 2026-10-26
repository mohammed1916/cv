import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('690 official examples', () => {
  assert.equal(buildTrace({ employees: [[1, 5, [2, 3]], [2, 3, []], [3, 3, []]], id: 1 }).result, 11)
  assert.equal(buildTrace({ employees: [[1, 2, [5]], [5, -3, []]], id: 5 }).result, -3)
})

test('690 random reporting trees match a breadth-first total', () => {
  let state = 47
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(8)
    const subs = Array.from({ length: n }, () => [])
    for (let v = 1; v < n; v++) subs[rand(v)].push(v)
    const importance = Array.from({ length: n }, () => rand(21) - 10)
    const employees = Array.from({ length: n }, (_, i) => [i, importance[i], subs[i]])
    const start = rand(n)
    // Oracle: breadth-first traversal of the same reporting tree.
    let expected = 0
    const queue = [start]
    for (let q = 0; q < queue.length; q++) { expected += importance[queue[q]]; queue.push(...subs[queue[q]]) }
    assert.equal(buildTrace({ employees, id: start }).result, expected, JSON.stringify({ employees, id: start }))
  }
})

test('690 rejects an id that is not an employee', () => {
  assert.throws(() => parseInput('{"employees":[[1,2,[]]],"id":9}'))
})
