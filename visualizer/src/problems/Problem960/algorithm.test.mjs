import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = strs => buildTrace(strs).result

test('960 official examples', () => {
  assert.equal(solve(['babca', 'bbazb']), 3)
  assert.equal(solve(['edcba']), 4)
  assert.equal(solve(['ghi', 'def', 'abc']), 0)
})

test('960 rejects strings of different lengths', () => {
  assert.throws(() => parseInput('["ab","abc"]'))
})

// Independent oracle: try every subset of columns and keep the largest one whose rows are all sorted.
function oracle(strs) {
  const cols = strs[0].length
  let best = 0
  for (let mask = 0; mask < 1 << cols; mask++) {
    const kept = []
    for (let c = 0; c < cols; c++) if (mask & (1 << c)) kept.push(c)
    const sorted = strs.every(row => kept.every((c, idx) => idx === 0 || row[kept[idx - 1]] <= row[c]))
    if (sorted) best = Math.max(best, kept.length)
  }
  return cols - best
}

test('960 random grids match an exhaustive search', () => {
  let seed = 23
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const cols = 1 + rnd(7), rows = 1 + rnd(4)
    const strs = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 'abc'[rnd(3)]).join(''))
    assert.equal(solve(strs), oracle(strs), JSON.stringify(strs))
  }
})
