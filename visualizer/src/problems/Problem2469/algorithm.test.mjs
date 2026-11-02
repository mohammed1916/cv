import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const close = (actual, expected) => {
  assert.equal(actual.length, expected.length)
  actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-5, `${v} vs ${expected[i]}`))
}
const PY = python.split('\n')

test('2469 worked examples', () => {
  close(buildTrace({ celsius: 36.5 }).result, [309.65, 97.7])
  close(buildTrace({ celsius: 122.11 }).result, [395.26, 251.798])
})

test('2469 freezing point', () => {
  close(buildTrace({ celsius: 0 }).result, [273.15, 32])
})

test('2469 frames point at real python lines', () => {
  for (const f of buildTrace({ celsius: 10 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2469 rejects a negative input', () => {
  assert.throws(() => parseInput('{"celsius":-1}'))
})
