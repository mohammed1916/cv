import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: a regular expression that inserts a dot before each group of three digits counted from the right.
const oracle = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

test('hand-checked values', () => {
  assert.equal(buildTrace(0).result, '0')
  assert.equal(buildTrace(999).result, '999')
  assert.equal(buildTrace(1000).result, '1.000')
  assert.equal(buildTrace(123456789).result, '123.456.789')
  assert.equal(buildTrace(2147483647).result, '2.147.483.647')
})

test('boundary and random values agree with the oracle', () => {
  for (let n = 0; n < 2000; n++) assert.equal(buildTrace(n).result, oracle(n), `n=${n}`)
  let state = 31
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = rand(2147483648)
    assert.equal(buildTrace(n).result, oracle(n), `n=${n}`)
  }
})

test('every frame points at real code and Python lines', () => {
  for (const frame of buildTrace(1234567).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('malformed input is rejected', () => {
  assert.equal(parseInput('42'), 42)
  assert.throws(() => parseInput('0123'), /leading zeros/)
  assert.throws(() => parseInput('2147483648'), /0 to 2147483647/)
  assert.throws(() => parseInput('-1'), /whole number/)
})
