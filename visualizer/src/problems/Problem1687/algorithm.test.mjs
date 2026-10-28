import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1687 official examples', () => {
  assert.equal(solve({ boxes: [[1, 1], [2, 1], [1, 1]], ports_count: 2, max_boxes: 3, max_weight: 3 }), 4)
  assert.equal(solve({ boxes: [[1, 2], [3, 3], [3, 1], [3, 1], [2, 4]], ports_count: 3, max_boxes: 3, max_weight: 6 }), 6)
})

test('1687 tight limits force one trip per box', () => {
  // Each single-box trip costs 2 (storage to port and back), so three trips cost 6.
  assert.equal(solve({ boxes: [[1, 5], [2, 5], [3, 5]], ports_count: 3, max_boxes: 1, max_weight: 5 }), 6)
  assert.equal(solve({ boxes: [[1, 1]], ports_count: 1, max_boxes: 5, max_weight: 1 }), 2)
})

test('1687 rejects a port outside the range and an unknown key', () => {
  assert.throws(() => parseInput('{"boxes":[[3,1]],"ports_count":2,"max_boxes":1,"max_weight":5}'))
  assert.throws(() => parseInput('{"boxes":[[1,1]],"ports_count":2,"max_boxes":1,"max_weight":5,"extra":1}'))
})

// Independent oracle: try every way to cut the boxes into consecutive trips and keep the cheapest legal split.
function oracle({ boxes, max_boxes, max_weight }) {
  const n = boxes.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let total = 0
    let start = 0
    let legal = true
    for (let end = 0; end < n; end++) {
      if (end === n - 1 || (mask >> end) & 1) {
        const trip = boxes.slice(start, end + 1)
        const weight = trip.reduce((sum, box) => sum + box[1], 0)
        if (trip.length > max_boxes || weight > max_weight) {
          legal = false
          break
        }
        let changes = 0
        for (let k = 1; k < trip.length; k++) if (trip[k][0] !== trip[k - 1][0]) changes++
        total += 2 + changes
        start = end + 1
      }
    }
    if (legal && total < best) best = total
  }
  return best
}

test('1687 random inputs match a subset-of-cuts oracle', () => {
  let seed = 1687
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const ports_count = 1 + rnd(4)
    const max_boxes = 1 + rnd(4)
    const max_weight = 2 + rnd(7)
    const boxes = Array.from({ length: 1 + rnd(7) }, () => [1 + rnd(ports_count), 1 + rnd(max_weight)])
    const input = { boxes, ports_count, max_boxes, max_weight }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
