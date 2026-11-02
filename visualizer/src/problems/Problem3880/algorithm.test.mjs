import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3880 official examples', () => {
  assert.equal(solve([1, 0, 0, 2, 0, 1]), 2)
  assert.equal(solve([1, 0, 1, 0]), -1)
})

test('3880 worked examples', () => {
  assert.equal(solve([1, 1, 1]), -1)
  assert.equal(solve([2, 1]), 1)
})

test('3880 edge cases', () => {
  assert.equal(solve([2]), -1)
  assert.equal(solve([0]), -1)
  assert.equal(solve([0, 0]), -1)
  assert.equal(solve([1, 2]), 1)
  assert.equal(solve([1, 0, 2]), 2)
  assert.equal(solve([1, 1, 2, 2, 1]), 1)
  assert.equal(solve([1, 2, 2, 2, 2, 1]), 1)
  assert.equal(solve([2, 2, 1, 2]), 1)
})

test('3880 accepts 0, 1 and 2 and rejects anything else', () => {
  assert.doesNotThrow(() => parseInput('{"nums":[0, 1, 2]}'))
  assert.throws(() => parseInput('{"nums":[3, 1]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Oracle: check every pair of indices directly.
function oracle(nums) {
  let best = -1
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (nums[i] === 1 && nums[j] === 2) {
        const gap = Math.abs(i - j)
        if (best === -1 || gap < best) best = gap
      }
    }
  }
  return best
}

test('3880 random inputs match a pairwise oracle', () => {
  let seed = 3880
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(3))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3880 candidate distances on [1,0,0,2,0,1] are 3 then 2', () => {
  const gaps = buildTrace({ nums: [1, 0, 0, 2, 0, 1] }).frames.filter(f => f.phase === 'pair').map(f => f.gap)
  assert.deepEqual(gaps, [3, 2])
  const { frames, result } = buildTrace({ nums: [1, 0, 0, 2, 0, 1] })
  assert.equal(result, 2)
  assert.deepEqual(frames.at(-1).bestPair, { from: 3, to: 5 })
})

test('3880 zeros-only input has no candidate and returns -1', () => {
  const { frames, result } = buildTrace({ nums: [0, 0] })
  assert.equal(result, -1)
  assert.equal(frames.filter(f => f.phase === 'pair').length, 0)
  assert.equal(frames.filter(f => f.phase === 'skip').length, 2)
})

test('3880 frames carry last-seen state and real line numbers', () => {
  const { frames } = buildTrace({ nums: [1, 0, 2] })
  for (const f of frames) {
    assert.ok(f.last && typeof f.last[1] === 'number' && typeof f.last[2] === 'number')
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
  }
})

// Independent oracle: enumerate all pairs over small arrays with values {0,1,2}.
function allPairsOracle(nums) {
  let best = -1
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (nums[i] === 1 && nums[j] === 2) {
        const gap = Math.abs(i - j)
        if (best === -1 || gap < best) best = gap
      }
    }
  }
  return best
}

test('3880 all arrays of length 1 to 6 over {0,1,2} match the pairwise oracle', () => {
  for (let len = 1; len <= 6; len++) {
    const total = 3 ** len
    for (let code = 0; code < total; code++) {
      const nums = []
      let c = code
      for (let k = 0; k < len; k++) { nums.push(c % 3); c = Math.floor(c / 3) }
      assert.equal(solve(nums), allPairsOracle(nums), JSON.stringify(nums))
    }
  }
})
