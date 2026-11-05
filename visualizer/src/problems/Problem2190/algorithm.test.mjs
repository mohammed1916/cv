import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, key) => buildTrace(parseInput(JSON.stringify({ nums, key }))).result

test('2190 worked examples', () => {
  assert.equal(solve([1, 100, 200, 1, 100], 1), 100)
  assert.equal(solve([2, 2, 2, 2, 3], 2), 2)
  assert.equal(solve([1, 2, 3, 1, 3], 1), 2)
  assert.equal(solve([4, 5], 4), 5)
})

test('2190 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[1],"key":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"key":3}'))
  assert.throws(() => parseInput('{"nums":[1,201],"key":1}'))
})

test('2190 random arrays with a unique leader match a direct count', () => {
  let seed = 2190
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(9) }, () => rnd(5))
    const key = nums[rnd(nums.length)]
    const counts = new Map()
    for (let i = 0; i + 1 < nums.length; i++) if (nums[i] === key) counts.set(nums[i + 1], (counts.get(nums[i + 1]) || 0) + 1)
    const top = Math.max(0, ...counts.values())
    const leaders = [...counts.entries()].filter(([, c]) => c === top).map(([v]) => v)
    if (leaders.length !== 1) continue
    assert.equal(solve(nums, key), leaders[0], JSON.stringify({ nums, key }))
  }
})

test('2190 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums":[1,100,200,1,100],"key":1}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
