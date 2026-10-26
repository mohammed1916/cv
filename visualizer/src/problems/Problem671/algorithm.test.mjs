import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('671 official examples', () => {
  assert.equal(buildTrace([2, 2, 5, null, null, 5, 7]).result, 5)
  assert.equal(buildTrace([2, 2, 2]).result, -1)
})

test('671 random special trees match a set-based oracle', () => {
  let state = 101
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    // Build a special tree: each child is at least its parent's value (min-heap shape, level order).
    const size = 1 + rand(10)
    const values = [1 + rand(5)]
    const nodes = [values[0]]
    const queue = [0]
    let made = 1
    const arr = [values[0]]
    for (let q = 0; q < queue.length && made < size; q++) {
      for (let c = 0; c < 2 && made < size; c++) {
        if (rand(3) === 0) { arr.push(null); continue }
        const v = nodes[queue[q]] + rand(4)
        arr.push(v); nodes.push(v); queue.push(nodes.length - 1); made++
      }
    }
    const all = arr.filter(v => v !== null)
    const min = Math.min(...all)
    const above = [...new Set(all.filter(v => v > min))].sort((a, b) => a - b)
    assert.equal(buildTrace(arr).result, above.length ? above[0] : -1, JSON.stringify(arr))
  }
})

test('671 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
