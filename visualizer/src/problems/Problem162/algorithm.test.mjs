import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

// Independent oracle: a peak is an index whose value beats each existing neighbour.
function isPeak(nums, i) {
  const left = i === 0 || nums[i] > nums[i - 1]
  const right = i === nums.length - 1 || nums[i] > nums[i + 1]
  return left && right
}

test('162 hand-made arrays return a valid peak', () => {
  assert.equal(solve([5]), 0)
  assert.equal(solve([1, 3, 2]), 1)
  assert.equal(solve([9, 4, 2, 7]), 0)
  assert.ok([1, 3].includes(solve([1, 4, 3, 8, 6])))
  assert.equal(solve([1, 2, 3, 2, 1]), 2)
})

test('162 random arrays always land on a peak', () => {
  let seed = 21
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(20)
    const nums = []
    while (nums.length < len) {
      const v = rnd(41) - 20
      if (nums.length === 0 || nums[nums.length - 1] !== v) nums.push(v)
    }
    const index = solve(nums)
    assert.ok(isPeak(nums, index), JSON.stringify(nums))
  }
})

test('162 frames carry phase, code line, narration and snapshot', () => {
  const run = buildTrace([1, 5, 3, 7, 2, 0])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 5)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(python.includes('def find_peak'))
})

test('162 rejects malformed input', () => {
  assert.throws(() => parseInput('{"a":1}'), /array/)
  assert.throws(() => parseInput('[1,2.5]'), /integer/)
  assert.throws(() => parseInput('[1,2,2,3]'), /same value/)
})
