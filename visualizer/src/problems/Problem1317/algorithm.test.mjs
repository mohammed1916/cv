import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const valid = (a, b, n) => a > 0 && b > 0 && a + b === n && !`${a}${b}`.includes('0') && !String(a).includes('0') && !String(b).includes('0')

test('hand-checked samples', () => {
  assert.deepEqual(buildTrace(11).result, [2, 9])
  assert.deepEqual(buildTrace(101).result, [2, 99])
  assert.deepEqual(buildTrace(1000).result, [1, 999])
})

test('every n in range has a valid answer, matching the direct search', () => {
  for (let n = 2; n <= 400; n++) {
    const [a, b] = buildTrace(n).result
    assert.ok(valid(a, b, n), `n=${n}`)
    let first = null
    for (let x = 1; x < n && first === null; x++) if (valid(x, n - x, n)) first = x
    assert.equal(a, first, `n=${n}`)
  }
})

test('every frame points at a real code line and Python line', () => {
  for (const frame of buildTrace(101).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('rejects bad input', () => {
  assert.throws(() => parseInput('1'), /2 to 10000/)
  assert.throws(() => parseInput('10001'), /2 to 10000/)
  assert.throws(() => parseInput('abc'), /whole number/)
})
