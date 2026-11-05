import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(m) {
  const diag = new Map()
  for (let r = 0; r < m.length; r++) for (let c = 0; c < m[0].length; c++) {
    const key = r - c
    if (!diag.has(key)) diag.set(key, m[r][c])
    else if (diag.get(key) !== m[r][c]) return false
  }
  return true
}

test('766 worked examples', () => {
  assert.equal(buildTrace([[1, 2, 3, 4], [5, 1, 2, 3], [9, 5, 1, 2]]).result, true)
  assert.equal(buildTrace([[1, 2], [2, 2]]).result, false)
})

test('766 random matrices match a diagonal-map check', () => {
  let state = 766
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 600; t++) {
    const rows = 1 + rand(4), cols = 1 + rand(4)
    const m = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rand(3)))
    assert.equal(buildTrace(m).result, brute(m), JSON.stringify(m))
  }
})

test('766 rejects a ragged matrix', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'))
})
