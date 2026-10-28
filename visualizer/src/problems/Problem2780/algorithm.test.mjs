import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2780 worked examples', () => {
  assert.equal(solve([1, 2, 2, 2]), 2)
  assert.equal(solve([2, 1, 3, 1, 1, 1, 7, 1, 2, 1]), 4)
  assert.equal(solve([3, 3, 3, 3, 7, 2, 2]), -1)
})

test('2780 a two element array splits at index zero when both sides agree', () => {
  assert.equal(solve([5, 5]), 0)
})

test('2780 rejects arrays without a dominant value', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3,4]}'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Independent oracle: for every split, find the majority value of each side directly and compare them.
function majority(values) {
  for (const x of new Set(values)) {
    if (2 * values.filter(v => v === x).length > values.length) return x
  }
  return null
}

function oracle(nums) {
  for (let i = 0; i < nums.length - 1; i++) {
    const a = majority(nums.slice(0, i + 1))
    const b = majority(nums.slice(i + 1))
    if (a !== null && a === b) return i
  }
  return -1
}

test('2780 random arrays with a dominant value match a split-by-split oracle', () => {
  let seed = 2780
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 600 && checked < 300; t++) {
    const len = 2 + rnd(11)
    const nums = Array.from({ length: len }, () => 1 + rnd(4))
    let parsed = true
    try { parseInput(JSON.stringify({ nums })) } catch { parsed = false }
    if (!parsed) continue
    checked++
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
  assert.ok(checked >= 100)
})
