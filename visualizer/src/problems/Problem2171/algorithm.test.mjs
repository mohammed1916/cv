import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2171 worked examples', () => {
  assert.equal(solve('[4,1,6,5]'), 4)
  assert.equal(solve('[2,10,3,2]'), 7)
  assert.equal(solve('[7]'), 0)
  assert.equal(solve('[3,3,3]'), 0)
})

test('2171 rejects invalid input', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[21]'))
})

function oracle(beans) {
  let best = Infinity
  for (let x = 1; x <= 20; x++) {
    let removed = 0
    for (const b of beans) removed += b >= x ? b - x : b
    best = Math.min(best, removed)
  }
  return best
}

test('2171 random bags match a target-value oracle', () => {
  let seed = 2171
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const beans = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(12))
    assert.equal(solve(JSON.stringify(beans)), oracle(beans), JSON.stringify(beans))
  }
})

test('2171 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[4,1,6,5]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
