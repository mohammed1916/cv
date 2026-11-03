import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('1425 sample inputs give the expected sums', () => {
  assert.equal(solve([10, 2, -10, 5, 20], 2), 37)
  assert.equal(solve([-1, -2, -3], 1), -1)
  assert.equal(solve([10, -2, -10, -5, 20], 2), 23)
})

test('1425 all-negative and single-element arrays pick the largest element', () => {
  assert.equal(solve([-7], 1), -7)
  assert.equal(solve([-5, -1, -9], 3), -1)
})

test('1425 trace has the declared phases and a final complete frame', () => {
  const { frames } = buildTrace({ nums: [1, 2, 3], k: 1 })
  const ids = new Set(phases.map(p => p.id))
  assert.ok(frames.every(f => ids.has(f.phase)))
  assert.equal(frames.at(-1).phase, 'done')
  assert.ok(frames.every(f => typeof f.activeLine === 'number' && f.activeLine > 0 && typeof f.pythonLine === 'number' && f.pythonLine > 0))
})

test('1425 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"nums":[],"k":1}'), /nums/)
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'), /k/)
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'), /k/)
})

// Independent oracle: enumerate every nonempty index subset whose consecutive chosen indices differ by at most k.
test('1425 random arrays match a subset-enumeration oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => rnd(41) - 20)
    const k = 1 + rnd(len)
    let best = -Infinity
    for (let mask = 1; mask < 1 << len; mask++) {
      const chosen = []
      for (let i = 0; i < len; i++) if (mask & (1 << i)) chosen.push(i)
      let ok = true
      for (let j = 1; j < chosen.length; j++) if (chosen[j] - chosen[j - 1] > k) ok = false
      if (!ok) continue
      best = Math.max(best, chosen.reduce((s, i) => s + nums[i], 0))
    }
    const input = JSON.stringify({ nums, k })
    parseInput(input)
    assert.equal(solve(nums, k), best, input)
  }
})
