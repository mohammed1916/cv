import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (properties, k) => buildTrace(parseInput(JSON.stringify({ properties, k }))).result

test('3493 official examples', () => {
  assert.equal(solve([[1, 2], [1, 1], [3, 4], [4, 5], [5, 6], [7, 7]], 1), 3)
  assert.equal(solve([[1, 2, 3], [2, 3, 4], [4, 5, 6]], 2), 2)
  assert.equal(solve([[1, 1], [1, 1]], 2), 2)
  assert.equal(solve([[1, 1], [1, 1]], 1), 1)
})

test('3493 edge cases', () => {
  assert.equal(solve([[5]], 1), 1)
  assert.equal(solve([[1, 2], [3, 4]], 1), 2)
})

test('3493 rejects ragged rows and values out of range', () => {
  assert.throws(() => parseInput('{"properties":[[1,2],[3]],"k":1}'))
  assert.throws(() => parseInput('{"properties":[[11]],"k":1}'))
})

// Independent oracle: count shared values by scanning each row, then find components by breadth-first search.
function oracle(properties, k) {
  const m = properties.length
  const sharedCount = (a, b) => {
    const distinct = [...new Set(properties[a])]
    return distinct.filter(v => properties[b].indexOf(v) !== -1).length
  }
  const seen = new Array(m).fill(false)
  let components = 0
  for (let s = 0; s < m; s++) {
    if (seen[s]) continue
    components++
    const queue = [s]
    seen[s] = true
    for (let h = 0; h < queue.length; h++) {
      for (let t = 0; t < m; t++) {
        if (!seen[t] && t !== queue[h] && sharedCount(queue[h], t) >= k) { seen[t] = true; queue.push(t) }
      }
    }
  }
  return components
}

test('3493 random property tables match a breadth-first oracle', () => {
  let seed = 3493
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(8)
    const width = 1 + rnd(6)
    const properties = Array.from({ length: m }, () => Array.from({ length: width }, () => 1 + rnd(10)))
    const k = 1 + rnd(6)
    assert.equal(solve(properties, k), oracle(properties, k), JSON.stringify({ properties, k }))
  }
})
