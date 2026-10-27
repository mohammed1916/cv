import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3012 official examples', () => {
  assert.equal(solve([1, 4, 3, 1]), 1)
  assert.equal(solve([5, 5, 5, 10, 5]), 2)
  assert.equal(solve([2, 3, 4]), 1)
})

test('3012 all equal values halve their count', () => {
  assert.equal(solve([7, 7]), 1)
  assert.equal(solve([7, 7, 7]), 2)
})

test('3012 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: search every reachable multiset of values (zeros cannot be picked) and keep the smallest size.
function oracle(start) {
  const memo = new Map()
  const best = state => {
    const key = state.join(',')
    if (memo.has(key)) return memo.get(key)
    let result = state.length
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state.length; j++) {
        if (i === j || state[i] === 0 || state[j] === 0) continue
        const rest = state.filter((_, k) => k !== i && k !== j)
        rest.push(state[i] % state[j])
        rest.sort((a, b) => a - b)
        result = Math.min(result, best(rest))
      }
    }
    memo.set(key, result)
    return result
  }
  return best([...start].sort((a, b) => a - b))
}

test('3012 small random arrays match a search oracle', () => {
  let seed = 3012
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
