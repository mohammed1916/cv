import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function oracle(letters, target) {
  return letters.find(c => c > target) ?? letters[0]
}

test('744 worked examples', () => {
  assert.equal(buildTrace({ letters: ['c', 'f', 'j'], target: 'a' }).result, 'c')
  assert.equal(buildTrace({ letters: ['c', 'f', 'j'], target: 'k' }).result, 'c')
  assert.equal(buildTrace({ letters: ['c', 'f', 'j'], target: 'j' }).result, 'c')
})

test('744 random sorted letters match a linear scan', () => {
  let state = 744
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 1000; t++) {
    const letters = Array.from({ length: 2 + rand(10) }, () => String.fromCharCode(97 + rand(26))).sort()
    const target = String.fromCharCode(97 + rand(26))
    assert.equal(buildTrace({ letters, target }).result, oracle(letters, target), JSON.stringify({ letters, target }))
  }
})

test('744 rejects unsorted letters', () => {
  assert.throws(() => parseInput('{"letters":["d","a"],"target":"b"}'))
})
