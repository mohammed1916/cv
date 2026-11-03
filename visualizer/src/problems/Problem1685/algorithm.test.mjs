import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

// Independent oracle: compare every value with every other value directly.
const brute = nums => nums.map(a => nums.reduce((sum, b) => sum + Math.abs(a - b), 0))

test('1685 a small sorted array gives the expected sums by hand', () => {
  assert.deepEqual(solve([1, 4, 6, 9]), [16, 10, 10, 16])
})

test('1685 repeated and negative values are handled', () => {
  assert.deepEqual(solve([-3, -3, 2]), [5, 5, 10])
  assert.deepEqual(solve([7, 7, 7]), [0, 0, 0])
})

test('1685 random sorted arrays match the brute-force oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(11) }, () => rnd(201) - 100).sort((a, b) => a - b)
    const input = JSON.stringify(nums)
    parseInput(input)
    assert.deepEqual(solve(nums), brute(nums), input)
  }
})

test('1685 unsorted or malformed input is rejected', () => {
  assert.throws(() => parseInput('[3,1,2]'), /sorted/)
  assert.throws(() => parseInput('[5]'), /2 to 12/)
  assert.throws(() => parseInput('[1,2.5]'), /integers/)
  assert.throws(() => parseInput('{"nums":[1,2]}'), /JSON array/)
})

test('1685 every frame has a message and lines inside the solver', () => {
  const run = buildTrace([1, 4, 6, 9])
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 8)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
