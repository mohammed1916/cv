import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2610 official examples', () => {
  assert.deepEqual(solve([1, 3, 4, 1, 2, 3, 1]), [[1, 3, 4, 2], [1, 3], [1]])
  assert.deepEqual(solve([1, 2, 3, 4]), [[1, 2, 3, 4]])
})

test('2610 a value repeated four times needs four rows', () => {
  assert.equal(solve([5, 5, 5, 5]).length, 4)
})

test('2610 rejects values outside 1 to 8', () => {
  assert.throws(() => parseInput('[9]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: the output must hold the same values, each row must have distinct
// values and no row may be empty, and the number of rows must equal the largest count.
function valid(nums, rows) {
  const flat = rows.flat().sort((a, b) => a - b)
  const sameValues = JSON.stringify(flat) === JSON.stringify([...nums].sort((a, b) => a - b))
  const distinctRows = rows.every(row => row.length > 0 && new Set(row).size === row.length)
  const counts = new Map()
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1)
  const largest = Math.max(...counts.values())
  return sameValues && distinctRows && rows.length === largest
}

test('2610 random arrays give valid, minimum-row answers', () => {
  let seed = 2610
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(14) }, () => 1 + rnd(5))
    const rows = solve(nums)
    assert.ok(valid(nums, rows), JSON.stringify({ nums, rows }))
  }
})
