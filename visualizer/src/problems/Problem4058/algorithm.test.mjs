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

const pulse = a => a.reduce((sum, v, k) => sum + (k % 2 === 0 ? v : -v), 0)

// Independent oracle: rotate every segment of length two or more and keep the best pulse.
function oracle(a) {
  let best = pulse(a)
  for (let l = 0; l < a.length; l++) {
    for (let r = l + 1; r < a.length; r++) {
      const rotated = [...a.slice(0, l), ...a.slice(l + 1, r + 1), a[l], ...a.slice(r + 1)]
      best = Math.max(best, pulse(rotated))
    }
  }
  return best
}

test('4058 a single element or an unhelpful array keeps its pulse', () => {
  assert.equal(solve([7]), 7)
  assert.equal(solve([5, 1]), 4) // rotating gives 1 - 5 = -4, so the unchanged 5 - 1 = 4 stays
})

test('4058 a rotation can move a large value into a positive slot', () => {
  assert.equal(solve([1, 2]), 1) // rotate to [2, 1]: 2 - 1 = 1
  assert.equal(solve([3, 1, 4]), 6) // no rotation beats 3 - 1 + 4
})

test('4058 the gain formula matches a direct recount', () => {
  assert.equal(solve([-2, 9, -4, 6]), oracle([-2, 9, -4, 6]))
  assert.equal(solve([10, -3, 8, -7, 2]), oracle([10, -3, 8, -7, 2]))
})

test('4058 rejects values outside the limits', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1000000001]'))
})

test('4058 random arrays match the segment oracle and frames stay valid', () => {
  let seed = 4058
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const a = Array.from({ length: 1 + rnd(8) }, () => rnd(41) - 20)
    const run = buildTrace(a)
    assert.equal(run.result, oracle(a), JSON.stringify(a))
    checkFrames(run)
  }
})
