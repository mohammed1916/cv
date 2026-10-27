import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3245 official style examples', () => {
  assert.deepEqual(solve({ colors: [0, 1, 0, 1, 0], queries: [[1, 3]] }), [3])
  // Before the update, the windows at starts 0, 3 and 4 alternate; after tile 2 becomes 1, two size-4 groups remain.
  assert.deepEqual(solve({ colors: [0, 1, 0, 0, 1], queries: [[1, 3], [2, 2, 1], [1, 4]] }), [3, 2])
})

test('3245 a fully alternating circle counts every start', () => {
  assert.deepEqual(solve({ colors: [0, 1, 0, 1], queries: [[1, 3], [1, 4]] }), [4, 4])
})

test('3245 rejects a group size larger than the circle', () => {
  assert.throws(() => parseInput('{"colors":[0,1,0],"queries":[[1,4]]}'))
})

// Independent oracle: test every start position and walk the group one tile at a time.
function oracle({ colors, queries }) {
  const cols = colors.slice()
  const n = cols.length
  const out = []
  for (const q of queries) {
    if (q[0] === 2) { cols[q[1]] = q[2]; continue }
    const size = q[1]
    let count = 0
    for (let s = 0; s < n; s++) {
      let ok = true
      for (let t = 0; t + 1 < size && ok; t++) {
        if (cols[(s + t) % n] === cols[(s + t + 1) % n]) ok = false
      }
      if (ok) count++
    }
    out.push(count)
  }
  return out
}

test('3245 random circles match a window-by-window scan', () => {
  let seed = 3245
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(8)
    const colors = Array.from({ length: n }, () => rnd(2))
    const queries = []
    for (let k = 1 + rnd(6); k > 0; k--) {
      if (rnd(2) === 0) queries.push([1, 3 + rnd(n - 2)])
      else queries.push([2, rnd(n), rnd(2)])
    }
    const input = { colors, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
