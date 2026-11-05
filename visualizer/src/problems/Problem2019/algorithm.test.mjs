import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: every way to pair up operators as a binary tree, built recursively on token lists.
function orders(tokens) {
  if (tokens.length === 1) return new Set([tokens[0]])
  const out = new Set()
  for (let i = 1; i < tokens.length; i += 2) {
    const left = tokens.slice(0, i), right = tokens.slice(i + 1)
    const op = tokens[i]
    for (const a of orders(left)) for (const b of orders(right)) out.add(op === '+' ? a + b : a * b)
  }
  return out
}
function oracle(s, answers) {
  const tokens = s.match(/\d|[+*]/g).map(t => (/\d/.test(t) ? Number(t) : t))
  const nums = s.split(/[+*]/).map(Number)
  const ops = s.match(/[+*]/g) ?? []
  let total = 0, term = nums[0]
  for (let k = 0; k < ops.length; k++) { if (ops[k] === '*') term *= nums[k + 1]; else { total += term; term = nums[k + 1] } }
  const correct = total + term
  const all = orders(tokens)
  return answers.reduce((sum, a) => sum + (a === correct ? 5 : all.has(a) ? 2 : 0), 0)
}

test('examples', () => {
  assert.equal(solve('{"s":"2+3*4","answers":[14,20,5,11,0]}'), 7)
  assert.equal(solve('{"s":"1+2*3","answers":[7,9,6,0]}'), 7)
  assert.equal(solve('{"s":"3+4","answers":[7,12,0]}'), 5)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"s":"2+3*4","answers":[14]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random expressions match the enumeration oracle', () => {
  let state = 307
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const count = 2 + rand(4)
    let s = String(rand(10))
    for (let i = 1; i < count; i++) s += '+*'[rand(2)] + String(rand(10))
    const answers = Array.from({ length: 1 + rand(6) }, () => rand(60))
    assert.equal(solve(JSON.stringify({ s, answers })), oracle(s, answers), JSON.stringify({ s, answers }))
  }
})
