import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: a left-to-right greedy that takes two digits when the next one is a #.
function oracle(s) {
  let out = ''
  for (let i = 0; i < s.length;) {
    if (s[i + 2] === '#') { out += String.fromCharCode(96 + Number(s.slice(i, i + 2))); i += 3 }
    else { out += String.fromCharCode(96 + Number(s[i])); i += 1 }
  }
  return out
}

test('hand-checked samples decode', () => {
  assert.equal(buildTrace('12#3').result, 'lc')
  assert.equal(buildTrace('10#1').result, 'ja')
  assert.equal(buildTrace('25#15').result, 'yae')
})

test('random valid strings agree with the left-to-right oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const parts = []
    const n = 1 + rand(8)
    for (let k = 0; k < n; k++) {
      if (rand(2)) parts.push(String(10 + rand(17)) + '#')
      else parts.push(String(1 + rand(9)))
    }
    const s = parts.join('')
    assert.equal(buildTrace(s).result, oracle(s), s)
  }
})

test('every frame has a code line and a Python line', () => {
  for (const frame of buildTrace('25#15').frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 12, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('rejects invalid strings', () => {
  assert.throws(() => parseInput('27#'), /10 to 26/)
  assert.throws(() => parseInput('1a'), /Use only/)
  assert.throws(() => parseInput('#'), /two digits/)
})
