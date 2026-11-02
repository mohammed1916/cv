import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2340 worked examples', () => {
  assert.equal(solve([3, 5, 2, 7, 1, 4]), 5)
  assert.equal(solve([2, 1, 4, 3]), 2)
  assert.equal(solve([5, 1]), 1)
  assert.equal(solve([1, 9]), 0)
  assert.equal(solve([4]), 0)
  assert.equal(solve([3, 3, 3]), 0)
})

test('2340 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,1]'))
})

// Oracle: breadth-first search over arrangements reached by adjacent swaps, stopping at the first valid one.
function oracle(nums) {
  const n = nums.length
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  const valid = a => a[0] === lo && a[n - 1] === hi
  const start = nums.join(',')
  const seen = new Map([[start, 0]])
  const queue = [nums.slice()]
  for (let head = 0; head < queue.length; head++) {
    const a = queue[head]
    const d = seen.get(a.join(','))
    if (valid(a)) return d
    for (let k = 0; k + 1 < n; k++) {
      const b = a.slice()
      ;[b[k], b[k + 1]] = [b[k + 1], b[k]]
      const key = b.join(',')
      if (!seen.has(key)) { seen.set(key, d + 1); queue.push(b) }
    }
  }
  return -1
}

test('2340 random arrays match a BFS-over-swaps oracle', () => {
  let seed = 2340
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 250; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2340 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[3,5,2,7,1,4]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
