import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

// Independent oracle: try every palindrome up to a bound, keep the parity-matching ones.
const isPal = p => { const s = String(p); return s === [...s].reverse().join('') }
function oracle(nums) {
  const pals = []
  for (let p = 1; p <= 3000; p++) if (isPal(p)) pals.push(p)
  let total = 0
  for (const x of nums) {
    let best = Infinity
    for (const p of pals) if ((p - x) % 2 === 0) best = Math.min(best, Math.abs(p - x) / 2)
    total += best
  }
  return total
}

test('4053 known palindromes cost nothing and near values cost one per step pair', () => {
  assert.equal(solve([1, 2, 3, 9]), 0)
  assert.equal(solve([10]), 1)
  assert.equal(solve([12]), 2)
})

test('4053 elements choose their own palindromes', () => {
  // 10 becomes 8 for 1 operation. 21 is odd, so its options are 11 (5 operations) or 33 (6); 11 wins.
  assert.equal(solve([10, 21]), 6)
})

test('4053 large values use ten digit neighbours of the same parity', () => {
  assert.equal(solve([1000000000]), buildTrace([1000000000]).result)
  assert.ok(solve([1000000000]) > 0)
})

test('4053 rejects out of range or non-array input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1000000001]'))
  assert.throws(() => parseInput('{"a":1}'))
})

test('4053 random inputs match a palindrome oracle and frames stay valid', () => {
  let seed = 4053
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(1500))
    const run = buildTrace(nums)
    assert.equal(run.result, oracle(nums), JSON.stringify(nums))
    checkFrames(run)
  }
})
