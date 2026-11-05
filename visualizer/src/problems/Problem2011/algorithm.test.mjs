import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: evaluate each operation by its literal text.
function oracle(ops) {
  let x = 0
  for (const op of ops) {
    if (op === '++X' || op === 'X++') x += 1
    else x -= 1
  }
  return x
}

test('examples', () => {
  assert.equal(solve('["--X","X++","X++"]'), 1)
  assert.equal(solve('["++X","++X","X++"]'), 3)
  assert.equal(solve('["X++","++X","--X","X--"]'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('["X++"]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random operation lists match the oracle', () => {
  let state = 251
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  const ops = ['++X', 'X++', '--X', 'X--']
  for (let t = 0; t < 100; t++) {
    const list = Array.from({ length: 1 + rand(30) }, () => ops[rand(4)])
    assert.equal(solve(JSON.stringify(list)), oracle(list))
  }
})
