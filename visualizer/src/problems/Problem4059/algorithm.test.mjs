import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4059 hand-checked arrays', () => {
  // [1, 2, 3]: 3 then 2 then 1 gives runs 2 for bit 1 and 1 for bit 0.
  assert.deepEqual(solve([1, 2, 3]), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1])
  // [3, 3, 10, 4, 4]: 10 first, then the two 3s before the 4s, lengthens the bit-1 run to 3.
  assert.deepEqual(solve([3, 3, 10, 4, 4]), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0])
  // A single value: the run for each bit is 1 if the bit is set, otherwise 0.
  assert.deepEqual(solve([12345]), Array.from({ length: 15 }, (_, i) => (12345 >> (14 - i)) & 1))
})

test('4059 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[32768]}'))
})

// Oracle: try every ordering and keep the lexicographically greatest 15-entry vector.
function oracle(nums) {
  const permute = (rest, acc, out) => {
    if (!rest.length) { out.push(acc); return }
    rest.forEach((v, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, v], out))
  }
  const orders = []
  permute(nums, [], orders)
  let best = null
  for (const order of orders) {
    const vec = []
    for (let b = 14; b >= 0; b--) {
      let run = 0
      while (run < order.length && ((order[run] >> b) & 1)) run++
      vec.push(run)
    }
    if (best === null || cmp(vec, best) > 0) best = vec
  }
  return best
}

function cmp(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

test('4059 small arrays match the exhaustive permutation oracle', () => {
  let seed = 4059
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(16))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
