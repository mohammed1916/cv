import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: compare every pair of indices directly.
function oracle(nums) {
  let good = 0
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] === nums[j]) good++
  return good
}

test('a repeated value pairs with every earlier copy', () => {
  // Value 4 at indices 0, 2, 3 gives 3 pairs; value 2 at indices 1, 4 gives 1 pair.
  assert.equal(buildTrace([4, 2, 4, 4, 2, 9]).result, 4)
})

test('all values equal gives n choose 2', () => {
  assert.equal(buildTrace([7, 7, 7, 7]).result, 6)
})

test('no repeats gives zero', () => {
  assert.equal(buildTrace([1, 2, 3, 4]).result, 0)
})

test('random arrays agree with the pairwise oracle', () => {
  let seed = 13
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(30)
    const nums = Array.from({ length: len }, () => 1 + rnd(8))
    assert.equal(buildTrace(nums).result, oracle(nums), JSON.stringify(nums))
  }
})

test('parseInput rejects values outside 1 to 100 and bad lengths', () => {
  assert.deepEqual(parseInput('[1,1]'), [1, 1])
  assert.throws(() => parseInput('[0]'), /1 to 100/)
  assert.throws(() => parseInput('[101]'), /1 to 100/)
  assert.throws(() => parseInput('[]'), /1 to 60/)
})

test('every frame names a real phase and in-range code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([2, 1, 2, 2])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length - 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
