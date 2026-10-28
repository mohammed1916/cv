import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2588 official examples', () => {
  assert.equal(solve([4, 3, 1, 2, 4]), 2)
  assert.equal(solve([1, 10, 4]), 0)
})

test('2588 edge cases: a single zero and an all-zero array', () => {
  assert.equal(solve([0]), 1)
  assert.equal(solve([0, 0, 0]), 6)
})

test('2588 rejects an empty array and an out-of-range value', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[256]}'))
})

// Independent oracle: breadth-first search over the operations, applied to each subarray on its own.
function canZero(arr) {
  const seen = new Set([arr.join(',')])
  const queue = [arr]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    if (cur.every(v => v === 0)) return true
    for (let i = 0; i < cur.length; i++) {
      for (let j = i + 1; j < cur.length; j++) {
        for (let k = 0; k < 3; k++) {
          if (((cur[i] >> k) & 1) && ((cur[j] >> k) & 1)) {
            const next = [...cur]
            next[i] -= 1 << k
            next[j] -= 1 << k
            const key = next.join(',')
            if (!seen.has(key)) { seen.add(key); queue.push(next) }
          }
        }
      }
    }
  }
  return false
}

function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) if (canZero(nums.slice(i, j + 1))) count++
  }
  return count
}

test('2588 random arrays match a subarray-by-subarray search', () => {
  let seed = 2588
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = []
    const len = 1 + rnd(5)
    for (let i = 0; i < len; i++) nums.push(rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
