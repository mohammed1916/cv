import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2195 worked examples', () => {
  assert.equal(solve([5, 6, 8], 2), 3)
  assert.equal(solve([1, 2, 3], 2), 9)
  assert.equal(solve([7], 3), 6)
  assert.equal(solve([2, 2, 4], 1), 1)
})

test('2195 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
})

function oracle(nums, k) {
  const taken = new Set(nums)
  let total = 0
  let x = 1
  let placed = 0
  while (placed < k) { if (!taken.has(x)) { total += x; placed++ } x++ }
  return total
}

test('2195 random inputs match a direct scan of free integers', () => {
  let seed = 2195
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(20))
    const k = 1 + rnd(10)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('2195 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums":[5,6,8],"k":2}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
