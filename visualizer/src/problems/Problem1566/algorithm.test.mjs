import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, m, k) => buildTrace({ arr, m, k }).result

test('1566 sample arrays give the expected answers', () => {
  assert.equal(solve([5, 1, 3, 1, 3, 9, 1, 3, 2], 2, 2), true)
  assert.equal(solve([5, 1, 3, 1, 3, 9, 1, 3, 2], 2, 3), false)
  assert.equal(solve([7, 7, 7, 7], 1, 4), true)
})

test('1566 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"arr":[1,2],"m":0,"k":2}'), /m is/)
  assert.throws(() => parseInput('{"arr":[1,2],"m":1,"k":0}'), /k is/)
  assert.throws(() => parseInput('{"arr":[0],"m":1,"k":1}'), /1 to 100/)
})

// Oracle: test every start position directly; a block of length m*k starting there must repeat with period m.
function oracle(arr, m, k) {
  for (let i = 0; i + m * k <= arr.length; i++) {
    let ok = true
    for (let x = i; x + m < i + m * k; x++) if (arr[x] !== arr[x + m]) { ok = false; break }
    if (ok) return true
  }
  return false
}

test('1566 matches a direct check on random arrays', () => {
  let seed = 21
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 500; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(3))
    const m = 1 + rnd(4)
    const k = 1 + rnd(4)
    assert.equal(solve(arr, m, k), oracle(arr, m, k), JSON.stringify({ arr, m, k }))
  }
})
