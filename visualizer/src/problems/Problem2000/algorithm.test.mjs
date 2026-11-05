import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: slice, reverse, and join.
function oracle(word, ch) {
  const i = word.indexOf(ch)
  if (i === -1) return word
  return word.slice(0, i + 1).split('').reverse().join('') + word.slice(i + 1)
}

test('examples', () => {
  assert.equal(solve('{"word":"abcdefd","ch":"d"}'), 'dcbaefd')
  assert.equal(solve('{"word":"xyxzxe","ch":"z"}'), 'zxyxxe')
  assert.equal(solve('{"word":"abcd","ch":"z"}'), 'abcd')
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"word":"abc","ch":"c"}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random words match the slice oracle', () => {
  let state = 173
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const word = Array.from({ length: 1 + rand(12) }, () => 'abcde'[rand(5)]).join('')
    const ch = 'abcdez'[rand(6)]
    assert.equal(solve(JSON.stringify({ word, ch })), oracle(word, ch), `${word} ${ch}`)
  }
})
