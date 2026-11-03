import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('1664 teaching cases return the expected counts', () => {
  assert.equal(solve([2, 1, 6, 4]), 1)
  assert.equal(solve([1, 1, 1]), 3)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([5]), 1)
  assert.equal(solve([3, 3, 3, 3]), 0)
})

test('1664 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /array/)
  assert.throws(() => parseInput('[1,0,3]'), /array/)
  assert.throws(() => parseInput('{"nums":[1,2]}'), /array/)
})

// Independent oracle: delete each index explicitly, then compare the sums of the remaining even and odd positions.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    const rest = nums.filter((_, j) => j !== i)
    const evenSum = rest.filter((_, j) => j % 2 === 0).reduce((a, b) => a + b, 0)
    const oddSum = rest.filter((_, j) => j % 2 === 1).reduce((a, b) => a + b, 0)
    if (evenSum === oddSum) count += 1
  }
  return count
}

test('1664 matches an explicit deletion oracle on random arrays', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const len = 1 + rnd(12)
    const nums = Array.from({ length: len }, () => 1 + rnd(6))
    parseInput(JSON.stringify(nums))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('1664 frames point to valid code and Python lines', () => {
  const { frames } = buildTrace([2, 1, 6, 4])
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
})
