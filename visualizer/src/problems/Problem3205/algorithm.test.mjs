import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3205 presets', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([0, 9, 0, 3]), 15)
  assert.equal(solve([4, 1, 6, 2, 5]), 22)
})

test('3205 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('{"a":1}'))
})

// Oracle: enumerate every subset of intermediate indices as the hop path.
function oracle(nums) {
  const n = nums.length
  if (n === 1) return 0
  let best = -Infinity
  const middle = Array.from({ length: n - 2 }, (_, k) => k + 1)
  for (let mask = 0; mask < 1 << middle.length; mask++) {
    const path = [0]
    middle.forEach((idx, bit) => { if (mask & (1 << bit)) path.push(idx) })
    path.push(n - 1)
    let score = 0
    for (let t = 1; t < path.length; t++) score += (path[t] - path[t - 1]) * nums[path[t]]
    best = Math.max(best, score)
  }
  return best
}

test('3205 random arrays match the path-enumeration oracle', () => {
  let seed = 3205
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(101))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3205 frames stay inside the pseudocode and Python listings', () => {
  const pyLines = python.split('\n').length
  const run = buildTrace([4, 1, 6, 2, 5])
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
  assert.equal(run.frames.at(-1).best.at(-1), run.result)
})
