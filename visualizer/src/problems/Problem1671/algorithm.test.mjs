import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('1671 hand-checked examples', () => {
  assert.equal(solve([1, 3, 1]), 0)
  // Keep 1,5,6,3,1 (length 5) and remove the other three values.
  assert.equal(solve([2, 1, 1, 5, 6, 2, 3, 1]), 3)
})

test('1671 rejects arrays with no possible peak', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
  assert.throws(() => parseInput('{"nums":[1,1,1]}'))
  assert.throws(() => parseInput('{"nums":[3,2,1]}'))
})

// Independent oracle: try every subsequence and keep the longest one that is a mountain.
function isMountain(seq) {
  if (seq.length < 3) return false
  let p = 0
  while (p + 1 < seq.length && seq[p + 1] > seq[p]) p++
  if (p === 0 || p === seq.length - 1) return false
  for (let i = p; i + 1 < seq.length; i++) if (!(seq[i + 1] < seq[i])) return false
  return true
}

function oracle(nums) {
  const n = nums.length
  let longest = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const seq = nums.filter((_, i) => mask & (1 << i))
    if (isMountain(seq) && seq.length > longest) longest = seq.length
  }
  return n - longest
}

test('1671 random cases match the subsequence oracle', () => {
  let seed = 1671
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400 && checked < 300; t++) {
    const n = rnd(7) + 3
    const nums = Array.from({ length: n }, () => rnd(9))
    let ok = true
    try { parseInput(JSON.stringify({ nums })) } catch { ok = false }
    if (!ok) continue
    checked++
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
  assert.ok(checked >= 100)
})
