import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: try every way to split the three changes between the two ends.
function oracle(nums) {
  const n = nums.length
  if (n <= 4) return 0
  let best = Infinity
  for (let a = 0; a <= 3; a++) {
    const b = 3 - a
    // Remove a smallest and b largest values, then the remaining range is the spread of what is left.
    const kept = [...nums].sort((x, y) => x - y).slice(a, n - b)
    best = Math.min(best, kept[kept.length - 1] - kept[0])
  }
  return best
}

test('four or fewer values give zero', () => {
  assert.equal(buildTrace([5, 1, 9]).result, 0)
  assert.equal(buildTrace([7, 3, 8, 1]).result, 0)
})

test('a hand-checked case: five-plus values with clustered middle', () => {
  // Sorted: 1, 2, 3, 20, 21, 22. Removing the 3 extremes at the right end leaves 1..3 (width 2).
  assert.equal(buildTrace([1, 20, 3, 22, 2, 21]).result, 2)
})

test('random arrays agree with the split-enumeration oracle', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => rnd(201) - 100)
    assert.equal(buildTrace(nums).result, oracle(nums), JSON.stringify(nums))
  }
})

test('parseInput rejects malformed arrays', () => {
  assert.deepEqual(parseInput('[3,1,2]'), [3, 1, 2])
  assert.throws(() => parseInput('[]'), /1 to 20/)
  assert.throws(() => parseInput('[1.5]'), /integers/)
  assert.throws(() => parseInput('{"a":1}'), /1 to 20/)
})

test('every frame names a real phase and in-range code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const nums of [[4, 9, 1, 7, 2], [2, 3]]) {
    const run = buildTrace(nums)
    for (const frame of run.frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.message.length > 10)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length - 1)
    }
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
