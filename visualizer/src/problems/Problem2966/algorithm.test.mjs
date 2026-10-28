import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2966 official examples', () => {
  assert.deepEqual(solve({ nums: [1, 3, 4, 8, 7, 9, 3, 5, 1], k: 2 }), [[1, 1, 3], [3, 4, 5], [7, 8, 9]])
  assert.deepEqual(solve({ nums: [1, 3, 3, 2, 7, 3], k: 3 }), [])
})

test('2966 a length that is not a multiple of three is rejected', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1}'))
})

// Independent oracle: search every way to split the remaining values into triples.
function feasible(values, k) {
  const used = Array(values.length).fill(false)
  const go = () => {
    const first = used.indexOf(false)
    if (first === -1) return true
    used[first] = true
    for (let j = first + 1; j < values.length; j++) {
      if (used[j]) continue
      used[j] = true
      for (let l = j + 1; l < values.length; l++) {
        if (used[l]) continue
        const trio = [values[first], values[j], values[l]]
        if (Math.max(...trio) - Math.min(...trio) > k) continue
        used[l] = true
        if (go()) return true
        used[l] = false
      }
      used[j] = false
    }
    used[first] = false
    return false
  }
  return go()
}

test('2966 random inputs agree with the triple-search oracle', () => {
  let seed = 2966
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 3 * (1 + rnd(3)) }, () => rnd(13))
    const k = rnd(7)
    const result = solve({ nums, k })
    assert.equal(result.length > 0, feasible(nums, k), JSON.stringify({ nums, k }))
    if (result.length > 0) {
      assert.deepEqual(result.flat().sort((a, b) => a - b), [...nums].sort((a, b) => a - b))
      for (const group of result) {
        assert.equal(group.length, 3)
        assert.ok(Math.max(...group) - Math.min(...group) <= k)
      }
    }
  }
})
