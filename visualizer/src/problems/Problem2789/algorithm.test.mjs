import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

// Independent oracle: explore every reachable array by repeatedly applying a legal merge, and keep the largest value seen.
function oracle(nums) {
  const seen = new Set()
  let best = 0
  const stack = [nums]
  while (stack.length) {
    const arr = stack.pop()
    const key = arr.join(',')
    if (seen.has(key)) continue
    seen.add(key)
    best = Math.max(best, ...arr)
    for (let i = 0; i + 1 < arr.length; i++) {
      if (arr[i] <= arr[i + 1]) {
        const next = arr.slice()
        next[i + 1] = arr[i] + arr[i + 1]
        next.splice(i, 1)
        stack.push(next)
      }
    }
  }
  return best
}

test('2789 examples', () => {
  assert.equal(solve([2, 3, 7, 9, 3]), 21)
  assert.equal(solve([5, 3, 3]), 11)
  assert.equal(solve([7]), 7)
})

test('2789 rejects zero values', () => {
  assert.throws(() => parseInput('{"nums":[0,1]}'))
})

test('2789 random arrays match an exhaustive merge search', () => {
  let seed = 2789
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
