import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: sum each prefix directly.
function prefixOracle(nums) {
  return nums.map((_, i) => nums.slice(0, i + 1).reduce((a, b) => a + b, 0))
}

test('sample arrays produce their prefix sums', () => {
  assert.deepEqual(buildTrace([3, -1, 4, 1, -5, 9]).result, [3, 2, 6, 7, 2, 11])
  assert.deepEqual(buildTrace([1, 2, 3, 4, 5]).result, [1, 3, 6, 10, 15])
  assert.deepEqual(buildTrace([7]).result, [7])
})

test('random arrays agree with the prefix oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rand(30) }, () => rand(2001) - 1000)
    assert.deepEqual(buildTrace(nums).result, prefixOracle(nums), JSON.stringify(nums))
  }
})

test('every frame has a phase, a message, and a code line inside the solution', () => {
  const run = buildTrace([2, 2, 2])
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 7)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.filter(f => f.phase === 'accumulate').length, 3)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /1 to 200/)
  assert.throws(() => parseInput('[1.5]'), /integer/)
  assert.throws(() => parseInput('[1001]'), /-1000 to 1000/)
  assert.throws(() => parseInput('{"a":1}'), /JSON array/)
})
