import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: compare every pair by cross-multiplication.
function oracle(rects) {
  let count = 0
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    if (rects[i][0] * rects[j][1] === rects[j][0] * rects[i][1]) count++
  }
  return count
}

test('examples', () => {
  assert.equal(solve('[[4,8],[3,6],[10,20],[15,30]]'), 6)
  assert.equal(solve('[[4,5],[7,8]]'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[[4,8],[3,6]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random rectangles match the cross-multiplication oracle', () => {
  let state = 181
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const rects = Array.from({ length: 1 + rand(15) }, () => [1 + rand(6), 1 + rand(6)])
    assert.equal(solve(JSON.stringify(rects)), oracle(rects), JSON.stringify(rects))
  }
})
