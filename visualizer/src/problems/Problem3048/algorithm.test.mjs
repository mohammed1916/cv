import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: exhaustive search over one action per second (nothing, decrement one index, or mark when it is zero).
function oracle({ nums, changeIndices }) {
  const n = nums.length
  const feasibleBy = T => {
    const failed = new Set()
    const go = (s, cur, marked) => {
      if (marked.every(Boolean)) return true
      if (s > T) return false
      const key = `${s}|${cur.join(',')}|${marked.join(',')}`
      if (failed.has(key)) return false
      const idx = changeIndices[s - 1] - 1
      let ok = go(s + 1, cur, marked)
      for (let i = 0; i < n && !ok; i++) {
        if (cur[i] > 0) {
          const next = [...cur]
          next[i] -= 1
          ok = go(s + 1, next, marked)
        }
      }
      if (!ok && cur[idx] === 0 && !marked[idx]) {
        const next = [...marked]
        next[idx] = true
        ok = go(s + 1, cur, next)
      }
      if (!ok) failed.add(key)
      return ok
    }
    return go(1, [...nums], new Array(n).fill(false))
  }
  for (let T = 1; T <= changeIndices.length; T++) if (feasibleBy(T)) return T
  return -1
}

test('3048 official examples', () => {
  assert.equal(solve({ nums: [2, 2, 0], changeIndices: [2, 2, 2, 2, 3, 2, 2, 1] }), 8)
  assert.equal(solve({ nums: [1, 3], changeIndices: [1, 1, 1, 2, 1, 1, 1] }), 6)
  assert.equal(solve({ nums: [0, 1], changeIndices: [2, 2, 2] }), -1)
})

test('3048 an index that is never changed gives -1', () => {
  assert.equal(solve({ nums: [0, 0], changeIndices: [1] }), -1)
  assert.equal(solve({ nums: [0], changeIndices: [1] }), 1)
})

test('3048 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"changeIndices":[1]}'))
  assert.throws(() => parseInput('{"nums":[1],"changeIndices":[2]}'))
  assert.throws(() => parseInput('{"nums":[4],"changeIndices":[1]}'))
})

test('3048 random cases match an exhaustive-action oracle', () => {
  let seed = 3048
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(3)
    const nums = Array.from({ length: n }, () => rnd(3))
    const changeIndices = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(n))
    assert.equal(solve({ nums, changeIndices }), oracle({ nums, changeIndices }), JSON.stringify({ nums, changeIndices }))
  }
})
