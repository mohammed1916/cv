import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const valid = (answer, nums) => answer.length === nums.length && /^[01]+$/.test(answer) && !nums.includes(answer)

test('examples give a valid string absent from the input', () => {
  for (const text of ['["01","10"]', '["00","01"]', '["111","011","001"]']) {
    const nums = JSON.parse(text)
    assert.ok(valid(solve(text), nums))
  }
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('["01","10"]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random unique inputs always yield an absent string', () => {
  let state = 9
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(6)
    const all = Array.from({ length: 2 ** n }, (_, v) => v.toString(2).padStart(n, '0'))
    const nums = []
    while (nums.length < n) {
      const pick = all[rand(all.length)]
      if (!nums.includes(pick)) nums.push(pick)
    }
    assert.ok(valid(solve(JSON.stringify(nums)), nums))
  }
})
