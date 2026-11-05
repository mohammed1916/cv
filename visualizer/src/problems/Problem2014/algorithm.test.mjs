import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: enumerate every subsequence of s, keep those repeated k times, pick longest then largest.
function oracle(s, k) {
  let best = ''
  for (let m = 1; m < 1 << s.length; m++) {
    let seq = ''
    for (let i = 0; i < s.length; i++) if (m & (1 << i)) seq += s[i]
    const full = seq.repeat(k)
    let j = 0
    for (const ch of s) if (j < full.length && ch === full[j]) j++
    if (j !== full.length) continue
    if (seq.length > best.length || (seq.length === best.length && seq > best)) best = seq
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"s":"letsleetcode","k":2}'), 'let')
  assert.equal(solve('{"s":"bb","k":2}'), 'b')
  assert.equal(solve('{"s":"ab","k":2}'), '')
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"s":"aabb","k":2}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random strings match the subsequence oracle', () => {
  let state = 419
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const s = Array.from({ length: 2 + rand(10) }, () => 'abc'[rand(3)]).join('')
    const k = 2 + rand(2)
    assert.equal(solve(JSON.stringify({ s, k })), oracle(s, k), `${s} ${k}`)
  }
})
