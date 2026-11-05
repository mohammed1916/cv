import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: compare as BigInt values, sort descending.
const oracle = (nums, k) => [...nums].sort((a, b) => (BigInt(b) > BigInt(a) ? 1 : BigInt(b) < BigInt(a) ? -1 : 0))[k - 1]

test('examples', () => {
  assert.equal(solve('{"nums":["3","6","7","10"],"k":4}'), '3')
  assert.equal(solve('{"nums":["2","21","12","1"],"k":3}'), '2')
  assert.equal(solve('{"nums":["0","0"],"k":2}'), '0')
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"nums":["3","6"],"k":1}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the BigInt oracle', () => {
  let state = 41
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rand(10)
    const nums = Array.from({ length: n }, () => String(rand(10) === 0 ? 0 : 1 + rand(10 ** (1 + rand(12)))))
    const k = 1 + rand(n)
    assert.equal(solve(JSON.stringify({ nums, k })), oracle(nums, k))
  }
})
