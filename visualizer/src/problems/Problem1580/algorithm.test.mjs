import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (boxes, warehouse) => buildTrace({ boxes, warehouse }).result

function checkFrames(trace) {
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1580 worked examples', () => {
  assert.equal(solve([4, 3, 4, 1], [5, 3, 4, 1, 2]), 3)
  assert.equal(solve([1, 2, 3, 4, 5, 6], [3, 4, 1, 2, 2, 1]), 3)
  assert.equal(solve([5], [1]), 0)
  checkFrames(buildTrace({ boxes: [4, 3, 4, 1], warehouse: [5, 3, 4, 1, 2] }))
})

test('1580 entering from the right reaches a room the left entrance cannot', () => {
  // The left entrance is blocked at room 1 by the ceiling 1 at room 0, but from the right room 1 is 3 high.
  assert.equal(solve([3], [1, 3]), 1)
  assert.equal(solve([3], [3, 1]), 1)
  assert.equal(solve([4], [3, 1]), 0)
})

// Oracle: each box chooses a room and an entrance; the room must fit the box on that side. Exhaustive search.
function oracle(boxes, warehouse) {
  const n = warehouse.length
  const fromLeft = j => Math.min(...warehouse.slice(0, j + 1))
  const fromRight = j => Math.min(...warehouse.slice(j))
  let best = 0
  const go = (i, used, count) => {
    best = Math.max(best, count)
    if (i === boxes.length) return
    go(i + 1, used, count)
    for (let j = 0; j < n; j++) {
      if (used[j]) continue
      if (boxes[i] <= fromLeft(j) || boxes[i] <= fromRight(j)) {
        used[j] = true
        go(i + 1, used, count + 1)
        used[j] = false
      }
    }
  }
  go(0, Array(n).fill(false), 0)
  return best
}

test('1580 random warehouses match an exhaustive oracle', () => {
  let seed = 1580
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  for (let trial = 0; trial < 300; trial++) {
    const boxes = Array.from({ length: 1 + rand(6) }, () => 1 + rand(9))
    const warehouse = Array.from({ length: 1 + rand(6) }, () => 1 + rand(9))
    assert.equal(solve(boxes, warehouse), oracle(boxes, warehouse), JSON.stringify({ boxes, warehouse }))
  }
})

test('1580 rejects heights outside the visualization range', () => {
  assert.throws(() => parseInput('{"boxes":[1],"warehouse":[0]}'))
})
