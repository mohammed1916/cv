import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1665 official examples', () => {
  assert.equal(solve({ tasks: [[1, 2], [2, 4], [4, 8]] }), 8)
  assert.equal(solve({ tasks: [[1, 3], [2, 4], [10, 11], [10, 12], [8, 9]] }), 32)
  assert.equal(solve({ tasks: [[1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12]] }), 27)
})

test('1665 a single task needs its minimum', () => {
  assert.equal(solve({ tasks: [[3, 9]] }), 9)
})

test('1665 rejects a minimum below the actual energy', () => {
  assert.throws(() => parseInput('{"tasks":[[5,4]]}'))
})

// Independent oracle: try every order of the tasks and keep the smallest starting energy that works for that order.
function oracle({ tasks }) {
  const n = tasks.length
  const used = Array(n).fill(false)
  let best = Infinity
  const walk = (depth, spent, peak) => {
    if (peak >= best) return
    if (depth === n) { best = peak; return }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      used[i] = true
      walk(depth + 1, spent + tasks[i][0], Math.max(peak, spent + tasks[i][1]))
      used[i] = false
    }
  }
  walk(0, 0, 0)
  return best
}

test('1665 random tasks match an order-enumeration oracle', () => {
  let seed = 1665
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const tasks = Array.from({ length: 1 + rnd(6) }, () => { const a = 1 + rnd(10); return [a, a + rnd(10)] })
    assert.equal(solve({ tasks }), oracle({ tasks }), JSON.stringify(tasks))
  }
})
