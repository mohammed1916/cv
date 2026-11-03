import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(parseInput(JSON.stringify(values))).result

test('1085 sample arrays', () => {
  assert.equal(solve([42, 17, 8]), 1)
  assert.equal(solve([123, 45, 67]), 0)
  assert.equal(solve([7]), 0)
})

test('1085 minimum is found before digits are summed', () => {
  assert.equal(solve([10, 9, 99]), 0)
  assert.equal(solve([100, 200, 11]), 1)
  assert.equal(solve([999, 998]), 1)
})

test('1085 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /1 to 20/)
  assert.throws(() => parseInput('[0]'), /1 to 999/)
  assert.throws(() => parseInput('[1000]'), /1 to 999/)
  assert.throws(() => parseInput('[2.5]'), /1 to 999/)
})

test('1085 frames point at real code and Python lines', () => {
  const { frames } = buildTrace([42, 17, 8])
  const pyCount = python.split('\n').length
  for (const frame of frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount, frame.message)
  }
})

// Independent oracle: sort the values and take the first one, then sum digits by string split.
test('1085 random arrays match a sort-based oracle', () => {
  let seed = 1085
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(999))
    const smallest = [...values].sort((a, b) => a - b)[0]
    const sum = String(smallest).split('').reduce((acc, ch) => acc + Number(ch), 0)
    assert.equal(solve(values), sum % 2 === 0 ? 1 : 0, JSON.stringify(values))
  }
})
