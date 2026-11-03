import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, s) => buildTrace({ n, s }).result

test('4000 small hand cases', () => {
  assert.equal(solve(1, 0), 0)
  assert.equal(solve(1, 9), 9)
  assert.equal(solve(1, 10), -1)
  assert.equal(solve(3, 30), -1)
  assert.equal(solve(3, 10), 910)
  assert.equal(solve(4, 23), 9950)
})

test('4000 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"n":0,"s":1}'))
  assert.throws(() => parseInput('{"n":2,"s":-1}'))
})

// Brute oracle: scan every integer below 10^n.
test('4000 matches a brute-force scan', () => {
  for (let n = 1; n <= 4; n++) {
    const best = new Map()
    for (let v = 0; v < 10 ** n; v++) {
      const sum = String(v).split('').reduce((a, c) => a + Number(c), 0)
      best.set(sum, v)
    }
    for (let s = 0; s <= 9 * n + 3; s++) {
      assert.equal(solve(n, s), best.has(s) ? best.get(s) : -1, `n=${n} s=${s}`)
    }
  }
})

test('4000 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ n: 4, s: 23 })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(f.digits.reduce((a, b) => a + b, 0) <= 23)
  }
})
