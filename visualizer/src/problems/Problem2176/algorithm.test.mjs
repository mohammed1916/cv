import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2176 worked examples', () => {
  assert.equal(solve('{"nums":[3,1,2,2,2,1,3],"k":2}'), 4)
  assert.equal(solve('{"nums":[1,2,3,4],"k":1}'), 0)
  assert.equal(solve('{"nums":[5,5],"k":1}'), 1)
  assert.equal(solve('{"nums":[5,5,5],"k":2}'), 3)
})

test('2176 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
  assert.throws(() => parseInput('{"nums":[10],"k":1}'))
})

test('2176 random inputs match a direct pair count', () => {
  let seed = 2176
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(3))
    const k = 1 + rnd(6)
    let expected = 0
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] === nums[j] && (i * j) % k === 0) expected++
    assert.equal(solve(JSON.stringify({ nums, k })), expected)
  }
})

test('2176 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums":[3,1,2],"k":2}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
