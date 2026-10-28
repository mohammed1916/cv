import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, maxVal) => buildTrace(parseInput(JSON.stringify({ nums, maxVal }))).result

test('3953 official examples', () => {
  assert.equal(solve([3, 4, 6], 5), 4)
  assert.equal(solve([1, 2, 3], 4), 3)
  assert.equal(solve([2, 2], 1), 1)
})

test('3953 a single element is trivially co-prime with everything', () => {
  assert.equal(solve([7], 3), 7)
})

test('3953 rejects maxVal above 12', () => {
  assert.throws(() => parseInput('{"nums":[1],"maxVal":13}'))
})

// Independent oracle: enumerate every final array (each entry kept or set to any value up to maxVal),
// then score each index that is co-prime with all others, paying one per changed entry.
function oracle(nums, maxVal) {
  const n = nums.length
  const options = nums.map(x => [x, ...Array.from({ length: maxVal }, (_, k) => k + 1)])
  const g = (a, b) => (b === 0 ? a : g(b, a % b))
  let best = -Infinity
  const finals = Array(n).fill(0)
  const walk = i => {
    if (i === n) {
      let changes = 0
      for (let j = 0; j < n; j++) if (finals[j] !== nums[j]) changes++
      for (let s = 0; s < n; s++) {
        let ok = true
        for (let j = 0; j < n; j++) if (j !== s && g(finals[s], finals[j]) !== 1) ok = false
        if (ok) {
          best = Math.max(best, finals[s] - changes)
        }
      }
      return
    }
    for (const opt of options[i]) {
      finals[i] = opt
      walk(i + 1)
    }
  }
  walk(0)
  return best
}

test('3953 random small inputs match an every-final-array oracle', () => {
  let seed = 3953
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(3)
    const nums = Array.from({ length: n }, () => 1 + rnd(6))
    const maxVal = 1 + rnd(6)
    assert.equal(solve(nums, maxVal), oracle(nums, maxVal), JSON.stringify({ nums, maxVal }))
  }
})
