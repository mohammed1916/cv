import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (mountain, target) => buildTrace({ mountain, target }).result

test('1095 official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 3, 1], 3), 2)
  assert.equal(solve([0, 1, 2, 4, 2, 1], 3), -1)
})

test('1095 the smaller index wins when the target is on both slopes', () => {
  assert.equal(solve([1, 3, 5, 3, 1], 3), 1)
  assert.equal(solve([1, 3, 5, 3, 1], 5), 2)
})

test('1095 rejects a sequence that is not a mountain', () => {
  assert.throws(() => parseInput('{"mountain":[1,3,2,2,1],"target":2}'), /strictly decrease/)
  assert.throws(() => parseInput('{"mountain":[1,2,3],"target":2}'), /peak/)
})

// Independent oracle: a plain scan from the left returns the first index holding the target.
function oracle(mountain, target) {
  const index = mountain.indexOf(target)
  return index
}

test('1095 random mountains match a linear-scan oracle', () => {
  let seed = 1095
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 3 + rnd(12)
    const pool = new Set()
    while (pool.size < size) pool.add(rnd(40))
    const values = [...pool].sort((a, b) => a - b)
    const peakValue = values.pop()
    const left = []
    const right = []
    for (const v of values) (rnd(2) ? left : right).push(v)
    if (left.length === 0 || right.length === 0) continue
    left.sort((a, b) => a - b)
    right.sort((a, b) => b - a)
    const mountain = [...left, peakValue, ...right]
    const target = rnd(41)
    assert.equal(solve(mountain, target), oracle(mountain, target), JSON.stringify({ mountain, target }))
  }
})
