import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const solve = n => buildTrace({ n }).result

function rangeAnd(lo, hi) {
  let acc = lo
  for (let v = lo + 1; v <= hi; v++) acc &= v
  return acc
}

test('3125 worked values', () => {
  assert.equal(solve(7), 3)
  assert.equal(solve(9), 7)
  assert.equal(solve(17), 15)
  assert.equal(solve(1), 0)
  assert.equal(solve(22), 15)
})

test('3125 matches a brute-force search over every x from n down', () => {
  for (let n = 1; n <= 300; n++) {
    let best = -1
    for (let x = n; x >= 0; x--) if (rangeAnd(x, n) === 0) { best = x; break }
    assert.equal(solve(n), best, `n=${n}`)
  }
})

test('3125 frames carry real pseudocode and python lines and the running x', () => {
  const run = buildTrace({ n: 22 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 7, `pythonLine ${frame.pythonLine}`)
    assert.ok(frame.x >= 0 && frame.x < 22)
    assert.equal(typeof frame.message, 'string')
  }
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).x, 15)
})

test('3125 parse rejects values outside a positive integer', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('2.5'))
  assert.throws(() => parseInput('"12"'))
  assert.equal(parseInput('22').n, 22)
})
