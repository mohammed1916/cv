import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every single change (or none) and count valid pivots directly.
function oracle(nums, k) {
  const n = nums.length
  const count = arr => {
    let c = 0
    for (let p = 1; p < n; p++) {
      const left = arr.slice(0, p).reduce((a, b) => a + b, 0)
      const right = arr.slice(p).reduce((a, b) => a + b, 0)
      if (left === right) c++
    }
    return c
  }
  let best = count(nums)
  for (let i = 0; i < n; i++) {
    const copy = nums.slice()
    copy[i] = k
    best = Math.max(best, count(copy))
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"nums":[2,-1,2],"k":0}'), 2)
  assert.equal(solve('{"nums":[0,0,0],"k":1}'), 2)
  assert.equal(solve('{"nums":[1,-1,1,-1],"k":-1}'), 2)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"nums":[1,2],"k":0}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the single-change oracle', () => {
  let state = 373
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 2 + rand(7) }, () => rand(7) - 3)
    const k = rand(7) - 3
    assert.equal(solve(JSON.stringify({ nums, k })), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
