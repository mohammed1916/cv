import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1452 official examples', () => {
  assert.deepEqual(solve({ favorite_companies: [['leetcode', 'google', 'facebook'], ['google', 'microsoft'], ['google', 'facebook'], ['google'], ['amazon']] }), [0, 1, 4])
  assert.deepEqual(solve({ favorite_companies: [['leetcode', 'google', 'facebook'], ['leetcode', 'amazon'], ['facebook', 'google']] }), [0, 1])
  assert.deepEqual(solve({ favorite_companies: [['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'd'], ['a', 'b', 'c', 'd']] }), [3])
})

test('1452 a single person is always kept', () => {
  assert.deepEqual(solve({ favorite_companies: [['x']] }), [0])
})

test('1452 rejects two people with the same list', () => {
  assert.throws(() => parseInput('{"favorite_companies":[["a"],["a"]]}'))
})

// Independent oracle: use plain sets instead of bitmasks.
function oracle(lists) {
  const sets = lists.map(list => new Set(list))
  const out = []
  sets.forEach((mine, i) => {
    const contained = sets.some((other, j) => j !== i && [...mine].every(c => other.has(c)))
    if (!contained) out.push(i)
  })
  return out
}

test('1452 seeded random inputs match a set-based oracle', () => {
  let seed = 1452
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = ['a', 'b', 'c', 'd', 'e', 'f']
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const people = 1 + rnd(6)
    const lists = Array.from({ length: people }, () => {
      const picks = pool.filter(() => rnd(2) === 1)
      return picks.length ? picks.slice(0, 4) : [pool[rnd(pool.length)]]
    })
    const input = { favorite_companies: lists }
    try { parseInput(JSON.stringify(input)) } catch { continue }
    checked++
    assert.deepEqual(solve(input), oracle(lists), JSON.stringify(input))
  }
  assert.ok(checked > 100)
})
