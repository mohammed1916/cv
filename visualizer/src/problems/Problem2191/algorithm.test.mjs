import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (mapping, nums) => buildTrace(parseInput(JSON.stringify({ mapping, nums }))).result

test('2191 worked examples', () => {
  assert.deepEqual(solve([8, 9, 4, 0, 2, 1, 3, 5, 7, 6], [991, 338, 38]), [338, 38, 991])
  assert.deepEqual(solve([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [789, 456, 123]), [123, 456, 789])
  assert.deepEqual(solve([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [5, 0, 7]), [5, 0, 7])
  assert.deepEqual(solve([9, 9, 9, 9, 9, 9, 9, 9, 9, 0], [0, 10]), [0, 10])
})

test('2191 rejects invalid input', () => {
  assert.throws(() => parseInput('{"mapping":[1,2],"nums":[1]}'))
  assert.throws(() => parseInput('{"mapping":[0,1,2,3,4,5,6,7,8,9],"nums":[]}'))
  assert.throws(() => parseInput('{"mapping":[0,1,2,3,4,5,6,7,8,10],"nums":[1]}'))
})

test('2191 random inputs match a stable sort on mapped strings', () => {
  let seed = 2191
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const mapping = Array.from({ length: 10 }, () => rnd(10))
    const nums = Array.from({ length: 1 + rnd(7) }, () => rnd(1000))
    const expected = nums.map((x, i) => ({ x, i, m: Number(String(x).split('').map(d => mapping[+d]).join('')) }))
      .sort((a, b) => a.m - b.m || a.i - b.i).map(o => o.x)
    assert.deepEqual(solve(mapping, nums), expected, JSON.stringify({ mapping, nums }))
  }
})

test('2191 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"mapping":[8,3,4,0,2,1,3,5,7,6],"nums":[991,338]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
