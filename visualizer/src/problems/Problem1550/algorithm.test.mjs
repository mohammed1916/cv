import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: look for any window of three positions whose values are all odd.
const oracle = arr => {
  for (let i = 0; i + 2 < arr.length; i++) if (arr.slice(i, i + 3).every(v => Math.abs(v) % 2 === 1)) return true
  return false
}

test('a run that appears late is found', () => {
  assert.equal(buildTrace([2, 6, 4, 1, 3, 5, 7]).result, true)
})

test('runs broken by an even value are not counted', () => {
  assert.equal(buildTrace([1, 2, 3, 4, 5]).result, false)
  assert.equal(buildTrace([-3]).result, false)
})

test('random arrays agree with the window oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rand(15) }, () => rand(41) - 20)
    assert.equal(buildTrace(arr).result, oracle(arr), JSON.stringify(arr))
  }
})

test('every frame points at real code and Python lines', () => {
  for (const frame of buildTrace([1, 3, 4, 5]).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[]'), /1 to 20/)
  assert.throws(() => parseInput('[1.5]'), /integers/)
})
