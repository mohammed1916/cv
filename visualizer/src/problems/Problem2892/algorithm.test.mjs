import test from 'node:test'
import assert from 'node:assert/strict'
import { code, python, parseInput, buildTrace, phases } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const PHASE_IDS = new Set(phases.map(p => p.id))
const PY = python.trim().split('\n')

// Brute force: explore every reachable array by merging adjacent pairs whose product is at most k.
function oracle(nums, k) {
  const seen = new Set()
  let best = Infinity
  const stack = [nums]
  while (stack.length) {
    const arr = stack.pop()
    const key = arr.join(',')
    if (seen.has(key)) continue
    seen.add(key)
    best = Math.min(best, arr.length)
    for (let i = 0; i + 1 < arr.length; i += 1) {
      const p = arr[i] * arr[i + 1]
      if (p <= k) stack.push([...arr.slice(0, i), p, ...arr.slice(i + 2)])
    }
  }
  return best
}

test('presets match the brute-force oracle', () => {
  const cases = [
    [[2, 3, 4, 5, 6], 30], [[9, 1, 8, 7, 1], 8], [[1, 1, 1, 1], 1],
    [[4, 4, 4, 4, 4, 4], 16], [[5, 2, 3, 1, 6, 2, 7], 12],
  ]
  for (const [nums, k] of cases) assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  assert.equal(solve([2, 3, 4, 5, 6], 30), 2)
  assert.equal(solve([9, 1, 8, 7, 1], 8), 3)
  assert.equal(solve([5, 2, 3, 1, 6, 2, 7], 12), 4)
})

test('randomised small inputs agree with the oracle', () => {
  let seed = 7
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t += 1) {
    const len = 1 + rnd(6)
    const nums = Array.from({ length: len }, () => 1 + rnd(5))
    const k = 1 + rnd(12)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('edge cases', () => {
  assert.equal(solve([7], 3), 1)
  assert.equal(solve([1], 1), 1)
  assert.equal(solve([3, 3], 2), 2)
  assert.equal(solve([1, 1, 1, 1, 1], 1), 1)
})

test('parser rejects bad input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('{"nums":[0,1],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1.5],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

test('frames carry valid pseudocode and python lines and known phases', () => {
  const run = buildTrace({ nums: [5, 2, 3, 1, 6, 2, 7], k: 12 })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const f of run.frames) {
    assert.ok(PHASE_IDS.has(f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= PY.length)
    assert.ok(f.groups >= 0 && f.product >= 1)
    assert.equal(f.starts.length, f.groups)
  }
})

test('code and python exports are non-empty and the python defines the function', () => {
  assert.ok(code.length >= 8)
  assert.match(python, /def min_final_length\(nums, k\):/)
})
