import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

test('4041 no operation needed when a subset already sums to target', () => {
  assert.equal(solve([3, 5], 8), 0)
  assert.equal(solve([7], 7), 0)
})

test('4041 one operation changes an element', () => {
  assert.equal(solve([3], 6), 1)
  assert.equal(solve([5], 2), 1)
  assert.equal(solve([1], 2), 1)
})

test('4041 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ nums: [3, 5, 4], target: 10 })
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4041 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"target":3}'))
  assert.throws(() => parseInput('{"nums":[0],"target":3}'))
  assert.throws(() => parseInput('{"nums":[2],"target":0}'))
})

// Independent oracle: enumerate every subset and, for each chosen element, every value it can reach.
// The reach search uses a much larger bound than the trace so that it cannot miss a cheaper route.
function reachOracle(x, target) {
  const bound = 16 * Math.max(target, x)
  const dist = new Map([[x, 0]])
  let frontier = [x]
  while (frontier.length) {
    const next = []
    for (const v of frontier) {
      for (const w of [2 * v, Math.floor(v / 2)]) {
        if (w >= 1 && w <= bound && !dist.has(w)) {
          dist.set(w, dist.get(v) + 1)
          next.push(w)
        }
      }
    }
    frontier = next
  }
  return [...dist.entries()].filter(([v]) => v >= 1 && v <= target)
}

function oracle(nums, target) {
  let best = Infinity
  const go = (i, sum, cost) => {
    if (sum === target) {
      best = Math.min(best, cost)
      return
    }
    if (i === nums.length || sum > target) return
    go(i + 1, sum, cost)
    for (const [v, c] of reachOracle(nums[i], target)) go(i + 1, sum + v, cost + c)
  }
  go(0, 0, 0)
  return best === Infinity ? -1 : best
}

test('4041 random small inputs match an exhaustive oracle', () => {
  let seed = 4041
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(8))
    const target = 1 + rnd(12)
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
