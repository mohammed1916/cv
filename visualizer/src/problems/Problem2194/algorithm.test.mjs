import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2194 worked examples', () => {
  assert.deepEqual(solve('A1:C2'), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  assert.deepEqual(solve('D4:D4'), ['D4'])
  assert.deepEqual(solve('B3:C3'), ['B3', 'C3'])
})

test('2194 rejects invalid input', () => {
  assert.throws(() => parseInput('C1:A2'))
  assert.throws(() => parseInput('A1-B2'))
  assert.throws(() => parseInput('A0:B2'))
  assert.throws(() => parseInput('A1:G2'))
})

test('2194 every range has the expected count and order', () => {
  for (const c2 of 'ABCDEF') for (const r2 of [1, 5, 9]) {
    const cells = solve(`A1:${c2}${r2}`)
    assert.equal(cells.length, (c2.charCodeAt(0) - 64) * r2)
    assert.equal(cells[0], 'A1')
    assert.equal(cells[cells.length - 1], `${c2}${r2}`)
  }
})

test('2194 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('A1:B2')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
