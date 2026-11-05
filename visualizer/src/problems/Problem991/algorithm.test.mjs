import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: breadth-first search forward from the start value, with values kept below a generous limit.
function bfs(startValue, target) {
  const limit = 4 * Math.max(startValue, target) + 4
  const dist = new Map([[startValue, 0]])
  const queue = [startValue]
  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    if (v === target) return dist.get(v)
    for (const next of [v * 2, v - 1]) {
      if (next >= 1 && next <= limit && !dist.has(next)) {
        dist.set(next, dist.get(v) + 1)
        queue.push(next)
      }
    }
  }
  return -1
}

test('991 broken calculator matches the breadth-first oracle', () => {
  const cases = [
    [2, 3], [5, 8], [3, 10], [1, 1], [7, 1], [1, 1024], [9, 5], [6, 13], [4, 100], [20, 37], [3, 77],
  ]
  for (const [startValue, target] of cases) {
    const run = buildTrace(parseInput(JSON.stringify({ startValue, target })))
    assert.equal(run.result, bfs(startValue, target), `${startValue} -> ${target}`)
  }
})

test('991 rejects values outside the range', () => {
  assert.throws(() => parseInput('{"startValue":0,"target":3}'))
})
