import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')

test('2460 worked examples', () => {
  assert.deepEqual(solve([2, 2, 4, 4, 0]), [4, 8, 0, 0, 0])
  assert.deepEqual(solve([3, 3, 1]), [6, 1, 0])
})

test('2460 doubling does not cascade past the pair', () => {
  assert.deepEqual(solve([2, 2, 2, 2]), [4, 4, 0, 0])
})

test('2460 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [2, 2, 0] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2460 rejects a single element', () => {
  assert.throws(() => parseInput('{"nums":[1]}'))
})

function oracle(nums) {
  const a = [...nums]
  for (let i = 0; i < a.length - 1; i++) if (a[i] === a[i + 1]) { a[i] *= 2; a[i + 1] = 0 }
  const nz = a.filter(x => x !== 0)
  return [...nz, ...Array(a.length - nz.length).fill(0)]
}

test('2460 random inputs match a brute-force oracle', () => {
  let seed = 2460
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(8) }, () => rnd(4))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
