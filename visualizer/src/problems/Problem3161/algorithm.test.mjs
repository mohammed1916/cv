import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3161 official style examples', () => {
  assert.deepEqual(solve('[[1,2],[2,3,3],[2,3,1],[2,2,2]]'), [false, true, true])
  // An obstacle at 7 leaves the free run 0 to 6 (length 7), so a block of 5 fits in [0, 6] and in [0, 15].
  assert.deepEqual(solve('[[1,7],[2,6,5],[2,15,5]]'), [true, true])
})

test('3161 a block must end at or before x', () => {
  // With cell 0 blocked, [0, 1] has only one free cell, but [0, 2] holds a free run of two (cells 1 and 2).
  assert.deepEqual(solve('[[1,0],[2,1,2],[2,2,2]]'), [false, true])
})

test('3161 rejects a cell outside 0 to 15', () => {
  assert.throws(() => parseInput('[[1,16]]'))
})

// Independent oracle: for each check, scan every possible start position directly.
function oracle(queries) {
  const blocked = new Set()
  const out = []
  for (const q of queries) {
    if (q[0] === 1) { blocked.add(q[1]); continue }
    const [, x, size] = q
    let fits = false
    for (let s = 0; s + size - 1 <= x && !fits; s++) {
      let free = true
      for (let c = s; c < s + size; c++) if (blocked.has(c)) { free = false; break }
      if (free) fits = true
    }
    out.push(fits)
  }
  return out
}

test('3161 random queries match a direct scan', () => {
  let seed = 3161
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const queries = []
    for (let k = 1 + rnd(10); k > 0; k--) {
      if (rnd(2) === 0) queries.push([1, rnd(16)])
      else queries.push([2, rnd(16), 1 + rnd(16)])
    }
    assert.deepEqual(solve(JSON.stringify(queries)), oracle(queries), JSON.stringify(queries))
  }
})
