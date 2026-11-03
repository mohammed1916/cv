import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = values => buildTrace(values).result

test('1064 sample inputs give the smallest fixed index', () => {
  assert.equal(solve([-3, 1, 2, 3, 7]), 1)
  assert.equal(solve([-2, 0, 1, 3, 5]), 3)
  assert.equal(solve([-6, -2, 1, 4, 9]), -1)
})

test('1064 edge shapes', () => {
  assert.equal(solve([0]), 0)
  assert.equal(solve([1]), -1)
  assert.equal(solve([-5]), -1)
  assert.equal(solve([0, 1, 2, 3]), 0)
})

test('1064 rejects non-increasing and out-of-range input', () => {
  assert.throws(() => parseInput('[1,1]'), /strictly increasing/)
  assert.throws(() => parseInput('[3,2]'), /strictly increasing/)
  assert.throws(() => parseInput('[51]'), /-50 to 50/)
  assert.throws(() => parseInput('[]'), /1 to 30/)
})

test('1064 every frame points at a real code and Python line', () => {
  const { frames } = buildTrace([-2, 0, 1, 3, 5])
  const pyCount = python.split('\n').length
  for (const frame of frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount, frame.message)
  }
})

// Independent oracle: check every index.
function oracle(values) {
  const i = values.findIndex((v, index) => v === index)
  return i
}

test('1064 random strictly increasing arrays match a linear oracle', () => {
  let seed = 1064
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const length = 1 + rnd(30)
    const values = []
    let current = rnd(40) - 25
    for (let i = 0; i < length; i++) {
      values.push(current)
      current += 1 + rnd(3)
      if (current > 50) break
    }
    const input = JSON.stringify(values)
    parseInput(input)
    assert.equal(solve(parseInput(input)), oracle(values), input)
  }
})
