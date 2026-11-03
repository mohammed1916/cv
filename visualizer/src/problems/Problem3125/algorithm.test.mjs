import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('3125 worked values', () => {
  assert.equal(solve(22), 9)
  assert.equal(solve(8), 7)
  assert.equal(solve(1), 0)
  assert.equal(solve(5), 2)
  assert.equal(solve(4), 3)
})

test('3125 matches a brute-force scan of every smaller x', () => {
  for (let n = 1; n <= 300; n++) {
    let best = -1
    for (let x = 0; x < n; x++) if ((x & n) === 0) best = x
    assert.equal(solve(n), best, `n=${n}`)
  }
})

test('3125 frames carry real pseudocode and python lines and the running x', () => {
  const run = buildTrace({ n: 22 })
  const pythonLines = 7
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 6, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLines, `pythonLine ${frame.pythonLine}`)
    assert.ok(frame.x >= 0 && frame.x < 22)
    assert.equal(typeof frame.message, 'string')
  }
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).x, 9)
})

test('3125 parse rejects values outside a positive integer', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('2.5'))
  assert.throws(() => parseInput('"12"'))
  assert.equal(parseInput('22').n, 22)
})
