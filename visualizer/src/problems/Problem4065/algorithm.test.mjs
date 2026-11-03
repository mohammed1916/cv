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

// Independent oracle: rounds written with plain arrays.
function oracle(nums) {
  let rest = [...nums]
  const out = []
  while (rest.length) {
    const distinct = [...new Set(rest)].sort((a, b) => a - b)
    out.push(...distinct)
    for (const v of distinct) rest.splice(rest.indexOf(v), 1)
  }
  return out
}

test('4065 one round per copy of the most repeated value', () => {
  assert.deepEqual(solve([1, 1, 2, 2, 3]), [1, 2, 3, 1, 2])
  assert.deepEqual(solve([5]), [5])
})

test('4065 each round takes distinct values in increasing order', () => {
  assert.deepEqual(solve([9, 3, 9, 3, 9, 1]), [1, 3, 9, 3, 9, 9])
})

test('4065 random arrays match the array oracle and frames stay valid', () => {
  let seed = 4065
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    const run = buildTrace(nums)
    assert.deepEqual(run.result, oracle(nums), JSON.stringify(nums))
    assert.equal(run.result.length, nums.length)
    checkFrames(run)
  }
})

test('4065 rejects out of range values', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('[0]'))
})
