import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every k-subset of a small list.
function oracle(nums, k) {
  let best = Infinity
  const pick = (start, chosen) => {
    if (chosen.length === k) { best = Math.min(best, Math.max(...chosen) - Math.min(...chosen)); return }
    for (let i = start; i < nums.length; i++) pick(i + 1, [...chosen, nums[i]])
  }
  pick(0, [])
  return best
}

test('examples', () => {
  assert.equal(solve('{"nums":[90],"k":1}'), 0)
  assert.equal(solve('{"nums":[9,4,1,7],"k":2}'), 2)
  assert.equal(solve('{"nums":[1,2,3,4,10],"k":3}'), 2)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"nums":[9,4,1,7],"k":2}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the subset oracle', () => {
  let state = 31
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rand(8)
    const nums = Array.from({ length: n }, () => rand(50))
    const k = 1 + rand(n)
    assert.equal(solve(JSON.stringify({ nums, k })), oracle(nums, k))
  }
})
