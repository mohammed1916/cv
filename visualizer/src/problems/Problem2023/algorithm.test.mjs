import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('examples', () => {
  assert.equal(solve('{"nums":["777","7","77","77"],"target":"7777"}'), 4)
  assert.equal(solve('{"nums":["123","4","12","34"],"target":"1234"}'), 2)
  assert.equal(solve('{"nums":["1","1","1"],"target":"11"}'), 6)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"nums":["1","2"],"target":"12"}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match a string-concatenation oracle', () => {
  let state = 359
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 2 + rand(6) }, () => String(1 + rand(99)))
    const target = String(1 + rand(9999)).padStart(2, '0')
    let expected = 0
    for (let i = 0; i < nums.length; i++) for (let j = 0; j < nums.length; j++) if (i !== j && nums[i] + nums[j] === target) expected++
    assert.equal(solve(JSON.stringify({ nums, target })), expected, JSON.stringify({ nums, target }))
  }
})
