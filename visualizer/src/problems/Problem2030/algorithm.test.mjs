import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: enumerate every index subset of size k and keep the lexicographically smallest valid string.
function oracle({ s, k, letter, repetition }) {
  const n = s.length
  let best = null
  for (let m = 0; m < 1 << n; m++) {
    let text = '', count = 0, size = 0
    for (let i = 0; i < n; i++) if (m & (1 << i)) { text += s[i]; size++; if (s[i] === letter) count++ }
    if (size !== k || count < repetition) continue
    if (best === null || text < best) best = text
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"s":"leet","k":3,"letter":"e","repetition":1}'), 'eet')
  assert.equal(solve('{"s":"leetcode","k":4,"letter":"e","repetition":2}'), 'ecde')
  assert.equal(solve('{"s":"bb","k":2,"letter":"b","repetition":2}'), 'bb')
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"s":"ab","k":1,"letter":"b","repetition":1}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random inputs match the subset oracle', () => {
  let state = 401
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rand(9) }, () => 'abc'[rand(3)]).join('')
    const k = 1 + rand(s.length)
    const letter = 'abc'[rand(3)]
    const have = s.split(letter).length - 1
    const repetition = rand(Math.min(k, have) + 1)
    const input = { s, k, letter, repetition }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
