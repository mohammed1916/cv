import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: enumerate every subsequence by bitmask and keep the distinct good ones.
function oracle(s) {
  const seen = new Set()
  for (let mask = 1; mask < 1 << s.length; mask++) {
    let t = ''
    for (let i = 0; i < s.length; i++) if (mask & (1 << i)) t += s[i]
    if (t === '0' || t[0] === '1') seen.add(t)
  }
  return seen.size
}

test('examples', () => {
  assert.equal(solve('{"binary":"001"}'), 2)
  assert.equal(solve('{"binary":"0110"}'), 5)
  assert.equal(solve('{"binary":"10"}'), 3)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"binary":"01"}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random strings match the enumeration oracle', () => {
  let state = 67
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(10)
    const s = Array.from({ length: n }, () => String(rand(2))).join('')
    assert.equal(solve(JSON.stringify({ binary: s })), oracle(s), s)
  }
})
