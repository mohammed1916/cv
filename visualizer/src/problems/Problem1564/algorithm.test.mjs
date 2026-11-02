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

test('1564 worked examples', () => {
  assert.equal(solve([4, 3, 4, 1], [5, 3, 4, 1, 2]), 3)
  assert.equal(solve([1, 2, 2, 3, 4], [3, 4, 1, 2]), 3)
  assert.equal(solve([5], [1]), 0)
  checkFrames(buildTrace({ boxes: [4, 3, 4, 1], warehouse: [5, 3, 4, 1, 2] }))
})

test('1564 a tall room behind a low ceiling cannot be reached', () => {
  // Room 1 is 9 high, but the ceiling before it is 2, so its effective height is 2 as well.
  assert.equal(solve([3, 3], [2, 9]), 0)
  assert.equal(solve([2, 2], [2, 9]), 2)
})

// Oracle: maximum matching of boxes to rooms where box fits room j iff box <= effective[j].
function oracle(boxes, warehouse) {
  const effective = []
  let limit = Infinity
  for (const h of warehouse) { limit = Math.min(limit, h); effective.push(limit) }
  let best = 0
  const go = (i, used, count) => {
    best = Math.max(best, count)
    if (i === boxes.length) return
    go(i + 1, used, count)
    for (let j = 0; j < effective.length; j++) {
      if (!used[j] && boxes[i] <= effective[j]) {
        used[j] = true
        go(i + 1, used, count + 1)
        used[j] = false
      }
    }
  }
  go(0, Array(effective.length).fill(false), 0)
  return best
}

test('1564 random warehouses match an exhaustive matching oracle', () => {
  let seed = 1564
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  for (let trial = 0; trial < 300; trial++) {
    const boxes = Array.from({ length: 1 + rand(6) }, () => 1 + rand(9))
    const warehouse = Array.from({ length: 1 + rand(6) }, () => 1 + rand(9))
    assert.equal(solve(boxes, warehouse), oracle(boxes, warehouse), JSON.stringify({ boxes, warehouse }))
  }
})

test('1564 rejects heights outside the visualization range', () => {
  assert.throws(() => parseInput('{"boxes":[10],"warehouse":[1]}'))
  assert.throws(() => parseInput('{"boxes":[],"warehouse":[1]}'))
})
