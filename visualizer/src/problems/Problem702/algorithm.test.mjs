import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, target) => buildTrace({ arr, target }).result

test('702 official examples', () => {
  assert.equal(solve([-1, 0, 3, 5, 9, 12], 9), 4)
  assert.equal(solve([-1, 0, 3, 5, 9, 12], 2), -1)
})

test('702 rejects an unsorted array', () => {
  assert.throws(() => parseInput('{"arr":[3,1],"target":1}'))
})

test('702 every target in and around a larger array', () => {
  const arr = Array.from({ length: 25 }, (_, i) => i * 3 - 20)
  for (let target = -25; target <= 60; target++) {
    assert.equal(solve(arr, target), arr.indexOf(target), `target ${target}`)
  }
})

// Independent oracle: the reader returns the same values as a plain array lookup, so indexOf is the answer.
test('702 random sorted arrays match indexOf', () => {
  let seed = 71
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const values = new Set()
    const size = 1 + rnd(30)
    while (values.size < size) values.add(rnd(201) - 100)
    const arr = [...values].sort((a, b) => a - b)
    const target = rnd(201) - 100
    assert.equal(solve(arr, target), arr.indexOf(target), JSON.stringify({ arr, target }))
  }
})
