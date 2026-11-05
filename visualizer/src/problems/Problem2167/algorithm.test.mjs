import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2167 worked examples', () => {
  assert.equal(solve('1100101'), 5)
  assert.equal(solve('0010'), 2)
  assert.equal(solve('0000'), 0)
  assert.equal(solve('1'), 1)
  assert.equal(solve('11'), 2)
})

test('2167 rejects invalid input', () => {
  assert.throws(() => parseInput('102'))
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('1'.repeat(17)))
})

// Oracle: try every removal of a prefix and a suffix, and pay 2 for each illegal car in the middle.
function oracle(s) {
  const n = s.length
  let best = Infinity
  for (let a = 0; a <= n; a++) for (let b = a; b <= n; b++) {
    let cost = a + (n - b)
    for (let k = a; k < b; k++) if (s[k] === '1') cost += 2
    best = Math.min(best, cost)
  }
  return best
}

test('2167 random strings match an enumeration oracle', () => {
  let seed = 2167
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(9) }, () => (rnd(2) ? '1' : '0')).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('2167 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('1100101')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
