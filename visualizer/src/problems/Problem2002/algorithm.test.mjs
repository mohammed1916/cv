import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: enumerate every pair of disjoint index sets and test palindromes by brute force (small n).
function isPal(t) { return t === t.split('').reverse().join('') }
function palLen(chars) {
  let best = 0
  for (let m = 1; m < 1 << chars.length; m++) {
    let t = ''
    for (let i = 0; i < chars.length; i++) if (m & (1 << i)) t += chars[i]
    if (isPal(t)) best = Math.max(best, t.length)
  }
  return best
}
function oracle(s) {
  const n = s.length
  let best = 0
  for (let a = 0; a < 3 ** n; a++) {
    let code = a
    const A = [], B = []
    for (let i = 0; i < n; i++) { const d = code % 3; code = Math.floor(code / 3); if (d === 1) A.push(s[i]); if (d === 2) B.push(s[i]) }
    best = Math.max(best, palLen(A) * palLen(B))
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"s":"ababbb"}'), 9)
  assert.equal(solve('{"s":"zaaaxbbby"}'), 9)
  assert.equal(solve('{"s":"ab"}'), 1)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"s":"abc"}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random short strings match the exhaustive oracle', () => {
  let state = 191
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 40; t++) {
    const s = Array.from({ length: 2 + rand(5) }, () => 'abc'[rand(3)]).join('')
    assert.equal(solve(JSON.stringify({ s })), oracle(s), s)
  }
})
