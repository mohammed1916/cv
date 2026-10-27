import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3011 official examples', () => {
  assert.equal(solve([8, 4, 2, 30, 15]), true)
  assert.equal(solve([1, 2, 3, 4, 5]), true)
  assert.equal(solve([3, 16, 8, 4, 2]), false)
})

test('3011 edge cases', () => {
  assert.equal(solve([7]), true)
  assert.equal(solve([2, 1]), true)
  assert.equal(solve([2, 4, 3]), false)
  assert.equal(solve([5, 3]), true)
})

test('3011 rejects zero and empty input', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: breadth-first search over arrays reachable by swapping neighbours with equal set bit counts.
function oracle(nums) {
  const bits = v => v.toString(2).split('1').length - 1
  const target = [...nums].sort((a, b) => a - b).join(',')
  const seen = new Set([nums.join(',')])
  const queue = [nums.slice()]
  for (let h = 0; h < queue.length; h++) {
    const cur = queue[h]
    if (cur.join(',') === target) return true
    for (let i = 0; i + 1 < cur.length; i++) {
      if (bits(cur[i]) !== bits(cur[i + 1])) continue
      const next = cur.slice()
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      const key = next.join(',')
      if (!seen.has(key)) { seen.add(key); queue.push(next) }
    }
  }
  return false
}

test('3011 random arrays match a breadth-first search over swaps', () => {
  let seed = 3011
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(31))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
