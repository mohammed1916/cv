import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (destination, k) => buildTrace(parseInput(JSON.stringify({ destination, k }))).result

test('1643 official examples', () => {
  assert.equal(solve([2, 3], 1), 'HHHVV')
  assert.equal(solve([2, 3], 2), 'HHVHV')
  assert.equal(solve([2, 3], 3), 'HHVVH')
})

test('1643 the last path is all V then H', () => {
  assert.equal(solve([1, 1], 2), 'VH')
  assert.equal(solve([3, 1], 4), 'VVVH')
})

test('1643 rejects bad input', () => {
  assert.throws(() => parseInput('{"destination":[2,3],"k":11}'))
  assert.throws(() => parseInput('{"destination":[0,3],"k":1}'))
  assert.throws(() => parseInput('{"destination":[6,7],"k":1}'))
})

// Independent oracle: list every arrangement of the moves, sort them as strings, and read off the k-th.
function sortedPaths(rows, cols) {
  const paths = []
  const build = (prefix, v, h) => {
    if (v === 0 && h === 0) { paths.push(prefix); return }
    if (h > 0) build(prefix + 'H', v, h - 1)
    if (v > 0) build(prefix + 'V', v - 1, h)
  }
  build('', rows, cols)
  return paths.sort()
}

test('1643 random destinations match the sorted-list oracle', () => {
  let seed = 1643
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const paths = sortedPaths(rows, cols)
    const k = 1 + rnd(paths.length)
    assert.equal(solve([rows, cols], k), paths[k - 1], JSON.stringify({ rows, cols, k }))
  }
})
